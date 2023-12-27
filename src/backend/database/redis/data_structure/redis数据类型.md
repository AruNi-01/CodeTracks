---
# 当前页面内容标题
title: Redis 数据类型
date: 2023-12-27
order: 2
#icon: write

# 分类
category:
 - 数据库
tag:
 - Redis

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

Redis 并没有直接使用数据结构来实现键值对数据库，而是 **基于数据结构创建了一些数据类型**，简单的五种数据类型分别是：**字符串 String、列表 List、哈希 Hash、集合 Set、有序集合 zSet**。此外还有一些高级的数据类型，例如 BitMap、HyperLogLog、GEO、Stream。

> Redis 中的 **数据结构** 包括：简单动态字符串 SDS、链表 List、压缩列表 ziplist、哈希表 hash、整数集合 intset、跳表 zskiplist、quicklist、listpack。本章主要是讲解数据类型，而不是底层实现的数据结构，数据结构可看 [Redis 底层数据结构](https://code.0x3f4.run/backend/database/redis/data_structure/redis%E5%BA%95%E5%B1%82%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html)。

:::

## > 前置知识：redisObject

Redis 使用 **redisObject 结构体表示各种数据结构**（Redis 种把各种数据类型看成不同的对象），redisObject 结构体中的属性如下：

```c
typedef struct redisObject {
    // 类型
    unsigned type:4;
    
    // 编码
    unsigned encoding:4;
    
    // 指向 type 类型底层实现（数据结构）的指针
    void *ptr;
} robj;
```

接下来分别简单的介绍一下这三个属性。

::: info 类型（type）

**type 属性记录了对象（数据结构）的类型**，即 String、List、Hash、Set、zSet。

在 Redis 种，key 总是 String 类型，而 value 可以是任意一种对象。

我们也可以使用 `TYPE key` 命令来查看该 key 对应 **value 的类型**。

:::

::: info 编码（encoding）和 底层实现的指针（ptr）

**encoding 属性记录了对象的编码**，也就是 **这个对象使用了什么数据结构作为底层实现**，而 **ptr 指针则指向了这个底层的数据结构**。

Redis 中每种对象都至少使用了 2 种不同的编码，如下图列出了每种类型的对象可以使用的编码：

![image-20230223185531411](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302231858184.png)

Redis 为对象提供至少 2 种不同的编码，Redis 为什么要这么做呢？

不同的编码对应着不同的底层数据结构，这就意味着可以 **根据不同的场景来选择不同的数据结构**，从而达到更加高效的数据存取，因为每种数据结构都有各自的优势与劣势。

> Redis 底层的数据结构本篇文章就不细讲了。

:::

知道了 redisObject 后，下面开始本篇文章的正题。

## 1. 字符串 String

String 是使用频率最高的数据类型，除了 key 总是使用 String 外，value 使用 String 的场景也非常多。

### 1.1 编码方式

需要注意的是，String 不仅仅是存储字符串，也可以存储数字（整数或浮点数），整数对应到编码里的 `REDIS_ENCODING_INT`，此时的 ptr 的类型就从 `void*` 转换成了 `long`。

例如，使用一个 SET 命令将 value 设置为一个数字 `SET number 10086`，那么这个 value 的字符串对象如下图所示：

![image-20231226213444423](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703597686.png)

对于数值是一个字符串的对象，String 对象有两种编码方式：

- **raw**：字符串 **长度大于 39 字节**；
- **embstr**：字符串 **长度小于等于 39 字节**。

> 注意：Redis 5.0 后字节分界点是 44 字节。

下面是一个 raw 编码方式的 String 对象：

```sh
redis> SET story "Long, long, long ago there lived a king ..."
OK
```

![image-20231226214402779](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703598245.png)

那 embstr 编码与 raw 有什么区别？为什么字符串长度较短时要使用 embstr 呢？

其实，**row 编码需要两次内存分配**，分别为 redisObject 和 sdshdr 的内存分配，而 **embstr 只需要一次**，因为其分配的是 **一块连续的内存区域**。embstr 编码的 Sting 对象如下图所示：

![image-20231226214841618](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703598523.png)

embstr 编码不仅 **减少了内存分配/释放的次数**，而且连续的内存区域也可以 **更好的利用 CPU 缓存**。

另外，**String 对象也是可以保存 long、double 类型的**，**浮点数** 在 Redis 中也是 **作为字符串来保存**，在有需要的时候（比如运算），程序会将字符串转回浮点数值，执行完操作后再转会字符串保存。

::: danger 注意

由于 Redis 没有为 embstr 编码的 String 对象提供修改值的命令，在修改时会先转为 raw 编码，所以 **embstr 编码的 String 对象在执行完修改命令后总会变成一个 raw 编码的 String 对象**。

:::

### 1.2 应用场景

String 对象的应用场景很经典，有如下：

- **缓存对象**，例如给热榜帖子做缓存，key 为帖子 id，value 为帖子信息的 json 字符串；
- **计数器**，因为 Redis 在处理请求时是单线程，**本身能保证操作的原子性**，所以可以做计数器（通过 `INCR` 和 `DECR` 命令），例如访问次数、库存量等；
- **分布式锁**，String 数据类型有一个 `SET key value NX PX time` 原子命令，可以确保 key 不存在才 set 成功，而且 Redis 本身就支持分布式，因此可以把 key 作为锁 key，只有 set 成功才能获取到分布式锁；
- **分布式 Session**，当项目使用分布式部署时，Session 是保存到单独的服务器上的，所以需要额外的同步操作，而 Redis 本身支持分布式，所以可以把 Session 保存到 Redis 中，所有服务器都向 Redis 获取即可。

## 2. 列表 List

### 2.1 编码方式

List 对象的编码方式有两种：

- **压缩列表 ziplist**：存储的元素 **长度小于 64 字节，且数量小于 512 个**（条件可通过参数修改）；
- **双向列表 linkedlist**：不满足上面两个条件。

> 注意：**Redis 3.2 后 List 的底层实现只有 quicklist**，代替了 ziplist 和 linkedlist，具体原因查看：[Redis 底层数据结构](https://code.0x3f4.run/backend/database/redis/data_structure/redis%E5%BA%95%E5%B1%82%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html#_8-quicklist)。

例如，简单的向一个 numbers 列表中插入三个数据：

```c
redis> RPUSH numbers 1 "three" 5
(integer) 3
```

![image-20231226231912948](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703603954.png)

如果编码方式是 linkedlist，那么键值对示意图如下所示：

![image-20231226232705281](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703604426.png)

需要注意的是，**linkedlist 中的每个值对象，其实是一个 String 对象**，在哈希、集合、有序集合中也会有嵌套 String 对象。

所以上面的 three 值对象其实是下面这样：

![image-20231226232859058](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_26-1703604540.png)

### 2.2 使用场景

List 是一个先进先出的有序队列，所以一般 **要求顺序的业务场景**，都可以使用 List，比如：

- **简单的消息队列**，不够成熟，例如没有消息丢失重试机制、不支持多次消费，更推荐使用 Stream 或 RabbitMQ、Kafka 等消息队列；

- **最新列表**：某个帖子的点赞列表按最新顺序展示，就可以把 key 作为帖子 id，点赞者 id 作为 value 加入到 list 中；

  > 不过 **不适用于更新频繁的分页列表**，因为可能会导致 **列表元素重复或遗漏**，因为可能在两次分页查询过程中混入了一个插入到表头的操作，这样就会在第二页中查询到第一页中的数据；而且 **List 不能实现范围查询**，比如某个时间范围，需要通过 zSet 来实现。

- **定时排行榜**：与上面最新列表类似，通过 `LRANGE key start stop` 命令获取排名在 start ~ stop 之间的数据。不过不能实现实时排名，因为元素入队后排名就定了，不能动态修改，只能重新插入，实时排行榜也需要通过 zSet 实现。

可以发现，最新列表和排行榜其实都可以通过 zSet 实现，而且功能还更强大，为什么还要用 List？这是因为 **List 类型占用的内存比 zSet 要少很多**，所以没有其他必须因素，还是用 List 比较合适。

## 3. 哈希 Hash

### 3.1 编码方式

Hash 对象的编码方式也有两种：

- **压缩列表 ziplist**：存储的所有键值对的 **键和值 长度都小于 64 字节，且键值对数量小于 512 个**（条件可通过参数修改）；
- **哈希表 hashtable**：不满足上面两个条件。

> 注意：**Redis 7.0 后 压缩列表已经废弃，被 listpack 替代**，具体原因查看：[Redis 底层数据结构](https://code.0x3f4.run/backend/database/redis/data_structure/redis%E5%BA%95%E5%B1%82%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html#_9-listpack)。

当使用压缩列表保存键值对时，采用的是尾插法，如下图所示：

![image-20231227143128794](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703658692.png)

当使用哈希表保存键值对时，**哈希表的每个键都是一个字符串对象**，该对象中保存了键值对的键，同理，哈希表的每个值也是一个字符串对象，如下图所示：

![image-20231227143338258](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703658820.png)

### 3.2 使用场景

Hash 数据类型主要有以下两个应用场景：

- **存储对象**，如果需要 **存储的对象不多时**，可以把 **key 设为固定值**，field 为 ID:属性，value 为属性值；如果 **存储的对象很多时**，则可以 **把 key 做一个动态分离**，分配多个 key 槽位，将 key 设置成 user:序号（序号可为 0~999），这样对象需要通过一个哈希映射函数 `H(k) = k % 1000`，来确定对象分配到哪个 key 槽中；

- **购物车**，用户 id 为 key，商品 id 为 field，商品数量为 value，刚好构成了购物车三要素，如下图所示：

  ![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fcdn.xiaolincoding.com%2Fgh%2Fxiaolincoder%2Fredis%2F%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B-2023_12_27-1703661242.png)

在将 String 对象时说过，将对象使用 Json 序列化后也可以存储，**那么 String + Json 和 Hash 到底应该用哪个存储对象**？

**当对象的属性修改频繁时，不适合使用 String + Json**，因为不够灵活，**每次都需要重新将整个对象序列化**，而 **Hash 可以针对某个属性单独修改**，无需序列化，比如商品的销量、评价数。

不过，**当对象的某个属性不是基本类型或字符串时，Hash 对象需要手动进行序列化**，比如用户标签，是一个标签对象 list，此时直接使用 String + Json 会更简单。

所以 **对象存储一般使用 String + Json，某些修改频繁的属性可以单独抽出来使用 Hash**。

## 4. 集合 Set

### 4.1 编码方式

Set 对象的编码方式也有两种：

- **整数集合 intset**：存储的 **元素都是整数值，且元素数量不超过 512 个**；
- **哈希表 hashtable**：不满足上面两个条件。

例如，下面是一个 intset 编码的 Set 对象：

![image-20231227152842681](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703662123.png)

contents 数组的类型由 encoding 决定。

而如果是 hashtable 编码的 Set 对象，**哈希表的每个键是一个字符串对象，该对象保存了集合元素，哈希表的值则都被置为 NULL**。如下所示：

![image-20231227153541118](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703662542.png)

### 4.2 使用场景

Set 对象是无序、不重复的，并且支持去交并差集等操作，常见的使用场景如下：

- **点赞，收藏**：
  - 点赞：SADD like:postId userId；
  - 取消点赞：SREM like:postId userId；
  - 用户是否点赞：SISMEMBER like:postId userId；
  - 获取点赞列表：SMEMBERS like:postId；
  - 获取点赞数量：SCARD like:postId。
- **[共同] 关注/粉丝/感兴趣的人集合**：key 为 follow:userId，value 为 userId 关注的用户；粉丝类似，key 为 follower:userId，value 为该用户的粉丝列表。共同关注的人只需取两个 follow:userId 的交集即可；
- **随机展示/随机抽奖**：可使用 `SRANDMEMBER  key [count]` 随机获取 Set 对象中的 count 个元素，若是需要不可重复获取，可使用 `SPOP key [count]`；
- **黑白名单**：可使用 SISMEMBER 快速判断某个用户、IP、设备是否处于黑白名单中。

## 5. 有序集合 zSet

### 5.1 编码方式

zSet 对象的编码方式也有两种：

- **压缩列表 ziplist**：存储的所有元素 **长度都小于 64 字节，且数量小于 128 个**（条件可通过参数修改）；
- **跳表 skiplist**：不满足上面两个条件。

> 注意：**Redis 7.0 后 压缩列表已经废弃，被 listpack 替代**，具体原因查看：[Redis 底层数据结构](https://code.0x3f4.run/backend/database/redis/data_structure/redis%E5%BA%95%E5%B1%82%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html#_9-listpack)。

当使用 ziplist 编码时，**每个集合元素使用两个紧挨在一起的压缩列表 entry 来保存**，分别保存元素的成员 member 和分值 score，**压缩列表内的集合元素按照 score 从小到大排序**，如下所示：

![image-20231227163438282](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703666079.png)

而使用 skiplist 编码时，zSet 对象使用 zset 结构作为底层实现，**为了让 zSet 的查找和范围型操作都尽可能快地执行**，其同时包含跳表和哈希字典：

```c
typedef struct zset {
    zskiplist *zsl;
    dict *dict;
} zset;
```

**跳表按照分值从小到大保存了所有集合元素，哈希字典则只保存从成员到分值的映射**，通过此可以使用 O(1) 复杂度获取某个成员的分值（ZSCORE 命令）。

跳表和哈希字典会通过一个指针来 **共享相同元素的成员和分值**，所以 **不会造成额外的内存消耗**。

skiplist 编码的 zSet 对象如下图所示（为了方便，图中并没有画出跳表和字典的共享属性）：

![image-20231227164421865](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%2FRedis%20%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B.assets-2023_12_27-1703666663.png)

### 5.2 使用场景

由于 zSet 对象可以根据 score 来排序，所以在排序的应用场景很常见，例如 **最新列表、排行榜**，以及之前在 List 对象中讲到的 **频繁更新的分页数据、范围查询**。下面讲讲最经典的排行榜功能。

排行榜的 key 可以设置成某个排行榜的标识，比如 post:rank，score 设置为帖子的分数，用户在查看、点赞、评论后，都将该帖子的 score 加上对应的值，member 则为帖子的 id，则该 zSet 的操作有如下：

```shell
ZADD post:rank 0 post:001	# 添加帖子
(integer) 1

ZINCRBY post:rank 2 post:001	# 增加帖子的分数
"2"

ZSCORE post:rank post:001	# 获取帖子的分数
"2"

ZREVRANGE post:rank 0 5 WITHSCORES	# 展示前 5 名（倒序获取）的帖子成员
"post:001"

ZRANGEBYSCORE post:rank 2 100 WITHSCORES   # 展示帖子分数在 2-100 的帖子成员
"post:001"
```

## 6. Bitmap

Bitmap 使用 **String 类型作为底层数据结构** 的一种统计 **二值状态** 的数据类型。**String 类型会保存为一个二进制的字节数组**，每一个 bit 位表示一个元素的二值状态。

二值状态指的是元素的取值只有 0 和 1 两种，在统计打卡、签到等场景中非常经典。例如每个用户一天的签到只有一个 bit 位就能表示，一个月最多 31 个 bit 位，一年也只需要 365 个 bit 位，**占用的空间十分少**。

Bitmap 提供了 GETBIT 和 SETBIT 操作，使用偏移量 offset 对 bit 数组中的某一个 bit 位进行操作（offset 从 0 开始）。而且 Bitmap 还提供了 **BITCOUNT 操作来统计 bit 数组中所有 1 的个数**，以及 **BITOP 命令对多个 Bitmap 按位做与、或、异或操作**，结果会保存到一个新的 Bitmap 中。

例如统计用户在 2023 年 12 月的签到情况，可以进行如下操作：

```shell
SETBIT user:sign:001:202312 4 1		# 12 月 5 号 已签到

GETBIT user:sign:001:202312 4	# 检查 001 用户 12 月 5 号是否签到

BITCOUNT user:sign:001:202312 	# 统计 001 用户 12 月的签到次数
```

如果需要统计 1 亿个用户中，连续签到10 天的用户数，则可以把每天的日期作为 key，每个 key 对应一个 1 亿位的 Bitmap，然后对这 10 天的 Bitmap 做与操作，放入一个新的 Bitmap 中，最后对这个 Bitmap 做 BITCOUNT 操作，即可得到连续签到 10 天的用户数量。

使用 Bitmap 来统计，每天需要一个 1 亿位的 Bitmap，大约 12M 内存（1*10^8/8/1024/1024），10 天则需要 120M，是比较节省内存的。而且我们一般会给 Bitmap 设置过期时间以自动删除不需要的记录。

所以 **Bitmap 非常适合用来统计数据的二值状态，在记录的数据量较大时，它能够有效的节省内存空间**。

## 7. HyperLogLog

HyperLogLog 是一种用于 **统计基数** 的数据类型（**基数统计就是指统计一个集合中不重复的元素个数**），即使 **在集合数量非常多时，它所占用的空间都是固定且很小的**。

在 Redis 中，一个 HyperLogLog 只需花费 12KB 内存，就能统计接近 2^64 个元素的基数，比 Set、Hash 这种元素越多越耗内存的类型要节省很多空间。

比如，在统计网页的 UV（Unique Visitor）：

```shell
PFADD page1:uv user1 user2 user3 user4	# 向 page1:uv HyperLogLog 中添加元素

PFCOUNT page1:uv	# 获取 page1 的 UV 值
```

另外，它还提供 PFMERGE 命令将多个 HyperLogLog 合并成一个。

HyperLogLog 虽然在海量数据的基数统计中非常节约内存，但是它的统计规则是 **基于概率完成的**，标准误算率是 0.81%，所以如果统计的 UV 是 100 万，但实际的可能有 101 万，误差不算大，**但若要精确的统计，还得使用 Set 或 Hash 类型**。

 ## 8. GEO

GEO 类型也是 Redis 一种扩展类型，主要用于 **位置信息服务（Location-Based Service, LBS）应用**，例如附近餐厅、打车软件。

在 LBS 应用中，需要使用经纬度信息来计算两个实体之间的距离，比如一辆车或一个用户对应一组经纬度，然后 **需要进行某个经纬度的范围查询**。

**GEO 的底层数据结构是使用 zSet + GeoHash 编码来实现的**，比如，我们使用 zSet 来保存车辆的经纬度信息，**field 是车辆 ID，权重分数是经纬度信息**，如下所示：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2Fa9%2F4e-2023_12_27-1703679679.jpeg)

但 zSet 的 **score 是一个浮点数，而 一组经纬度包含两个值，怎么保存呢**？这就要用到 GEO 的 GeoHash 编码了。

### 8.1 GeoHash 编码

GeoHash 编码并不是 Redis 设计出来的，而是在 LBS 应用业界中广泛使用的一种编码方法，这个方法的原理是 **二分区间，区间编码**。

当需要对一组经纬度进行 GeoHash 编码时，**首先要对经度和纬度分别编码，然后再把这两个编码组合成一个最终编码**。

先来看看经纬度的单独编码过程。

一个经度的范围是 [-180, 180]，GeoHash 编码会把一个经度值编码成一个 N 位的二进制值，即 **对经度范围 [-180, 180] 做 N 次二分区操作**（N 可自定义）。**每二分一次区间，都会使经度值落在这两个区间的其中一个，如果落到左分区则用 0 表示，落到右分区则用 1 表示。这样每完成一次二分区，就可以得到 1 位编码值。这样当做完 N 次二分区后，经度值就可以使用一个 N bit 的数来表示了**。

假设对经度值 116.37 进行 5 次的二分区，得到的编码如下所示：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2F3c%2Ff2-2023_12_27-1703681060.jpeg)

对于纬度也同理，只是范围在 [-90, 90]，假设对纬度值 39.86 进行 5 次的二分区，得到的编码如下所示：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2F65%2F6d-2023_12_27-1703681123.jpeg)

这样对经纬度的分别编码就完成了，接下来只需要将各自的编码组合在一起，组合规则是：**最终编码值的偶数位上依次是经度得编码值，奇数位上依次是纬度得编码值**，其中 **偶数首位在奇数首位的前面**。

上面的经纬度得到的首次编码分别是 11010 和 10111，组合之后的最终编码如下：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2F4a%2F87-2023_12_27-1703681553.jpeg)

所以，使用了 GeoHash 编码后，一组经纬度（116.37, 39.86）就可以使用 1110011101 这一个值表示了，就可以保存为 zSet 的 score 了。

**使用了 GeoHash 编码后，就相当于把整个地理空间划分成了一个个方格，每个方格对应了 GeoHash 中的一个分区**。例如，把经纬度分别做 1 次二分区，总共就会得到 4 个分区，如下图所示：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2F2a%2F74-2023_12_27-1703682202.jpeg)

- 分区一：[-180,0) 和 [-90,0)，编码 00；
- 分区二：[-180,0) 和 [0,90]，编码 01；
- 分区三：[0,180] 和 [-90,0)，编码 10；
- 分区四：[0,180] 和 [0,90]，编码 11。

这样 **在使用 zSet 范围查询得到相近的编码值，在实际的地理空间上，也是相邻的方格**，所以实现了 LBS 应用中搜索附件的人或物的功能了。

不过，**有些编码值虽然在大小上接近，但实际的方格却距离较远**，比如下面对经纬度分别做 2 次二分区，得到 16 个分区：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/https%2Fstatic001.geekbang.org%2Fresource%2Fimage%2F0d%2Fba-2023_12_27-1703682526.jpeg)

所以 **为了避免查询不准确的问题，可以同时查询给定经纬度所在方格周围的 4 个或 8 个方格**。

### 8.2 应用场景

Redis 中的 GEO 类型最经典的应用场景就是 LBS 应用，查找附近的人，打车等。

在使用 GEO 时，最常用命令如下：

```shell
# 存储指定的地理空间位置，将经度(longitude)、纬度(latitude)、位置名称(member)添加到指定的 key 中。
GEOADD key longitude latitude member [longitude latitude member ...]

# 返回两个给定位置之间的距离。
GEODIST key member1 member2 [m|km|ft|mi]

# 根据用户给定的经纬度坐标来获取指定范围内的地理位置集合。
GEORADIUS key longitude latitude radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key] [STOREDIST key]
```

假设一个车辆的 ID 是 33，经纬度是（116.034579，39.030452），可以使用 GEO 集合保存所有车辆的经纬度，key 是 cars:locations：

```shell
GEOADD cars:locations 116.034579 39.030452 33
```

查找附件的网约车时，就可以使用 GEORADIUS 命令：

```shell
GEORADIUS cars:locations 116.054579 39.030452 5 km ASC COUNT 10
```

LBS 应用执行上面的命令时，Redis 会根据输入的用户的经纬度信息（116.054579，39.030452 ），升序（从近到远）查找以这个经纬度为中心的 5 公里内的车辆信息，并返回给 LBS 应用。

## 9. 参考文章

- [Redis 实战经验](https://www.cnblogs.com/pangzizhe/tag/Redis/)
- [小林 coding](https://xiaolincoding.com)
- 《Redis 设计与实战》
- 《Redis 核心技术与实战》