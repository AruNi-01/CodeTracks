const t=JSON.parse(`{"key":"v-7bfc07f6","path":"/studynotes/design_pattern/pattern/create_type/%E5%B7%A5%E5%8E%82%E6%A8%A1%E5%BC%8F.html","title":"工厂模式","lang":"zh-CN","frontmatter":{"title":"工厂模式","order":2,"icon":"write","category":["设计模式"],"tag":["设计模式与范式"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 前言 除了上一章讲的单例模式外，还有一个比较常用的创建型模式：工厂模式。 工厂模式可以分为三种类型：简单工厂、工厂方法和抽象工厂。在本章中，除了了解工厂模式的原理和实现之外，更重要的是搞清楚下面两个问题： 什么时候应该使用工厂模式？ 相对于直接 new 来创建对象，工厂模式有什么好处？","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/design_pattern/pattern/create_type/%E5%B7%A5%E5%8E%82%E6%A8%A1%E5%BC%8F.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"工厂模式"}],["meta",{"property":"og:description","content":"本文内容 前言 除了上一章讲的单例模式外，还有一个比较常用的创建型模式：工厂模式。 工厂模式可以分为三种类型：简单工厂、工厂方法和抽象工厂。在本章中，除了了解工厂模式的原理和实现之外，更重要的是搞清楚下面两个问题： 什么时候应该使用工厂模式？ 相对于直接 new 来创建对象，工厂模式有什么好处？"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-04-04T03:38:54.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"设计模式与范式"}],["meta",{"property":"article:modified_time","content":"2023-04-04T03:38:54.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"工厂模式\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-04-04T03:38:54.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 简单工厂","slug":"_1-简单工厂","link":"#_1-简单工厂","children":[{"level":3,"title":"1.1 常规的简单工厂","slug":"_1-1-常规的简单工厂","link":"#_1-1-常规的简单工厂","children":[]},{"level":3,"title":"1.2 结合单例的简单工厂","slug":"_1-2-结合单例的简单工厂","link":"#_1-2-结合单例的简单工厂","children":[]},{"level":3,"title":"1.3 小结","slug":"_1-3-小结","link":"#_1-3-小结","children":[]}]},{"level":2,"title":"2. 工厂方法","slug":"_2-工厂方法","link":"#_2-工厂方法","children":[{"level":3,"title":"2.1 工厂方法的引出","slug":"_2-1-工厂方法的引出","link":"#_2-1-工厂方法的引出","children":[]},{"level":3,"title":"2.2 工厂方法存在的问题","slug":"_2-2-工厂方法存在的问题","link":"#_2-2-工厂方法存在的问题","children":[]},{"level":3,"title":"2.3 什么时候使用工厂方法，而非简单工厂呢？","slug":"_2-3-什么时候使用工厂方法-而非简单工厂呢","link":"#_2-3-什么时候使用工厂方法-而非简单工厂呢","children":[]}]},{"level":2,"title":"3. 抽象工厂","slug":"_3-抽象工厂","link":"#_3-抽象工厂","children":[]},{"level":2,"title":"4. 总结","slug":"_4-总结","link":"#_4-总结","children":[]}],"git":{"createdTime":1680579534000,"updatedTime":1680579534000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":11.89,"words":3567},"filePathRelative":"studynotes/design_pattern/pattern/create_type/工厂模式.md","localizedDate":"2023年4月4日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<div class=\\"hint-container info\\">\\n<p class=\\"hint-container-title\\">前言</p>\\n<p>除了上一章讲的单例模式外，还有一个比较常用的创建型模式：<strong>工厂模式</strong>。</p>\\n<p>工厂模式可以分为三种类型：<strong>简单工厂、工厂方法和抽象工厂</strong>。在本章中，除了了解工厂模式的原理和实现之外，更重要的是搞清楚下面两个问题：</p>\\n<ul>\\n<li><strong>什么时候应该使用工厂模式</strong>？</li>\\n<li><strong>相对于直接 new 来创建对象，工厂模式有什么好处</strong>？</li>\\n</ul>\\n</div>","autoDesc":true}`);export{t as data};
