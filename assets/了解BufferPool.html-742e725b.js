import{_ as f,Z as u,$ as a,a3 as o,a1 as r,a4 as t,a2 as e,a0 as p,E as s}from"./framework-63f054a3.js";const g={},i={class:"hint-container details"},d=o("summary",null,"本文内容",-1),c={class:"table-of-contents"},h=p('<h2 id="_1-为什么需要-buffer-pool" tabindex="-1"><a class="header-anchor" href="#_1-为什么需要-buffer-pool" aria-hidden="true">#</a> 1. 为什么需要 Buffer Pool？</h2><p>我们都知道，MySQL 中的数据都是放在 <strong>磁盘</strong> 上的，凡是跟磁盘打交道，基本上都需要在内存中建立 <strong>缓存</strong>，因为磁盘的读写速度非常慢。</p><p>例如，Linux 在内存和磁盘之间就建立了一个缓冲区 Buffers，主要有两个 <strong>好处</strong>：</p><ul><li><strong>写操作时</strong>，如果 Buffers 中有该页，则直接在 Buffers 中写，如果没有则将该页先读入 Buffers，再在 Buffers 中写，后续再统一写回磁盘。也就是 <strong>将小量多次的写磁盘操作转换成了大量少次</strong>，大大提升了写的效率；</li><li><strong>读操作时</strong>，因为 <strong>Buffers 中就是最新的数据</strong>，所以可以直接从 Buffers 中读取，而不用到低速的磁盘上读，也大大提升了读的效率；</li></ul><p>所以，MySQL 也建立了一个 <strong>缓冲池</strong>，由于 MySQL 的操作单位是页（一页 16K），所以如果需要访问某个页中的数据，就需要把 <strong>完整的页加载到内存中</strong>。</p><blockquote><p>就算只访问页中的一条记录，也需要加载整个页到内存中。</p></blockquote><p>对这个页访问完毕后，也 <strong>不会立即将该页刷回磁盘</strong>，这样当后续再访问此页中的数据时，就可以直接在内存中操作了，从而节省磁盘的 I/O 开销。</p><blockquote><p>MySQL 有专门的算法应对内存不足时如何淘汰页，后续文章会讲到。</p></blockquote><h2 id="_2-什么是-buffer-pool" tabindex="-1"><a class="header-anchor" href="#_2-什么是-buffer-pool" aria-hidden="true">#</a> 2. 什么是 Buffer Pool？</h2><p>为了缓冲磁盘中的页，InnoDB 在 MySQL 实例启动时就会向操作系统申请一片连续的内存，这片内存就叫 Buffer Pool（缓冲池）。</p><blockquote><p>所以，Buffer Pool 是在 InnoDB 存储引擎层实现的。</p></blockquote><p>这片内存空间的大小可以由 <code>innodb_buffer_pool_size</code>（单位字节）配置，默认大小为 128MB。一般建议设置成可用物理内存的 60%~80%。</p><h2 id="_3-buffer-pool-缓存什么" tabindex="-1"><a class="header-anchor" href="#_3-buffer-pool-缓存什么" aria-hidden="true">#</a> 3. Buffer Pool 缓存什么？</h2><p>前面说到，MySQL 是以页为单位来进行数据存储的，所以 <strong>Buffer Pool 也是按页进行划分</strong>，我们把这些页称为 <strong>缓冲页</strong>。那么这些缓冲页都存放些什么内容呢？</p><p>Buffer Pool 不只缓存了 **数据页 **和 索引页，还包括了 <strong>插入缓冲页、undo 页、自适应哈希索引和一些锁信息</strong> 等。</p><p>需要注意的是，<strong>redo log 有自己的缓冲区，叫 redo log buffer</strong>。同时，还会有额外的内存池供其他操作使用。</p><p>所以，MySQL 的大致内存结构如下图：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303050957973.png" alt="image-20230305095743564"></p><h2 id="_4-如何管理缓冲页" tabindex="-1"><a class="header-anchor" href="#_4-如何管理缓冲页" aria-hidden="true">#</a> 4. 如何管理缓冲页？</h2><p>Buffer Pool 中的缓冲页这么多，怎么管理是个大问题，如何方便的获取我想要的页呢？</p><p>这就要说到 Buffer Pool 的内部组成了，InnoDB 为每个缓冲页都创建了一些 <strong>控制信息</strong>。这些控制信息包括 <strong>该页所属的表空间编号、页号、缓冲页在 Buffer Pool 中的地址</strong> 等，控制信息被放在一个叫 <strong>控制块</strong> 的内存中。</p><p>控制块和缓冲页是一一对应的，它们都被放在 Buffer Pool 中，控制块在前，整个内存空间结构图如下所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303051012242.png" alt="image-20230305101239267"></p><p>可以看见，控制块和缓冲页之间还有一小块 <strong>内存碎片</strong>。这是因为在分配了足够多的控制块和缓冲页后，<strong>剩余的一小块空间不够一对控制块和缓冲页了</strong>，那么这块内存空间自然也就用不到了，也就是碎片空间。当然，如果把 Buffer Pool 大小设置得刚刚好，也有可能不会产生内存碎片。</p><blockquote><p>注：控制块大约占缓冲页大小的 5%，innodb_buffer_pool_size 并不包含这些缓冲块的空间。所以 <strong>这片连续的内存空间大小会比 innodb_buffer_pool_size 大 5% 左右</strong>。</p></blockquote><p>下面就来看看，几个常见的页是如何被具体管理的。</p><h3 id="_4-1-如何管理空闲页" tabindex="-1"><a class="header-anchor" href="#_4-1-如何管理空闲页" aria-hidden="true">#</a> 4.1 如何管理空闲页？</h3><p>Buffer Pool 是一片连续的内存空间，然后把它划分成若干对控制块和缓冲页。但是，<strong>刚开始并没有将磁盘中的页缓存到 Buffer Pool 中</strong>（还没使用到）。随着 MySQL 的运行，才会不断地将磁盘中的页被缓存到 Buffer Pool 中。</p><p>那么在要放入 Buffer Pool 时，如何放到未被使用过的缓冲页上呢？总不可能通过遍历的方式寻找空闲的缓冲页吧。</p><p>所以，我们需要在一个地方记录哪些缓冲页是可用的，这时候控制块就派上大用场了。我们可以 <strong>把所有空闲的缓冲页对应的控制块作为节点，放入一个链表中</strong>，这个链表称为 <strong>free 链表</strong>（空闲链表）。</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303051035669.png" alt="img"></p><p>为了方便管理 free 链表，还定义了一个头节点，包含链表的头节点地址、尾节点地址以及链表节点的数量。</p><p>有了 free 链表，我们每次将磁盘页载入缓冲页时，就可以通过这个链表找到空闲缓冲页的控制块，然后再通过控制块找到这个空闲缓冲页，最后将该空闲缓冲页对应的控制块从 free 链表中移除即可。</p><blockquote><p><strong>链表的头节点并不包含在 Buffer Pool 的内存中</strong>，而是在上面讲到的额外内存池中单独申请一块内存空间。</p></blockquote><h3 id="小插曲-如何判断访问的页是否在-buffer-pool-中" tabindex="-1"><a class="header-anchor" href="#小插曲-如何判断访问的页是否在-buffer-pool-中" aria-hidden="true">#</a> &gt; 小插曲：如何判断访问的页是否在 Buffer Pool 中？</h3><p>前文说过，当我们需要访问某个页中的数据时，如果该页已经在 Buffer Pool 中，则可以直接使用，不在才需要加载进来。</p><p>那么，怎么判断访问的页是否在 Buffer Pool 中呢？难道依次遍历 Buffer Pool 中的所有缓冲页？这样显然效率很低。</p><p>我们其实是根据 <strong>表空间 + 页号来定位一个页的</strong>，所以可以使用 <strong>哈希表</strong> 来记录数据页和缓冲页控制块的映射关系。</p><p>具体来说，<strong>key 就是表空间 + 页号，value 就是缓冲页控制块的地址</strong>。这样我们在访问页时，就可以通过这个 key 快速判断这个页在 Buffer Pool 中有没有对应的缓冲页。</p><h3 id="_4-2-如何管理脏页" tabindex="-1"><a class="header-anchor" href="#_4-2-如何管理脏页" aria-hidden="true">#</a> 4.2 如何管理脏页？</h3><p>前文说过，建立缓冲区不仅可以提高读性能，也能提高写性能，而且在写操作结束后，并不是立马刷回磁盘。</p><p>所以如果修改了某个缓冲页中的数据，那么它就与磁盘上的页数据不一致了，这样的页就称为 <strong>脏页</strong>，后续会有后台线程将脏页刷回磁盘（后面会讲解）。</p><p>同样，为了快速判断哪些缓冲页是脏页，又创建了一个 <strong>flush 链表</strong>，与 free 链表类似。</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303051106815.png" alt="img"></p><p>有了 flush 链表后，后台线程就可以直接遍历 flush 链表，将脏页刷回磁盘了。</p><h3 id="_4-3-脏页何时被刷回磁盘" tabindex="-1"><a class="header-anchor" href="#_4-3-脏页何时被刷回磁盘" aria-hidden="true">#</a> 4.3 脏页何时被刷回磁盘？</h3><p>修改数据时，Buffer Pool 中的 <strong>脏页并不是立刻刷回磁盘的</strong>，这样当后续操作还要使用该页时，就可以直接在 Buffer Pool 中操作，因为 <strong>Buffer Pool 中的数据就是最新的</strong>。</p><p>那如果脏页还没来得及刷回磁盘，这时候 MySQL 实例宕机了，数据会不一致吗？</p><p>不会的，数据的一致性是由 redo log 保证的，InnoDB 采用 <strong>WAL 技术</strong>（Write Ahead Log），在更新数据时，会 <strong>先写日志，再写磁盘</strong>。通过 redo log，MySQL 就有了 crash-safe 的能力，也就是崩溃恢复能力。这个在日志相关文章中会详细讲解。</p><p>脏页的刷盘时机有下面几种情况：</p><ul><li><p><strong>空闲时</strong>，会有 <strong>后台线程</strong> 定时将适量的脏页刷回磁盘；</p></li><li><p><strong>Buffer Pool 空间不足时</strong>，会淘汰一部分缓冲页，如果是脏页，则需要先刷回磁盘再淘汰；</p></li><li><p><strong>redo log 写满时</strong>，也会将脏页刷回磁盘；</p><blockquote><p>因为数据的一致性就是靠 redo log 保证的，而 redo log 是一个 <strong>环状</strong> 日志。所以它写满时，后续的新记录会覆盖旧记录，那当然要先将脏页刷回磁盘了，否则就可能出现数据不一致的情况。</p></blockquote></li><li><p><strong>MySQL 正常关闭之前</strong>，会将所有的脏页刷回磁盘。</p></li></ul><p>可以发现，刷脏页是一个常态，而且只有空闲时才会使用后台线程，所以需要注意 <strong>刷脏页对数据库性能的影响</strong>。</p><p>出现以下这两种情况，都是会明显影响性能的：</p><ul><li><strong>Buffer Pool 空间不足时</strong>，如果一个查询 <strong>要淘汰的脏页个数太多</strong>，就会导致 <strong>查询的响应时间明显变长</strong>；</li><li><strong>redo log 写满时</strong>，<strong>更新会全部堵住</strong>，写性能跌为 0，这种情况对敏感业务来说是不能接受的。</li></ul><p>为了避免上述情况，我们可以适当调大 Buffer Pool 空间或 redo log 的大小。</p><h3 id="_4-4-lru-链表的管理" tabindex="-1"><a class="header-anchor" href="#_4-4-lru-链表的管理" aria-hidden="true">#</a> 4.4 LRU 链表的管理</h3><p>除了上面提到的两个链表外，其实还有一个 <strong>非常重要</strong> 的 <strong>LRU 链表</strong>。</p><p>因为 Buffer Pool 空间是有限的，所以 <strong>当 free 链表中的缓冲页使用完之后，就需要将一些旧的缓冲页淘汰掉</strong>。显然，不能乱淘汰，我们要 <strong>尽量保留一些访问频率高的缓冲页</strong>。因此，就出现了 LRU 链表。</p><p>当然，<strong>LRU 链表中也会有脏页</strong>，因为 LRU 是根据最近访问时间和访问频率来进行保留和淘汰的。</p><blockquote><p>上面说的 <strong>Buffer Pool 空间不足时</strong>，会淘汰一部分缓冲页，如果是脏页，则需要先刷回磁盘再淘汰，就是从 LRU 中筛选。</p></blockquote><p>关于 LRU 的讲解后续会有详细的文章，本文只是简单介绍一下 Buffer Pool。</p><h2 id="_5-总结" tabindex="-1"><a class="header-anchor" href="#_5-总结" aria-hidden="true">#</a> 5. 总结</h2><p>InnoDB 设计了一个缓冲池 Buffer Pool，用来提高数据库的读写性能。</p><p>Buffer Pool 中划分出了一个个缓冲页，InnDB 使用链表来管理这些缓冲页：</p><ul><li><strong>free 链表</strong>（空闲页链表）：管理还没有使用的空闲页；</li><li><strong>flush 链表</strong>（脏页链表）：管理有过数据修改的脏页；</li><li><strong>LRU 链表</strong>：管理 <strong>脏页 + 干净页</strong>（只读的页），将最近且经常访问的数据进行保留，而淘汰不常访问的数据。</li></ul><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303061847080.png" alt="img"></p><p>此外，还需要特别注意脏页的刷盘时机，以免出现性能问题。</p><h2 id="_6-参考文章" tabindex="-1"><a class="header-anchor" href="#_6-参考文章" aria-hidden="true">#</a> 6. 参考文章</h2>',68),_=o("li",null,"《MySQL 是怎样运行的》",-1),B=o("li",null,"《MySQL 实战 45 讲》",-1),b={href:"https://xiaolincoding.com",target:"_blank",rel:"noopener noreferrer"};function P(m,L){const n=s("router-link"),l=s("ExternalLinkIcon");return u(),a("div",null,[o("details",i,[d,o("nav",c,[o("ul",null,[o("li",null,[r(n,{to:"#_1-为什么需要-buffer-pool"},{default:t(()=>[e("1. 为什么需要 Buffer Pool？")]),_:1})]),o("li",null,[r(n,{to:"#_2-什么是-buffer-pool"},{default:t(()=>[e("2. 什么是 Buffer Pool？")]),_:1})]),o("li",null,[r(n,{to:"#_3-buffer-pool-缓存什么"},{default:t(()=>[e("3. Buffer Pool 缓存什么？")]),_:1})]),o("li",null,[r(n,{to:"#_4-如何管理缓冲页"},{default:t(()=>[e("4. 如何管理缓冲页？")]),_:1}),o("ul",null,[o("li",null,[r(n,{to:"#_4-1-如何管理空闲页"},{default:t(()=>[e("4.1 如何管理空闲页？")]),_:1})]),o("li",null,[r(n,{to:"#小插曲-如何判断访问的页是否在-buffer-pool-中"},{default:t(()=>[e("> 小插曲：如何判断访问的页是否在 Buffer Pool 中？")]),_:1})]),o("li",null,[r(n,{to:"#_4-2-如何管理脏页"},{default:t(()=>[e("4.2 如何管理脏页？")]),_:1})]),o("li",null,[r(n,{to:"#_4-3-脏页何时被刷回磁盘"},{default:t(()=>[e("4.3 脏页何时被刷回磁盘？")]),_:1})]),o("li",null,[r(n,{to:"#_4-4-lru-链表的管理"},{default:t(()=>[e("4.4 LRU 链表的管理")]),_:1})])])]),o("li",null,[r(n,{to:"#_5-总结"},{default:t(()=>[e("5. 总结")]),_:1})]),o("li",null,[r(n,{to:"#_6-参考文章"},{default:t(()=>[e("6. 参考文章")]),_:1})])])])]),h,o("ul",null,[_,B,o("li",null,[o("a",b,[e("小林 coding"),r(l)])])])])}const y=f(g,[["render",P],["__file","了解BufferPool.html.vue"]]);export{y as default};
