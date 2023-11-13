---
# 当前页面内容标题
title: Build Time vs Runtime
date: 2023-11-13
order: 3
#icon: write

# 分类
category:
 - 前端
tag:
 - Next.js

sticky: false
# 是否收藏在博客主题的文章列表中，当填入数字时，数字越大，排名越靠前。
star: false
# 是否将该文章添加至文章列表中
article: true
# 是否将该文章添加至时间线中
timeline: true
---


## Build Time

构建阶段是应用代码准备投入生产环境的一个必要阶段，当你 **构建应用** 时，Next.js 会将你的代码转换成 **优化过的生产环境文件**，以准备部署到服务器进行访问，这些文件包括：

- **静态生成页面的 HTML 文件**；
- 用于 **在服务器上使页面渲染的 JavaScript 代码**；
- 用于 **在客户端上使页面交互的 JavaScript 代码**；
- **CSS 文件**。

## Runtime

**运行阶段**（或者叫请求阶段）指的是当应用程序构建并部署后，**响应用户请求的时期**。

## Client and Server

在 Web 应用中，Client 指用户使用的浏览器，它会发送请求到服务端，然后将收到的响应转换为用户可以与之交互的界面。

Server 指作为数据中心的机器，用于存储程序代码、接收客户端的请求，执行一些业务逻辑和计算后，响应该请求。

![image-20231113113732770](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131137991.png)
