const e=JSON.parse(`{"key":"v-25727427","path":"/studynotes/framework/small-spring/ioc/%E7%AC%AC05%E7%AB%A0%EF%BC%9A%E8%B5%84%E6%BA%90%E5%8A%A0%E8%BD%BD%E5%99%A8%E8%A7%A3%E6%9E%90%E6%96%87%E4%BB%B6%E6%B3%A8%E5%86%8C%E5%AF%B9%E8%B1%A1.html","title":"第05章：资源加载器解析文件注册对象","lang":"zh-CN","frontmatter":{"title":"第05章：资源加载器解析文件注册对象","order":5,"icon":"write","category":["框架"],"tag":["Spring"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 设计 在上一章中，我们可以通过单元测试进行手动操作 Bean 对象的定义、注册和属性填充，以及最终获取对象调用方法。但是，实际上有个问题，在注册多个 Bean 时，如果依赖的属性很多，那么需要将这些属性一个一个地封装成 PropertyValue，再添加进PropertyValues，然后才进行属性填充，无疑增加了很多代码量。 所以这个章节，我们就用配置文件的方式，将所有的 Bean，以及 Bean 所依赖的属性都配置到 XML 文件。所以就需要一个 能解析 XML 配置文件的模块，将文件中的信息解析出来，然后由这个模块进行 PropertyValues 的处理，接着进行 Bean 的注册，此时就可以顺带把依赖的属性 PropertyValues 也传递进去。","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/framework/small-spring/ioc/%E7%AC%AC05%E7%AB%A0%EF%BC%9A%E8%B5%84%E6%BA%90%E5%8A%A0%E8%BD%BD%E5%99%A8%E8%A7%A3%E6%9E%90%E6%96%87%E4%BB%B6%E6%B3%A8%E5%86%8C%E5%AF%B9%E8%B1%A1.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"第05章：资源加载器解析文件注册对象"}],["meta",{"property":"og:description","content":"本文内容 1. 设计 在上一章中，我们可以通过单元测试进行手动操作 Bean 对象的定义、注册和属性填充，以及最终获取对象调用方法。但是，实际上有个问题，在注册多个 Bean 时，如果依赖的属性很多，那么需要将这些属性一个一个地封装成 PropertyValue，再添加进PropertyValues，然后才进行属性填充，无疑增加了很多代码量。 所以这个章节，我们就用配置文件的方式，将所有的 Bean，以及 Bean 所依赖的属性都配置到 XML 文件。所以就需要一个 能解析 XML 配置文件的模块，将文件中的信息解析出来，然后由这个模块进行 PropertyValues 的处理，接着进行 Bean 的注册，此时就可以顺带把依赖的属性 PropertyValues 也传递进去。"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-14T15:51:31.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"Spring"}],["meta",{"property":"article:modified_time","content":"2023-03-14T15:51:31.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"第05章：资源加载器解析文件注册对象\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-03-14T15:51:31.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01/\\"}]}"]]},"headers":[{"level":2,"title":"1. 设计","slug":"_1-设计","link":"#_1-设计","children":[]},{"level":2,"title":"2. 实现","slug":"_2-实现","link":"#_2-实现","children":[]},{"level":2,"title":"3. 测试","slug":"_3-测试","link":"#_3-测试","children":[]},{"level":2,"title":"4. 流程","slug":"_4-流程","link":"#_4-流程","children":[]}],"git":{"createdTime":1678809091000,"updatedTime":1678809091000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":4.84,"words":1452},"filePathRelative":"studynotes/framework/small-spring/ioc/第05章：资源加载器解析文件注册对象.md","localizedDate":"2023年3月14日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 设计</h2>\\n<p>在上一章中，我们可以通过单元测试进行手动操作 Bean 对象的定义、注册和属性填充，以及最终获取对象调用方法。但是，实际上有个问题，在注册多个 Bean 时，<strong>如果依赖的属性很多，那么需要将这些属性一个一个地封装成 PropertyValue，再添加进PropertyValues</strong>，然后才进行属性填充，无疑增加了很多代码量。</p>\\n<p>所以这个章节，我们就用配置文件的方式，将所有的 Bean，以及 Bean 所依赖的属性都配置到 XML 文件。所以就需要一个 <strong>能解析 XML 配置文件的模块</strong>，将文件中的信息解析出来，然后由这个模块进行 PropertyValues 的处理，接着进行 Bean 的注册，此时就可以顺带把依赖的属性 PropertyValues 也传递进去。</p>","autoDesc":true}`);export{e as data};
