const t=JSON.parse(`{"key":"v-3cabc5e3","path":"/studynotes/java/collection/ArrayList%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90.html","title":"ArrayList 源码分析","lang":"zh-CN","frontmatter":{"title":"ArrayList 源码分析","date":"2023-2-8","order":2,"icon":"write","category":["Java"],"tag":["集合"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 介绍 ArrayList = Array + List，即数组 + 列表，它的底层是通过 数组 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 动态扩容。 2. 源码分析 2.1 初始化","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/java/collection/ArrayList%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"ArrayList 源码分析"}],["meta",{"property":"og:description","content":"本文内容 1. 介绍 ArrayList = Array + List，即数组 + 列表，它的底层是通过 数组 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 动态扩容。 2. 源码分析 2.1 初始化"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-05T09:41:24.000Z"}],["meta",{"property":"article:tag","content":"集合"}],["meta",{"property":"article:published_time","content":"2023-02-08T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-05T09:41:24.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"ArrayList 源码分析\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-02-08T00:00:00.000Z\\",\\"dateModified\\":\\"2023-03-05T09:41:24.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"1. 介绍","slug":"_1-介绍","link":"#_1-介绍","children":[]},{"level":2,"title":"2. 源码分析","slug":"_2-源码分析","link":"#_2-源码分析","children":[{"level":3,"title":"2.1 初始化","slug":"_2-1-初始化","link":"#_2-1-初始化","children":[]},{"level":3,"title":"2.2 插入","slug":"_2-2-插入","link":"#_2-2-插入","children":[]},{"level":3,"title":"2.3 删除","slug":"_2-3-删除","link":"#_2-3-删除","children":[]},{"level":3,"title":"2.4 扩容机制","slug":"_2-4-扩容机制","link":"#_2-4-扩容机制","children":[]},{"level":3,"title":"2.5 System.arraycopy() 和 Arrays.copyOf()","slug":"_2-5-system-arraycopy-和-arrays-copyof","link":"#_2-5-system-arraycopy-和-arrays-copyof","children":[]}]},{"level":2,"title":"3. 参考文章","slug":"_3-参考文章","link":"#_3-参考文章","children":[]}],"git":{"createdTime":1675866314000,"updatedTime":1678009284000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":3}]},"readingTime":{"minutes":10,"words":2999},"filePathRelative":"studynotes/java/collection/ArrayList源码分析.md","localizedDate":"2023年2月8日","excerpt":"<div class=\\"addthis_inline_share_toolbox\\"></div>\\n<hr>\\n<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 介绍</h2>\\n<p>ArrayList = Array + List，即数组 + 列表，它的底层是通过 <strong>数组</strong> 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 <strong>动态扩容</strong>。</p>\\n<h2> 2. 源码分析</h2>\\n<h3> 2.1 初始化</h3>","autoDesc":true}`);export{t as data};
