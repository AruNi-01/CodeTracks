const e=JSON.parse('{"key":"v-35965992","path":"/studynotes/java/concurrency/ThreadLocal%E8%AF%A6%E8%A7%A3.html","title":"ThreadLocal 详解","lang":"zh-CN","frontmatter":{"title":"ThreadLocal 详解","date":"2022-12-01T00:00:00.000Z","order":3,"category":["Java"],"tag":["并发编程"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 什么是 ThreadLocal？ ThreadLocal 叫做本地线程变量，顾名思义，ThreadLocal 中存放的是 当前线程的变量，该变量对其他线程而言是 隔离 的。对于 ThreadLocal 存放的变量，在每个线程中都有一份自己的 副本变量，多个线程互不干扰。 下面使用一个简单的例子来展示 ThreadLocal 的线程隔离：","head":[["meta",{"property":"og:url","content":"https://aruni.me/studynotes/java/concurrency/ThreadLocal%E8%AF%A6%E8%A7%A3.html"}],["meta",{"property":"og:site_name","content":"AruNi"}],["meta",{"property":"og:title","content":"ThreadLocal 详解"}],["meta",{"property":"og:description","content":"本文内容 1. 什么是 ThreadLocal？ ThreadLocal 叫做本地线程变量，顾名思义，ThreadLocal 中存放的是 当前线程的变量，该变量对其他线程而言是 隔离 的。对于 ThreadLocal 存放的变量，在每个线程中都有一份自己的 副本变量，多个线程互不干扰。 下面使用一个简单的例子来展示 ThreadLocal 的线程隔离："}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-09-16T10:04:08.000Z"}],["meta",{"property":"article:author","content":"AruNi_Lu"}],["meta",{"property":"article:tag","content":"并发编程"}],["meta",{"property":"article:published_time","content":"2022-12-01T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-09-16T10:04:08.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"ThreadLocal 详解\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-12-01T00:00:00.000Z\\",\\"dateModified\\":\\"2023-09-16T10:04:08.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"AruNi_Lu\\",\\"url\\":\\"https://github.com/AruNi-01\\"}]}"]]},"headers":[{"level":2,"title":"1. 什么是 ThreadLocal？","slug":"_1-什么是-threadlocal","link":"#_1-什么是-threadlocal","children":[]},{"level":2,"title":"2. ThreadLocal 内部设计","slug":"_2-threadlocal-内部设计","link":"#_2-threadlocal-内部设计","children":[{"level":3,"title":"2.1 早期设计","slug":"_2-1-早期设计","link":"#_2-1-早期设计","children":[]},{"level":3,"title":"2.2 JDK 1.8 的设计","slug":"_2-2-jdk-1-8-的设计","link":"#_2-2-jdk-1-8-的设计","children":[]},{"level":3,"title":"2.3 ThreadLocalMap 的实现","slug":"_2-3-threadlocalmap-的实现","link":"#_2-3-threadlocalmap-的实现","children":[]},{"level":3,"title":"2.4 ThreadLocal 会发生内存泄漏吗？","slug":"_2-4-threadlocal-会发生内存泄漏吗","link":"#_2-4-threadlocal-会发生内存泄漏吗","children":[]},{"level":3,"title":"2.5 key 为什么设计成弱引用？","slug":"_2-5-key-为什么设计成弱引用","link":"#_2-5-key-为什么设计成弱引用","children":[]},{"level":3,"title":"2.5 value 为什么不设计成弱引用呢？","slug":"_2-5-value-为什么不设计成弱引用呢","link":"#_2-5-value-为什么不设计成弱引用呢","children":[]}]},{"level":2,"title":"3. ThreadLocal 应用场景","slug":"_3-threadlocal-应用场景","link":"#_3-threadlocal-应用场景","children":[{"level":3,"title":"3.1 维护数据库连接对象 Connection","slug":"_3-1-维护数据库连接对象-connection","link":"#_3-1-维护数据库连接对象-connection","children":[]},{"level":3,"title":"3.2 保存用户信息","slug":"_3-2-保存用户信息","link":"#_3-2-保存用户信息","children":[]},{"level":3,"title":"3.3 保存线程不安全的工具类","slug":"_3-3-保存线程不安全的工具类","link":"#_3-3-保存线程不安全的工具类","children":[]}]},{"level":2,"title":"4. ThreadLocal 源码初探","slug":"_4-threadlocal-源码初探","link":"#_4-threadlocal-源码初探","children":[]},{"level":2,"title":"5. ThreadLocalMap 源码剖析","slug":"_5-threadlocalmap-源码剖析","link":"#_5-threadlocalmap-源码剖析","children":[{"level":3,"title":"5.1 ThreadLocalMap Hash 算法","slug":"_5-1-threadlocalmap-hash-算法","link":"#_5-1-threadlocalmap-hash-算法","children":[]},{"level":3,"title":"5.2 ThreadLocalMap.set() 详解","slug":"_5-2-threadlocalmap-set-详解","link":"#_5-2-threadlocalmap-set-详解","children":[]},{"level":3,"title":"5.3 清理逻辑","slug":"_5-3-清理逻辑","link":"#_5-3-清理逻辑","children":[]},{"level":3,"title":"5.4 扩容机制","slug":"_5-4-扩容机制","link":"#_5-4-扩容机制","children":[]},{"level":3,"title":"5.5 ThreadLocalMap.get() 分析","slug":"_5-5-threadlocalmap-get-分析","link":"#_5-5-threadlocalmap-get-分析","children":[]}]},{"level":2,"title":"6. InheritableThreadLocal 类","slug":"_6-inheritablethreadlocal-类","link":"#_6-inheritablethreadlocal-类","children":[{"level":3,"title":"6.1 原理分析","slug":"_6-1-原理分析","link":"#_6-1-原理分析","children":[]},{"level":3,"title":"6.2 InheritableThreadLocal 的缺陷","slug":"_6-2-inheritablethreadlocal-的缺陷","link":"#_6-2-inheritablethreadlocal-的缺陷","children":[]}]},{"level":2,"title":"7. ThreadLocal 使用注意事项","slug":"_7-threadlocal-使用注意事项","link":"#_7-threadlocal-使用注意事项","children":[{"level":3,"title":"7.1 避免线程复用（线程池）时的脏数据","slug":"_7-1-避免线程复用-线程池-时的脏数据","link":"#_7-1-避免线程复用-线程池-时的脏数据","children":[]},{"level":3,"title":"7.2 内存泄漏问题","slug":"_7-2-内存泄漏问题","link":"#_7-2-内存泄漏问题","children":[]}]},{"level":2,"title":"8. 参考文章","slug":"_8-参考文章","link":"#_8-参考文章","children":[]}],"git":{"createdTime":1674487546000,"updatedTime":1694858648000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":4},{"name":"aarynlu","email":"aarynlu@tencent.com","commits":2}]},"readingTime":{"minutes":29.59,"words":8877},"filePathRelative":"studynotes/java/concurrency/ThreadLocal详解.md","localizedDate":"2022年12月1日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 什么是 ThreadLocal？</h2>\\n<p>ThreadLocal 叫做本地线程变量，顾名思义，ThreadLocal 中存放的是 <strong>当前线程的变量</strong>，该变量对其他线程而言是 <strong>隔离</strong> 的。对于 ThreadLocal 存放的变量，在每个线程中都有一份自己的 <strong>副本变量</strong>，多个线程互不干扰。</p>\\n<p>下面使用一个简单的例子来展示 ThreadLocal 的线程隔离：</p>","autoDesc":true}');export{e as data};
