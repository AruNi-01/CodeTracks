import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import {searchPlugin} from "@vuepress/plugin-search";
import { nprogressPlugin } from '@vuepress/plugin-nprogress';
import { commentPlugin } from "vuepress-plugin-comment2";


//自定义用户配置
export default defineUserConfig({
  base: "/docs/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "AruNi's docs",
      description: "学习文档",
      // 设置 favicon
      head: [
        ["link", { rel: "icon", href: "/logo.svg" }],
      ],
    },
  },
  // 主题设置
  theme,

  plugins: [
    // 搜索插件
    searchPlugin({
      //多语言支持
      locales: {
        "/": {
          placeholder: "搜索 Ctrl+k",
        },
      },
      // 热键支持
      hotKeys: ["command", "k"],
      // 最大推荐个数
      maxSuggestions: 7,
      // 排除首页中的内容
      isSearchable: (page) => page.path !== "/",
    }),

    // 评论插件
    commentPlugin({
      // Giscus 评论
      provider: "Giscus",
      repo: "AruNi-01/docs",
      repoId: "R_kgDOIzaunw",
      category: "Announcements",
      categoryId: "DIC_kwDOIzaun84CTx1G",
      lazyLoading: true,
    }),

    // 加载进度条
    nprogressPlugin(),
  ],

  shouldPrefetch: false,
});
