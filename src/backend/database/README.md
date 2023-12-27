---
title: 数据库
date: 2023-01-23
icon: database
index: false
dir:
  order: 2

# 分类
category:
 - 导航
# 标签
tag:
 - 导航

sticky: false
# 是否收藏在博客主题的文章列表中，当填入数字时，数字越大，排名越靠前。
star: false
# 是否将该文章添加至文章列表中
article: false
# 是否将该文章添加至时间线中
timeline: false
---

::: tip 相关内容
数据库相关知识，MySQL、Redis 等！
:::

## MySQL

::: note 基础
- [MySQL 常见存储引擎](mysql/basis/MySQL常见存储引擎.md)
- [select 执行流程](mysql/basis/select执行流程.md)
:::

::: note 索引
- [执行计划之 explain](mysql/index/执行计划之explain.md)
- [索引覆盖和索引条件下推](mysql/index/索引覆盖和索引条件下推.md)
- [联合索引与最左前缀匹配](mysql/index/联合索引与最左前缀匹配.md)
:::

::: note 日志
- [redo log：崩溃恢复神器](mysql/log/redo%20log：崩溃恢复神器.md)
- [binlog：主从复制和备份](mysql/log/binlog：主从复制和备份.md)
- [update 执行流程](mysql/log/update%20执行流程.md)
- [两阶段提交有什么问题](mysql/log/两阶段提交有什么问题.md)
- [undo log：世上真有后悔药](mysql/log/undo%20log：世上真有后悔药.md)

:::

::: note 事务
- [初识事务](mysql/transaction/初识事务.md)
- [事务隔离级别](mysql/transaction/事务隔离级别.md)
- [隔离级别的实现原理](mysql/transaction/隔离级别的实现原理.md)

:::

::: note 缓冲池
- [了解 Buffer Pool](mysql/buffer_pool/了解BufferPool.md)
- [提高缓存命中率的 LRU 链表](mysql/buffer_pool/提高缓存命中率的LRU链表.md)
:::

::: note 锁
- [MySQL 中的锁](mysql/lock/MySQL中的锁.md)
- [行锁的加锁规则](mysql/lock/行锁的加锁规则.md)

:::


<!-- --------------------------------------------------- -->
## Redis

::: note 基础
- [kv 数据库如何实现](redis/basis/kv数据库如何实现.md)
:::

::: note 数据结构
- [Redis 底层数据结构](redis/data_structure/redis底层数据结构.md)
- [Redis 数据类型](redis/data_structure/redis数据类型.md)

:::

::: note 持久化

:::

::: note 功能模块

:::

::: note 缓存

:::

::: note 高可用

:::
