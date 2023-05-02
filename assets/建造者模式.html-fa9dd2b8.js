const e=JSON.parse(`{"key":"v-f449a610","path":"/studynotes/design_pattern/pattern/create_type/%E5%BB%BA%E9%80%A0%E8%80%85%E6%A8%A1%E5%BC%8F.html","title":"建造者模式","lang":"zh-CN","frontmatter":{"title":"建造者模式","order":3,"icon":"write","category":["设计模式"],"tag":["设计模式与范式"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 为什么需要建造者模式？ 在开发时，我们创建一个对象常用的方式就是 new，new 一个对象是通过构造函数来完成的。那什么情况下不适合用构造函数来创建对象呢？ 假设现在需要设计一个 资源池配置类 ResourcePoolConfig（类比线程池、连接池等，资源可以复用，用完后归还即可），里面有如下几个变量，有些是必填项、有些有默认值（可填可不填）：","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/design_pattern/pattern/create_type/%E5%BB%BA%E9%80%A0%E8%80%85%E6%A8%A1%E5%BC%8F.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"建造者模式"}],["meta",{"property":"og:description","content":"本文内容 1. 为什么需要建造者模式？ 在开发时，我们创建一个对象常用的方式就是 new，new 一个对象是通过构造函数来完成的。那什么情况下不适合用构造函数来创建对象呢？ 假设现在需要设计一个 资源池配置类 ResourcePoolConfig（类比线程池、连接池等，资源可以复用，用完后归还即可），里面有如下几个变量，有些是必填项、有些有默认值（可填可不填）："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-04-04T03:38:54.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"设计模式与范式"}],["meta",{"property":"article:modified_time","content":"2023-04-04T03:38:54.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"建造者模式\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-04-04T03:38:54.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 为什么需要建造者模式？","slug":"_1-为什么需要建造者模式","link":"#_1-为什么需要建造者模式","children":[]},{"level":2,"title":"2. 什么是建造者模式？","slug":"_2-什么是建造者模式","link":"#_2-什么是建造者模式","children":[]},{"level":2,"title":"3. 与工厂模式有何区别？","slug":"_3-与工厂模式有何区别","link":"#_3-与工厂模式有何区别","children":[]},{"level":2,"title":"4. 总结","slug":"_4-总结","link":"#_4-总结","children":[]}],"git":{"createdTime":1680579534000,"updatedTime":1680579534000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":8.84,"words":2653},"filePathRelative":"studynotes/design_pattern/pattern/create_type/建造者模式.md","localizedDate":"2023年4月4日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 为什么需要建造者模式？</h2>\\n<p>在开发时，我们创建一个对象常用的方式就是 new，new 一个对象是通过构造函数来完成的。<strong>那什么情况下不适合用构造函数来创建对象呢</strong>？</p>\\n<p>假设现在需要设计一个 <strong>资源池配置类 ResourcePoolConfig</strong>（类比线程池、连接池等，资源可以复用，用完后归还即可），里面有如下几个变量，<strong>有些是必填项、有些有默认值</strong>（可填可不填）：</p>","autoDesc":true}`);export{e as data};
