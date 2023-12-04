---
# 当前页面内容标题
title: Seata AT 模式
date: 2023-12-04
# 当前页面图标
#icon: write
order: 1

# 分类
category:
 - 微服务架构
# 标签
tag:
 - SpringCloudAlibaba

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


::: info 前言

Seata 有四种事务模式，分别是 AT、TCC、Saga 和 XA，每种模式各有优缺点，适用的数据库也不同。本文将介绍 Seata 默认、常用的 AT 模式。

在学习分布式事务原理前，确保你已经对本地事务 ACID 原则，事务隔离级别、日志和锁等知识有一定的了解。

:::

## 1. 什么是 AT 模式？

我们在 Seata 入门时候的案例，使用的就是 AT 模式，在配置部署好 Seata-Server、数据库等后，在业务代码中直接使用一个 `@GlobalTransactional` 即可使用 Seata 分布式事务功能。

可见 AT 模式是一种 **非侵入式** 的解决方案，简单来说就是 **Seata 对数据库做了代理操作（AOP 思想），在 SQL 真正执行的前后做了一些额外的操作**（比如插入/删除 undo_log、获取/释放全局锁），从而达到控制 **多个本地事务的共同提交或回滚**。

要使用 AT 模式，使用的数据库需要 **支持本地 ACID 原则**，比如我们常用的 MySQL，而且 Java 应用需要 **通过 JDBC 访问数据库**。

在分布式事务中，各本地事务称为分支事务，整个分布式事务称为全局事务，由多个分支事务组成。

## 2. AT 模式的机制

简单来说，AT 模式主要是基于两阶段提交协议演变而来：

- 一阶段：**业务数据和 undo_log 在同一个本地事务中提交 (提交前需要获取全局锁)**，然后就 **释放本地锁和连接资源**；
- 二阶段（分为全局提交或回滚）：
  - **全局提交**：若 **各分支事务都可提交**，则全局事务也为提交状态，此过程是 **异步** 的（快速完成）；
  - **全局回滚**：若 **各分支事务有一个不可提交**，则全局事务为回滚状态，主要通过一阶段生成的 **undo_log** 进行反向补偿。

在两阶段提交中，会涉及到 **本地锁/全局锁、本地事务/全局事务的提交/回滚** 等等，下面分别从 **写隔离** 和 **读隔离** 来说明。

### 2.1 写隔离

在本地事务的基础上，Seata AT 模式的分布式写隔离主要靠以下两点来保证：

- 一阶段 **本地事务提交前**，需要 **先拿到全局锁**；若拿不到则会进行重试，**超时后** 将会放弃事务的执行，并 **回滚本地事务** 和 **释放本地锁**；
- **全局事务提交/回滚后，才释放全局锁**；

由于 **全局锁是在整个全局事务过程中持有的**，所以 **不会发生脏写** 问题。

下面用官方的一个例子来加以说明：两个全局事务 tx1 和 tx2，分别对 a 表的 m 字段进行更新操作，m 的初始值 1000。

1. tx1 开启本地事务，拿到本地锁后执行更新操作；
2. tx1 本地事务更新完成，**先拿到该记录的全局锁，才能提交** 然后释放本地锁；
3. tx2 开启本地事务，拿到本地锁后执行更新操作；
4. tx2 本地事务更新完成，先拿到该记录的全局锁，但此时全局锁被 tx1 持有，所以暂时不能提交本地事务，tx2 只能重试等待；
5. tx1 提交全局事务，然后释放全局锁；
6. tx2 重试拿到全局锁，才能提交本地事务，然后释放本地锁。

![Write-Isolation: Commit](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fseata.io%2Fzh-cn%2Fassets%2Fimages-2023_12_04-1701697181.png)

如果 tx1 需要全局回滚（某个其他/自己分支执行失败需要回滚），则 tx1 需要重新获取本地锁，然后才能进行反向补偿，实现分支的回滚。

> 注意：这里的反向补偿其实是本地事务执行更新操作（更新成原来的数据），然后提交本地事务。

若此时该数据的本地锁被 tx2 持有，而 tx2 又需要获取全局锁来提交本地事务，从而释放本地锁。即 tx1 持有全局锁，要获取本地锁，tx2 持有本地锁，要获取全局锁，此时会不会发生死锁呢？显然不会，因为前面说过 tx2 获取不到全局锁会进行重试，**超时后会放弃全局事务**，所以自然会 **回滚本地事务并释放本地锁**，tx1 此时就可以获取到本地锁，从而完成反向补偿，回滚了全局事务。

![Write-Isolation: Rollback](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fseata.io%2Fzh-cn%2Fassets%2Fimages-2023_12_04-1701698191.png)

### 2.2 读隔离

当 **本地事务** 的隔离级别是 **读已提交（Read Committed）或以上** 时，Seata AT 模式的 **默认全局隔离级别** 是 **读未提交**（Read Uncommitted）。

> 因为 tx1 本地事务提交后，全局事务未提交前，tx2 也能读取到 tx1 本地事务提交后的数据。

若应用需要 **全局的读已提交** 的隔离级别，则可通过对 **SELECT FOR UPDATE** 语句的代理来实现。

> 普通 SELECT 语句并没有进行代理，因为这样会消耗一定的性能。

在 Seata AT 模式中，**SELECT FOR UPDATE 语句执行前需要先获取到全局锁**，如果获取不到则会释放本地锁（SELECT FOR UPDATE 执行前会获取本地锁），并进行重试。**这个过程的查询是被阻塞的，直到拿到全局锁，才能返回数据**。

![Read Isolation: SELECT FOR UPDATE](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fseata.io%2Fzh-cn%2Fassets%2Fimages-2023_12_04-1701699111.png)

## 3. AT 模式的代理操作有哪些？

开头说到，AT 模式是一种 **非侵入式** 的解决方案，即 **Seata 对数据库做了代理操作**，那么这些代理操作具体做了什么呢？

下面以一个 product 表为例，将两阶段提交分开讲解。SQL 为 `update product set name = 'GTS' where name = 'TXC'`。

| Field | Type         | Key     |
| ----- | ------------ | ------- |
| id    | bigint(20)   | PRIMARY |
| name  | varchar(100) |         |
| since | varchar(100) |         |

在讲解之前，先来复习下 Seata 分布式事务的执行过程：

1. **TM 向 TC 申请开启一个全局事务，全局事务创建成功并生成一个全局唯一的 XID**；

   > **XID 通过 RPC 在微服务调用链路的 context 中传播**。

2. **RM 向 TC 注册分支事务，将其纳入 XID 对应全局事务的管辖**；

3. **TM 向 TC 发起针对 XID 的全局提交或回滚决议**；

4. **TC 调度 XID 下管辖的全部分支事务完成提交或回滚请求**。

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fseata.io%2Fzh-cn%2Fassets%2Fimages-2023_12_04-1701703067.png)

还需要知道每个业务数据库新增的 undo_log 表字段：

```sql
-- for AT mode you must to init this sql for you business database. the seata server not need it.
CREATE TABLE IF NOT EXISTS `undo_log`
(
    `branch_id`     BIGINT       NOT NULL COMMENT 'branch transaction id',
    `xid`           VARCHAR(128) NOT NULL COMMENT 'global transaction id',
    `context`       VARCHAR(128) NOT NULL COMMENT 'undo_log context,such as serialization',
    `rollback_info` LONGBLOB     NOT NULL COMMENT 'rollback info',
    `log_status`    INT(11)      NOT NULL COMMENT '0:normal status,1:defense status',
    `log_created`   DATETIME(6)  NOT NULL COMMENT 'create datetime',
    `log_modified`  DATETIME(6)  NOT NULL COMMENT 'modify datetime',
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COMMENT ='AT transaction mode undo table';
ALTER TABLE `undo_log` ADD INDEX `ix_log_created` (`log_created`);
```

### 3.1 一阶段提交

我们知道，在一阶段中 **业务数据和 undo_log 在同一个本地事务中提交 (提交前需要获取全局锁)**，然后就 **释放本地锁和连接资源**。在这个过程中涉及到以下几个代理操作：

- **SQL 执行前**：查询记录的前镜像；
- **SQL 执行后**：
  - 查询记录的后镜像；
  - 插入回滚日志到 undo_log 表中。
- **本地事务提交前**：向 TC 注册分支（申请该记录的全局锁）；
- **本地事务提交时**：业务数据的更新和生成的 undo_log 一并提交；
- **本地事务提交后**：将本地事务的提交结果（提交/回滚）上报给 TC。

结合示例（SQL 为 `update product set name = 'GTS' where name = 'TXC'`），整个过程步骤如下：

**1、查询记录的前镜像**：根据 SQL 解析后的条件，生成查询语句：

```sql
select id, name, since from product where name = 'TXC';
```

得到前镜像：

| id   | name | since |
| ---- | ---- | ----- |
| 1    | TXC  | 2014  |

**2、执行 SQL**：更新该记录的 name 为 'GTS'。

**3、查询记录的后镜像**：根据前镜像结果，通过 **主键** 查询数据：

```sql
select id, name, since from product where id = 1;
```

得到后镜像：

| id   | name | since |
| ---- | ---- | ----- |
| 1    | GTS  | 2014  |

**4、插入 undo_log**：把前后镜像数据和业务 SQL 的信息组合成一条 undo_log，插入到 undo_log 表中，undo 信息为：

```json
{
    "branchId": 641789253,
    "undoItems": [{
        "afterImage": {
            "rows": [{
                "fields": [{
                    "name": "id",
                    "type": 4,
                    "value": 1
                }, {
                    "name": "name",
                    "type": 12,
                    "value": "GTS"
                }, {
                    "name": "since",
                    "type": 12,
                    "value": "2014"
                }]
            }],
            "tableName": "product"
        },
        "beforeImage": {
            "rows": [{
                "fields": [{
                    "name": "id",
                    "type": 4,
                    "value": 1
                }, {
                    "name": "name",
                    "type": 12,
                    "value": "TXC"
                }, {
                    "name": "since",
                    "type": 12,
                    "value": "2014"
                }]
            }],
            "tableName": "product"
        },
        "sqlType": "UPDATE"
    }],
    "xid": "xid:xxx"
}
```

**5、提交前向 TC 注册分支**：申请 product 表中主键记录为 1 记录的 **全局锁**。

**6、提交本地事务**：业务数据的更新和生成的 undo_log 一并提交。

**7、提交后将本地事务的提交结果（提交/回滚）上报给 TC**。

### 3.2 二阶段提交 — 提交

若全局事务可以进行提交（分支事务都可提交时，TM/RM 会收到 TC 的分支提交请求），TM/RM 则会把请求放入一个 **异步队列** 中，然后马上返回提交成功的结果给 TC，后续将会 **异步地批量删除相应的 undo_log 记录**。

TC 会把最后全局事务的提交结果返回给 TM，TM 即启动 `@GlobalTransactional` 的业务，业务即完成了本次的全局事务。

### 3.3 二阶段提交 — 回滚

若全局事务需要进行回滚（分支事务至少有一个需要回滚时，TM/RM 会收到 TC 的分支回滚请求），执行如下操作：

1. TM/RM 开启一个本地事务；

2. 通过 XID 和 BranchID 查找出对应的 undo_log 记录；

3. **数据校验**：用 undo_log 中的后镜像和当前数据做对比：

   - 若相同则说明数据没有被改动过，执行后续步骤；
   - **若不同则说明数据被全局事务之外的操作做了修改**，此时需要根据配置策略做处理。

4. 根据 undo_log 中的前镜像和业务 SQL 的信息生成回滚 SQL，进行反向补偿：

   ```sql
   update product set name = 'TXC' where id = 1;
   ```

5. 提交本地事务，把执行结果上报给 TC；

6. TC 会把最后全局事务的回滚结果返回给 TM，TM 即启动 `@GlobalTransactional` 的业务，业务即可捕获到对应的回滚异常。


