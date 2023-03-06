---
# 当前页面内容标题
title: Hello VuePress
date: 2023-1-19
order: 1
icon: write

# 分类
category:
 - 杂谈
tag:
 - 网站

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

<AudioPlayer
  src="/mp3/Chris James - 12 Hours.mp3"
  title="Chris James - 12 Hours"
  poster="/mp3/logo/Chris James - 12 Hours.png"
/>

::: tip 今天，我的博客文档诞生了
:::

## 为什么选择 VuePress ？

还记得第一次学习 `Vue.js` 的时候，首先吸引我的是 `Vue` 的官网 —— 简约、大方。`Vue` 的网站就是使用 VitePress（VuePress 小兄弟） 静态生成的，它是一个由 Vue 驱动的静态站点生成器。

VuePress 的优点：
- 简洁至上，以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作；
- Vue 驱动，享受 Vue + webpack 的开发体验，可以在 Markdown 中使用 Vue 组件，又可以使用 Vue 来开发自定义主题；
- 高性能，VuePress 会为每个页面预渲染生成静态的 HTML，同时，每个页面被加载的时候，将作为 SPA 运行；
- 易部署，VuePress 有很多种部署方式，且都相对较简单。本站部署到 GitHub Pages，[Github Actions](https://docs.github.com/cn/actions)（Github 的持续集成服务）自动实现 commit 后推送静态文件到仓库的指定分支；
- 好看的主题，搭建该文档的一个重要原因是 [VuePress-Hope-Theme](https://theme-hope.vuejs.press/zh) 这个主题太漂亮了。

## 为什么要搭建博客 ？

搭建一个简单的博客，不需要花费大量时间，平时有兴致的时候可以有个小地方记录生活、记录日常。它并不是必须的，但确可以提高个人满足感。当你写满一篇又一篇文章时，或多或少会有些许成就感。