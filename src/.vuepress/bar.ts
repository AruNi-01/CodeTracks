import { navbar, sidebar } from "vuepress-theme-hope";

export const Navbar = navbar([
    { text: "学习笔记", icon: "Notes", link: "/studynotes/" },
    { text: "人生杂谈", icon: "rensheng", link: "/lifetalk/" },
    { text: "链接分享", icon: "link", link: "/link/" },
    { text: "项目作品", icon: "project", link: "/project/" },
    { text: "更新日志", icon: "rizhi", link: "/updatelog/" },
    // { text: "我的博客", icon: "blog", link: "https://aruni.me" },
]);

export const Sidebar = sidebar({

    "/studynotes/": "structure",
    "/lifetalk/": "structure",
    // ========================= 学习笔记 =========================
    // "/studynotes/": [
    //   // // ---------------- java ----------------
    //   {
    //     text: "java",
    //     icon: "java",
    //     collapsible: true,
    //     prefix: "/studynotes/java/",
    //     children: [
    //         // java 基础
    //       {
    //         text: "java 基础",
    //         icon: "java",
    //         collapsible: true,
    //         prefix: "/studynotes/java/javase/",
    //         children: [
    //           {
    //             text: "Object 类",
    //             icon: "write",
    //             link: "Object类.md",
    //           },
    //           {
    //             text: "String 类",
    //             icon: "write",
    //             link: "String类.md",
    //           }
    //         ]
    //       },
    //
    //       // concurrency
    //       {
    //         text: "concurrency",
    //         icon: "java",
    //         collapsible: true,
    //         prefix: "/studynotes/java/concurrency/",
    //         children: [
    //           {
    //             text: "volatile 详解",
    //             icon: "write",
    //             link: "volatile详解.md",
    //           }
    //         ]
    //       },
    //     ],
    //   },
    //
    //   // ---------------- database ----------------
    //   {
    //     text: "database",
    //     icon: "storage",
    //     collapsible: true,
    //     prefix: "/codenotes/database/",
    //     children: [
    //
    //       // MySQL
    //       {
    //         text: "MySQL",
    //         icon: "mysql",
    //         collapsible: true,
    //         prefix: "/studynotes/database/mysql/",
    //         children: [
    //           {
    //             text: "MySQL 存储",
    //             icon: "write",
    //             link: "MySQL存储.md",
    //           }
    //         ]
    //       },
    //
    //       // Redis
    //       {
    //         text: "Redis",
    //         icon: "stack",
    //         collapsible: true,
    //         prefix: "/studynotes/database/redis/",
    //         children: [
    //           {
    //             text: "Redis 持久化",
    //             icon: "write",
    //             link: "Redis持久化.md"
    //           }
    //         ]
    //       }
    //     ],
    //   },
    //
    //   // ---------------- cs ----------------
    //   {
    //     text: "cs",
    //     icon: "computer",
    //     collapsible: true,
    //     prefix: "/codenotes/cs/",
    //     children: [
    //
    //       // OS
    //       {
    //         text: "操作系统",
    //         icon: "OS",
    //         collapsible: true,
    //         prefix: "/studynotes/cs/os/",
    //         children: [
    //           {
    //             text: "虚拟内存",
    //             icon: "write",
    //             link: "虚拟内存.md",
    //           }
    //         ]
    //       },
    //
    //       // 网络
    //       {
    //         text: "网络",
    //         icon: "network",
    //         collapsible: true,
    //         prefix: "/studynotes/cs/network/",
    //         children: [
    //           {
    //             text: "认识 HTTP",
    //             icon: "write",
    //             link: "认识HTTP.md"
    //           }
    //         ]
    //       }
    //     ],
    //   },
    //
    //   // ---------------- 分布式系统 ----------------
    //   {
    //     text: "LeetCode 算法",
    //     icon: "structure",
    //     collapsible: true,
    //     prefix: "/codenotes/distributed/",
    //     children: [
    //
    //       // sort
    //       {
    //         text: "sort",
    //         icon: "structure",
    //         collapsible: true,
    //         prefix: "/studynotes/distributed/sort/",
    //         children: [
    //           {
    //             text: "介绍",
    //             icon: "write",
    //             link: "介绍.md",
    //           }
    //         ]
    //       },
    //
    //       // 剑指 Offer
    //       {
    //         text: "剑指 Offer",
    //         icon: "structure",
    //         collapsible: true,
    //         prefix: "/studynotes/distributed/jzoffer/",
    //         children: [
    //           {
    //             text: "剑指 Offer01. 最长回文子串",
    //             icon: "write",
    //             link: "剑指_Offer01_最长回文子串.md"
    //           }
    //         ]
    //       }
    //     ],
    //   },
    //
    //
    //
    // ],
    //
    //
    // // ========================浮生杂记的侧边栏========================
    // "/lifetalk/": [
    //   {
    //     text: "小镇美食家",
    //     icon: "linter",
    //     collapsible: true,
    //     link: "/lifetalk/cooker/",
    //   },
    //   {
    //     text: "小镇技术宅",
    //     icon: "computer",
    //     collapsible: true,
    //     link: "/lifetalk/iter/",
    //   },
    //   {
    //     text: "小镇运动狂",
    //     icon: "strong",
    //     collapsible: true,
    //     link: "/lifetalk/sporter/",
    //   },
    //   {
    //     text: "小镇思考者",
    //     icon: "style",
    //     collapsible: true,
    //     link: "/lifetalk/thinker/",
    //   },
    // ],

});
