---
# 当前页面内容标题
title: SpringCloudAlibaba 概览
date: 2023-11-24
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


## 1. SpringCloudAlibaba 是什么

SpringCloudAlibaba 简称 SCA，官网：https://sca.aliyun.com/zh-cn/

SpringCloudAlibaba 致力于提供 **微服务开发的一站式解决方案**。此项目 **包含开发分布式应用服务的必需组件**，方便开发者通过 Spring Cloud 编程模型轻松使用这些组件来开发分布式应用服务。

依托 SpringCloudAlibaba，您只需要添加一些注解和少量配置，就可以将 Spring Cloud 应用接入阿里分布式应用解决方案，通过阿里中间件来迅速搭建分布式应用系统。

## 2. SpringCloudAlibaba 的定位

![spring-cloud](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701519046.png)

SpringCloudAlibaba 是阿里巴巴结合自身丰富的微服务实践而推出的微服务开发的一站式解决方案，是 Spring Cloud 第二代实现的主要组成部分。吸收了 Spring Cloud Netflix 微服务框架的核心架构思想，并进行了高性能改进。自 Spring Cloud Netflix 进入停更维护后，SpringCloudAlibaba 逐渐代替它成为主流的微服务框架。

## 3. SpringCloudAlibaba 有哪些组件

一个微服务全景图如下所示：

![image-20231107082716683](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311070827994.png)

其中含有 SpringCloudAlibaba 的主要组件有：

- Nacos：服务注册与配置中心；
- Dubbo：RPC 框架；
- Sentinel：服务治理，包括服务限流、降级、熔断等；
- Seata：分布式事务解决方案；
- RocketMQ：分布式消息队列。

分层结构如下：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/Java%2FSpringCloudAlibaba.assets-2023_12_02-1701519055.png)
