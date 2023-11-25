---
# 当前页面内容标题
title: redo log：崩溃恢复神器
date: 2023-03-07
order: 1
#icon: write

# 分类
category:
 - 数据库
tag:
 - MySQL

sticky: false
# 是否收藏在博客主题的文章列表中，当填入数字时，数字越大，排名越靠前。
star: false
# 是否将该文章添加至文章列表中
article: true
# 是否将该文章添加至时间线中
timeline: true
---


::: details 本文内容
[[toc]]
:::

## 1. 前言

在 [了解 Buffer Pool](https://code.0x3f4.run/backend/database/mysql/buffer_pool/了解BufferPool.html#_4-3-脏页何时被刷回磁盘) 中说过，BP 中的数据是不会立即刷回磁盘的，那么此时如果 MySQL 崩溃了，重启后还未来得及刷盘的脏页会丢失么？

答案是不会的，因为 InnoDB 在更新的时候，采用的是 **WAL 技术**（Write-Ahead Logging，写前日志），即更新时 **先写日志，后刷磁盘**。

也就是说，在更新一条记录的时候，InnoDB 会先把该数据页加载进 BP（该页不在 BP 中时），然后对该记录进行更新，接着 **将这个页的修改写到 redo log**，这个时候 **更新就算完成了**。后续会有空闲线程将数据刷回磁盘。

也就是下图所示的执行流程：

![image-20230307165034054](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303071651548.png)

这样就算内存中的数据页还没刷回磁盘，也可根据这个神奇的 redo log 将数据恢复回来，下面就来具体的介绍一下它。

## 2. 为什么需要 redo log？

其实，为了持久化内存中的数据，一个很简单的方法就是，每次执行完更新有关的操作，就将这个缓冲页刷回磁盘。但是这样的刷盘方式会有如下问题：

- InnoDB 是以 **页** 来管理数据的（一页 16K），如果我们 **只修改了一页中的一条记录**，那么就要将这 **一整个页都刷回磁盘**，大大降低了磁盘 I/O 的效率；
- 有可能 SQL 语句 **修改了多个页面**，而且这些页面还 **不相邻**，这就导致在刷回磁盘的时候需要进行很多的 **随机 I/O**，这比顺序 I/O 要慢。

所以，InnoDB 采用了 **redo log**，在每次修改数据的时候，就将这个修改对数据页产生的影响记录下来，后面如果发生了崩溃，重启后只需要根据 redo log 中的内容进行恢复即可。

比如说某个更新操作将系统表空间中的第 100 号页面中，偏移量为 1000 处的那个字节的值 1 改成 2，redo log 只需要记录一下这个 **物理日志**：

- **`将第 0 号表空间的 100 号页面的偏移量为 1000 处的值更新为 2`**。

这样我们在更新完后，将 redo log 刷回磁盘，之后崩溃恢复的时候，**按照 redo log 上的内容重新更新数据页即可**。

你可能会问，redo log 不也要刷回磁盘？那还不如直接将数据页刷回磁盘呢？

不不不，这两个刷磁盘的方式是不一样的，**redo log 刷盘的好处** 如下：

- **redo log 占用的空间非常小**，一行简单的 redo log 只包含表空间号、数据页号、磁盘偏移量、更新值，就占几十个字节；
- **redo log 写入磁盘是顺序 I/O**，不管这些记录在多少个页面，redo log 都是按序记录（在磁盘上追加写即可），刷盘的时候不用去找该页对应的磁盘在哪个区域。

所以，**redo log 刷盘比数据页的刷盘快多了**，这就是 WAL 技术的另一个优点：**将磁盘的随机写转为顺序写**，提高了执行效率。

## 3. 产生的 redo log 直接写入磁盘吗？

因为写 redo log 也要刷盘，所以为了减少 I/O 操作，并不会写一条 redo log 就刷一次盘，它有一个自己的缓冲区  **redo log buffer**，每产生一条 redo log 记录只需要先写入 redo log buffer 即可，后续再进行刷盘。

redo log buffer 是不在 Buffer Pool 里的（[了解 Buffer Pool](https://code.0x3f4.run/backend/database/mysql/buffer_pool/了解BufferPool.html#_3-buffer-pool-缓存什么) 中有提到），它有一块自己的连续地址空间。大小可以通过 `innodb_log_buffer_size` 调整，默认为 16MB。

## 4. redo log 刷盘时机

既然 redo log 是缓存在 redo log buffer 中，那它的刷盘时机就非常重要了，因为持久性是靠它来保证的，它可不能出任何差错。

redo log 的刷盘时机主要有下面几种：

- MySQL **正常关闭时**；
- **后台线性每隔 1 秒**，就会将 redo log buffer 持久化到磁盘；
- redo log buffer **使用的内存空间大于一半时**；
- 每次 **事务提交时**，可通过 **`innodb_flush_at_trx_commit` 参数** 控制刷盘时机。

前三个时机都比较好理解，需要保证 redo log 尽量多的落盘嘛，下面主要来讲讲最后一个时机。

### 4.1 事务提交控制的刷盘时机

在 MySQL 中会默认开启 **隐式事务**，即在执行 insert、update 或 delete 语句的时候，会自动开启一个事务来执行这些操作。

那么当 **事务提交时**，InnoDB 会根据 **`innodb_flush_at_trx_commit` 参数来进行 redo log 的刷盘**：

- 参数为 **0**：事务提交时 **不进行刷盘**，把刷盘交给其他三种时机来进行；

    > 此参数虽然加快了处理速度，但是会增大数据丢失的概率。

- 参数为 **1**：事务提交时 **将 redo log buffer 中的 redo log 同步到磁盘**，1 也是它的默认值；

    > 此参数可以保证数据不会丢失。

- 参数为 **2**：事务提交时 **只将 redo log 写入到操作系统的缓冲区 Page Cache**。

    > Page Cache 是操作系统专门用来缓存文件数据的，**此时其实还没有落盘**，具体的落盘时机由操作系统控制。

具体来说，当参数为 0 时，InnoDB 会有后台线程每隔 1 秒就将 redo log buffer 中的 redo log 通过调用 `write()` 写到操作系统的 Page Cache 中，然后调用 `fsync()` 持久化到磁盘上。

当参数为 1 时，事务提交时就会将 redo log 刷入磁盘，也就是调用 `write()` 后，马上调用 `fsync()` 进行刷盘操作。

当参数为 2 时，也是通过后台线程将 redo log 刷入磁盘，不过此时直接调用 `fsync()` 即可，因为此时的 redo log 已经在操作系统的 Page Cache 中了。

也就是说，参数 1 是最安全的做法，然后是参数 2，最后是参数 0（写入性能就是反序了）。因为参数 2 会先把 redo log 写到 Page Cache，只要操作系统不宕机，就算 MySQL 发生崩溃，数据也不会丢失。

> 三种策略中，因为有了后台线程的加持，所以 **最多也只会丢失 1 秒钟的事务数据**。

## 5. redo log 文件组

MySQL 默认使用 **两个名为 `ib_logfile0` 和 `ib_logfile1` 的文件存储 redo log，这两个文件构成一个 redo log 文件组**。

::: info redo log 文件的调节参数

可以通过下面两个参数来调节 redo log 文件的文件组大小和单个文件的大小：

- `innodb_log_file_size`：指定每个 redo log 文件的大小，MySQL 5.7 中默认为 48MB；
- `innodb_log_files_in_group`：指定 redo log 文件组中文件的个数，默认为 2，最大值为 100。

:::

也就是说，redo log 文件并不是无限的，它只会写入到这个文件组里面。从 `ib_logfile0` 开始写，写满了就写 `ib_logfile1`，这时写满了最后一个文件后就又去写 `ib_logfile0`，如下图所示：

![image-20230307220017602](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303072200279.png)



因此，**redo log 文件组采用的是循环写的方式**，文件被写完后又会从头开始写。这就意味着 **会进行数据的覆盖**，不会对持久性产生影响吗？

那当然可能了，InnoDB 自然也考虑到了这个问题，所以提出了 **checkpoint** 的概念。

## 6. checkpoint

由于 **redo log 只是为了系统崩溃后恢复脏页用的，如果这些脏页已经刷到磁盘了，那么就算崩溃后重启，也用不到这些 redo log**，所以即使被覆盖了也没关系。

所以，判断 redo log 文件是否可以被覆盖的依据就是：**它对应的脏页是否已经被刷到了磁盘**。

InnoDB 使用 **checkpoint 表示 redo log 文件中已经进行了刷盘的位置**，用 **write pos 表示 redo log 文件写到了哪个位置**。如下图所示：

![image-20230307230048960](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303072300028.png)

具体来说：

- write pos 到 checkpoint 之间的文件（红色部分），表示 **已经落盘的数据**，因此 **可以进行覆盖**，写入新的 redo log；
- checkpoint 到 write pos 之间的文件（蓝色部分），表示 **还未落盘的脏数据**，因此还 **不能进行覆盖**。

**当 write pos 追上 checkpoint 时，就说明 redo log 文件已经写满了，为了保证 redo log 的持久性，此时 MySQL 会停止更新操作（即阻塞，所以尽量把 redo log 文件适当地调大些），然后开始将 Buffer Pool 中的脏页刷到磁盘，这些脏页对应的 redo log 就可以被覆盖了，此时 checkpoint 就会向前移动**。此时 redo log 可以继续覆盖写入了，MySQL 恢复执行。

所以，有了 redo log，InnoDB 就可以保证即使数据库发生了 **崩溃**，重启后也能保证 **已提交的记录都不会丢失**，也将这个能力称为 **crash-safe**。

简单来说，一次 checkpoint 过程就是把脏页刷到磁盘，然后标记与之对应的 redo log 哪些可以被覆盖的过程。

> 具体的 checkpoint 过程涉及到 LSN（Log Sequeue Number），后续文章会具体讲解。

## 7. 总结

InnoDB 通过 redo log，保证了数据的 **持久性**，它的好处主要有两个：

- 在 MySQL 宕机时，能保证重启后 **已提交事务的记录都不会丢失**，这也叫 **crash-safe** 能力；

- **将数据页刷磁盘的随机 I/O 转换成 redo log 的顺序 I/O**。

redo log 是先缓存在 **redo log buffer** 中的，也需要刷入磁盘，它的刷盘机制有如下几种：

- MySQL **正常关闭时**；
- **后台线性每隔 1 秒**，就会将 redo log buffer 持久化到磁盘；
- redo log buffer **使用的内存空间大于一半时**；
- 每次 **事务提交时**，可通过 **`innodb_flush_at_trx_commit` 参数** 控制刷盘时机。

其中 `innodb_flush_at_trx_commit` 参数有下面几种：

- 参数为 **0**：事务提交时 **不进行刷盘**，把刷盘交给其他三种时机来进行；
- 参数为 **1**：事务提交时 **将 redo log buffer 中的 redo log 同步到磁盘**，1 也是它的默认值；
- 参数为 **2**：事务提交时 **只将 redo log 写入到操作系统的缓冲区 Page Cache**，此时还没有落盘。

又讲到，redo log 文件是以文件组的形式存在的，相当于一个 **环形文件**，写入时可能会有覆盖操作，那么判断是否能进行覆盖的主要依据是 **checkpoint 和 write pos** 的位置。当不能进行覆盖时，会 **阻塞** MySQL 的更新操作，去 **通过刷脏页来推动 checkpoint 向前移动**。

## 8. 参考文章

- 《MySQL 是怎样运行的》
- 《MySQL 实战 45 讲》
- [小林 coding](https://xiaolincoding.com)

