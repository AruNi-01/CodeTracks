---
# 当前页面内容标题
title: 执行计划之 explain
date: 2023-02-15
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


## **1. 介绍**

MySQL 在执行查询 SQL 语句时，优化器会基于成本来生成多个执行方案，最后会选择一个成本最低的方案来生成执行计划。

如果我们想看看这个执行计划，比如用什么方式访问的表、用到了哪个索引等，可以使用 MySQL 提供的 **explain** 命令。

在实际开发中，如果我们的 SQL 查询效率很低，那么就可以使用 explain 命令看看具体的执行计划，从而分析存在什么问题，是没有建立索引，还是索引失效等等情况。

explain 命令的使用非常简单，只需要在 SQL 的前面加上 explain 即可，例如：

![image-20230215214032453](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302152140345.png)

输出的这一大堆东西就是执行计划，接下来就一起来看看它们到底都代表什么。

> 当然，其余的 insert、delete、update 语句的前面也都可以加上 explain，只不过在查询中使用得比较多。

## **2. 执行计划的各列**

先来大致的介绍以下每一列都代表什么意思，然后详细讲解几个比较重要的列。

在上面输出的执行计划中，各列的含义如下：

- `id`：查询语句对应的唯一 id，每个 select 语句都会有；
- `select_type`：查询的类型；
- `table`：表名，如果两个表进行连表查询，则会输出两个表的执行计划（前面的是驱动表，后面的是被驱动表；
- `partitions`：匹配的区分信息；
- `type`：针对单表的访问方法；
- `possible_keys`：可能会用到的索引；
- `key`：实际用到的索引；
- `key_len`：实际用到的索引的长度；
- `ref`：当使用索引列进行等值查询时，与索引列进行等值匹配的对象信息；
- `rows`：预估的需要读取的记录条数；
- `filtered`：经过搜索条件过滤后，剩余记录条数的百分比；
- `Extra`：一些额外的信息。

我这里只会挑几个常见且重要的列来讲解，其余的列详情可以查看《MySQL 是怎样运行的》这本书。

### **2.1 type**

`type` 列代表 MySQL 对某个表执行查询时的 **扫描方式**，常见的扫描方式如下（执行效率从高到底）：

- `const`：执行 **单表查询** 时，**主键或唯一二级索引等值查询**；
- `eq_ref`：执行 **连接查询** 时，**主键或唯一二级索引等值查询**；
- `ref`：**非唯一索引等值查询**；
- `range`：**索引范围扫描**；
- `index`：**全索引扫描**；
- `ALL`：**全表扫描**。

const 类型和 eq_ref 都属于 **主键或唯一二级索引的等值查询**，但是 **const 是针对单表的，查询效率更快。而 eq_ref 常用在多表联查中**。

ref 类型表示 **非唯一索引的等值查询**，虽然也是等值查询，但是 **索引列可能会有重复**，所以会在一个小范围（范围大小对应该索引值的重复条数）进行扫描。

range 表示 **索引范围扫描**，一般就是在 where 后面使用 >、<、in、between 等。**从 range 开始往下，索引的效率会越来越低**，所以尽量不要到达这一级别，更不要到达 range 以下的级别。

index 虽然也使用了索引，但是 **对索引进行了全扫描**，开销也很大。

ALL 是最坏情况，采用 **全表扫描**，是性能最差的扫描方式。

### **2.2 possible_keys 和 key**

**possible_keys** 表示对表执行单表查询时 **可能会用到的索引有哪些**，而 **key** 则表示 **实际上用到的索引是哪个**。

因为优化器是基于成本来选择执行计划的，使用了哪个索引就说明用此索引进行查询的成本是最低的。

不过需要注意，**possible_keys 并不是越多越好**，可能会用到的索引越多，那么优化器在计算查询成本时所花费的时间也就越长。所以要尽量删除掉一些不用的索引。

### **2.3 ref**

> 注意与 type 列的 ref 进行区分。

当使用 const、eq_ref、ref 中的一个扫描方式时，**ref 列** 展示的就是 **与索引列进行等值匹配的东西是什么**：

- 如果是一个常数，则 ref 列为 `const`（注意与 type 列的 const 进行区分）；
- 如果是某个字段，则 ref 列就为这个字段；
- 如果是一个函数，则 ref 列为 `func`，比如 UPPER、LOWER、CONCAT 等。

### **2.4 rows**

rows 列表示 **预计扫描的记录行数**，注意是 **预计**。

为什么是预计呢？可以想象一下，如果需要通过扫描所有的记录行数，才能获取扫描的记录行数，那么在优化器选择执行计划的时候，消耗的时间也就太长了。

所以为了减少扫描时间，**优化器会根据一个规则来估算需要扫描的记录行数**。所以 **explain 的效执行率也是很高的**。

这个规则如下：

- 根据第一个记录所在的页和最后一个记录所在的页，再从第一个记录所在页向右连续查找
    8 个页，总共 10 个页，获取这 10 个页的总记录数，再除以 10 取平均值，即可得到一个页中记录的平均值，最后乘总的页数目，即可得到一个不精确的总记录数。

    > 页是 InnoDB 管理存储空间的基本单位，一个页默认为 16KB。

### **2.5 Extra**

Extra 顾名思义，表示一些额外的信息。虽然它叫 Extra，但它一点也不多余，这些额外信息是精准判断执行计划的关键。

几个常见且重要的 Extra 信息如下：

- **Using index**：**索引覆盖**。表示在二级索引中即可获取到需要查询的记录，不需要再进行回表，增加了效率；

- **Using filesort**：**对结果使用排序算法进行排序，可能会通过文件排序**，效率是很低的。当我们在使用 order by 对结果排序时，如果无法利用索引完成排序操作，就会使用 filesort；

    > 注意：**MySQL 会在 group by 中默认使用 order by**。

- **Using temporary**：**使用了临时表保存中间结果**。常见于 distinct 和 order by，如果无法利用索引来去重或者排序，则需要使用临时表；

- **Using index condition**：**索引条件下推**（ICP）。这里就不详细讲解什么是 ICP 了，具体见 [索引覆盖和索引条件下推](https://code.0x3f4.run/backend/database/mysql/index/索引覆盖和索引条件下推.html)；

- **Using where**：**某个搜索条件需要到 server 层进行判断**。

## **3. 实战分析**

explain 输入列中常见的列都已经过了一遍，现在来几条正真的 SQL 语句，分析下它们的执行计划。

使用的 Demo 表设计如下：

```sql
CREATE TABLE `explain_example`  (
  `id` int(0),
  `key` int(0),
  `uk_key` int(0),
  `key_part1` varchar(255),
  `key_part2` varchar(255),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_uk_key`(`uk_key`),
  INDEX `idx_key`(`key`),
  INDEX `idx_key_part`(`key_part1`, `key_part2`)
)
```

- 主键索引：id；
- 唯一索引 idx_uk_key：uk_key；
- 非唯一索引 idx_key：key；
- 联合索引 idx_key_part：key_part1，key_part2；

::: info SQL 语句一：

`explain select * from explain_example where uk_key = 1;`

![image-20230215234326642](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302152343257.png)

- 扫描方式 type 是 const，因为这里是唯一索引的等值扫描；
- 等值的条件是一个常数，索引 ref 为 const。

:::

::: info SQL 语句二：

`explain select * from explain_example where key_part2 = 'b';`

![image-20230215235428280](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302152354725.png)

- 联合索引为 idx_key_part(key_part1, key_part2)，很明显 `where key_part2 = 'b'` 不满足最左前缀匹配原则，索引失效。所以使用的是全表扫描 ALL，possible_keys 和 key 也都是 Null。
- Extra 为 Using where，因为使用不到 ICP（ICP 只适用于二级索引，这里是全表扫描，用的是聚簇索引），所以查找到一条记录，就要返回 Server 层判断 `key_part2` 字段是否为 `'b'`。

:::

::: info SQL 语句三：

`explain select * from explain_example where key_part1 > 'a' and key_part2 = '2';`

![image-20230216000000235](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302160000174.png)

> **注意**：联合索引遇到范围查询会停止匹配，所以上面的语句中只有 `key_part1` 可以用到联合索引，`key_part2` 是无法走联合索引的。

- 扫描方式 type 为 range，因为使用了联合索引 idx_key_part 进行范围扫描；

- Extra 中为 Using index condition，说明使用到了 ICP。

    > 虽然第二个条件 `key_part2 = '2'` 使用不到联合索引，但是在查询到 key_part1 时，联合索引中刚好有 key_part2，所以就可以利用 ICP 在存储引擎层进行判断。而不用定位到一条记录后，获取主键，然后进行回表查出 key_part2，再进行判断。

:::

::: info SQL 语句四：

`explain select  id from explain_example where uk_key > 2;`

![image-20230216002852177](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302160028938.png)

- 主要看 Extra 中有 Using index，说明使用了索引覆盖。因为 uk_idx_key 索引中有主键 id（二级索引中 B+ 树叶子节点的数据存储的就是主键值），所以就不用去聚簇索引回表查询出 id 了。

:::

## **4. 参考文章**

- 《MySQL 是怎样运行的》
- [小林 coding](https://xiaolincoding.com/)



