---
# 当前页面内容标题
title: 理论：传统 MVC vs DDD
date: 2023-3-18
order: 5
icon: write

# 分类
category:
 - 设计模式
tag:
 - 设计原则与思想

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

我们现在很多项目都是使用传统的 MVC 开发模式进行的，但其实它是不符合面向对象编程风格的，而是一种彻彻底底的面向过程的编程风格。

下面就来看看到底为什么不符合？而又为什么都要使用？有没有什么好的解决办法。

:::

## 1. 基于贫血模型的传统开发模式

在 MVC 三层架构中，M 表示 Model，V 表示 View，C 表示 Controller，它将整个系统分为三层：展示层、逻辑层、数据层。

当然，我们现在做开发一般都不会严格遵循这样的分层方式，现在基本都是前后端分离的项目，所以一般会将后端分为如下三层：

- **Repository 层：负责数据访问**；
- **Service 层：负责业务逻辑**；
- **Controller 层：负责暴露接口**。

下面再来看看什么是贫血模型。

在我们平时的开发中，由于各层中的数据是不统一的，所以经常会定义一些 VO、BO、Entity 等。其中 VO 和 Controller 组成了接口层、BO 和 Service 组成了业务逻辑层、Entity 和 Repository 组成了数据访问层。下面举个具体的例子：

数据访问层 Repository + Entity：

```java
//---------- Repository + Entity ----------//
public class UserRepository {
    public UserEntity getUserById(Long userId) { //... }
}

public class UserEntity {	// 省略其他属性、getter/setter/construct 方法
    private Long id;
    private String name;
    private String cellphone;
}
```

业务逻辑层 Service + BO：

```java
//---------- Service+BO(Business Object) ----------//
public class UserService {
  private UserRepository userRepository;	 // 通过构造函数或者 IOC 框架注入
  
  public UserBo getUserById(Long userId) {
    UserEntity userEntity = userRepository.getUserById(userId);
    UserBo userBo = [...convert userEntity to userBo...];
    return userBo;
  }
}

public class UserBo {	// 省略其他属性、getter/setter/construct 方法
  private Long id;
  private String name;
  private String cellphone;
}
```

接口层：Controller + VO：

```java
//---------- Controller+VO(View Object) ----------//
public class UserController {
  private UserService userService;	 // 通过构造函数或者 IOC 框架注入
  
  public UserVo getUserById(Long userId) {
    UserBo userBo = userService.getUserById(userId);
    UserVo userVo = [...convert userBo to userVo...];
    return userVo;
  }
}

public class UserVo {	// 省略其他属性、getter/setter/construct 方法
  private Long id;
  private String name;
  private String cellphone;
}
```

从代码中可以发现，Entity、BO、VO 都是一个 **纯粹的数据结构**，**只包含数据，没有任何业务逻辑**，这样的类就叫做 **贫血模型**。即 **数据与业务逻辑方法相分离**，是一种典型的 **面向过程** 的编程风格。

## 2. 基于充血模型的 DDD 开发模式

### 2.1 什么是充血模型？

在上面的贫血模型中，数据和业务逻辑是分离的，在不同的类中。而 **充血模型** 正好相反，**数据和对应的业务逻辑都被封装到同一个类中**。因此 **满足封装** 特性，是一种典型的 **面向对象** 的编程风格。

### 2.2 什么是 DDD？

DDD，即 Domain Driven Design 领域驱动设计，主要用来指导 **如何解耦业务系统、划分业务模块、定义业务领域模型及其交互**。

其实 DDD 早在 2004 年就被提出，随着微服务的兴起，它也慢慢被大众熟知。因为在微服务设计中，除了监控、调用链追踪、API 网关等服务治理系统的开发之外，还有一个更重要的工作，就是 **针对业务合理的做微服务的拆分**。而 **DDD 恰好就是用来指导划分服务的**。

### 2.3 基于充血模型的 DDD 开发模式是怎样的？

实际上，基于充血模型的 DDD 开发模式的代码实现，也是按照 MVC 三层架构分层的：

- Controller 层还是负责暴露接口；
- Repository 层还是负责数据访问；

而它与基于贫血模型的传统开发模式 **主要的区别在 Service 层**。

- 基于贫血模型的传统开发模式：Service 层包含 Service 类和 BO 类两部分。**BO 是贫血模型，只包含数据，不包含具体的业务逻辑**，业务逻辑在 Service 中；
- 基于充血模型的 DDD 开发模式：Service 层分为 Service 类和 Domain 类两部分。Domain 相当于贫血模型中的 BO，但是 **Domain 是充血模型，既包含数据，也包含业务逻辑**。

所以，基于贫血模型的 **MVC** 开发模式，**重 Service 轻 BO**，而基于充血模型的 **DDD** 开发模式，**轻 Service 重 Domain**。

## 3. 为什么常用基于贫血模型的传统开发模式？

既然基于贫血模型的传统开发模式违反了 OOP 的封装特性，是面向过程的编程风格，为什么还如此常用呢？

- **系统的业务比较简单**，都是基于 SQL 的 CRUD 操作，所以不需要花费大量时间设计充血模型，贫血模型已经足够应付了。而且，业务比较简单的话，就算使用了充血模型，该模型所包含的业务逻辑也很少，很单薄，跟贫血模型差不多，没有多大意义；
- **充血模型的设计更加有难度**。因为充血模型是一种面向对象的编程风格，所以从一开始就要设计好数据要暴露哪些操作，定义哪些业务逻辑。而贫血模型只需要定义数据，有什么功能往 Service 中加就行了；
- **思维已固化，转型有成本**。大多数人、项目，都是使用的贫血模型，这时候就不好引入充血模型了。一个是重构量大、另一个是别人学习成本高。

## 4. 什么情况下考虑使用基于充血模型的 DDD 开发模式呢？

上面提到，基于贫血模型的传统开发模式，适合业务比较简单的系统。相对应的，基于充血模型的 DDD 开发模式，更适合 **业务复杂的系统**。比如，包含各种利息计算模型、还款模型等复杂业务的金融系统。

两种开发模式落地到代码实现，其实就 **只有 Service 层上有所不同**，一个将业务逻辑放到 Service 类中，一个将业务逻辑放到 Domain 领域模型中。那为什么基于贫血模型的传统开发模式，就不能应对复杂的系统开发了？

其实还有一个非常重要的区别，就是两种不同的开发模式会导致 **不同的开发流程**。

先来看看我们平时使用的基于贫血模型的传统开发模式，是怎么实现一个功能需求的。

毫不夸张的讲，我们 **平时的开发，大都是 SQL 驱动（SQL-Driven）的开发模式**。当接到一个后端接口的开发需求时，就会去看接口需要的数据对应到哪个数据库中，需要哪些表，然后思考如何编写 SQL 把需要的数据查出来，接着定义 Entity、BO、VO，然后模板式地往对应的 Repository、Service、Controller 类中添加对应的方法。

这样做确实很方便快捷、不需要动脑子（可能最需要动脑的就是 SQL 语句）。但是，这样做的 **弊端** 有：

- 业务逻辑包裹在一个大的 SQL 语句中，而 Service 层可以做的事情很少；
- SQL 都是针对特定业务功能编写的，复用性差。当要开发另一个业务功能时，又重新写一个 SQL，导致各种长得差不多、区别很小的 SQL 语句满天飞。

所以，**当业务开始复杂起来的时候，整个系统就会非常的混乱，最终导致无法维护**。

而如果使用了基于充血模型的 DDD 开发模式，**开发流程就完全不一样了**。这时候需要 **先理清楚所有的业务、定义领域模型所包含的属性和方法。领域模型相当于可复用的业务中间层**。遇到新业务需求，都可以基于之前定义好的这些领域模型来完成。

**越复杂的系统，对代码的复用性、易维护性要求就越高**，所以就越应该花更多的时间和精力在 **前期设计** 上。而基于充血模型的 DDD 开发模式，正好需要我们 **前期做大量的业务调研、领域模型设计**，所以它更加适合复杂系统的开发。

## 5. 总结

基于贫血模型的传统开发模式与基于充血模型的 DDD 开发模式的主要区别就在 **Service 层**， DDD 开发模式将 Service 层分为 **Service 类和 Domain 领域模型**，**将数据与业务逻辑都放到 Domain 中**，是经典的 **面向对象** 的编程风格。

除此之外，这两种开发模式的 **开发流程完全不同**，DDD 开发模式需要在前期下功夫，做业务逻辑分析、领域模型设计等，在复杂的系统中 **复用性更高、可维护性更好**。

所以，我们在实际开发中，需要根据实际的业务复杂度，来选定使用哪种开发模式，而不是一味的使用某一种。

