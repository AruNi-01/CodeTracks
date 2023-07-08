import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import { getDirname, path } from "@vuepress/utils";
import { Navbar, Sidebar } from "./bar";

const __dirname = getDirname(import.meta.url);

//自定义用户配置
export default defineUserConfig({
    base: "/",
    lang: "zh-CN",
    title: "AruNi's domain",
    description: "学习文档",
    shouldPrefetch: false,
    head: [],

    dest: "public",

    // 主题设置
    theme: hopeTheme({
        // 当前网站部署域名
        hostname: "https://aruni.me/",

        // 文章显示的默认作者
        author: {
            name: "AruNi_Lu",
            url: "https://github.com/AruNi-01",
        },

        // 使用官方提供的图标库-也可以构建自己的图标库
        iconAssets: "//at.alicdn.com/t/c/font_3869136_t8oqoj8dj8h.css",
        iconPrefix: "iconfont icon-",

        // 导航栏图标
        logo: "/logo.png",
        logoDark: "/logo.png",

        // favicon站点图标（标签页上的小图标）
        favicon: "/logo.svg",

        // 导航栏上的个人仓库地址
        repo: "https://github.com/AruNi-01/",

        // 自定义仓库链接文字-默认从repo中自动推断为"GitHub" / "GitLab" / "Gitee" / "Bitbucket" 其中之一，或是 "Source"。
        repoLabel: "GitHub",

        // 是否在导航栏内显示仓库链接
        repoDisplay: true,

        // 导航栏布局
        navbarLayout: {
            start: ["Brand"],
            center: ["Links"],
            end: ["Repo", "Outlook", "Search"],
        },

        hotReload: true,

        // 页面显示信息
        pageInfo: ["Author", "Date", "Word", "ReadingTime", "Category", "Tag"],

        // 路径导航
        breadcrumb: true,

        // 路径导航的图标显示
        breadcrumbIcon: true,

        // 暗黑模式切换-在深色模式和浅色模式中切换
        darkmode: "toggle",
        // 全屏按钮
        fullscreen: false,
        // 返回顶部按钮-下滑300px后显示
        backToTop: true,
        // 纯净模式
        pure: false,

        // 文章的最后更新时间
        lastUpdated: true,

        // 显示页面的贡献者
        contributors: false,

        // 编辑此页开关
        editLink: false,
        editLinkPattern: ":repo/edit/:branch/:path",

        // 文章所在仓库
        docsRepo: "https://github.com/AruNi-01/AruNi-01.github.io",

        // 文章所在分支
        docsBranch: "main",

        // 文章所在目录
        docsDir: "src",

        // 导航栏与侧边栏
        navbar: Navbar,
        sidebar: Sidebar,

        // 显示页脚
        displayFooter: false,

        // 全局设置页脚信息
        footer: "学习文档",

        copyright: false,
        hideSiteNameOnMobile: true,
        navbarIcon: true,
        // 导航栏title，此设置会覆盖站点title，但不会影响标签栏
        navTitle: "AruNi's domain",
        navbarAutoHide: "mobile",
        sidebarIcon: true,
        sidebarSorter: ["readme", "order", "title", "filename"],
        headerDepth: 2,
        prevLink: true,
        nextLink: true,
        titleIcon: true,
        rtl: false,
        toc: true,
        print: true,

        plugins: {
            blog: true,
            pwa: true,
            // 开启git实现编辑此页面-最后更新时间-贡献者功能
            git: true,
            nprogress: true,
            prismjs: true,
            photoSwipe: true,
            readingTime: true,
            seo: true,
            sitemap: true,
            comment: {
                // Giscus 评论
                provider: "Giscus",
                repo: "AruNi-01/docs",
                repoId: "R_kgDOIzaunw",
                category: "Announcements",
                categoryId: "DIC_kwDOIzaun84CTx1G",
                lazyLoading: true,
            },

            components: {
                // 在MD文件中启用的组件
                components: [
                    // 为站点提供了在MD文档中自定义颜色的徽章
                    "Badge",
                    // 为站点提供了在MD文档中加载B站视频的功能，但是不建议使用
                    "BiliBili",
                    // 为站点提供了在MD文档中加载PDF阅读器的功能，但是不建议使用
                    // 原因一：PDF书籍较大，上传到码云后会大量占用码云空间
                    // 原因二：当PDF阅读器较多的时候，将MD文档渲染成HTML页面比较耗费性能，使页面加载速度变慢
                    "PDF",

                    // 音乐播放器
                    "AudioPlayer",

                    // 站点信息组件
                    "SiteInfo",
                ],

                rootComponents: {
                    // addThis 分享按钮
                    // addThis: "ra-640435c5c88b015c",

                    // 通知组件
                    // notice: [
                    //   {
                    //     path: "/",
                    //     title: "GoodLuck ~",
                    //     content: "✨ 实习面经快速导航 ✨",
                    //     actions: [
                    //       {
                    //         text: "立即查看",
                    //         link: "/lifetalk/",
                    //         type: "primary",
                    //       },
                    //       { text: "取消" },
                    //     ],
                    //     fullscreen: false,
                    //   },
                    // ],
                },
            },

            // 代码复制功能-vuepress-plugin-copy-code2
            copyCode: {
                // 在移动端也可以实现复制代码
                showInMobile: true,
                selector: '.theme-default-content div[class*="language-"] pre',
                duration: 1500,
                // pure: false,
                delay: 800,
            },

            // MarkDown文件增强
            mdEnhance: {
                demo: true,
                imgSize: true,
                gfm: true,
                container: true,
                checkLinks: { status: "dev" },
                tabs: true,
                codetabs: true,
                attrs: false,
                figure: false,
                mermaid: true,
                katex: true,
                mathjax: false,
                chart: false,
                echarts: false,
                delay: 800,
                sup: true,
                sub: true,
                tasklist: true,
                card: true,
                imgLazyload: true,
                imgMark: false,
                obsidianImgSize: false,
                include: true,
                mark: true,
                footnote: true,
                align: true,
                vuePlayground: true,
                playground: {
                    presets: ["ts", "vue"],
                },
                presentation: {
                    plugins: ["highlight", "math", "search", "notes", "zoom"],
                },
                stylize: [
                    {
                        matcher: "Recommanded",
                        replacer: ({ tag }) => {
                            if (tag === "em")
                                return {
                                    tag: "Badge",
                                    attrs: { type: "tip" },
                                    content: "Recommanded",
                                };
                        },
                    },
                ],
            },
        }
    }),

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
        }),
    ],
});