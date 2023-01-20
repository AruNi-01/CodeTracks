import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/studynotes/": [   // 学习笔记
    {
      text: "Java",
      icon: "java",
      collapsible: true,
      prefix: "/studynotes/Java/",
      children: [
        {
          text: "Java 基础",
          icon: "java",
          collapsible: true,
          prefix: "/studynotes/Java/Java基础/",
          children: [
            {
              text: "Object 类",
              icon: "write",
              link: "Object类.md",
            },
            {
              text: "String 类",
              icon: "write",
              link: "String类.md",
            }
          ]
        },

        {
          text: "并发编程",
          icon: "java",
          collapsible: true,
          prefix: "/studynotes/Java/Concurrency/",
          children: [
            {
              text: "volatile 详解",
              icon: "write",
              link: "volatile详解.md",
            }
          ]
        },
      ],
    },

    {
      text: "Java虚拟机",
      icon: "engine",
      collapsible: true,
      prefix: "/codenotes/jvm/",
      children: [""],
    },

  ],

  // 浮生杂记的侧边栏
  "/floatinglife/": [
    {
      text: "小镇美食家",
      icon: "linter",
      collapsible: true,
      link: "/floatinglife/cooker/",
    },
    {
      text: "小镇技术宅",
      icon: "computer",
      collapsible: true,
      link: "/floatinglife/iter/",
    },
    {
      text: "小镇运动狂",
      icon: "strong",
      collapsible: true,
      link: "/floatinglife/sporter/",
    },
    {
      text: "小镇思考者",
      icon: "style",
      collapsible: true,
      link: "/floatinglife/thinker/",
    },
  ],
});
