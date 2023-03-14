---
# 当前页面内容标题
title: 第02章：Bean 的定义、注册、获取
date: 2023-3-9
order: 2
icon: write

# 分类
category:
 - 框架
tag:
 - Spring

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

## 1. 设计

上面创建的 Bean 容器比较简单，接下来我们需要提供一个 **单例 Bean 缓存**（因为缓存中保存一个实例 Bean 即可，所以采用单例），在获取 Bean 的时候，如果缓冲中存在就直接返回，否则才需要创建 Bean。

另外，在上面的设计中，BeanDefinition 中的 bean 变量是 Object 类型，那么在初始化阶段就要实例化这个 Bean。所以我们考虑 **将 bean 变量定义成 Class 类型**，这样 **在初始化阶段就可以只传一个类信息，转而把 Bean 的实例化也交给容器来做**。

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303091506735.png)

## 2. 实现

考虑到涉及到的类比较多了，因此需要进行解耦，根据单一职责的原则，我们让每个类只做与它有关的事情。

除了使用工厂模式外，这里再使用一个 **模板方法模式** 定义创建和获取 Bean 的抽象方法，具体的实现由子类完成。

目录结构更新如下：

![image-20230314082119557](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303140821065.png)

各个类的关系、职责如下图所示：

![image-20230309193732265](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303091937370.png)

- 右上角的两个类是与单例 Bean 有关的；

- 再下来就是一个 **提供了模板方法的抽象类 AbstractBeanFactory**，它定义了 **两个抽象方法供子类实现**，分别是获取 BeanDefinition 和将 Bean 注入到容器中。

    同时，它 **继承了上面与单例有关的类**，所以它也 **具有获取单例 Bean 的能力**。

    该类中还 **提供获取 Bean 的流程**，即先获取单例 Bean，获取不到则创建 Bean，创建 Bean 的具体流程由子类实现。

- 接下来就是 **AbstractAutoWireCapableBeanFactory 抽象类**，它 **具有创建 Bean 的能力**，因为它继承自 AbstractBeanFactory，**实现了创建 Bean 的模板方法**，提供了具体实现：

    1. 创建 BeanDefinition 实例（将实例化 Bean 的步骤移到了此）；
    2. 将实例化的 Bean 放入单例缓存（由于继承链的存在，所以可以直接调用向单例缓存中添加 Bean 的方法 `addSingleton()`）；

- 最后一个 **核心类 DefaultListableBeanFactory 提供了 Bena 容器，实现了向容器中注册 Bean 和从容器中获取 Bean 的方法**；

- 外部调用就是通过 DefaultListableBeanFactory 调用继承链中模板类 AbstractBeanFactory 的 `getBean()` 方法来获取 Bean 实例。

## 3. 测试

测试方法：

```java
 @Test
 public void test_BeanFactory() {
     // 1. 初始化 BeanFactory
     DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
 
     // 这里直接把 UserService.class 传递给了 BeanDefinition，而不是像上次那样直接 new UserService()
     BeanDefinition beanDefinition = new BeanDefinition(UserService.class);
 
     // 2. 注册 bean
     beanFactory.registerBeanDefinition("userService", beanDefinition);
 
     // 3. 第一次获取 bean
     UserService userService = (UserService) beanFactory.getBean("userService");
     userService.queryUserInfo();
     // 4. 第二次获取 bean from Singleton
     UserService userService_singleton = (UserService) beanFactory.getBean("userService");
     userService_singleton.queryUserInfo();
 
 }
```

## 4. 流程

注册、获取 Bean 的流程图：

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303091946463.png)