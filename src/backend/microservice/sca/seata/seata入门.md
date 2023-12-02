---
# 当前页面内容标题
title: Seata 入门
date: 2023-12-01
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

## **1. 分布式事务问题**

单体应用被拆分成微服务应用，原来的三个模块被拆分成三个独立的应用，分别使用三个独立的数据源，业务操作需要调用三个服务来完成。例如，用户购买商品的业务逻辑，整个业务逻辑由 3 个微服务提供支持：

- 仓储服务：对给定的商品扣除仓储数量。
- 订单服务：根据采购需求创建订单。
- 帐户服务：从用户帐户中扣除余额。

![Architecture](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_29-1701262804.png)

此时每个服务内部的数据一致性由本地事务来保证，但是 **全局的数据一致性问题没法保证**。所以 **一次业务操作需要跨多个数据源或跨多个系统进行远程调用**，就会产生分布式事务问题。



## **2. 什么是 Seata**

Seata 是一款开源的分布式事务解决方案，致力于提供高性能和简单易用的分布式事务服务。

在学习 Seata 之前，先来了解一下一个分布式事务处理过程的 **一个 ID + 三个组件**：

- **Transaction ID（XID）事务 ID**：全局唯一的事务 ID；
- **Transaction Coordinator（TC）事务协调者**：维护全局和分支事务的状态，驱动全局事务提交或回滚；
- **Transaction Manager（TM）事务管理器**：定义全局事务的范围，开始全局事务、提交或回滚全局事务；
- **Resource Manager（RM）资源管理器**：管理分支事务处理的资源，与 TC 交谈以注册分支事务和报告分支事务的状态，并驱动分支事务提交或回滚。

一个分布式事务的处理过程如下（**重要**）：

1. **TM 向 TC 申请开启一个全局事务，全局事务创建成功并生成一个全局唯一的 XID**；

   > **XID 在微服务调用链路的 context 中传播**。

2. **RM 向 TC 注册分支事务，将其纳入 XID 对应全局事务的管辖**；

3. **TM 向 TC 发起针对 XID 的全局提交或回滚决议**；

4. **TC 调度 XID 下管辖的全部分支事务完成提交或回滚请求**。

![image-20231129211819932](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_29-1701263904.png)

Seata 的使用是非常简单的，当把 Seata 部署好之后，直接使用 `@GlobalTransactional` 注解到业务方法上即可。在后续搭建 Demo 的时候就深有体会了。

## **3. Seata 部署**

Seata 分 TC、TM 和 RM 三个角色，TC（Server端）为单独服务端部署，TM 和 RM（Client端）由业务系统集成。

### **3.1 启动 Server**

Server 端存储模式（store.mode）现有 file、db、redis、raft 四种（后续将引入 mongodb）：

- file 模式：无需改动，直接启动即可；
- db 模式：高可用模式，全局事务会话信息通过 db 共享，相应性能差些；
- redis 模式：Seata-Server 1.3 及以上版本支持，性能较高，存在事务信息丢失风险，请提前配置合适当前场景的 redis 持久化配置。

**一、启动包**

去[官网](https://github.com/seata/seata/releases)下载 Seata-Server，Seata 新版本的配置文件有所更变，推荐直接下载最新版本（我下载的 v1.7.0，最好与 client 端 pom 文件中的 seata 版本一致），最新版的部署指南：https://seata.io/zh-cn/docs/ops/deploy-guide-beginner.html。

seata 的存储模式、配置中心、注册中心都可以自定义，我们下面的演示存储模式为 db，配置中心和注册中心都是 Nacos。

资源目录 `.\seata\script` 下的文件介绍：

- client：存放 client 端 sql 脚本 (包含 undo_log 表) ，参数配置（v2.0.0 已移除，在[源码](https://github.com/seata/seata/tree/develop/script/client)中获取）

- config-center：各个配置中心参数导入脚本，config.txt(包含server和client，原名nacos-config.txt)为通用参数文件

- server：server端数据库脚本 (包含 lock_table、branch_table 与 global_table) 及各个容器配置

**二、建表 — db 模式**

全局事务会话信息由3块内容构成，全局事务 --> 分支事务 --> 全局锁，对应表 global_table、branch_table、lock_table。SQL 文件在 `.\seata\script\server\db` 目录下。

**三、修改 store.mode 为 db，修改数据库连接属性配置**

启动包：seata-->conf-->application.yml，修改 store.mode="db"。

```yaml
seata:
  config:
    # support: nacos, consul, apollo, zk, etcd3
    type: file
  registry:
    # support: nacos, eureka, redis, zk, consul, etcd3, sofa
    type: file
  store:
    # support: file 、 db 、 redis 、 raft
    mode: db
    # 配置 db
    db:
      datasource: druid
      db-type: mysql
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/seata?useSSL=false&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
      user: root
      password: 123456
      min-conn: 10
      max-conn: 100
      global-table: global_table
      branch-table: branch_table
      lock-table: lock_table
      distributed-lock-table: distributed_lock
      query-limit: 1000
      max-wait: 5000
  #  server:
  #    service-port: 8091 #If not configured, the default is '${server.port} + 1000'
```

**四、修改注册中心**

与上面 db 配置文件类似，修改 seata.registry：

```yaml
seata:
  config:
    # support: nacos, consul, apollo, zk, etcd3
    type: file
  registry:
    # support: nacos 、 eureka 、 redis 、 zk  、 consul 、 etcd3 、 sofa
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace:
      cluster: default
      username: 
      password: 
      context-path:
      ##if use MSE Nacos with auth, mutex with username/password attribute
      #access-key:
      #secret-key:
```

**五、修改配置中心**

修改 seata.config：

```yaml
seata:
  config:
    # support: nacos 、 consul 、 apollo 、 zk  、 etcd3
    type: file
    nacos:
      server-addr: 127.0.0.1:8848
      group: SEATA_GROUP
      namespace:
      username: 
      password: 
      context-path:
      data-id: seataServer.properties
      ##if use MSE Nacos with auth, mutex with username/password attribute
      #access-key:
      #secret-key:
```

> Tips：后续配置 client 时，确保 client 与 serve r的注册处于同一个 namespace 和 group，不然会找不到服务。

启动 Nacos，接着将 Seata 的配置上传到 Nacos。

通过 dataId 配置：

1. 从 v1.4.2 版本开始，已支持从一个 Nacos dataId 中获取所有配置信息，只需要额外添加一个 dataId 配置项。

2. 首先需要在 nacos 新建配置，此处 dataId 为 seataServer.properties，配置内容参考 `.\seata\script\config-center` 中的 config.txt 并按需修改保存。

   我们这里主要修改一个事务分组 `service.vgroupMapping.aaryn_test_tx_group` 和 存储模式 db `store.mode` 的内容：

   ```properties
   #Transaction routing rules configuration, only for the client
   # service.vgroupMapping.default_tx_group=default	# 指定事务分组至集群映射关系（等号右侧的集群名需要与Seata-server注册到Nacos的cluster保持一致）
   # 修改成自定义的事务分组
   service.vgroupMapping.aaryn_test_tx_group=default
   
   #Transaction storage configuration, only for the server. The file, db, and redis configuration values are optional.
   store.mode=db
   
   #These configurations are required if the `store mode` is `db`. If `store.mode,store.lock.mode,store.session.mode` are not equal to `db`, you can remove the configuration block.
   store.db.datasource=druid
   store.db.dbType=mysql
   store.db.driverClassName=com.mysql.cj.jdbc.Driver
   store.db.url=jdbc:mysql://localhost:3306/seata?useSSL=false&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
   store.db.user=root
   store.db.password=123456
   store.db.minConn=5
   store.db.maxConn=30
   store.db.globalTable=global_table
   store.db.branchTable=branch_table
   store.db.distributedLockTable=distributed_lock
   store.db.queryLimit=100
   store.db.lockTable=lock_table
   store.db.maxWait=5000
   
   ```

Nacos 新建配置，注意 Data ID 为  seataServer.properties，Group 为 SEATA_GROUP：

![image-20231202005345686](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701449626.png)

**六、启动**

> 先启动 Nacos。

命令启动：`seata-server.sh -h 127.0.0.1 -p 8091 -m db`，win 执行执行 `.\seata-server.bat`

- -h: 注册到注册中心的 ip    
- -p: Server rpc 监听端口   
- -m: 全局事务会话信息存储模式，file、db、redis，优先读取启动参数 (Seata-Server 1.3 及以上版本支持 redis)    
- -n: Server node，多个 Server 时，需区分各自节点，用于生成不同区间的 transactionId，以免冲突    
- -e: 多环境配置参考 http://seata.io/en-us/docs/ops/multi-configuration-isolation.html

启动后查看 Nacos 的服务列表，可以看到 seata-server 已经注册进来了：

![image-20231130150533386](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_30-1701327934.png)

### **3.2 业务系统集成 Client**

分布式事务业务示例说明：这里我们会创建三个服务，一个订单服务，一个库存服务，一个账户服务。

当用户下单时，会在订单服务中创建一个订单，然后通过远程调用库存服务来扣减下单商品的库存，再通过远程调用账户服务来扣减用户账户里面的余额，最后在订单服务中修改订单状态为已完成。

该操作跨越三个数据库，有两次远程调用，很明显会有分布式事务问题。

#### **3.2.1 数据库准备**

新建三个库，在每个库中新建对应的表：

- seata_account 库，t_account 用户表：

  ```SQL
  CREATE TABLE t_account (
  
    `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'id',
  
    `user_id` BIGINT(11) DEFAULT NULL COMMENT '用户id',
  
    `total` DECIMAL(10,0) DEFAULT NULL COMMENT '总额度',
  
    `used` DECIMAL(10,0) DEFAULT NULL COMMENT '已用余额',
  
    `residue` DECIMAL(10,0) DEFAULT '0' COMMENT '剩余可用额度'
  
  ) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
  
  
  INSERT INTO seata_account.t_account(`id`, `user_id`, `total`, `used`, `residue`)  VALUES ('1', '1', '1000', '0', '1000');
  ```

- seata_storage 库，t_storage 库存表：

  ```sql
  CREATE TABLE t_storage (
  
   `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
   `product_id` BIGINT(11) DEFAULT NULL COMMENT '产品id',
  
   `total` INT(11) DEFAULT NULL COMMENT '总库存',
  
   `used` INT(11) DEFAULT NULL COMMENT '已用库存',
  
   `residue` INT(11) DEFAULT NULL COMMENT '剩余库存'
  
  ) ENGINE=INNODB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
  
   
  INSERT INTO seata_storage.t_storage(`id`, `product_id`, `total`, `used`, `residue`) VALUES ('1', '1', '100', '0', '100');
  ```

- seata_order 库，t_order 订单表：

  ```sql
  CREATE TABLE t_order (
  
    `id` BIGINT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
    `user_id` BIGINT(11) DEFAULT NULL COMMENT '用户id',
  
    `product_id` BIGINT(11) DEFAULT NULL COMMENT '产品id',
  
    `count` INT(11) DEFAULT NULL COMMENT '数量',
  
    `money` DECIMAL(11,0) DEFAULT NULL COMMENT '金额',
  
    `status` INT(1) DEFAULT NULL COMMENT '订单状态：0：创建中；1：已完结' 
  
  ) ENGINE=INNODB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
  ```

除此之外，每个库下都要建立一个回滚日志表 undo_log（[官方 SQL 地址](https://github.com/seata/seata/blob/2.x/script/client/at/db/mysql.sql)）：

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

所有的数据库表：

![image-20231130132224847](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_30-1701321762.png)

#### **3.2.2 业务模块搭建**

业务需求：下订单 -> 减库存 -> 扣余额 -> 改（订单）状态。

我们在学习 Seata 时，都使用新版。所以先改下 父 pom，使用 springboot3、jdk17，可直接使用 [Cloud Native App Initializer (aliyun.com)](https://start.aliyun.com/) 生成：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.run.sca</groupId>
    <artifactId>SpringCloudAlibaba</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <modules>
        <module>cloudalibaba-provider-payment9001</module>
        <module>cloudalibaba-provider-payment9002</module>
        <module>cloudalibaba-consumer-order83</module>
        <module>cloudalibaba-config-nacos-client3377</module>
        <module>cloudalibaba-sentinel-service8401</module>
        <module>cloudalibaba-seata-order-service2001</module>
    </modules>

    <!-- 同一管理 jar 包版本 -->
    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>3.0.2</spring-boot.version>
        <spring-cloud-alibaba.version>2022.0.0.0-RC2</spring-cloud-alibaba.version>
        <spring-cloud.version>2022.0.0-RC2</spring-cloud.version>
        <junit.version>4.12</junit.version>
        <log4j.version>1.2.17</log4j.version>
        <lombok.version>1.18.30</lombok.version>
        <mysql.version>8.0.33</mysql.version>
    </properties>

    <!-- 子模块继承之后，提供作用：锁定版本+子module不用写groupId和version  -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <configuration>
                    <mainClass>com.run.sca.SpringCloudAlibaba.SpringCloudAlibabaApplication</mainClass>
                    <skip>true</skip>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
        </repository>
    </repositories>

</project>
```

新建 cloudalibaba-seata-order-service2001 订单服务模块，pom：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.run.sca</groupId>
        <artifactId>SpringCloudAlibaba</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>cloudalibaba-seata-order-service2001</artifactId>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!--nacos-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <!--seata-->
        <dependency>
            <groupId>io.seata</groupId>
            <artifactId>seata-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>io.seata</groupId>
                    <artifactId>seata-spring-boot-starter</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!--feign，Hoxton.M2 RELEASED 版本之后不再使用 ribbon，而是 spring-cloud-loadbalancer-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <!--web-actuator-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <!--mysql-druid-->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.2.16</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>3.0.2</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    </dependencies>

</project>
```

yml 配置文件：

```yaml
server:
  port: 2001

spring:
  application:
    name: seata-order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/seata_order?useSSL=false&useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456

seata:
    # 自定义事务组名称需要与 seata 配置中心中的配置对应（service.vgroupMapping.aaryn_test_tx_group=default）
  tx-service-group: aaryn_test_tx_group
  service:
    # 虚拟组和分组的映射
    vgroup-mapping:
      aaryn_test_tx_group: default
#  enable-auto-data-source-proxy: true   # seata 自动代理数据源，从而管理事务（默认开启）
  # 配置中心
  config:
    type: nacos
    nacos:
      server-addr: 127.0.0.1:8848
      group: "SEATA_GROUP"
      namespace: ""
      dataId: "seataServer.properties"
      username:
      password:
  # 注册中心
  registry:
    type: nacos
    nacos:
      application: seata-server
      server-addr: 127.0.0.1:8848
      group: "SEATA_GROUP"  # 请确保client与server的注册处于同一个namespace和group，不然会找不到服务。
      namespace: ""
      username:
      password:

logging:
  level:
    io:
      seata: info

mybatis:
  mapperLocations: classpath:mapper/*.xml
  configuration:
    map-underscore-to-camel-case: true

```

SpringApplication 启动类：

```java
@EnableDiscoveryClient
@SpringBootApplication
@MapperScan({"com.run.sca.dao"})
@EnableFeignClients
public class SeataOrderService2001 {
    public static void main(String[] args) {
        SpringApplication.run(SeataOrderService2001.class, args);
    }
}
```

新建 domain 包，创建 Order 实体和返回的结果 CommonResult：

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order
{
    private Long id;

    private Long userId;

    private Long productId;

    private Integer count;

    private BigDecimal money;

    /**
     * 订单状态：0：创建中；1：已完结
     */
    private Integer status;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommonResult<T>
{
    private Integer code;
    private String  message;
    private T       data;

    public CommonResult(Integer code, String message)
    {
        this(code,message,null);
    }
}
```

新建 dao 包，创建 OrderDao：

```java
@Mapper
public interface OrderDao {

    /**
     * 创建订单
     */
    void create(Order order);

    /**
     * 修改订单金额
     */
    void update(@Param("userId") Long userId, @Param("status") Integer status);
}
```

`resources/mapper/OrderMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >

<mapper namespace="com.run.sca.dao.OrderDao">

    <insert id="create">
        INSERT INTO `t_order` (`id`, `user_id`, `product_id`, `count`, `money`, `status`)
        VALUES (NULL, #{userId}, #{productId}, #{count}, #{money}, 0);
    </insert>

    <update id="update">
        UPDATE `t_order`
        SET status = 1
        WHERE user_id = #{userId}
          AND status = #{status};
    </update>
    
</mapper>
```

service 包下的 OrderServcie 服务：

```java
public interface OrderService {

    /**
     * 创建订单
     */
    void create(Order order);
}


@Service
@Slf4j
public class OrderServiceImpl implements OrderService {
    
    @Resource
    private OrderDao orderDao;

    @Resource
    private AccountService accountService;

    @Resource
    private StorageService storageService;


    /**
     * 创建订单->调用库存服务扣减库存->调用账户服务扣减账户余额->修改订单状态
     * 简单说：下订单->减库存->减余额->改状态
     */
    @Override
    public void create(Order order) {
        log.info("------->下单开始");

        // 1. 本应用创建订单
        orderDao.create(order);

        // 2. 远程调用库存服务扣减库存
        log.info("------->order-service中扣减库存开始");
        storageService.decrease(order.getProductId(), order.getCount());
        log.info("------->order-service中扣减库存结束");

        // 3. 远程调用账户服务扣减余额
        log.info("------->order-service中扣减余额开始");
        accountService.decrease(order.getUserId(), order.getMoney());
        log.info("------->order-service中扣减余额结束");

        // 4. 修改订单状态为已完成
        log.info("------->order-service中修改订单状态开始");
        orderDao.update(order.getUserId(), 0);
        log.info("------->order-service中修改订单状态结束");

        log.info("------->下单结束");
    }
}
```

service 包下的 account、storage 服务，通过 Feign 远程调用：

```java
/**
 * @desc: 使用 Feign 调用 account 服务
 * @author: AarynLu
 * @date: 2023-11-30 16:10
 */
@FeignClient(value = "seata-account-service")
public interface AccountService {

    /**
     * 扣减账户余额
     */
    //@RequestMapping(value = "/account/decrease", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @PostMapping("/account/decrease")
    CommonResult decrease(@RequestParam("userId") Long userId, @RequestParam("money") BigDecimal money);

}


/**
 * @desc: 使用 Feign 调用 storage 服务
 * @author: AarynLu
 * @date: 2023-11-30 16:10
 */
@FeignClient(value = "seata-storage-service")
public interface StorageService {

    /**
     * 扣减库存
     */
    @PostMapping(value = "/storage/decrease")
    CommonResult decrease(@RequestParam("productId") Long productId, @RequestParam("count") Integer count);

}
```

controller：

```java
@RestController
public class OrderController {

    @Resource
    private OrderService orderService;

    /**
     * 创建订单
     */
    @GetMapping("/order/create")
    public CommonResult create(Order order) {
        orderService.create(order);
        return new CommonResult(200, "订单创建成功!");
    }

}
```

到此，订单服务就创建完毕了。其他两个服务也类似，就不详细写出来了，具体源码看：[AruNi-01/SpringCloudAlibaba (github.com)](https://github.com/AruNi-01/SpringCloudAlibaba)。

#### **3.2.3 运行测试**

将 Nacos、Seata-Server、还有三个服务启动，先来正常走一波流程，看看服务有没有问题，三个库表的初始数据：

![image-20231201234147144](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_01-1701445835.png)

访问：http://localhost:2001/order/create?userId=1&productId=1&count=10&money=100。

![image-20231201234748116](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_01-1701445670.png)

访问后库表数据：

![image-20231201234901784](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_01-1701445743.png)

可以发现三个库表的数据是满足一致性的，接下来手动制造异常，并且也 **不给 OrderServcie 的 `create(Order order)` 方法加 `@GlobalTransactional` 注解**。把 seata-account-service 服务的扣款设置超时异常：

```java
@Service
@Slf4j
public class AccountServiceImpl implements AccountService {

    @Resource
    AccountDao accountDao;

    /**
     * 扣减账户余额
     */
    @Override
    public void decrease(Long userId, BigDecimal money) {
        log.info("------->account-service中扣减账户余额开始");
        // sleep 10s 模拟超时异常（在调用方设置了 OpenFeign 请求处理超时时间是 3s），全局事务回滚
        try {
            TimeUnit.SECONDS.sleep(10);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        accountDao.decrease(userId, money);
        log.info("------->account-service中扣减账户余额结束");
    }
}
```

接着在 seata-order-service 的 yml 配置文件中配置向 seata-account-service 发出的请求，超时时间为 3s：

```yaml
spring:
  application:
    name: seata-order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
    openfeign:
      client:
        config:
          seata-account-service:  # 服务提供者名称
            read-timeout: 3000    # 配置 seata-account-service 服务的请求超时时间为 3s
```

重启两个服务，再次访问订单服务，按预期出现超时异常：

![image-20231202002624126](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701447985.png)

请求完后 **马上** 再来看看库表数据，发现 account 没有扣钱，订单生成了，status=0，表示未付款，而库存却减了：

![image-20231202002913765](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701448154.png)

过一会儿再刷新库表数据看看，会发现 account 又扣款成功了，这是因为 Feign 有重试机制，但是 order 的 status 依旧为 0，这就表示用户还是没付款，但又扣款了：

![image-20231202003306765](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701448387.png)

此时就需要使用 `@GlobalTransactional` 来保证全局事务了，在 order-service 的 create 方法上加上此注解：

```java
    @Override
    // Seata 开启分布式事务
    @GlobalTransactional(name = "seata-order-service:createOrder", rollbackFor = Exception.class)        
    public void create(Order order) {
```

再来访问，虽然还是超时，但是发现库表的数据都回滚了，三个库表的数据都没有变化：

![image-20231202004031616](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701448832.png)

来看看 seata 数据库和 seata-server（读取的 seata 数据库），都有对应的回滚记录：

![image-20231202004353858](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701449035.png)



