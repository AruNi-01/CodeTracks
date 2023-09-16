const e=JSON.parse('{"key":"v-43e9b969","path":"/studynotes/microservice/fuse_limit_downgrade/%E7%86%94%E6%96%AD-%E5%A6%82%E4%BD%95%E9%98%B2%E6%AD%A2%E6%8A%96%E5%8A%A8.html","title":"熔断 - 如何防止抖动","lang":"zh-CN","frontmatter":{"title":"熔断 - 如何防止抖动","date":"2023-07-09T00:00:00.000Z","order":1,"category":["微服务架构"],"tag":["服务熔断限流与降级"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 前言 在微服务架构中，系统的 可用性 是非常重要的，为了避免高并发下服务的崩溃，通常会使用 熔断、限流、降级 等措施。本文就先来讲解服务熔断是什么，它是如何提高系统的可用性的，服务出现抖动了怎么办？ 1. 什么是服务熔断？","head":[["meta",{"property":"og:url","content":"https://aruni.me/studynotes/microservice/fuse_limit_downgrade/%E7%86%94%E6%96%AD-%E5%A6%82%E4%BD%95%E9%98%B2%E6%AD%A2%E6%8A%96%E5%8A%A8.html"}],["meta",{"property":"og:site_name","content":"AruNi"}],["meta",{"property":"og:title","content":"熔断 - 如何防止抖动"}],["meta",{"property":"og:description","content":"本文内容 前言 在微服务架构中，系统的 可用性 是非常重要的，为了避免高并发下服务的崩溃，通常会使用 熔断、限流、降级 等措施。本文就先来讲解服务熔断是什么，它是如何提高系统的可用性的，服务出现抖动了怎么办？ 1. 什么是服务熔断？"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-09-16T10:04:08.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"服务熔断限流与降级"}],["meta",{"property":"article:published_time","content":"2023-07-09T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-09-16T10:04:08.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"熔断 - 如何防止抖动\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-07-09T00:00:00.000Z\\",\\"dateModified\\":\\"2023-09-16T10:04:08.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01\\"}]}"]]},"headers":[{"level":2,"title":"1. 什么是服务熔断？","slug":"_1-什么是服务熔断","link":"#_1-什么是服务熔断","children":[]},{"level":2,"title":"2. 判断服务健康状态","slug":"_2-判断服务健康状态","link":"#_2-判断服务健康状态","children":[{"level":3,"title":"2.1 阈值如何选择？","slug":"_2-1-阈值如何选择","link":"#_2-1-阈值如何选择","children":[]},{"level":3,"title":"2.2 超过阈值后何时熔断？","slug":"_2-2-超过阈值后何时熔断","link":"#_2-2-超过阈值后何时熔断","children":[]}]},{"level":2,"title":"3. 判断服务恢复正常","slug":"_3-判断服务恢复正常","link":"#_3-判断服务恢复正常","children":[]},{"level":2,"title":"4. 如何让客户端控制熔断恢复后的请求流量？","slug":"_4-如何让客户端控制熔断恢复后的请求流量","link":"#_4-如何让客户端控制熔断恢复后的请求流量","children":[]},{"level":2,"title":"5. 总结","slug":"_5-总结","link":"#_5-总结","children":[]}],"git":{"createdTime":1688897945000,"updatedTime":1694858648000,"contributors":[{"name":"aarynlu","email":"aarynlu@tencent.com","commits":3}]},"readingTime":{"minutes":6.72,"words":2015},"filePathRelative":"studynotes/microservice/fuse_limit_downgrade/熔断-如何防止抖动.md","localizedDate":"2023年7月9日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<div class=\\"hint-container info\\">\\n<p class=\\"hint-container-title\\">前言</p>\\n<p>在微服务架构中，系统的 <strong>可用性</strong> 是非常重要的，为了避免高并发下服务的崩溃，通常会使用 <strong>熔断、限流、降级</strong> 等措施。本文就先来讲解服务熔断是什么，它是如何提高系统的可用性的，服务出现抖动了怎么办？</p>\\n</div>\\n<h2> 1. 什么是服务熔断？</h2>","autoDesc":true}');export{e as data};
