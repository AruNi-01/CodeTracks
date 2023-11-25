import { navbar, sidebar } from "vuepress-theme-hope";

export const Navbar = navbar([
    { text: "后端足迹", icon: "backend", link: "/backend/" },
    { text: "前端足迹", icon: "frontend", link: "/frontend/" },
    { text: "项目作品", icon: "project", link: "/project/" },
    { text: "人生杂谈", icon: "rensheng", link: "/lifetalk/" },
    { text: "链接分享", icon: "link", link: "/link/" },
]);

export const Sidebar = sidebar({

    "/backend/": "structure",
    "/frontend/": "structure",
    "/lifetalk/": "structure",

    
    // ========================= 学习笔记 =========================
    // "/backend/": [
    //   // // ---------------- java ----------------
    //   {
    //     text: "java",
    //     icon: "java",
    //     collapsible: true,
    //     prefix: "/backend/java/",
    //     children: [
    //         // java 基础
    //       {
    //         text: "java 基础",
    //         icon: "java",
    //         collapsible: true,
    //         prefix: "/backend/java/javase/",
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
    //         prefix: "/backend/java/concurrency/",
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
    //         prefix: "/backend/database/mysql/",
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
    //         prefix: "/backend/database/redis/",
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
    //         prefix: "/backend/cs/os/",
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
    //         prefix: "/backend/cs/network/",
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
    //         prefix: "/backend/distributed/sort/",
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
    //         prefix: "/backend/distributed/jzoffer/",
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
