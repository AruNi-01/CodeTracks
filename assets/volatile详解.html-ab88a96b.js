const e=JSON.parse(`{"key":"v-2de3a0e6","path":"/studynotes/java/concurrency/volatile%E8%AF%A6%E8%A7%A3.html","title":"volatile 详解","lang":"zh-CN","frontmatter":{"title":"volatile 详解","icon":"write","category":["Java"],"tag":["并发编程"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 [[toc]] 1. 认识 volatile volatile 关键字是一个轻量级的同步机制，一般作用于 变量，在并发场景下保证了内存的 可见性，以及 避免了指令的重排序。 volatile 三大特性： 保证可见性；; 不保证原子性；; 禁止指令重排；; 并发编程的三个重要特性： 可见性：一个线程对共享变量进行了修改，其他线程可以立刻看到修改...","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/docs/studynotes/java/concurrency/volatile%E8%AF%A6%E8%A7%A3.html"}],["meta",{"property":"og:site_name","content":"AruNi's docs"}],["meta",{"property":"og:title","content":"volatile 详解"}],["meta",{"property":"og:description","content":"本文内容 [[toc]] 1. 认识 volatile volatile 关键字是一个轻量级的同步机制，一般作用于 变量，在并发场景下保证了内存的 可见性，以及 避免了指令的重排序。 volatile 三大特性： 保证可见性；; 不保证原子性；; 禁止指令重排；; 并发编程的三个重要特性： 可见性：一个线程对共享变量进行了修改，其他线程可以立刻看到修改..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-01-20T17:36:52.000Z"}],["meta",{"property":"article:tag","content":"并发编程"}],["meta",{"property":"article:modified_time","content":"2023-01-20T17:36:52.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"volatile 详解\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-01-20T17:36:52.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"1. 认识 volatile","slug":"_1-认识-volatile","link":"#_1-认识-volatile","children":[]},{"level":2,"title":"2. JMM 介绍","slug":"_2-jmm-介绍","link":"#_2-jmm-介绍","children":[]},{"level":2,"title":"3. volatile 底层原理","slug":"_3-volatile-底层原理","link":"#_3-volatile-底层原理","children":[{"level":3,"title":"3.1 如何保证可见性？","slug":"_3-1-如何保证可见性","link":"#_3-1-如何保证可见性","children":[]},{"level":3,"title":"3.2 如何禁止指令重排？","slug":"_3-2-如何禁止指令重排","link":"#_3-2-如何禁止指令重排","children":[]},{"level":3,"title":"3.3 为何不保证原子性？","slug":"_3-3-为何不保证原子性","link":"#_3-3-为何不保证原子性","children":[]}]},{"level":2,"title":"4. volatile 和 synchronized 的区别","slug":"_4-volatile-和-synchronized-的区别","link":"#_4-volatile-和-synchronized-的区别","children":[]},{"level":2,"title":"5. volatile 应用场景","slug":"_5-volatile-应用场景","link":"#_5-volatile-应用场景","children":[{"level":3,"title":"5.1 状态标志","slug":"_5-1-状态标志","link":"#_5-1-状态标志","children":[]},{"level":3,"title":"5.2 单例模式","slug":"_5-2-单例模式","link":"#_5-2-单例模式","children":[]},{"level":3,"title":"5.3 volatile bean 模式","slug":"_5-3-volatile-bean-模式","link":"#_5-3-volatile-bean-模式","children":[]},{"level":3,"title":"5.4 开销较低的读－写锁策略","slug":"_5-4-开销较低的读-写锁策略","link":"#_5-4-开销较低的读-写锁策略","children":[]}]},{"level":2,"title":"6. 参考文章","slug":"_6-参考文章","link":"#_6-参考文章","children":[]}],"git":{"createdTime":1674236212000,"updatedTime":1674236212000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":1}]},"readingTime":{"minutes":12.3,"words":3690},"filePathRelative":"studynotes/java/concurrency/volatile详解.md","localizedDate":"2023年1月20日","autoDesc":true}`);export{e as data};
