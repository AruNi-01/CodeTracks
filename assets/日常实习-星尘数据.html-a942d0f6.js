import{_ as t,Z as r,$ as n,a3 as l,a1 as a,a4 as e,a0 as h,E as s,a2 as d}from"./framework-63f054a3.js";const u={},o={class:"hint-container details"},c=l("summary",null,"本文内容",-1),_={class:"table-of-contents"},f=h('<h2 id="_2023-3-28-一面" tabindex="-1"><a class="header-anchor" href="#_2023-3-28-一面" aria-hidden="true">#</a> 2023/3/28（一面）</h2><h3 id="项目" tabindex="-1"><a class="header-anchor" href="#项目" aria-hidden="true">#</a> 项目</h3><ul><li>讲讲你这个项目的背景和怎么做的？</li><li>Kafka 用来做什么？</li><li>ES 用来做什么？</li><li>怎么保证 ES 和数据库中的数据一致呢？</li><li>讲讲 Redis 的五种基本数据类型，你项目中是怎么使用的？</li><li>你项目在使用缓存时采用的是什么策略？</li><li>如果你删除缓存后，来了大量的请求，全部打到数据库，怎么解决呢？</li><li>你使用 Caffeine 配合 Redis 做了二级缓存，如果我部署多台服务器，在更新本地缓存的时候，一台更新失败了，一台更新成功了，怎么办呢？</li><li>你写到使用缓存后，QPS 提高了 20 倍，你怎么做的量化？怎么测的？</li></ul><h3 id="java" tabindex="-1"><a class="header-anchor" href="#java" aria-hidden="true">#</a> Java</h3><ul><li>讲讲 HashMap 和 ConcurrentHashMap 的区别</li><li>了解过 CountdownLatch 和 CyclicBarrier 的区别吗？</li><li>讲讲线程池的几个核心参数</li><li>创建线程池有哪几种方式？</li><li>使用 Executors 来创建线程池会有什么问题？</li><li>如果让你来设计核心线程数，你会怎么设计？</li><li>多线程并发的本质了解吗？或者说相关的一些特性</li><li>JDK 8 默认的垃圾回收器是什么？</li><li>讲一下五种 IO 模型</li></ul><h3 id="框架" tabindex="-1"><a class="header-anchor" href="#框架" aria-hidden="true">#</a> 框架</h3><ul><li>讲讲你对 Spring AOP 的理解</li><li>能讲一下动态代理吗？</li><li>BeanFactory 和 ApplicationContext 有什么区别？</li><li>Spring 事物的实现方式或低层原理</li></ul><h3 id="mysql-redis" tabindex="-1"><a class="header-anchor" href="#mysql-redis" aria-hidden="true">#</a> MySQL &amp; Redis</h3><ul><li>InnoDB 为什么要使用 B+ 树做索引？</li><li>一个 select 语句的执行流程了解吗？</li><li>MySQL 默认的隔离级别是什么？</li><li>你在写 SQL 语句的时候有没有进行过一些优化？</li><li>你在什么情况下会建索引？</li><li>有一个三种状态的字段，适合建索引吗？</li><li>你对雪崩、击穿、穿透是怎么理解的？有什么解决方案？</li></ul><h3 id="其他" tabindex="-1"><a class="header-anchor" href="#其他" aria-hidden="true">#</a> 其他</h3><ul><li>你最近在学什么？</li><li>了解过分布式相关的技术吗？</li><li>GET 和 POST 的区别是什么？</li><li>编程题：写一个多线程程序，四个线程对一个全局 int 变量，2 个加 1，2 个减 1，保证线程安全</li><li>编程题：利用 Java 面向对象的思路设计正方形、长方形 、和圆的计算面积的类</li></ul><h2 id="_2023-3-31-二面" tabindex="-1"><a class="header-anchor" href="#_2023-3-31-二面" aria-hidden="true">#</a> 2023/3/31（二面）</h2><details class="hint-container details"><summary>闲聊</summary><ul><li>毕业后你对第一份工作的地点、公司规模有什么样的期待呢？</li><li>你考察一家公司的发展空间具体是看什么呢？</li><li>你觉得现在哪些行业是符合这个时代发展的？</li><li>单身 or 恋爱中？？？</li><li>还有在面其他公司的实习吗？</li><li>在学校的专业排名</li><li>你平时是怎么学习技术的？</li><li>“武汉有多少个理发店？” 如果你接到这样一个任务，你会怎么去统计？</li><li>你本科相比其他研究生的优势在哪里？公司为什么要招你呢？</li></ul></details><h3 id="项目-1" tabindex="-1"><a class="header-anchor" href="#项目-1" aria-hidden="true">#</a> 项目</h3><ul><li>敏感词过滤算法具体是怎么实现的？</li><li>如果在敏感词中要加上类似于 “特朗普在美国南部修了一堵墙” 这种场景的过滤，你会怎么样来做呢？</li><li>为什么使用 Kafka？有没有对比过其他类似的中间件？</li><li>讲讲你二级缓存是怎么实现的？</li><li>为什么考虑用 ES 来做搜索呢？它的使用场景是什么？有没有一些其他的替代方案呢？</li></ul><h3 id="mysql-redis-1" tabindex="-1"><a class="header-anchor" href="#mysql-redis-1" aria-hidden="true">#</a> MySQL &amp; Redis</h3><ul><li>MySQL 和 Redis 有什么区别呢？它们的使用场景分别是什么？</li><li>Redis 中的哨兵模式是怎样的？</li><li>介绍一下事物的隔离级别</li><li>做分页查询时，使用 limit 查第 1 页和第 500 页，有什么区别吗？</li></ul><h3 id="java-1" tabindex="-1"><a class="header-anchor" href="#java-1" aria-hidden="true">#</a> Java</h3><ul><li>讲一讲类加载器中的双亲委派模型是怎么样的？</li><li>这些加载器之间是什么关系呢？是继承关系吗？</li><li>讲讲 BIO、NIO、AIO</li></ul><h3 id="网络" tabindex="-1"><a class="header-anchor" href="#网络" aria-hidden="true">#</a> 网络</h3><ul><li>在浏览器中输入 <code>www.taobao.com</code> 到页面显示出来，中间的流程是怎么样的呢？</li><li>为什么 TCP 断开连接要进行四次挥手呢？</li></ul><h3 id="编程" tabindex="-1"><a class="header-anchor" href="#编程" aria-hidden="true">#</a> 编程</h3><ul><li>写一个代码片段，让它跑出 OOM</li><li>从 <code>log.txt</code> 文件中读取出 ERROR 格式的日志信息</li></ul><h2 id="hr-面-2023-4-4" tabindex="-1"><a class="header-anchor" href="#hr-面-2023-4-4" aria-hidden="true">#</a> HR 面（2023/4/4）</h2><ul><li>闲聊</li></ul>',25);function m(x,y){const i=s("router-link");return r(),n("div",null,[l("details",o,[c,l("nav",_,[l("ul",null,[l("li",null,[a(i,{to:"#_2023-3-28-一面"},{default:e(()=>[d("2023/3/28（一面）")]),_:1}),l("ul",null,[l("li",null,[a(i,{to:"#项目"},{default:e(()=>[d("项目")]),_:1})]),l("li",null,[a(i,{to:"#java"},{default:e(()=>[d("Java")]),_:1})]),l("li",null,[a(i,{to:"#框架"},{default:e(()=>[d("框架")]),_:1})]),l("li",null,[a(i,{to:"#mysql-redis"},{default:e(()=>[d("MySQL & Redis")]),_:1})]),l("li",null,[a(i,{to:"#其他"},{default:e(()=>[d("其他")]),_:1})])])]),l("li",null,[a(i,{to:"#_2023-3-31-二面"},{default:e(()=>[d("2023/3/31（二面）")]),_:1}),l("ul",null,[l("li",null,[a(i,{to:"#项目-1"},{default:e(()=>[d("项目")]),_:1})]),l("li",null,[a(i,{to:"#mysql-redis-1"},{default:e(()=>[d("MySQL & Redis")]),_:1})]),l("li",null,[a(i,{to:"#java-1"},{default:e(()=>[d("Java")]),_:1})]),l("li",null,[a(i,{to:"#网络"},{default:e(()=>[d("网络")]),_:1})]),l("li",null,[a(i,{to:"#编程"},{default:e(()=>[d("编程")]),_:1})])])]),l("li",null,[a(i,{to:"#hr-面-2023-4-4"},{default:e(()=>[d("HR 面（2023/4/4）")]),_:1})])])])]),f])}const v=t(u,[["render",m],["__file","日常实习-星尘数据.html.vue"]]);export{v as default};
