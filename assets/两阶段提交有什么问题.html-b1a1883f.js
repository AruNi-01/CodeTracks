const e=JSON.parse(`{"key":"v-16f2bf36","path":"/studynotes/database/mysql/log/%E4%B8%A4%E9%98%B6%E6%AE%B5%E6%8F%90%E4%BA%A4%E6%9C%89%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98.html","title":"两阶段提交有什么问题","lang":"zh-CN","frontmatter":{"title":"两阶段提交有什么问题","date":"2023-03-15T00:00:00.000Z","order":4,"icon":"write","category":["数据库"],"tag":["MySQL"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 两阶段提交的问题 在 select 执行流程 中，讲到了可以利用两阶段提交解决 redo log 和 binlog 一致性的问题。但是有两阶段提交有一个明显的问题，就是性能很差。主要体现在两个方面：","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/database/mysql/log/%E4%B8%A4%E9%98%B6%E6%AE%B5%E6%8F%90%E4%BA%A4%E6%9C%89%E4%BB%80%E4%B9%88%E9%97%AE%E9%A2%98.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"两阶段提交有什么问题"}],["meta",{"property":"og:description","content":"本文内容 1. 两阶段提交的问题 在 select 执行流程 中，讲到了可以利用两阶段提交解决 redo log 和 binlog 一致性的问题。但是有两阶段提交有一个明显的问题，就是性能很差。主要体现在两个方面："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-06-10T13:25:13.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2023-03-15T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-06-10T13:25:13.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"两阶段提交有什么问题\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-03-15T00:00:00.000Z\\",\\"dateModified\\":\\"2023-06-10T13:25:13.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 两阶段提交的问题","slug":"_1-两阶段提交的问题","link":"#_1-两阶段提交的问题","children":[{"level":3,"title":"1.1 为什么磁盘 I/O 次数多？","slug":"_1-1-为什么磁盘-i-o-次数多","link":"#_1-1-为什么磁盘-i-o-次数多","children":[]},{"level":3,"title":"1.2 为什么锁竞争激烈？","slug":"_1-2-为什么锁竞争激烈","link":"#_1-2-为什么锁竞争激烈","children":[]}]},{"level":2,"title":"2. binlog 的组提交","slug":"_2-binlog-的组提交","link":"#_2-binlog-的组提交","children":[]},{"level":2,"title":"3. redo log 的组提交","slug":"_3-redo-log-的组提交","link":"#_3-redo-log-的组提交","children":[]},{"level":2,"title":"4. 关于日志刷盘的性能问题","slug":"_4-关于日志刷盘的性能问题","link":"#_4-关于日志刷盘的性能问题","children":[]},{"level":2,"title":"5. 总结","slug":"_5-总结","link":"#_5-总结","children":[]},{"level":2,"title":"6. 参考文章","slug":"_6-参考文章","link":"#_6-参考文章","children":[]}],"git":{"createdTime":1678890920000,"updatedTime":1686403513000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1},{"name":"aarynlu","email":"aarynlu@tencent.com","commits":1}]},"readingTime":{"minutes":7.7,"words":2310},"filePathRelative":"studynotes/database/mysql/log/两阶段提交有什么问题.md","localizedDate":"2023年3月15日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 两阶段提交的问题</h2>\\n<p>在 <a href=\\"https://aruni.me/docs/studynotes/database/mysql/log/update%20%E6%89%A7%E8%A1%8C%E6%B5%81%E7%A8%8B.html\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">select 执行流程</a> 中，讲到了可以利用两阶段提交解决 redo log 和 binlog 一致性的问题。但是有两阶段提交有一个明显的问题，就是性能很差。主要体现在两个方面：</p>","autoDesc":true}`);export{e as data};
