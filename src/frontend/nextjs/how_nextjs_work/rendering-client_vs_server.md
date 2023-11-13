---
# 当前页面内容标题
title: Rendering - Client vs Server
date: 2023-11-13
order: 4
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


## What is Rendering?

渲染指将 React 代码转换成 HTML 表示形式的用户界面。渲染可以在服务端或客户端上进行，发生在构建阶段之前或者在运行阶段的请求时。

在 Next.js 中有三种渲染方式：

- **服务端渲染**；
- **客户端渲染**；
- **静态网站生成**。

## Pre-Rendering

**服务端渲染和静态网站生成也被称为预渲染**，因为 **外部数据的获取和将 React 组件转换成 HTML 都发生在结果发送到客户端之前**。

## Client-Side Rendering vs Pre-Rendering

在标准的 React 应用中，**浏览器接收到的是附带着 JavaScript 指令（用于控制 UI）的空 HTML shell**。因为 **初始的渲染工作发送在用户的设备**，所以被称为 **Client-Side Rendering (客户端渲染)**。

相反，Next.js 的默认会预渲染每一个页面，**Pre-Rendering (预渲染)** 意味着 **HTML 是提前在服务端生成的，而不是通过 JavaScript 在用户设备上完成所有操作**。

如果应用 **完全是由客户端进行渲染**，那么 **在渲染过程中用户将会看到一个空白的页面**，如下图所示，初始时只是一个空的 HTML shell，只有在渲染完成后，才会出现 UI（渲染后）：

![image-20231113142742550](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131428739.png)

相较于 **预渲染** 的应用，用户 **无论何时总是能看到构建的 HTML**。如下图所示，初始时 HTML 就已经渲染完成了：

![image-20231113143503921](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131435729.png)

下面来看看两种类型的 Pre-Rendering。

## Server-Side Rendering

使用 **服务端渲染** 时，**HTML 页面是在服务器上针对每个请求生成的，生成用于页面交互的 HTML、JSON 数据，以及 JavaScript 指令，再发送给客户端**。

在客户端，**HTML 被用来快速展示非交互的页面，而 React 使用 JSON 数据和 JavaScript 指令来让组件进行交互**（例如触发一个按钮事件）。Next.js 把这个过程被称为 **Hydration**。

在 Next.js 中，可以通过使用 [getServerSideProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props) 选择服务端渲染，在 App Router  中有改动，详细查看 https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering。

> 注意：React 18 和 Next.js 12 引入了 React 服务器组件的 alpha 版本。服务器组件完全在服务器上进行渲染，不需要客户端 JavaScript 来进行渲染。此外，服务器组件允许开发人员在服务器上保留一些逻辑，并仅将该逻辑的结果发送给客户端。这减少了发送给客户端的 dundle 大小，并提高了客户端渲染性能。 [Learn more about React server components here](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html).

## Static Site Generation

使用 **静态网站生成** 时，HTML 也是在服务端生成，但是不像服务端渲染那样，其 **在运行时没有服务端**。相反，**网站内容只在构建阶段生成一次，当应用部署后，HTML 一般存储在 CDN 并且对每个请求都可以重复使用**。

在 Next.js 中，可以通过使用 [getStaticProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) 选择静态地生成页面。在 App Router 中有改动，详细查看 https://nextjs.org/docs/app/building-your-application/rendering/server-components

Next.js 的优点就在于，无论是静态站点生成、服务端渲染还是客户端渲染，都 **可以按 page 层面给应用选择最合适的渲染方法**，详细阅读 [Data Fetch](https://nextjs.org/docs/pages/building-your-application/data-fetching)。对于 App Router，阅读 [Data Fetch](https://nextjs.org/docs/app/building-your-application/data-fetching)。
