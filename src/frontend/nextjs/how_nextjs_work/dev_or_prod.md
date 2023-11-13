---
# 当前页面内容标题
title: Dev or Prod
date: 2023-11-13
order: 2
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


Next.js 提供了开发和生产两个阶段的特性，例如：

- 在开发阶段，Next.js 为开发者以及应用的构建进行了优化，这提高了开发者的开发体验，例如内置 TypeScript、集成 ESLint、更快的刷新速度等；
- 在生产阶段，Next.js 为 App 使用者提供了优化和使用体验。

一个 App 从  Dev 到 Prod 需要做很多事情，例如，代码需要经过以下几个阶段：`compile`(编译) -> `bundle`(捆绑) -> `minify`(压缩) -> `code split`(代码分离)。

为了让你的 App 更容易的发布到生产环境，Next.js 做了 **许多代码转换（code transformations）和底层基础建设**。

Next.js 的编译器是由底层语言 Rust 编写的， 以及用于 compilation, minification, bundling 的 SWC（super-fast TypeScript/JavaScript compiler written in Rust）。

## Compiling

开发者现在都使用更友好的语言编写程序，例如 JSX、TypeScript、现代版本的 JavaScript。但是浏览器不支持这些，所以需要将其 **编译成浏览器能识别的代码**。例如：

![image-20231113102048519](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131020413.png)

在 Next.js 中，**编译发生在开发阶段**，其作为构建步骤中的一个部分，为发布到生产环境做准备。

## Minifying

开发者编写的代码都是针对更好的可读性的，这些代码可能包含额外的内容，而这些内容跟代码运行无关，例如代码注释、空格、缩进和换行。

**Minifying 就是为了移除那些运行不需要的代码内容，以通过减小文件大小来提高应用的性能**。例如：

![image-20231113102833362](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131028222.png)

在 Next.js 中，JavaScript 和 CSS 文件都会被自动 minify。

> 注意：代码高亮并非 Minify 需要处理的内容，这是代码编辑器的功劳。

## Bundling

开发者在开发应用时，往往会 **将应用拆分成不同的模块、组件和函数**，这将使代码结构更加清晰，更利于构建大型项目。还会导出和导入内部模块以及第三方包，这会创建一个复杂的文件依赖关系。

**Bundling 是一个合并（打包）这些文件（模块）的过程**，为的就是解决复杂的文件依赖。

![image-20231113104222193](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131042205.png)

当用户浏览网页时，将 **有利于减少文件的请求次数**。

## Code Splitting

开发者通常会将应用分开成多个页面，以便从不同的 URLs 进行访问。**每一个页面都成了进入应用的一个唯一切入点**。

**Code-Splitting 是一个将应用 bundle（可理解为包） 拆分成每隔切入点所需的更小 chunks（可理解为块） 的过程**，这样就可以 **在访问某个页面时，仅仅加载这个页面所需的代码，将会提高应用的初始加载时间**。

![image-20231113105855646](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202311131058626.png)

Next.js 内置 Code-Splitting，在构建步骤中，每一个在 `pages/` 目录下的文件将会自动拆分成它们自己的 JavaScript bundle。

**Next.js 特性**：

- **页面间共享的代码将会被拆分为另一个 bundle**，以避免在后面的导航中重新下载相同的代码；
- **当初始页面加载后，Next.js 会开启 pre-loading the code 预加载其他页面**，用户后续可能会导航到；
- [动态 import](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) 是另一种手动分离初始化加载代码的方式。
