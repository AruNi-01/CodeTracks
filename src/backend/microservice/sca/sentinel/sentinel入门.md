---
# 当前页面内容标题
title: Sentinel 入门
date: 2023-11-28
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

## 1. 什么是 Sentinel

Sentinel 是面向分布式的 **流量治理** 组件，主要以流量为切入点，从 **流量路由、流量控制、流量整形、熔断降级、系统自适应过载保护、热点流量防护** 等多个维度来帮助开发者 **保障微服务的稳定性**。

**流量控制**：任意时间到来的请求往往是随机不可控的，而系统的处理能力是有限的。我们需要 **根据系统的处理能力对流量进行控制**。Sentinel 作为一个调配器，可以根据需要 **把随机的请求调整成合适的 “形状”**：

![arch](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700911310.jpg)

流量控制有以下几个角度：

- 资源的调用关系，例如资源的调用链路，资源和资源之间的关系；
- 运行指标，例如 QPS、线程池、系统负载等；
- 控制的效果，例如直接限流、冷启动、排队等。

Sentinel 的设计理念是让您自由选择控制的角度，并进行灵活组合。





**熔断降级**：由于调用关系的复杂性，如果 **调用链路中的某个资源出现了不稳定（表现为 timeout，异常比例升高），最终会导致请求发生堆积**。所以这时需要 **对该资源的调用进行限制，并让请求快速失败，避免影响到其它的资源，最终产生雪崩的效果**。

![image](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700911512.png)

**系统负载保护**：防止雪崩，是系统防护中重要的一环。**当系统负载较高的时候，如果还持续让请求进入，可能会导致系统崩溃，无法响应**。在集群环境下，网络负载均衡会把本应这台机器承载的流量转发到其它的机器上去。如果这个时候 **其它的机器也处在一个边缘状态的时候，这个增加的流量就会导致这台机器也崩溃，最后导致整个集群不可用**。针对这个情况，Sentinel 提供了对应的保护机制，**让系统的入口流量和系统的负载达到一个平衡，保证系统在能力范围之内处理最多的请求**。





## 2. 快速开始

### 2.1 启动 Dashboard

Sentinel 的使用分为两个部分:

- 核心库（Java 客户端）：不依赖任何框架/库，能够运行于 Java 8 及以上的版本的运行时环境。
- 控制台（Dashboard）：Dashboard 主要负责管理推送规则、监控、管理机器信息等。

下面我们先下载 Dashboard，看看 Sentinel 的管理界面长什么样子。下载地址：https://github.com/alibaba/Sentinel/releases，直接下载 jar 包运行即可：

```sh
java -jar .\sentinel-dashboard-1.8.6.jar
```

### 2.2 初始化工程

先把 Nacos8848 启动起来：`./startup.cmd -m standalone`。

新建 cloudalibaba-sentinel-service8401 Module，pom 文件如下：

```xml
    <dependencies>
        <!-- SpringCloud Alibaba sentinel -->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        </dependency>
        <!-- SpringCloud Alibaba sentinel-datasource-nacos 后续做持久化用 -->
        <dependency>
            <groupId>com.alibaba.csp</groupId>
            <artifactId>sentinel-datasource-nacos</artifactId>
        </dependency>

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
```

yaml 文件：

```yaml
server:
  port: 8401

spring:
  application:
    name: sentinel-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848   # 配置Nacos地址

    sentinel:
      transport:
        dashboard: localhost:8080   # 配置 Sentinel Dashboard 地址，
        port: 8719  # 默认 8719 端口，用于与 Sentinel Dashboard 交互

management:
  endpoints:
    web:
      exposure:
        include: '*'  # Spring Actuator 监控，将所有可用的端点都公开出来，供外部访问。

```

controller：

```java
@RestController
public class FlowLimitController {

    @GetMapping("/testA")
    public String testA() {
        return "------------testA";
    }

    @GetMapping("/testB")
    public String testB() {
        return "------------testB";
    }

}

```



启动项目，访问 Sentinel Dashboard，发现还是没应用，这是因为它采用的是懒加载，我们先去访问一下controller 层服务的接口，然后再查看 Dashboard，可以发现，Sentinel8080 正在监控微服务 sentinel-service8401：

![image-20231125230315716](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700924597.png)

![image-20231125230404273](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_25-1700924645.png)

## 3. 流控规则

在 Dashboard 看看流控设置有哪些：

![image-20231127235111062](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_27-1701100289.png)

我们新增一个 QPS 单机阈值 = 1，流控效果快速失败，这意味着如果每秒请求量大于 1 时，后续的请求都会直接失败：

![image-20231127235333821](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_27-1701100416.png)

现在来看看流控规则中的配置项：

- **资源名**：唯一名称，默认请求路径

- **针对来源**：Sentinel 可以 **针对调用者进行限流**，填写微服务名，默认default（不区分来源)

- **阈值类型/单机阈值**：

  - QPS（每秒钟的请求数量）：当调用该 api 的 QPS 达到间值的时候，进行限流。
  - 线程数：当调用该 api 的线程数达到阈值的时候，进行限流

- **是否集群**：不需要集群

- **流控模式**：

  - 直接：api 达到限流条件时，直接限流。
  - 关联：当与之关联的资源达到阈值时，就限流自己（别人达到阈值，限流自己，比如支付接口崩了，让下单接口限流）。
  - 链路：只记录指定链路上的流量（指定资源从入口资源进来的流量，如果达到阈值，就进行限流）【api 级别的针对来源，多个 api 访问同一个其他的 api】

- **流控效果**：

  - 快速失败：直接失败，抛异常。

  - WarmUp：当阈值达到 `设定阀值 / codeFactor(默认为 3)` 时，开始在设定的预热时长时间内，逐渐升至设置的 QPS 阈值。

    > 场景：秒杀系统在开启的瞬间，突增的大量流量可能直接把系统打死，预热方式就是把为了保护系统，慢慢的把流量放进来，慢慢的把阀值增长到设置的阀值。

  - 排队等待：匀速排人，让请求以匀速的速度通过（对应漏桶算法），阈值类型必须设置为 QPS，否则无效。设置的超时时间到之后还没排到则请求失败。

    > 场景：主要用于处理间隔性突发的流量，例如消息队列。例如在某一秒有大量的请求到来，而接下来的几秒则处于空闲状态，我们希望系统能够在接下来的空闲期间逐渐处理这些请求，而不是在第一秒直接拒绝多余的请求。

## 4. 熔断规则

现.代微服务架构都是分布式的，由非常多的服务组成。不同服务之间相互调用，组成复杂的调用链路。以上的问题在链路调用中会产生放大的效果。复杂链路上的某一环不稳定，就可能会层层级联，最终导致整个链路都不可用。因此我们需要对不稳定的 **弱依赖服务调用** 进行熔断降级，暂时切断不稳定调用，避免局部不稳定因素导致整体的雪崩。熔断降级作为保护自身的手段，通常在客户端（调用端）进行配置。

例如，支付的时候，可能需要远程调用银联提供的 API；查询某个商品的价格，可能需要进行数据库查询。然而，这个被依赖服务的稳定性是不能保证的。如果依赖的服务出现了不稳定的情况，请求的响应时间变长，那么调用服务的方法的响应时间也会变长，线程会产生堆积，最终可能耗尽业务自身的线程池，服务本身也变得不可用。

![chain](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701134637.png)

Sentinel 熔断降级会在调用链路中某个 **资源出现不稳定状态时**（例如调用超时或异常比例升高），对这个资源的调用 **进行限制**，让请求 **快速失败**，**避免影响到其它的资源而导致级联错误**。当资源被降级后，在接下来的熔断降级时间内，对该资源的调用都自动熔断（默认行为是抛出 DegradeException）。

来看看 Sentinel 熔断配置都有哪些：

![image-20231128092514601](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701134715.png)

熔断降级规则（DegradeRule）包含下面几个重要的属性：

|       Field        | 说明                                                         | 默认值     |
| :----------------: | :----------------------------------------------------------- | :--------- |
|      resource      | 资源名，即规则的作用对象                                     |            |
|       grade        | 熔断策略，支持慢调用比例/异常比例/异常数策略                 | 慢调用比例 |
|       count        | 慢调用比例模式下为慢调用临界 RT（超出该值计为慢调用）；异常比例/异常数模式下为对应的阈值 |            |
|     timeWindow     | 熔断时长，单位为 s                                           |            |
|  minRequestAmount  | 熔断触发的最小请求数，请求数小于该值时即使异常比率超出阈值也不会熔断（1.7.0 引入） | 5          |
|   statIntervalMs   | 统计时长（单位为 ms），如 60*1000 代表分钟级（1.8.0 引入）   | 1000 ms    |
| slowRatioThreshold | 慢调用比例阈值，仅慢调用比例模式有效（1.8.0 引入）           |            |

熔断策略：

- **慢调用比例 (`SLOW_REQUEST_RATIO`)**：选择以慢调用比例作为阈值，需要设置允许的慢调用 RT（即最大的响应时间），**请求的响应时间大于该值则统计为慢调用**。当 **单位统计时长（`statIntervalMs`）内请求数目大于设置的最小请求数目，并且慢调用的比例大于阈值**，则接下来的熔断时长内请求会自动被熔断。**经过熔断时长后熔断器会进入探测恢复状态**（HALF-OPEN 状态），若接下来的一个请求响应时间小于设置的慢调用 RT 则结束熔断，若大于设置的慢调用 RT 则会再次被熔断。
- **异常比例 (`ERROR_RATIO`)**：**当单位统计时长（`statIntervalMs`）内请求数目大于设置的最小请求数目，并且异常的比例大于阈值**，则接下来的熔断时长内请求会自动被熔断。**经过熔断时长后熔断器会进入探测恢复状态**（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。异常比率的阈值范围是 `[0.0, 1.0]`，代表 0% - 100%。
- **异常数 (`ERROR_COUNT`)**：**当单位统计时长内的异常数目超过阈值之后会自动进行熔断**。**经过熔断时长后熔断器会进入探测恢复状态**（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。

## 5. 热点参数限流

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

热点参数限流会 **统计传入参数中的热点参数**，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，**仅对包含热点参数的资源调用生效**。

![Sentinel Parameter Flow Control](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701136569.png)

Sentinel 利用 **LRU 策略** 统计最近最常访问的热点参数，结合 **令牌桶算法** 来进行参数级别的流控。

热点规则：

![image-20231128101056103](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701137457.png)

例子：

```java
    @GetMapping("/testHotParams")
    @SentinelResource(value = "testHotParams", blockHandler = "handle_testHotParams")
    public String testHotParams(@RequestParam(value = "p1", required = false) String p1,
                                @RequestParam(value = "p2", required = false) String p2) {
        return "------------testHotParams";
    }

    // 配置热点参数限流触发时的处理方法，不配置则直接将异常信息打到页面
    public String handle_testHotParams(String p1, String p2, BlockException exception) {
        return "------------handle_testHotParams(兜底处理)";
    }
```

热点规则：

![image-20231128101511019](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701137712.png)

当传入参数 idx 为 0（即 p1），1s 内 QPS 超过 1 时，就会进行限流。

**参数例外项**：参数例外项可 **额外配置该热点参数的参数值和限流阈值**，该参数值的阈值不受上面阈值的限制。我们接着上面的配置，来新增参数例外项：

![image-20231128103151607](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701138712.png)

此时当请求 testHotParams 时，当参数 idx = 0（p1）不为 "5" 时，QPS 阈值只有 1，等于 "5" 时，阈值可以到 200。

注意：@SentinelResource 只管在 Sentinel 配置的出错，运行出错该走异常走异常。

## 6. 系统自适应保护

Sentinel 系统自适应保护从 **整体维度对应用入口流量** 进行控制，结合应用的 Load、总体平均 RT、入口 QPS 和线程数等几个维度的监控指标，让系统的入口流量和系统的负载达到一个平衡，让系统尽可能跑在最大吞吐量的同时保证系统整体的稳定性。

系统保护规则是应用整体维度的，而不是资源维度的，并且**仅对入口流量生效**。入口流量指的是进入应用的流量（`EntryType.IN`），比如 Web 服务或 Dubbo 服务端接收的请求，都属于入口流量。

系统规则支持以下的阈值类型：

- **Load**（仅对 Linux/Unix-like 机器生效）：当系统 load1（系统负载）超过阈值，且系统当前的并发线程数超过系统容量时才会触发系统保护。系统容量由系统的 `maxQps * minRt` 计算得出。设定参考值一般是 `CPU cores * 2.5`。
- **CPU usage**（1.5.0+ 版本）：当系统 CPU 使用率超过阈值即触发系统保护（取值范围 0.0-1.0）。
- **RT**：当单台机器上所有入口流量的平均 RT 达到阈值即触发系统保护，单位是毫秒。
- **线程数**：当单台机器上所有入口流量的并发线程数达到阈值即触发系统保护。
- **入口 QPS**：当单台机器上所有入口流量的 QPS 达到阈值即触发系统保护。

## 7. @SentinelResource

Sentinel 提供了 `@SentinelResource` 注解用于 **定义资源**，并提供了 AspectJ 的扩展用于 **自动定义资源、处理 `BlockException` 等**。

> **注意**：注解方式埋点不支持 private 方法。

`@SentinelResource` 用于定义资源，并提供可选的异常处理和 fallback 配置项。 `@SentinelResource` 注解包含以下属性：

- `value`：资源名称，必需项（不能为空），Dashboard 中可以配置资源名，也可以配置 URL。
- `entryType`：entry 类型，可选项（默认为 `EntryType.OUT`）
- `blockHandler` / `blockHandlerClass`：`blockHandler` 对应处理 `BlockException` 的函数名称，可选项。
  - blockHandler 函数访问范围需要是 `public`，返回类型需要与原方法相匹配，参数类型需要和原方法相匹配并且最后加一个额外的参数，类型为 `BlockException`。
  - blockHandler 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 `blockHandlerClass` 为对应的类的 `Class` 对象，注意对应的函数必需为 static 函数，否则无法解析。
- `fallback` / `fallbackClass`：fallback 函数名称，可选项，用于在抛出异常的时候提供 fallback 处理逻辑。fallback 函数可以针对所有类型的异常（除了 `exceptionsToIgnore` 里面排除掉的异常类型）进行处理。fallback 函数签名和位置要求：
  - 返回值类型必须与原函数返回值类型一致；
  - 方法参数列表需要和原函数一致，或者可以额外多一个 `Throwable` 类型的参数用于接收对应的异常。
  - fallback 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 `fallbackClass` 为对应的类的 `Class` 对象，注意对应的函数必需为 static 函数，否则无法解析。
- `defaultFallback`（since 1.6.0）：默认的 fallback 函数名称，可选项，通常用于通用的 fallback 逻辑（即可以用于很多服务或方法）。默认 fallback 函数可以针对所以类型的异常（除 `exceptionsToIgnore` 里面排除掉的异常类型）进行处理。若同时配置了 fallback 和 defaultFallback，则只有 fallback 会生效。defaultFallback 函数签名要求：
  - 返回值类型必须与原函数返回值类型一致；
  - 方法参数列表需要为空，或者可以额外多一个 `Throwable` 类型的参数用于接收对应的异常。
  - `defaultFallback` 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 `fallbackClass` 为对应的类的 `Class` 对象，注意对应的函数必需为 static 函数，否则无法解析。
- `exceptionsToIgnore`（since 1.6.0）：用于指定哪些异常被排除掉，不会计入异常统计中，也不会进入 fallback 逻辑中，而是会原样抛出。

> 注：1.6.0 之前的版本 fallback 函数只针对降级异常（`DegradeException`）进行处理，**不能针对业务异常进行处理**。

`blockHandler` 和 `fallback`：

- **`blockHandler`** 是专门(只)处理 sentinel **流控降级规则抛出的 BlockException**，**其他异常均会直接抛出**，不会进入blockHandler方法处理。

- **`fallback` 默认处理所有的异常**，其中包括 BlockEcxeption（BlockException 是 Exception 的子类）。

- 特别地，**若 blockHandler 和 fallback 都进行了配置**，则被限流降级而抛出 `BlockException` 时 **只会进入 `blockHandler` 处理逻辑**。若未配置 `blockHandler`、`fallback` 和 `defaultFallback`，则被限流降级时会将 `BlockException` **直接抛出**。

示例：

```java
public class TestService {

    // 对应的 `handleException` 函数需要位于 `ExceptionUtil` 类中，并且必须为 static 函数.
    @SentinelResource(value = "test", blockHandler = "handleException", blockHandlerClass = {ExceptionUtil.class})
    public void test() {
        System.out.println("Test");
    }

    // 原函数
    @SentinelResource(value = "hello", blockHandler = "exceptionHandler", fallback = "helloFallback")
    public String hello(long s) {
        return String.format("Hello at %d", s);
    }
    
    // Fallback 函数，函数签名与原函数一致或加一个 Throwable 类型的参数.
    public String helloFallback(long s) {
        return String.format("Halooooo %d", s);
    }

    // Block 异常处理函数，参数最后多一个 BlockException，其余与原函数一致.
    public String exceptionHandler(long s, BlockException ex) {
        // Do some log here.
        ex.printStackTrace();
        return "Oops, error occurred at " + s;
    }
}
```

## 8. 持久化

Dashboard 的推送规则方式是通过 API 将规则推送至客户端并直接更新到内存中，一旦重启应用，Sentinel 配置的规则就会丢失：

![Original push rules from Sentinel Dashboard](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701175389.png)

这种做法的好处是简单，无依赖；坏处是应用重启规则就会消失，仅用于简单测试，不能用于生产环境。生产环境肯定是需要持久化的，可以将规则持久化到某些持久层中，例如数据库。

我们这里演示一下持久化到 Nacos 配置中心里去。在 cloudalibaba-sentinel-service8401 pom 文件中添加依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
</dependency>
```

yaml 配置文件，配置 sentinel 的 datasource：

```yaml
server:
  port: 8401

spring:
  application:
    name: sentinel-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848   # 配置Nacos地址

    sentinel:
      transport:
        dashboard: localhost:8080   # 配置 Sentinel Dashboard 地址
        port: 8719  # 默认 8719 端口，用于与 Sentinel Dashboard 交互
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            namespace: public
            data-id: cloudalibaba-sentinel-service
            group-id: DEFAULT_GROUP
            data-type: json
            rule-type: flow   # 流控规则

management:
  endpoints:
    web:
      exposure:
        include: '*'  # Spring Actuator 监控，将所有可用的端点都公开出来，供外部访问。

```

在 Nacos 中添加流控规则的配置（其他规则的配置可自行搜索）：

```json
[
    {
        "resource": "/rateLimit/byUrl",
        "limitApp": "default",
        "grade": 1,
        "count": 1,
        "strategy": 0,
        "controlBehavior": 0,
        "clusterMode": false
    }
]

/*
resource：资源名称；
limitApp：来源应用；
grade：阈值类型，0 表示线程数，1 表示 QPS；
count：单机阈值；
strategy：流控模式，0 表示直接，1 表示关联，2 表示链路；
controlBehavior：流控效果，0 表示快速失败，1 表示 Warm Up，2 表示排队等待；
clusterMode：是否集群。
*/
```

![image-20231128203245098](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701175005.png)

查看 Sentinel Dashboard，发现已经有了该流控规则：

![image-20231128203627668](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701521469.png)

快速访问 http://localhost:8401/rateLimit/byUrl，流控规则也是可以生效的。

现在我们重启 sentinel-service8401，发现 Dashboard 中的流控规则还是存在的（注意 Dashboard 是懒加载，得访问一次接口流控规则才会显示）。

通过将规则写在 Nacos 配置中心里可以达到持久化的目的，但是无疑过于繁琐，其实，Sentinel 有三种规则管理及推送模式，可以在 Sentinel Dashboard 中直接配置规则，然后应用中再进行持久化（Pull 模式）：
![Push rules from Sentinel Dashboard to local file](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701175698.png)

或者引入一个远程配置中心，通过 Dashboard 将配置写入远程配置中心，然后再将配置推送到应用（Push 模式）：

![Remote push rules to config center](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_11_28-1701175711.png)

实现要涉及到改造 Sentinel 客户端应用，具体内容看官方文档：https://github.com/alibaba/Sentinel/wiki/%E5%9C%A8%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%B8%AD%E4%BD%BF%E7%94%A8-Sentinel。

持久化到 MySQL：https://www.cnblogs.com/cdfive2018/p/9838577.html。

