const t=JSON.parse(`{"key":"v-1bebb9c6","path":"/studynotes/database/mysql/index/%E8%81%94%E5%90%88%E7%B4%A2%E5%BC%95%E4%B8%8E%E6%9C%80%E5%B7%A6%E5%89%8D%E7%BC%80%E5%8C%B9%E9%85%8D.html","title":"联合索引与最左前缀匹配","lang":"zh-CN","frontmatter":{"title":"联合索引与最左前缀匹配","date":"2023-02-19T00:00:00.000Z","order":3,"icon":"write","category":["数据库"],"tag":["MySQL"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 前言 在谈及到索引失效时，往往都会想到查询的条件是否满足最左前缀匹配。同时，面试也经常会问有关最左前缀匹配的 SQL，问你到底有没有走索引。所以把最左前缀匹配弄清楚是十分有必要的。 1. 联合索引是如何存放的 因为最左前缀匹配原则主要是与联合索引有关。所以我们先来看看联合索引是如何存放在 B+ 树中的。","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/database/mysql/index/%E8%81%94%E5%90%88%E7%B4%A2%E5%BC%95%E4%B8%8E%E6%9C%80%E5%B7%A6%E5%89%8D%E7%BC%80%E5%8C%B9%E9%85%8D.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"联合索引与最左前缀匹配"}],["meta",{"property":"og:description","content":"本文内容 前言 在谈及到索引失效时，往往都会想到查询的条件是否满足最左前缀匹配。同时，面试也经常会问有关最左前缀匹配的 SQL，问你到底有没有走索引。所以把最左前缀匹配弄清楚是十分有必要的。 1. 联合索引是如何存放的 因为最左前缀匹配原则主要是与联合索引有关。所以我们先来看看联合索引是如何存放在 B+ 树中的。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-06-10T13:25:13.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2023-02-19T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-06-10T13:25:13.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"联合索引与最左前缀匹配\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-02-19T00:00:00.000Z\\",\\"dateModified\\":\\"2023-06-10T13:25:13.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 联合索引是如何存放的","slug":"_1-联合索引是如何存放的","link":"#_1-联合索引是如何存放的","children":[]},{"level":2,"title":"2. 最左前缀匹配原则是什么","slug":"_2-最左前缀匹配原则是什么","link":"#_2-最左前缀匹配原则是什么","children":[]},{"level":2,"title":"3. 如何安排联合索引中列的顺序","slug":"_3-如何安排联合索引中列的顺序","link":"#_3-如何安排联合索引中列的顺序","children":[]},{"level":2,"title":"4. 什么情况下联合索引会失效","slug":"_4-什么情况下联合索引会失效","link":"#_4-什么情况下联合索引会失效","children":[]},{"level":2,"title":"5. 参考文章","slug":"_5-参考文章","link":"#_5-参考文章","children":[]}],"git":{"createdTime":1677758434000,"updatedTime":1686403513000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":3},{"name":"aarynlu","email":"aarynlu@tencent.com","commits":1}]},"readingTime":{"minutes":5.33,"words":1598},"filePathRelative":"studynotes/database/mysql/index/联合索引与最左前缀匹配.md","localizedDate":"2023年2月19日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<div class=\\"hint-container info\\">\\n<p class=\\"hint-container-title\\">前言</p>\\n<p>在谈及到索引失效时，往往都会想到查询的条件是否满足最左前缀匹配。同时，面试也经常会问有关最左前缀匹配的 SQL，问你到底有没有走索引。所以把最左前缀匹配弄清楚是十分有必要的。</p>\\n</div>\\n<h2> <strong>1. 联合索引是如何存放的</strong></h2>\\n<p>因为最左前缀匹配原则主要是与联合索引有关。所以我们先来看看联合索引是如何存放在 B+ 树中的。</p>","autoDesc":true}`);export{t as data};
