---
# 当前页面内容标题
title: Nacos 入门
date: 2023-11-25
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

## 1. 什么是 Nacos

[Nacos](https://nacos.io) 即 Naming and Configuration Service，是一个动态服务注册与发现、配置管理和服务管理的平台。

Nacos 的关键特性包括：

- **服务发现和服务健康监测**：
  - Nacos 支持基于 DNS 和基于 RPC 的服务发现。服务提供者使用 [原生SDK](https://nacos.io/zh-cn/docs/sdk.html)、[OpenAPI](https://nacos.io/zh-cn/docs/open-api.html)、或一个[独立的Agent TODO](https://nacos.io/zh-cn/docs/other-language.html)注册 Service 后，服务消费者可以使用[DNS TODO](https://nacos.io/zh-cn/docs/xx) 或[HTTP&API](https://nacos.io/zh-cn/docs/open-api.html)查找和发现服务。
  - Nacos 提供对服务的实时的健康检查，阻止向不健康的主机或服务实例发送请求。还提供了统一的健康检查仪表盘，帮助您根据健康状态管理服务的可用性及流量。
- **动态配置服务**：
  - 动态配置服务可以让您以中心化、外部化和动态化的方式管理所有环境的应用配置和服务配置。
  - 动态配置消除了配置变更时重新部署应用和服务的需要，让配置管理变得更加高效和敏捷。
  - Nacos 提供了一个简洁易用的UI ([控制台样例 Demo](http://console.nacos.io/nacos/index.html)) 帮助您管理所有的服务和应用的配置。
- **动态 DNS 服务**：
  - 动态 DNS 服务支持权重路由，让您更容易地实现中间层负载均衡、更灵活的路由策略、流量控制以及数据中心内网的简单DNS解析服务。



## 2. 基本名词解释

Nacos 的基本架构：

![nacos_arch.jpg](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701519064.jpeg)

核心专业术语：

- **服务 (Service)**：服务是指一个或一组软件功能（例如特定信息的检索或一组操作的执行），其目的是不同的客户端可以为不同的目的重用（例如通过跨进程的网络调用）。Nacos 支持主流的服务生态，如 Kubernetes Service、gRPC|Dubbo RPC Service 或者 Spring Cloud RESTful Service。
- **服务注册中心 (Service Registry)**：服务注册中心，它是服务，其实例及元数据的数据库。服务实例在启动时注册到服务注册表，并在关闭时注销。服务和路由器的客户端查询服务注册表以查找服务的可用实例。服务注册中心可能会调用服务实例的健康检查 API 来验证它是否能够处理请求。
- **服务提供方 (Service Provider)**：是指提供可复用和可调用服务的应用方。
- **服务消费方 (Service Consumer)**：是指会发起对某个服务调用的应用方。
- **名字服务 (Naming Service)**：提供分布式系统中所有对象(Object)、实体(Entity)的“名字”到关联的元数据之间的映射管理服务，例如 ServiceName -> Endpoints Info, DNS Domain Name -> IP List, 服务发现和 DNS 就是名字服务的 2 大场景。
- **配置服务 (Configuration Service)**：在服务或者应用运行过程中，提供动态配置或者元数据以及配置管理的服务提供者。

## 3. 安装运行 Nacos

Nacos 依赖 Java 环境，确保机器上有 JDK 1.8+ 环境。

下面提供两种方式安装 Nacos：

- 下载编译后的压缩包：从 [最新稳定版本](https://github.com/alibaba/nacos/releases) 下载 `nacos-server-$version.zip` 包，解压后执行：

  ```sh
  sh startup.sh -m standalone	# Linux
  
  startup.cmd -m standalone	# Win
  ```

- Docker 方式：

  ```sh
  # 1. 克隆并进入项目
  git clone https://github.com/nacos-group/nacos-docker.git
  cd nacos-docker
  #  2. 启动
  docker-compose -f example/standalone-derby.yaml up
  ```

启动后访问 ip:8848/naocs，即可进入管理页面，默认用户名密码都为 nacos。

## 4. Nacos 服务注册与发现

SCA Nacos 官网的 [快速开始](https://sca.aliyun.com/zh-cn/docs/2022.0.0.0/user-guide/nacos/quick-start#nacos-%E6%9C%8D%E5%8A%A1%E6%B3%A8%E5%86%8C%E4%B8%8E%E5%8F%91%E7%8E%B0)。

### 4.1 基于 Nacos 的服务提供者

在父项目中新建子 Module `cloudalibaba-provider-payment9001`。

在父 pom 文件中添加 SCA 依赖：

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
    </modules>

    <!-- 同一管理 jar 包版本 -->
    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>4.12</junit.version>
        <log4j.version>1.2.17</log4j.version>
        <lombok.version>1.16.18</lombok.version>
        <mysql.version>5.1.47</mysql.version>
        <druid.version>1.1.16</druid.version>
        <mybatis.spring.boot.version>1.3.0</mybatis.spring.boot.version>
    </properties>

    <!-- 子模块继承之后，提供作用：锁定版本+子module不用写groupId和version  -->
    <dependencyManagement>
        <dependencies>
            <!--spring boot 2.2.2-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.2.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!--spring cloud alibaba 2.1.0.RELEASE-->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>2.1.0.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${mysql.version}</version>
            </dependency>
            <dependency>
                <groupId>com.alibaba</groupId>
                <artifactId>druid</artifactId>
                <version>${druid.version}</version>
            </dependency>
            <dependency>
                <groupId>org.mybatis.spring.boot</groupId>
                <artifactId>mybatis-spring-boot-starter</artifactId>
                <version>${mybatis.spring.boot.version}</version>
            </dependency>
            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
            </dependency>
            <dependency>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
                <version>${log4j.version}</version>
            </dependency>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
                <optional>true</optional>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <fork>true</fork>
                    <addResources>true</addResources>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <skip>true</skip>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

本模块的 pom 文件，引入 nacos：

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

    <artifactId>cloudalibaba-provider-payment9001</artifactId>

    <dependencies>
        <!--SpringCloud ailibaba nacos -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <!-- SpringBoot整合Web组件 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!--日常通用jar包配置-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
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

</project>
```

配置 yml 文件：

```yaml
server:
  port: 9001

spring:
  application:
    name: nacos-payment-provider
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848   # 配置Nacos地址

management:
  endpoints:
    web:
      exposure:
        include: '*'  # Spring Actuator 监控，将所有可用的端点都公开出来，供外部访问。

```

主启动类，加上Spring Cloud 注解 `@EnableDiscoveryClient`，启用服务注册和发现的功能：

```java
package com.run.sca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * @desc:
 * @author: AruNi_Lu
 * @date: 2023/11/7
 */
@EnableDiscoveryClient
@SpringBootApplication
public class PaymentMain9001 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentMain9001.class, args);
    }
}
```

业务类 controller：

```java
package com.run.sca.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * @desc:
 * @author: AruNi_Lu
 * @date: 2023/11/7
 */
@RestController
public class PaymentController {
    
    @Value("${server.port}")
    private String serverPort;
    
    @GetMapping(value = "/payment/nacos/{id}")
    public String getPayment(@PathVariable("id") Integer id) {
        return "nacos registry serverPort: " + serverPort + "\t id: " + id;
    }
    
}
```

启动项目，服务就会自动注册到 nacos 了，nacos 控制台：

![image-20231107120940800](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071209870.png)

为了演示 nacos 负载均衡的功能，复制上面项目，端口为 9002。启动后 nacos 中的该服务实例数就变为 2 了：

![image-20231107121658863](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071217007.png)

访问以下服务接口 http://localhost:9001/payment/nacos/1001，成功返回响应：

![image-20231107121829483](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071218801.png)

### 4.2 基于 Nacos 的服务消费者

创建 Module 与前面类似。

yml 配置文件：

```yaml
server:
  port: 83

spring:
  application:
    name: nacos-order-consumer
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848


# 消费者将要去访问的微服务名称(注册成功进 nacos 的微服务提供者)
service-url:
  nacos-user-service: http://nacos-payment-provider   # 与提供者配置文件的服务名对应

```

Nacos 之所以能进行负载均衡的原因，是因为它集成了 Ribbon：

![image-20231107123241662](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071232797.png)

Spring 配置类，配置负载均衡：

```java
package com.run.sca.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * @desc:
 * @author: AruNi_Lu
 * @date: 2023/11/7
 */
@Configuration
public class ApplicationContextBean {

    // RestTemplate 配合 Ribbon 做负载均衡
    // 通过 RestTemplate 发送的请求将会基于负载均衡策略分发到多个实例上
    @Bean
    @LoadBalanced
    public RestTemplate getRestTemplate() {
        return new RestTemplate();
    }
}

```

业务类 controller：

```java
package com.run.sca.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;

/**
 * @desc:
 * @author: AruNi_Lu
 * @date: 2023/11/7
 */
@RestController
public class OrderController {

    @Resource
    private RestTemplate restTemplate;

    @Value("${service-url.nacos-user-service}")
    private String serverURL;

    @GetMapping(value = "/consumer/payment/nacos/{id}")
    public String getPayment(@PathVariable("id") Integer id) {
        return restTemplate.getForObject(serverURL + "/payment/nacos/" + id, String.class);
    }

}

```

启动项目，访问：http://localhost:83/consumer/payment/nacos/1002，多次访问，发现访问的 provider 端口在 9001 和 9002 中轮询，即实现了负载均衡：

![image-20231107125748977](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071257075.png)

## 5. Nacos 配置中心

SCA Nacos 官网的 [快速开始](https://sca.aliyun.com/zh-cn/docs/2022.0.0.0/user-guide/nacos/quick-start#nacos-%E9%85%8D%E7%BD%AE%E4%B8%AD%E5%BF%83)。

### 5.1 基础配置

新建 Module `cloudalibaba-config-nacos-client3377`。

pom 文件引入 nacos 的 config 和 discovery 依赖：

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

    <artifactId>cloudalibaba-config-nacos-client3377</artifactId>

    <dependencies>
        <!--nacos-config-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
        </dependency>
        <!--nacos-discovery-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
        <!-- SpringBoot整合Web组件 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!--日常通用jar包配置-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
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

</project>
```

yml 配置文件：

- Nacos 在项目初始化时，**要保证先从配置中心进行配置拉取**，拉取配置之后，才能保证项目的正常启动；
- SpringBoot 中配置文件的加载是存在优先级顺序的，`bootstrap.yml` 优先级高于 `application.yml`。

因此，我们需要先在 bootstrap 配置文件中进行项目的配置：

```yaml
# nacos配置
server:
  port: 3377

spring:
  application:
    name: nacos-config-client
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848   # Nacos 服务注册中心地址
      config:
        server-addr: localhost:8848   # Nacos 作为配置中心地址
        file-extension: yaml  # 指定 yaml 格式的配置


# Nacos 配置规则：${spring.application.name}-${spring.profile.active}.${spring.cloud.nacos.config.file-extension}
# 对应到该项目就是：nacos-config-client-dev.yaml

```

application 配置文件：

```yaml
spring:
  profiles:
    active: dev
    
```

业务类 controller：

- Nacos 通过 SpringCloud 原生注解 `@RefreshScope` 实现配置自动更新；

```java
package com.run.sca.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @desc:
 * @author: AruNi_Lu
 * @date: 2023/11/7
 */
@RestController
@RefreshScope   // 控制器类上加 @RefreshScope 使当前类下的配置支持 Nacos 的动态刷新
public class ConfigClientController {

    // 要从 Nacos 配置文件中获取的信息
    @Value("${config.info}")
    private String configInfo;

    @GetMapping("/config/info")
    public String getConfigInfo() {
        return configInfo;
    }

}
```

在 Nacos 中添加配置之前，需要先了解以下其配置规则，因为 **Naocs 中的 dataid 与 SpringBoot 配置文件有关**：

在 Nacos Spring Cloud 中，`dataId` 的完整格式如下：

```text
${prefix}-${spring.profiles.active}.${file-extension}
```

- `prefix` 默认为 `spring.application.name` 的值，也可以通过配置项 `spring.cloud.nacos.config.prefix `来配置。
- `spring.profiles.active` 即为当前环境对应的 profile，详情可以参考 [Spring Boot 文档](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-profiles.html#boot-features-profiles)。 **注意：当 `spring.profiles.active` 为空时，对应的连接符 `-` 也将不存在，dataId 的拼接格式变成 `${prefix}.${file-extension}`**；
- `file-exetension` 为配置内容的数据格式，可以通过配置项 `spring.cloud.nacos.config.file-extension` 来配置。目前只支持 `properties` 和 `yaml` 类型。

所以根据该项目的配置，dataid 就是 `nacos-config-client-dev.yaml`。

![image-20231107133616388](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071336206.png)

了解之后，就可以到 Nacos 中新建配置了：

![image-20231107133838985](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071339508.png)

 启动项目，访问 http://localhost:3377/config/info，获取配置信息：

![image-20231107134339077](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071343059.png)

现在在 Nacos 中修改配置信息，重新访问，即可获取最新的配置信息：

![image-20231107134516242](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071345125.png)



### 5.2 分类配置

分类配置要解决的问题：

- 实际项目中一般会有 dev、test、prod 环境，如何确保环境启动时能正确读取到 Nacos 上对应的配置文件呢？
- 一个项目分为很多微服务，每个微服务又有对应的 dev、test、pre、prod 环境，如何对应它们各自的配置文件？

Nacos 采用 Namespace + Group + DataID 来区分：

- Namespace 可以用于区分部署环境。
- Group 和 DataID 逻辑上区分两个目标对象。

![image-20231107135519559](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071355376.png)

- **Namespace 主要用来实现隔离**。比方说我们现在有三个环境：开发、测试、生产环境，我们就可以创建三个 Namespace，不同的 Namespace 之间是隔离的；
- **Group 可以把不同的微服务划分到同一个分组里面去**；
- **Service 就是微服务**；一个 Service 可以包含多个 Cluster（集群），Cluster 是对指定微服务的一个虚拟划分。比方说为了容灾，将 Service 微服务分别部署在了杭州机房和广州机房，这时就可以给杭州机房的 Service 微服务起一个集群名称（HZ），给广州机房的 Service 微服务起一个集群名称（GZ），还可以尽量让同一个机房的微服务互相调用，以提升性能。
- **Instance 就是微服务的实例**。

默认情况：

- Namespace=public；
- Group=DEFAULT_GROUP；
- 默认Cluster 是 DEFAULT。





**DataID 方案**

通过 DataID 中的 `${spring.profile.active}` 就能切换不同部署环境的配置文件。例如 `nacos-config-client-dev.yaml`、`nacos-config-client-test.yaml`，在 Nacos 中建立对应的配置即可。

**Group 方案**：通过 Group 实现环境区分。

在新建配置时指定 Group 即可：

![image-20231107142047361](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071420766.png)

接着在 SpringBoot 配置文件中添加 `group` 配置即可：

![image-20231107142252344](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071422303.png)

**Namespace 方案**：

Nacos 新建 dev/test Namespace：

![image-20231107142417706](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071424836.png)

 此时服务列表有对应的 Namespace，下面的服务是隔离的：

![image-20231107142614750](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071426574.png)

接着按照 SpringBoot 配置文件来编写 dev Namespace 下的配置：

![image-20231107142704564](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071427160.png)

SpringBoot 配置文件中添加 `namespace`，值为 Namespace 的 ID：

![image-20231107142846082](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311071428164.png)

## 6. Nacos 持久化配置

Nacos 默认自带一个嵌入式数据库 derby 实现数据的存储，但不方便观察数据存储的基本情况。后续 Nacos 支持了 MySQL 数据源，切换步骤如下：

1. 安装 MySQL 数据库，版本要求：5.6.5+
2. 新建名为 nacos_config 的数据库，初始化表数据：`nacos/conf` 目录下的 `mysql-schema.sql`
3. 修改 `nacos/conf` 目录下的 `application.properties` 文件，增加支持 MySQL 数据源配置（目前只支持 MySQL ），添加 MySQL 数据源的 URL、用户名和密码。

```properties
spring.datasource.platform=mysql

db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=root
db.password=123456
```

重启 Nacos，后续所有的数据都会写到 MySQL 中。

## 7. Nacos 集群

Nacos 官方推荐我们将所有服务列表放到一个 VIP（Virtual IP）下，然后挂到一个域名下，即 http://nacos.com:port/openAPI 域名 + SLB 模式（内网SLB，不可暴露到公网，以免带来安全风险）。这样可读性好，而且换 ip 方便。

![deployDnsVipMode.jpg](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2Fassets-2023_11_25-1700879543.jpg)

部署 Nacos 集群推荐使用 Linux 系统，并且需要 3 个或以上的 Nacos 节点才能构成集群。

**1、准备工作**

首先在 Linux 中下载配置好 JDK、Maven、Nacos，并且按照上面 Nacos 持久化配置，将 MySQL 作为数据源（Linux 操作不便可以在 PC 上连接 MySQL 操作）。

**2、集群配置 `cluster.conf`**

在目录 nacos/conf 下有配置文件 `cluster.conf`，配置集群信息：

```sh
# ip:port
200.8.9.16:8847
200.8.9.17:8848
200.8.9.18:8849
```

**3、修改 naocs 启动脚本 `startup.sh`**

启动单机版都是直接执行 `./startup.sh` 即可，但集群启动的时候，我们希望可以按不同的端口号启动，例如 `./startup.sh -p 3333` 启动 3333 端口的 nacos。所以需要修改启动脚本来支持。

编辑 `startup.sh`，需要修改三个地方：

![image-20231125140619220](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700892389.png)



启动三个 Nacos 节点：

```sh
./startup.sh -p 3333/4444/5555
```

编辑 Nginx 配置文件做代理：

```sh
upstream cluster {
  server 127.0.0.1:3333;
  server 127.0.0.1:4444;
  server 127.0.0.1:5555;
}

server {
  listen 1111;
  server_name localhost;

  location / {
    #root html;
    #index index.html;
    proxy_pass http://cluster;    # 代理到自定义的 upstream cluster
  }

  error_page 500 502 503 504 /50x.html;
  location = /50x.html {
    root html;
  }
}
```

启动 Nginx，访问 ip:1111/nacos，即可访问集群节点。

> 云服务器记得添加端口到防火墙规则。

这样在项目中，client 端配置 nacos 就只用配 port=1111 这个节点即可使用集群，实现了 Nacos 的高可用：

![image-20231125141042358](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700892646.png)

