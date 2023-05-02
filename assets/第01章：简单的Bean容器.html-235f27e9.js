const e=JSON.parse(`{"key":"v-48e14c55","path":"/studynotes/framework/small-spring/ioc/%E7%AC%AC01%E7%AB%A0%EF%BC%9A%E7%AE%80%E5%8D%95%E7%9A%84Bean%E5%AE%B9%E5%99%A8.html","title":"第01章：简单的 Bean 容器","lang":"zh-CN","frontmatter":{"title":"第01章：简单的 Bean 容器","order":1,"icon":"write","category":["框架"],"tag":["Spring"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 设计 实现一个最简单的 Bean 容器，由于我们需要通过 Bean 的名字来获取该 Bean 对象，所以使用 Map 进行映射最好不过了。 我们把 Bean 对象单独放在一个 BeanDefinition 类中，再定义一个 Bean 工厂 BeanFacotry 来存取 Bean。","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/framework/small-spring/ioc/%E7%AC%AC01%E7%AB%A0%EF%BC%9A%E7%AE%80%E5%8D%95%E7%9A%84Bean%E5%AE%B9%E5%99%A8.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"第01章：简单的 Bean 容器"}],["meta",{"property":"og:description","content":"本文内容 1. 设计 实现一个最简单的 Bean 容器，由于我们需要通过 Bean 的名字来获取该 Bean 对象，所以使用 Map 进行映射最好不过了。 我们把 Bean 对象单独放在一个 BeanDefinition 类中，再定义一个 Bean 工厂 BeanFacotry 来存取 Bean。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-14T03:18:43.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"Spring"}],["meta",{"property":"article:modified_time","content":"2023-03-14T03:18:43.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"第01章：简单的 Bean 容器\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-03-14T03:18:43.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 设计","slug":"_1-设计","link":"#_1-设计","children":[]},{"level":2,"title":"2. 实现","slug":"_2-实现","link":"#_2-实现","children":[]},{"level":2,"title":"3. 测试","slug":"_3-测试","link":"#_3-测试","children":[]},{"level":2,"title":"4. 流程","slug":"_4-流程","link":"#_4-流程","children":[]}],"git":{"createdTime":1678763923000,"updatedTime":1678763923000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":1.1,"words":329},"filePathRelative":"studynotes/framework/small-spring/ioc/第01章：简单的Bean容器.md","localizedDate":"2023年3月14日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 设计</h2>\\n<p>实现一个最简单的 Bean 容器，由于我们需要通过 Bean 的名字来获取该 Bean 对象，所以使用 Map 进行映射最好不过了。</p>\\n<p>我们把 Bean 对象单独放在一个 BeanDefinition 类中，再定义一个 Bean 工厂 BeanFacotry 来存取 Bean。</p>\\n<p><img src=\\"https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303091506104.png\\" alt=\\"img\\"></p>","autoDesc":true}`);export{e as data};
