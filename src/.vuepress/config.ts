import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import {searchPlugin} from "@vuepress/plugin-search";
import { nprogressPlugin } from '@vuepress/plugin-nprogress';

//自定义用户配置
export default defineUserConfig({
  base: "/docs/",

  // 多语言设置
  locales: {
    "/": {
      lang: "zh-CN",
      title: "AruNi's docs",
      description: "学习文档",
      // 设置favicon
      head: [["link", { rel: "icon", href: "/favicon.png" }]],
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
          placeholder: "搜索文章",
        },
      },
      // 热键支持
      hotKeys: ["command", "k"],
      // 最大推荐个数
      maxSuggestions: 7,
      // 排除首页中的内容
      isSearchable: (page) => page.path !== "/",
    }),

    // 加载进度条
    nprogressPlugin(),
  ],

  shouldPrefetch: false,
});
