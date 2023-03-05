const e=JSON.parse(`{"key":"v-299b38c5","path":"/studynotes/database/mysql/buffer_pool/%E4%BA%86%E8%A7%A3BufferPool.html","title":"了解 Buffer Pool","lang":"zh-CN","frontmatter":{"title":"了解 Buffer Pool","date":"2023-3-5","order":1,"icon":"write","category":["数据库"],"tag":["MySQL"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 为什么需要 Buffer Pool？ 我们都知道，MySQL 中的数据都是放在 磁盘 上的，凡是跟磁盘打交道，基本上都需要在内存中建立 缓存，因为磁盘的读写速度非常慢。 例如，Linux 在内存和磁盘之间就建立了一个缓冲区 Buffers，主要有两个 好处：","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/database/mysql/buffer_pool/%E4%BA%86%E8%A7%A3BufferPool.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"了解 Buffer Pool"}],["meta",{"property":"og:description","content":"本文内容 1. 为什么需要 Buffer Pool？ 我们都知道，MySQL 中的数据都是放在 磁盘 上的，凡是跟磁盘打交道，基本上都需要在内存中建立 缓存，因为磁盘的读写速度非常慢。 例如，Linux 在内存和磁盘之间就建立了一个缓冲区 Buffers，主要有两个 好处："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-05T09:41:24.000Z"}],["meta",{"property":"article:tag","content":"MySQL"}],["meta",{"property":"article:published_time","content":"2023-03-05T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-05T09:41:24.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"了解 Buffer Pool\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-03-05T00:00:00.000Z\\",\\"dateModified\\":\\"2023-03-05T09:41:24.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"1. 为什么需要 Buffer Pool？","slug":"_1-为什么需要-buffer-pool","link":"#_1-为什么需要-buffer-pool","children":[]},{"level":2,"title":"2. 什么是 Buffer Pool？","slug":"_2-什么是-buffer-pool","link":"#_2-什么是-buffer-pool","children":[]},{"level":2,"title":"3. Buffer Pool 缓存什么？","slug":"_3-buffer-pool-缓存什么","link":"#_3-buffer-pool-缓存什么","children":[]},{"level":2,"title":"4. 如何管理缓冲页？","slug":"_4-如何管理缓冲页","link":"#_4-如何管理缓冲页","children":[{"level":3,"title":"4.1 如何管理空闲页？","slug":"_4-1-如何管理空闲页","link":"#_4-1-如何管理空闲页","children":[]},{"level":3,"title":"> 小插曲：如何判断访问的页是否在 Buffer Pool 中？","slug":"小插曲-如何判断访问的页是否在-buffer-pool-中","link":"#小插曲-如何判断访问的页是否在-buffer-pool-中","children":[]},{"level":3,"title":"4.2 如何管理脏页？","slug":"_4-2-如何管理脏页","link":"#_4-2-如何管理脏页","children":[]},{"level":3,"title":"4.3 脏页何时被刷回磁盘？","slug":"_4-3-脏页何时被刷回磁盘","link":"#_4-3-脏页何时被刷回磁盘","children":[]},{"level":3,"title":"4.4 LRU 链表的管理","slug":"_4-4-lru-链表的管理","link":"#_4-4-lru-链表的管理","children":[]}]},{"level":2,"title":"5. 总结","slug":"_5-总结","link":"#_5-总结","children":[]},{"level":2,"title":"6. 参考文章","slug":"_6-参考文章","link":"#_6-参考文章","children":[]}],"git":{"createdTime":1677990444000,"updatedTime":1678009284000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":2}]},"readingTime":{"minutes":9.29,"words":2788},"filePathRelative":"studynotes/database/mysql/buffer_pool/了解BufferPool.md","localizedDate":"2023年3月5日","excerpt":"<div class=\\"addthis_inline_share_toolbox\\"></div>\\n<hr>\\n<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 为什么需要 Buffer Pool？</h2>\\n<p>我们都知道，MySQL 中的数据都是放在 <strong>磁盘</strong> 上的，凡是跟磁盘打交道，基本上都需要在内存中建立 <strong>缓存</strong>，因为磁盘的读写速度非常慢。</p>\\n<p>例如，Linux 在内存和磁盘之间就建立了一个缓冲区 Buffers，主要有两个 <strong>好处</strong>：</p>","autoDesc":true}`);export{e as data};
