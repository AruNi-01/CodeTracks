const t=JSON.parse(`{"key":"v-de700bbe","path":"/studynotes/design_pattern/pattern/structure_type/%E4%BA%AB%E5%85%83%E6%A8%A1%E5%BC%8F.html","title":"享元模式","lang":"zh-CN","frontmatter":{"title":"享元模式","date":"2023-4-18","order":7,"icon":"write","category":["设计模式"],"tag":["设计模式与范式"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 前言 上一篇文章讲的组合模式，主要应用在数据能表示成树形结构，所以不太常用。 而本篇文章要讲的 享元模式，也不太常用，因为它的使用场景也比较特殊。不过在 Java 中，你经常使用的 String、Integer 都使用到了享元模式。","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/design_pattern/pattern/structure_type/%E4%BA%AB%E5%85%83%E6%A8%A1%E5%BC%8F.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"享元模式"}],["meta",{"property":"og:description","content":"本文内容 前言 上一篇文章讲的组合模式，主要应用在数据能表示成树形结构，所以不太常用。 而本篇文章要讲的 享元模式，也不太常用，因为它的使用场景也比较特殊。不过在 Java 中，你经常使用的 String、Integer 都使用到了享元模式。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-04-18T06:11:53.000Z"}],["meta",{"property":"article:tag","content":"设计模式与范式"}],["meta",{"property":"article:published_time","content":"2023-04-18T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-04-18T06:11:53.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"享元模式\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-04-18T00:00:00.000Z\\",\\"dateModified\\":\\"2023-04-18T06:11:53.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"1. 什么是享元模式","slug":"_1-什么是享元模式","link":"#_1-什么是享元模式","children":[]},{"level":2,"title":"2. 如何实现享元模式","slug":"_2-如何实现享元模式","link":"#_2-如何实现享元模式","children":[]},{"level":2,"title":"3. 享元模式 vs 单例、缓存、池化技术","slug":"_3-享元模式-vs-单例、缓存、池化技术","link":"#_3-享元模式-vs-单例、缓存、池化技术","children":[]},{"level":2,"title":"4. 享元模式在 Java 中的应用","slug":"_4-享元模式在-java-中的应用","link":"#_4-享元模式在-java-中的应用","children":[{"level":3,"title":"4.1 享元模式在 Integer 中的应用","slug":"_4-1-享元模式在-integer-中的应用","link":"#_4-1-享元模式在-integer-中的应用","children":[]},{"level":3,"title":"4.2 享元模式在 String 中的应用","slug":"_4-2-享元模式在-string-中的应用","link":"#_4-2-享元模式在-string-中的应用","children":[]}]},{"level":2,"title":"5. 总结","slug":"_5-总结","link":"#_5-总结","children":[]}],"git":{"createdTime":1681798313000,"updatedTime":1681798313000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":11.43,"words":3430},"filePathRelative":"studynotes/design_pattern/pattern/structure_type/享元模式.md","localizedDate":"2023年4月18日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<div class=\\"hint-container info\\">\\n<p class=\\"hint-container-title\\">前言</p>\\n<p>上一篇文章讲的组合模式，主要应用在数据能表示成树形结构，所以不太常用。</p>\\n<p>而本篇文章要讲的 <strong>享元模式</strong>，也不太常用，因为它的使用场景也比较特殊。不过在 Java 中，你经常使用的 <strong>String、Integer 都使用到了享元模式</strong>。</p>\\n</div>","autoDesc":true}`);export{t as data};
