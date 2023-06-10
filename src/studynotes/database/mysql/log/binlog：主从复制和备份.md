---
# 当前页面内容标题
title: binlog：主从复制和备份
date: 2023-03-11
order: 2
icon: write

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


## 1. 什么是 binlog？

之前学习的 redo log，是属于 InnoDB 存储引擎层的，MySQL 的 **Server 层** 也有自己的日志，称为 **binlog**（归档日志）。

binlog 记录的是 **全量日志**，写完一个文件就会写下一个文件，所以 binlog 里有数据库的所有数据信息，非常适合用来做 **备份和主从复制**。

## 2. binlog 的格式

binlog 有 3 种格式类型，分别是 statement（默认格式）、row 和 mixed，它们的区别如下：

- **statement**：记录的是 **SQL 原文**，相当于逻辑日志，重现时需要执行 SQL 语句；
- **row**：**会把具体受影响的行记录下来**，此时不能被称为逻辑日志；
- **mixed**：**混合模式**，根据不同的情况自动判断使用 statement 还是 row。

如果是 statement 格式，SQL 语句中又含有 uuid 或者 now 等函数，那么 **由于执行 SQL 语句的时间不一致，会导致数据不一致**。而 row 格式就不会有这个问题，因为它会直接把当时的具体数据给记录下来。

但是 row 格式会 **记录每行数据变化的结果**，例如一条 delete 删除 10 万行数据，**删除多少行就会产生多少条记录**，使得 **写 binlog 十分耗时，且占用更大的磁盘空间**。而 statement 格式就只会记录一条 delete 语句。

基于这两种格式的优缺点，所以就出现了 **mixed 格式**，这是一种折中方案。MySQL 会 **判断这条 SQL 语句是否可能会造成数据不一致**（包括备份和主从复制），如果有可能，则使用 row 格式，否则使用 statement 格式。

所以，statement 格式的 binlog 是不合理的，因为会造成数据不一致这种严重的错误。至少都应该将 binlog 设置为 mixed 格式。

但是，还是建议把 binlog 设置为 row 格式，因为可以进行 **数据的恢复**（注意不是崩溃恢复）：

- insert：binglog 会记录插入数据的所有字段，所以恢复时将 insert 转为 delete 即可；
- delete：binglog 会记录被删除行的整行信息，所以恢复时将 delete 转为 insert 即可；
- update：binglog 会记录修改前整行的数据和修改后整行的数据，所以恢复时将两行的信息对调即可。

## 3. 为什么需要两份日志？

为什么 MySQL 要同时使用 redo log 和 binlog 两份日志呢？

因为之前 MySQL 用的是 MyISAM 存储引擎，是没有 redo log 的，也就是没有 crash-safe 的能力。

**binlog 是没有 crash-safe 能力的**，它只能用于归档，所以 InnoDB 才设计出了 redo log。

下面分析一下这两种日志的 **区别**：

- binlog 在 **Server 层**，所有引擎都可使用；

    redo log 是 **InnoDB 特有的**。

- binlog 有 **不同的日志格式**；

    redo log 是 **物理日志**，记录的是 `在某个表空间在某个数据页上做了什么修改`。

- binlog 是 **全量日志**，写完一个文件接着写下一个；

    redo log 是 **循环写**，写完后接着从头开始写。

可以发现：

- 由于 redo log 是循环写，因为肯定不能用来备份和主从复制这种需要全量数据的功能；
- 而 binlog 为 statement 格式时，记录的是逻辑日志，不知道具体的数据是什么；崩溃恢复时也不知道从哪儿开始恢复，自然也没有 crash-safe 的能力。

所以 binlog 和 redo log 是互补的，如果你要说，为什么不把 binlog 改造成 redo log 那样，这不是重复造轮子嘛，而且存储引擎层是插件式的置入 MySQL，不改动任何代码就可以使用 redo log，所以现在的 MySQL 默认都是 InnoDB 引擎了。

而且 binlog 和 redo log 在更新数据时都是配合使用的，从而保证数据一致性。（后续在两阶段提交中会讲到）

## 4. binlog 刷盘时机

binlog 也有自己的缓冲区 **binlog cache**，这个缓冲区是由 Server 层申请的，不在 InnoDB 的 Buffer Pool 中。

binlog 的写入逻辑比较简单：

- **事务执行时，先把日志写到 binlog cache，事务提交时，再把 binlog cache 写到 binlog 文件中**。

::: danger 注意

**一个事务的 binlog 是不能拆开的**，无论这个事务多大，都要保证一次性写入。

因为 **binlog 是基于事务来记录的**，一个完整的 binlog 就是一个完整的事务，如果 binlog 被拆开，那这个事务就不完整、不原子了。

而 redo log 是基于数据页来记录的，只需要保证数据页的完整就可以了，所以 redo log 可以拆开。

:::

MySQL给 binlog cache 申请了一片内存，**每个线程一个 binlog cache**，参数 `binlog_cache_size` 用于控制单个线程的 binlog cache 大小。**如果超过了这个大小，就要暂存到磁盘**，而不是先进行刷盘。

::: info 为什么 binlog cache 是线程独占，而 redo log buffer 是共享的？

因为 redo log 是以数据页格式存储的，**数据页本来就是共享的**；而 binlog 是以 statement 或 row 格式存储，不会记录数据页，**执行 binlog 时需要上下文环境，是跟事务有关的**。

redo log buffer 是所有线程共享，所以 **可能存在被动刷盘**（后台线程），而 binlog cache 不可能存在。

:::

**事务提交时**，执行器就会把 binlog cache 里 **完整的事务** 写入 binlog 中，并清空 binlog cache。

![binlog cach](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303111320403.png)

虽然每个线程有自己的 binlog cache，但是 **共用同一份 binlog 文件**。

- 图中的 write 只是把日志写入操作系统的 page cache 中，并没有进行刷盘，所以速度比较快；
- 图中的 fsync 才是真正的刷盘操作，涉及磁盘 I/O，速度比较慢。

write 和 fsync 的时机，即刷盘时机，由参数 **`sync_binlog`** 控制：

- `sync_binlog = 0`：每次提交事务，**只 write，不 fsync**；
- `sync_binlog = 1`：每次提交事务 **都会执行 fsync**；
- `sync_binlog = N`（N > 1）：每次提交事务都 write，**累积 N 个事务后才 fsync**。

> 这里可以和 redo log 在事务提交时的刷盘时机对比起来看。

系统默认的设置是 `sync_binlog = 0`，这时性能最好，但风险也最高，因为一旦发生宕机，page cache 中还没持久化到磁盘的数据就会丢失。

当参数设置为 1 时，虽然最安全，但性能也最低。所以 **一般将参数设置为 100~1000 来平衡安全和性能**，这样最多会丢失最近 N 个事务的 binlog 日志。

## 5. 总结

**binlog** 属于 Server 层，由于保存的是 **全量日志**，所以常用来做备份或主从复制。而 **redo log** 属于存储引擎层，是 **循环写**，因此不具备所有的数据记录，也就无法进行备份或主从复制了。

**binlog 也没有 redo log 的 crash-safe 能力**，因为它没有像 redo log 那样的机制，例如 statement 格式的物理日志，redo log 可通过 checkpoint 机制方便的知道哪些数据已刷盘，需要恢复哪些数据。

binlog 提供 **不同的日志格式**：

- statement：记录原始 SQL 语句，逻辑日志；
- row：记录具体受影响的所有行数据；
- mided：混合使用。

binlog 有自己的缓冲区 binlog cache，每次 **事务提交时**，会将 binlog 刷盘，刷盘时机由参数 `sync_binlog` 控制：

- 参数为 0：每次事务提交时，只 write，不 fsync；
- 参数为 1：每次事务提交时都 fsync；
- 参数为 N（N > 1）：每次事务提交时都 write，累积 N 个事务后才 fsync。

## 6. 参考文章

- 《MySQL 实战 45 讲》
- [小林 coding](https://xiaolincoding.com)
