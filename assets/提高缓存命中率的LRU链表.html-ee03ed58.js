import{_ as a,Z as u,$ as g,a3 as o,a1 as n,a4 as l,a2 as r,a0 as d,E as e}from"./framework-63f054a3.js";const i={},p={class:"hint-container details"},_=o("summary",null,"本文内容",-1),f={class:"table-of-contents"},h=d('<h2 id="_1-缓冲区不够了怎么办" tabindex="-1"><a class="header-anchor" href="#_1-缓冲区不够了怎么办" aria-hidden="true">#</a> 1. 缓冲区不够了怎么办？</h2><p>在上一篇文章中我们知道，为了提高数据库的读写性能，InnoDB 建立了一个缓冲区 Buffer Pool。Buffer Pool 被划分为多个缓冲页，这些缓冲页通过链表（链表中保存的是控制块）来管理。</p><p>在 Buffer Pool 中，常用的链表有 free 链表、flush 链表，还有一个就是我们今天的主角 — <strong>LRU 链表</strong>。</p><p>缓冲区的大小是有限的，那么当 <strong>缓冲区的内存不足时</strong>，就需要淘汰一些旧的缓冲页，再来存放新的。这个事情，就由 LRU 链表负责。</p><p>LRU 链表中保存着缓冲区中所有 <strong>使用过的缓冲页</strong>，包括干净页（只读）和脏页（读写）。</p><p>那么，LRU 链表该根据什么样的方式进行淘汰呢？接下来就一一为你揭晓。</p><h2 id="_2-简单的-lru-链表" tabindex="-1"><a class="header-anchor" href="#_2-简单的-lru-链表" aria-hidden="true">#</a> 2. 简单的 LRU 链表</h2><h3 id="_2-1-原始-lru-是怎样的" tabindex="-1"><a class="header-anchor" href="#_2-1-原始-lru-是怎样的" aria-hidden="true">#</a> 2.1 原始 LRU 是怎样的？</h3><p>一讲到内存淘汰策略，首先想到的肯定是淘汰掉不经常使用的，以免影响 <strong>缓存的命中率</strong>，Buffer Pool 同样也是如此，所以 InnoDB 采用了 <strong>LRU 算法</strong>（Least Recently Used，最近最少使用），把使用过的缓冲页用一个叫 LRU 的链表来保存。</p><p>当需要访问某个磁盘页时，会按照如下方式处理 LRU 链表：</p><ul><li><p>该页 <strong>已加载</strong> 到 Buffer Pool 中：直接把 <strong>该页对应的控制块移动到 LRU 链表头部</strong>；</p></li><li><p>该页 <strong>不在</strong> Buffer Pool 中：把该页从磁盘加载到 Buffer Pool 的缓冲页，并且把该缓冲页对应的控制块作为节点 <strong>插入到 LRU 链表的头部</strong>；</p></li></ul><p>可以看出，当我们要 <strong>使用到某个缓冲页时</strong>，就会把该页移动到 LRU 链表的 <strong>头部</strong>，这样 LRU 链表的 <strong>尾部</strong> 就是一些 <strong>最近最少使用</strong> 的缓冲页了。当 Buffer Pool 中的空闲缓冲页使用完时，直接到 LRU 链表尾部淘汰一些即可。</p><p>这就是简单的 LRU 算法，但是 InnoDB 并没有采用最原始的 LRU 算法，因为它存在 <strong>两个问题</strong>：</p><ul><li>预读失效；</li><li>Buffer Pool 缓存污染。</li></ul><h3 id="_2-1-预读失效" tabindex="-1"><a class="header-anchor" href="#_2-1-预读失效" aria-hidden="true">#</a> 2.1 预读失效</h3><p>InnoDB 提供了一个 <strong>预读机制</strong>，即在加载一个数据页的时候，可能会预先把一些相邻的页页加载到 Buffer Pool 中。</p><p>为什么要设置这个预读机制呢？根据程序的局部性原理，当前数据如果被访问，则靠近它的数据被访问的概率也很大，所以 InnoDB 提供了预读机制，可以进一步减少磁盘 I/O。</p><p>InnoDB 提供了两种不同的预读触发方式：</p><ul><li><p><strong>线性预读</strong>：如果 <strong>顺序</strong> 访问某个 <strong>区</strong>（extent）的页面超过了系统变量 <code>innodb_read_ahead_threshold</code> 的值（默认 56），则会 <strong>异步</strong> 读取 <strong>下一个区的全部页面</strong> 到 Buffer Pool；</p><blockquote><p>注意是异步，所以并不会对当前工作线程造成影响。</p></blockquote></li><li><p><strong>随机预读</strong>：如果某个 <strong>区</strong>（extent）的 <strong>13 个连续的页面</strong> 都被读取到 Buffer Pool，<strong>不管是否是按顺序读取</strong>（注意按序和页面连续的区别），都会 <strong>异步</strong> 读取 <strong>本区中的所有其他页面</strong> 到 Buffer Pool。</p><blockquote><p>随机预读默认关闭，可通过 <code>innodb_random_read_ahead = ON</code> 开启。</p></blockquote></li></ul><p>这个预读机制看似挺好，但是如果 <strong>预读进来的数据页压根就没有被访问呢</strong>，这就发生了 <strong>预读失效</strong>。</p><p>发生预读失效后，这个预读不仅没有起到应有的效果，而且这些数据页还会被插入到 <strong>LRU 链表头部</strong>，如果此时 Buffer Pool 的 <strong>容量不足</strong>，则会 <strong>淘汰掉原有的缓存数据</strong>，从而大大降低 Buffer Pool 的命中率。（真是偷鸡不成蚀把米啊）</p><h3 id="_2-2-buffer-pool-缓存污染" tabindex="-1"><a class="header-anchor" href="#_2-2-buffer-pool-缓存污染" aria-hidden="true">#</a> 2.2 Buffer Pool 缓存污染</h3><p>当我们编写的 SQL 语句需要 <strong>扫描大量记录</strong> 时，而 Buffer Pool <strong>容量又不足</strong>，就会把 <strong>当前扫描到的数据插入到 LRU 链表头部</strong>，而 <strong>淘汰掉原有的缓存数据</strong>，而这些扫描到的记录后续又不会被访问，从而大大降低 Buffer Pool 的命中率。</p><p>需要注意的是，这个扫描大量记录，不只是 SQL 语句的查询结果有很多，当发生 <strong>全表扫描</strong> 时，页会出现扫描大量记录的情况。</p><p>例如，我们编写的 SQL 语句 <strong>没有建立对应的索引或者索引失效</strong> 时，就会发生 <strong>全表扫描</strong>，这将会严重影响 Buffer Pool 的命中率。</p><h2 id="_3-改进的-lru-链表" tabindex="-1"><a class="header-anchor" href="#_3-改进的-lru-链表" aria-hidden="true">#</a> 3. 改进的 LRU 链表</h2><p>因为预读失效和缓存污染的存在，会大大降低 Buffer Pool 的命中率，从而影响性能。</p><p>为了解决预读失效问题，InnoDB 把 LRU 链表按照一定比例划分成了两个区：</p><ul><li><strong>young 区</strong>：使用频率非常高的缓冲页，也称为热数据；</li><li><strong>old 区</strong>：使用频率不是很高的缓冲页，也称为冷数据；</li></ul><p>划分后的 LRU 链表如下，young 区在前，old 区在后：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303062027625.png" alt="image-20230306202727776"></p><p>划分的比例可以通过 <code>innodb_old_blocks_pct</code> 参数进行设定，默认是 37，代表 LRU 链表中 young 区与 old 区的比例是 63:37。</p><p>经过了 LRU 链表的划分，就可以针对前面两种情况进行优化了。</p><h3 id="_3-1-针对预读失效" tabindex="-1"><a class="header-anchor" href="#_3-1-针对预读失效" aria-hidden="true">#</a> 3.1 针对预读失效</h3><p>InnoDB 规定，<strong>当某个数据页被初次加载到 Buffer Pool 时，该页只会插入到 old 区的头部</strong>。</p><p>因此，预读到的页面就算不进行后续的访问，也不会影响 young 区的热数据。而这些 old 区的冷数据也会很容易被淘汰掉。</p><h3 id="_3-2-针对缓存污染" tabindex="-1"><a class="header-anchor" href="#_3-2-针对缓存污染" aria-hidden="true">#</a> 3.2 针对缓存污染</h3><p>我们先来看看，如果只有上面的一个规定，能不能解决缓存污染的问题。</p><p>如果扫描了大量记录，在首次访问时，该记录对应的页会被放到 old 区的头部，由于 <strong>后面马上又会访问该页</strong>（一页中有多条记录，访问的都是同一页），因此就会把该页放到 young 区的头部，<strong>这仍然会把原来的热数据给排挤下去</strong>。</p><p>因此，InnoDB 不得不针对缓存污染，再定一个乌龟的屁股，那什么样的龟腚才能降住它呢？</p><p>这就要对症下药了，如果要扫描大量记录，虽然一个页中有多条记录，扫描的时候会频繁的访问同一页。但是，这个 <strong>扫描过程的时间是非常短的</strong>，因为扫描该页的第一条记录时，就已经把该页加载到 Buffer Pool 中了（只不过是在 old 区）。</p><p>基于这个特点，我们提高数据页进入 young 区的门槛，给出如下规定：</p><ul><li>如果 <strong>后续的访问时间与第一次访问的时间在某个时间间隔内</strong>，那么该页就 <strong>不会被移动到 young 区的头部</strong>；</li><li>否则，就可以将该页移到到 young 区的头部。</li></ul><p>这个时间间隔由参数 <code>innodb_old_blocks_time</code> 控制，默认是 1000ms。</p><p>所以，在进行大量记录的扫描时，<strong>由于多次访问同一个页面（读取同一个页中的多条记录）的时间一般不会超过 1s</strong>，所以有效避免了缓存污染带来的缓存命中率下降的问题。</p><h3 id="_3-3-lru-链表再优化" tabindex="-1"><a class="header-anchor" href="#_3-3-lru-链表再优化" aria-hidden="true">#</a> 3.3 LRU 链表再优化</h3><p>通过将 LRU 链表划分成 young 区和 old 区，有效的解决了预读和缓存污染的问题，即用不到的预读页面以及扫描大量记录的页面都只会放到 old 区，而不会影响 young 区的热数据。</p><p>上面的改进，相当于给原来的 LRU 链表增加了一个 old 区，我们并没有去关注 young 区会有什么问题。</p><p>对于 young 区的数据页来说，<strong>每次访问都需要把它重新移动到头部</strong>，由于 young 区的都是热数据，会被经常访问，所以就会造成 <strong>节点的频繁移动</strong>，带来了不小额外的开销。</p><p>所以，InnoDB 对 LRU 链表又进行了一个小优化：<strong>young 区的前面 1/4 的数据页被访问时，不会将其节点移动到链表头部，只有后面的 3/4 被访问时才会移动</strong>。</p><div class="hint-container danger"><p class="hint-container-title">注意</p><p>前面在预读机制中提到，如果 Buffer Pool 中有某个区的 13 个连续页面，就会触发随机预读，将整个区的页面都加载到 Buffer Pool。</p><p>其实这是不严谨的，InnoDB 还要求这 13 个连续页面是非常热的页面，所谓的非常热，指的就是 young 区的前 1/4 处。</p></div><h2 id="_4-总结" tabindex="-1"><a class="header-anchor" href="#_4-总结" aria-hidden="true">#</a> 4. 总结</h2><p>LRU 链表用来管理干净页 + 脏页，当 Buffer Pool 空间不足时，会根据 LRU 算法来淘汰最近最少使用的缓冲页。</p><p>为了避免预读失效和缓存污染的问题，InnoDB 提出了如下的优化策略：</p><p>将 <strong>LRU 链表划分为 young 区和 old 区</strong>：</p><ul><li>解决预读失效：首次访问数据页时，会先将该页加载进 old 区的头部，当该页后续再被访问时，才会从 old 区移动到 young 区；</li><li>解决缓存污染：当页面被访问的时间间隔超过 <code>innodb_old_blocks_time</code> 的阈值（默认 1s）时，才会将该页移动到 young 区，否则就只保留在 old 区，从而不会影响 young 区的热数据。</li></ul><p>另外，我们也要尽量避免全表扫描大量数据，不仅效率低，也会对 Buffer Pool 的 old 区域造成影响。</p><h2 id="_6-参考文章" tabindex="-1"><a class="header-anchor" href="#_6-参考文章" aria-hidden="true">#</a> 6. 参考文章</h2>',58),c=o("li",null,"《MySQL 是怎样运行的》",-1),L=o("li",null,"《MySQL 实战 45 讲》",-1),B={href:"https://xiaolincoding.com",target:"_blank",rel:"noopener noreferrer"};function R(U,b){const t=e("router-link"),s=e("ExternalLinkIcon");return u(),g("div",null,[o("details",p,[_,o("nav",f,[o("ul",null,[o("li",null,[n(t,{to:"#_1-缓冲区不够了怎么办"},{default:l(()=>[r("1. 缓冲区不够了怎么办？")]),_:1})]),o("li",null,[n(t,{to:"#_2-简单的-lru-链表"},{default:l(()=>[r("2. 简单的 LRU 链表")]),_:1}),o("ul",null,[o("li",null,[n(t,{to:"#_2-1-原始-lru-是怎样的"},{default:l(()=>[r("2.1 原始 LRU 是怎样的？")]),_:1})]),o("li",null,[n(t,{to:"#_2-1-预读失效"},{default:l(()=>[r("2.1 预读失效")]),_:1})]),o("li",null,[n(t,{to:"#_2-2-buffer-pool-缓存污染"},{default:l(()=>[r("2.2 Buffer Pool 缓存污染")]),_:1})])])]),o("li",null,[n(t,{to:"#_3-改进的-lru-链表"},{default:l(()=>[r("3. 改进的 LRU 链表")]),_:1}),o("ul",null,[o("li",null,[n(t,{to:"#_3-1-针对预读失效"},{default:l(()=>[r("3.1 针对预读失效")]),_:1})]),o("li",null,[n(t,{to:"#_3-2-针对缓存污染"},{default:l(()=>[r("3.2 针对缓存污染")]),_:1})]),o("li",null,[n(t,{to:"#_3-3-lru-链表再优化"},{default:l(()=>[r("3.3 LRU 链表再优化")]),_:1})])])]),o("li",null,[n(t,{to:"#_4-总结"},{default:l(()=>[r("4. 总结")]),_:1})]),o("li",null,[n(t,{to:"#_6-参考文章"},{default:l(()=>[r("6. 参考文章")]),_:1})])])])]),h,o("ul",null,[c,L,o("li",null,[o("a",B,[r("小林 coding"),n(s)])])])])}const y=a(i,[["render",R],["__file","提高缓存命中率的LRU链表.html.vue"]]);export{y as default};
