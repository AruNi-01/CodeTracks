---
# 当前页面内容标题
title: 创建 Next.js App
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


## Create Next.js App

> 注意：需要 Node.js 18+

创建一个 Next.js 项目：

```sh
npx create-next-app@latest
```

自动创建 Next.js 项目会有如下可选项：

```sh
> npx create-next-app@latest --typescript
Need to install the following packages:
create-next-app@14.0.2
Ok to proceed? (y) y
√ What is your project named? ... nextjs-learn
√ Would you like to use ESLint? ... No / Yes
√ Would you like to use Tailwind CSS? ... No / Yes
√ Would you like to use `src/` directory? ... No / Yes
√ Would you like to use App Router? (recommended) ... No / Yes
√ Would you like to customize the default import alias (@/*)? ... No / Yes
√ What import alias would you like configured? ... @/*
```

创建完毕后，进入项目文件夹，运行项目：

```sh
npm run dev
```

浏览器输入 http://localhost:3000 查看：

![image-20231112160342979](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311121603499.png)

这样一个基本的 Next.js 项目就运行起来了，下面先来看看它的目录结构。

## Next.js 项目目录结构

![image-20231112221519148](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131711247.png)

下面介绍一些比较重要的文件：

- `public`：静态资源；

- `src`：应用源码文件夹，与项目配置文件区分开；

    - `app`：[App Router](https://nextjs.org/docs/app/building-your-application/routing)，Next13 最新推荐的路由方式，app 路由约定如下：

        **路由文件**（文件后缀可以是 `.js`、`.jsx`、`.tsx`）：

        - `layout.tsx`：布局，可嵌套。例如：

            ![image-20231112232017999](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311122320007.png)

        - `page.tsx`：页面，被用来生成一个可行的路由段（路由段名称为其所属的文件夹名），例如：

            ![image-20231112231916804](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311122319948.png)

        - `loading.tsx`：用户加载界面；

        - `not-found.tsx`：404 Not Fount 界面；

        - `error.tsx`：错误界面；

        - `global-error.tsx`：全局错误界面。

        **嵌套路由**：

        - folder：路由段，对应 URL 中一段路由；

        - folder/folder：嵌套路由段。

        - 示例：

            ![image-20231112231744074](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311122317089.png)

        **动态路由**：

        - [folder]：动态路由段，例如 Route：`app/blog/[slug].js`，URL：`/blog/a`，params：`{ slug: 'a' }`
        - [...folder]：全匹配路由段；
        - [[...folder]]：可选全匹配路由段。

        下面列举一个 App 路由与 React 组件之间的对应关系：

        ![image-20231112230951799](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311122309904.png)

        其实就是约定大于配置，你根据 Next.js 的约定编写文件，它就会自动给你组装起来。

    - `pages`：Pages Router，基于文件系统的路由器，将文件添加到 pages  目录后，将会自动作为路由使用（根据文件名）。路由约定如下：

        **特殊文件**（文件后缀可以是 `.js`、`.jsx`、`.tsx`）：

        - `_app.tsx`：定制 App；
        - `_document.tsx`：定制 Document；
        - `_error.tsx`：定制错误页面；
        - `404.tsx`：404 错误页面；
        - `500.tsx`：500 错误页面。

        **路由**：

        - 若文件用 `index.xx` 命令，则路由使用其所属的文件夹名称：例如 `pages/index.js` → `/`、`pages/blog/index.js` → `/blog`；
        - 嵌套路由：`pages/blog/first-post.js` → `/blog/first-post`、`pages/dashboard/settings/username.js` → `/dashboard/settings/username`；
        - 动态路由：与 App 路由中的类似。

- `next.config.js`：Next.js 配置文件；

- `package.json`：项目依赖和脚本；

- `postcss.config.js`：Tailwind CSS 配置文件，用于配置 PostCSS 的插件和选项；

- `tailwind.config.ts`：需要将使用 Tailwind CSS 的文件名配置到该文件中；

- `tsconfig.json`： TypeScript 配置文件；

此处只需要大致了解下 Next.js 的目录结构，后续会在使用中逐渐熟悉。
