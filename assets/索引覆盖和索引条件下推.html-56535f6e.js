const t=JSON.parse('{"key":"v-7fafca77","path":"/studynotes/database/mysql/index/%E7%B4%A2%E5%BC%95%E8%A6%86%E7%9B%96%E5%92%8C%E7%B4%A2%E5%BC%95%E6%9D%A1%E4%BB%B6%E4%B8%8B%E6%8E%A8.html","title":"索引覆盖和索引条件下推","lang":"zh-CN","frontmatter":{"title":"索引覆盖和索引条件下推","date":"2023-02-16T00:00:00.000Z","order":2,"category":["数据库"],"tag":["MySQL"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 前言 讲到索引优化的方式时，一般都会有索引覆盖和索引条件下推，那么这两个到底是什么？又是如何提高查询效率的？它们又有什么区别？ 1. 索引覆盖 1.1 什么是索引覆盖 索引覆盖针对的是 二级索引（辅助索引），指 从辅助索引中就可以得到查询所需的字段，而不需要通过回表去聚簇索引中查询。","head":[["meta",{"property":"og:url","content":"https://aruni.me/studynotes/database/mysql/index/%E7%B4%A2%E5%BC%95%E8%A6%86%E7%9B%96%E5%92%8C%E7%B4%A2%E5%BC%95%E6%9D%A1%E4%BB%B6%E4%B8%8B%E6%8E%A8.html"}],["meta",{"property":"og:site_name","content":"AruNi"}],["meta",{"property":"og:title","content":"索引覆盖和索引条件下推"}],["meta",{"property":"og:description","content":"本文内容 前言 讲到索引优化的方式时，一般都会有索引覆盖和索引条件下推，那么这两个到底是什么？又是如何提高查询效率的？它们又有什么区别？ 1. 索引覆盖 1.1 什么是索引覆盖 索引覆盖针对的是 二级索引（辅助索引），指 从辅助索引中就可以得到查询所需的字段，而不需要通过回表去聚簇索引中查询。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-09-16T10:04:08.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2023-02-16T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-09-16T10:04:08.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"索引覆盖和索引条件下推\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-02-16T00:00:00.000Z\\",\\"dateModified\\":\\"2023-09-16T10:04:08.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01\\"}]}"]]},"headers":[{"level":2,"title":"1. 索引覆盖","slug":"_1-索引覆盖","link":"#_1-索引覆盖","children":[{"level":3,"title":"1.1 什么是索引覆盖","slug":"_1-1-什么是索引覆盖","link":"#_1-1-什么是索引覆盖","children":[]},{"level":3,"title":"1.2 案例","slug":"_1-2-案例","link":"#_1-2-案例","children":[]}]},{"level":2,"title":"2. 索引条件下推","slug":"_2-索引条件下推","link":"#_2-索引条件下推","children":[{"level":3,"title":"2.1 什么是索引条件下推","slug":"_2-1-什么是索引条件下推","link":"#_2-1-什么是索引条件下推","children":[]},{"level":3,"title":"2.2 案例","slug":"_2-2-案例","link":"#_2-2-案例","children":[]}]},{"level":2,"title":"3. 总结","slug":"_3-总结","link":"#_3-总结","children":[]},{"level":2,"title":"4. 参考文章","slug":"_4-参考文章","link":"#_4-参考文章","children":[]}],"git":{"createdTime":1677758434000,"updatedTime":1694858648000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":3},{"name":"aarynlu","email":"aarynlu@tencent.com","commits":3}]},"readingTime":{"minutes":7.62,"words":2286},"filePathRelative":"studynotes/database/mysql/index/索引覆盖和索引条件下推.md","localizedDate":"2023年2月16日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<div class=\\"hint-container info\\">\\n<p class=\\"hint-container-title\\">前言</p>\\n<p>讲到索引优化的方式时，一般都会有索引覆盖和索引条件下推，那么这两个到底是什么？又是如何提高查询效率的？它们又有什么区别？</p>\\n</div>\\n<h2> <strong>1. 索引覆盖</strong></h2>\\n<h3> <strong>1.1 什么是索引覆盖</strong></h3>\\n<p>索引覆盖针对的是 <strong>二级索引</strong>（辅助索引），指 <strong>从辅助索引中就可以得到查询所需的字段，而不需要通过回表去聚簇索引中查询</strong>。</p>","autoDesc":true}');export{t as data};
