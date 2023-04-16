import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { nprogressPlugin } from '@vuepress/plugin-nprogress';
import { commentPlugin } from "vuepress-plugin-comment2";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { getDirname, path } from "@vuepress/utils";

const __dirname = getDirname(import.meta.url);

//自定义用户配置
export default defineUserConfig({
  base: "/docs/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "AruNi's domain",
      description: "学习文档",
      // 设置 favicon
      head: [
        ["link", { rel: "icon", href: "/logo.svg" }],
      ],
    },
  },
  // 主题设置
  theme,

  alias: {
    "@MyLink": path.resolve(__dirname, "./components/Mylink.vue"),
    "@MyCoverLink": path.resolve(__dirname, "./components/MyCoverLink.vue"),
    "@Design": path.resolve(__dirname, "./data/design.ts"),
    "@Api": path.resolve(__dirname, "./data/api.ts"),
  },

  plugins: [
    // 谷歌统计
    googleAnalyticsPlugin({
      id: 'G-893HD6BZW1',
    }),

    // 搜索插件
    docsearchPlugin({
      appId: "5BC4BBMT90",
      apiKey: "0f8789cd48dbcc5ae98b33d8172fae79",
      indexName: "aruni",

      locales: {
        "/": {
          placeholder: "搜索文档",
          translations: {
            button: {
              buttonText: "搜索文档",
              buttonAriaLabel: "搜索文档",
            },
            modal: {
              searchBox: {
                resetButtonTitle: "清除查询条件",
                resetButtonAriaLabel: "清除查询条件",
                cancelButtonText: "取消",
                cancelButtonAriaLabel: "取消",
              },
              startScreen: {
                recentSearchesTitle: "搜索历史",
                noRecentSearchesText: "没有搜索历史",
                saveRecentSearchButtonTitle: "保存至搜索历史",
                removeRecentSearchButtonTitle: "从搜索历史中移除",
                favoriteSearchesTitle: "收藏",
                removeFavoriteSearchButtonTitle: "从收藏中移除",
              },
              errorScreen: {
                titleText: "无法获取结果",
                helpText: "你可能需要检查你的网络连接",
              },
              footer: {
                selectText: "选择",
                navigateText: "切换",
                closeText: "关闭",
                searchByText: "搜索提供者",
              },
              noResultsScreen: {
                noResultsText: "无法找到相关结果",
                suggestedQueryText: "你可以尝试查询",
                reportMissingResultsText: "你认为该查询应该有结果？",
                reportMissingResultsLinkText: "点击反馈",
              },
            },
          },
        },
      },

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
