import{_ as d,Z as i,$ as a,a3 as o,a1 as r,a4 as t,a2 as e,a0 as g,E as s}from"./framework-63f054a3.js";const c={},p={class:"hint-container details"},_=o("summary",null,"本文内容",-1),u={class:"table-of-contents"},h=o("h2",{id:"_1-前言",tabindex:"-1"},[o("a",{class:"header-anchor",href:"#_1-前言","aria-hidden":"true"},"#"),e(" 1. 前言")],-1),f={href:"https://aruni.me/docs/studynotes/database/mysql/buffer_pool/%E4%BA%86%E8%A7%A3BufferPool.html#_4-3-%E8%84%8F%E9%A1%B5%E4%BD%95%E6%97%B6%E8%A2%AB%E5%88%B7%E5%9B%9E%E7%A3%81%E7%9B%98",target:"_blank",rel:"noopener noreferrer"},b=g('<p>答案是不会的，因为 InnoDB 在更新的时候，采用的是 <strong>WAL 技术</strong>（Write-Ahead Logging，写前日志），即更新时 <strong>先写日志，后刷磁盘</strong>。</p><p>也就是说，在更新一条记录的时候，InnoDB 会先把该数据页加载进 BP（该页不在 BP 中时），然后对该记录进行更新，接着 <strong>将这个页的修改写到 redo log</strong>，这个时候 <strong>更新就算完成了</strong>。后续会有空闲线程将数据刷回磁盘。</p><p>也就是下图所示的执行流程：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303071651548.png" alt="image-20230307165034054"></p><p>这样就算内存中的数据页还没刷回磁盘，也可根据这个神奇的 redo log 将数据恢复回来，下面就来具体的介绍一下它。</p><h2 id="_2-为什么需要-redo-log" tabindex="-1"><a class="header-anchor" href="#_2-为什么需要-redo-log" aria-hidden="true">#</a> 2. 为什么需要 redo log？</h2><p>其实，为了持久化内存中的数据，一个很简单的方法就是，每次执行完更新有关的操作，就将这个缓冲页刷回磁盘。但是这样的刷盘方式会有如下问题：</p><ul><li>InnoDB 是以 <strong>页</strong> 来管理数据的（一页 16K），如果我们 <strong>只修改了一页中的一条记录</strong>，那么就要将这 <strong>一整个页都刷回磁盘</strong>，大大降低了磁盘 I/O 的效率；</li><li>有可能 SQL 语句 <strong>修改了多个页面</strong>，而且这些页面还 <strong>不相邻</strong>，这就导致在刷回磁盘的时候需要进行很多的 <strong>随机 I/O</strong>，这比顺序 I/O 要慢。</li></ul><p>所以，InnoDB 采用了 <strong>redo log</strong>，在每次修改数据的时候，就将这个修改对数据页产生的影响记录下来，后面如果发生了崩溃，重启后只需要根据 redo log 中的内容进行恢复即可。</p><p>比如说某个更新操作将系统表空间中的第 100 号页面中，偏移量为 1000 处的那个字节的值 1 改成 2，redo log 只需要记录一下这个 <strong>物理日志</strong>：</p><ul><li><strong><code>将第 0 号表空间的 100 号页面的偏移量为 1000 处的值更新为 2</code></strong>。</li></ul><p>这样我们在更新完后，将 redo log 刷回磁盘，之后崩溃恢复的时候，<strong>按照 redo log 上的内容重新更新数据页即可</strong>。</p><p>你可能会问，redo log 不也要刷回磁盘？那还不如直接将数据页刷回磁盘呢？</p><p>不不不，这两个刷磁盘的方式是不一样的，<strong>redo log 刷盘的好处</strong> 如下：</p><ul><li><strong>redo log 占用的空间非常小</strong>，一行简单的 redo log 只包含表空间号、数据页号、磁盘偏移量、更新值，就占几十个字节；</li><li><strong>redo log 写入磁盘是顺序 I/O</strong>，不管这些记录在多少个页面，redo log 都是按序记录（在磁盘上追加写即可），刷盘的时候不用去找该页对应的磁盘在哪个区域。</li></ul><p>所以，<strong>redo log 刷盘比数据页的刷盘快多了</strong>，这就是 WAL 技术的另一个优点：<strong>将磁盘的随机写转为顺序写</strong>，提高了执行效率。</p><h2 id="_3-产生的-redo-log-直接写入磁盘吗" tabindex="-1"><a class="header-anchor" href="#_3-产生的-redo-log-直接写入磁盘吗" aria-hidden="true">#</a> 3. 产生的 redo log 直接写入磁盘吗？</h2><p>因为写 redo log 也要刷盘，所以为了减少 I/O 操作，并不会写一条 redo log 就刷一次盘，它有一个自己的缓冲区 <strong>redo log buffer</strong>，每产生一条 redo log 记录只需要先写入 redo log buffer 即可，后续再进行刷盘。</p>',18),B={href:"https://aruni.me/docs/studynotes/database/mysql/buffer_pool/%E4%BA%86%E8%A7%A3BufferPool.html#_3-buffer-pool-%E7%BC%93%E5%AD%98%E4%BB%80%E4%B9%88",target:"_blank",rel:"noopener noreferrer"},m=o("code",null,"innodb_log_buffer_size",-1),k=g('<h2 id="_4-redo-log-刷盘时机" tabindex="-1"><a class="header-anchor" href="#_4-redo-log-刷盘时机" aria-hidden="true">#</a> 4. redo log 刷盘时机</h2><p>既然 redo log 是缓存在 redo log buffer 中，那它的刷盘时机就非常重要了，因为持久性是靠它来保证的，它可不能出任何差错。</p><p>redo log 的刷盘时机主要有下面几种：</p><ul><li>MySQL <strong>正常关闭时</strong>；</li><li><strong>后台线性每隔 1 秒</strong>，就会将 redo log buffer 持久化到磁盘；</li><li>redo log buffer <strong>使用的内存空间大于一半时</strong>；</li><li>每次 <strong>事务提交时</strong>，可通过 <strong><code>innodb_flush_at_trx_commit</code> 参数</strong> 控制刷盘时机。</li></ul><p>前三个时机都比较好理解，需要保证 redo log 尽量多的落盘嘛，下面主要来讲讲最后一个时机。</p><h3 id="_4-1-事务提交控制的刷盘时机" tabindex="-1"><a class="header-anchor" href="#_4-1-事务提交控制的刷盘时机" aria-hidden="true">#</a> 4.1 事务提交控制的刷盘时机</h3><p>在 MySQL 中会默认开启 <strong>隐式事务</strong>，即在执行 insert、update 或 delete 语句的时候，会自动开启一个事务来执行这些操作。</p><p>那么当 <strong>事务提交时</strong>，InnoDB 会根据 <strong><code>innodb_flush_at_trx_commit</code> 参数来进行 redo log 的刷盘</strong>：</p><ul><li><p>参数为 <strong>0</strong>：事务提交时 <strong>不进行刷盘</strong>，把刷盘交给其他三种时机来进行；</p><blockquote><p>此参数虽然加快了处理速度，但是会增大数据丢失的概率。</p></blockquote></li><li><p>参数为 <strong>1</strong>：事务提交时 <strong>将 redo log buffer 中的 redo log 同步到磁盘</strong>，1 也是它的默认值；</p><blockquote><p>此参数可以保证数据不会丢失。</p></blockquote></li><li><p>参数为 <strong>2</strong>：事务提交时 <strong>只将 redo log 写入到操作系统的缓冲区 Page Cache</strong>。</p><blockquote><p>Page Cache 是操作系统专门用来缓存文件数据的，<strong>此时其实还没有落盘</strong>，具体的落盘时机由操作系统控制。</p></blockquote></li></ul><p>具体来说，当参数为 0 时，InnoDB 会有后台线程每隔 1 秒就将 redo log buffer 中的 redo log 通过调用 <code>write()</code> 写到操作系统的 Page Cache 中，然后调用 <code>fsync()</code> 持久化到磁盘上。</p><p>当参数为 1 时，事务提交时就会将 redo log 刷入磁盘，也就是调用 <code>write()</code> 后，马上调用 <code>fsync()</code> 进行刷盘操作。</p><p>当参数为 2 时，也是通过后台线程将 redo log 刷入磁盘，不过此时直接调用 <code>fsync()</code> 即可，因为此时的 redo log 已经在操作系统的 Page Cache 中了。</p><p>也就是说，参数 1 是最安全的做法，然后是参数 2，最后是参数 0（写入性能就是反序了）。因为参数 2 会先把 redo log 写到 Page Cache，只要操作系统不宕机，就算 MySQL 发生崩溃，数据也不会丢失。</p><blockquote><p>三种策略中，因为有了后台线程的加持，所以 <strong>最多也只会丢失 1 秒钟的事务数据</strong>。</p></blockquote><h2 id="_5-redo-log-文件组" tabindex="-1"><a class="header-anchor" href="#_5-redo-log-文件组" aria-hidden="true">#</a> 5. redo log 文件组</h2><p>MySQL 默认使用 <strong>两个名为 <code>ib_logfile0</code> 和 <code>ib_logfile1</code> 的文件存储 redo log，这两个文件构成一个 redo log 文件组</strong>。</p><div class="hint-container info"><p class="hint-container-title">redo log 文件的调节参数</p><p>可以通过下面两个参数来调节 redo log 文件的文件组大小和单个文件的大小：</p><ul><li><code>innodb_log_file_size</code>：指定每个 redo log 文件的大小，MySQL 5.7 中默认为 48MB；</li><li><code>innodb_log_files_in_group</code>：指定 redo log 文件组中文件的个数，默认为 2，最大值为 100。</li></ul></div><p>也就是说，redo log 文件并不是无限的，它只会写入到这个文件组里面。从 <code>ib_logfile0</code> 开始写，写满了就写 <code>ib_logfile1</code>，这时写满了最后一个文件后就又去写 <code>ib_logfile0</code>，如下图所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303072200279.png" alt="image-20230307220017602"></p><p>因此，<strong>redo log 文件组采用的是循环写的方式</strong>，文件被写完后又会从头开始写。这就意味着 <strong>会进行数据的覆盖</strong>，不会对持久性产生影响吗？</p><p>那当然可能了，InnoDB 自然也考虑到了这个问题，所以提出了 <strong>checkpoint</strong> 的概念。</p><h2 id="_6-checkpoint" tabindex="-1"><a class="header-anchor" href="#_6-checkpoint" aria-hidden="true">#</a> 6. checkpoint</h2><p>由于 <strong>redo log 只是为了系统崩溃后恢复脏页用的，如果这些脏页已经刷到磁盘了，那么就算崩溃后重启，也用不到这些 redo log</strong>，所以即使被覆盖了也没关系。</p><p>所以，判断 redo log 文件是否可以被覆盖的依据就是：<strong>它对应的脏页是否已经被刷到了磁盘</strong>。</p><p>InnoDB 使用 <strong>checkpoint 表示 redo log 文件中已经进行了刷盘的位置</strong>，用 <strong>write pos 表示 redo log 文件写到了哪个位置</strong>。如下图所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303072300028.png" alt="image-20230307230048960"></p><p>具体来说：</p><ul><li>write pos 到 checkpoint 之间的文件（红色部分），表示 <strong>已经落盘的数据</strong>，因此 <strong>可以进行覆盖</strong>，写入新的 redo log；</li><li>checkpoint 到 write pos 之间的文件（蓝色部分），表示 <strong>还未落盘的脏数据</strong>，因此还 <strong>不能进行覆盖</strong>。</li></ul><p><strong>当 write pos 追上 checkpoint 时，就说明 redo log 文件已经写满了，为了保证 redo log 的持久性，此时 MySQL 会停止更新操作（即阻塞，所以尽量把 redo log 文件适当地调大些），然后开始将 Buffer Pool 中的脏页刷到磁盘，这些脏页对应的 redo log 就可以被覆盖了，此时 checkpoint 就会向前移动</strong>。此时 redo log 可以继续覆盖写入了，MySQL 恢复执行。</p><p>所以，有了 redo log，InnoDB 就可以保证即使数据库发生了 <strong>崩溃</strong>，重启后也能保证 <strong>已提交的记录都不会丢失</strong>，也将这个能力称为 <strong>crash-safe</strong>。</p><p>简单来说，一次 checkpoint 过程就是把脏页刷到磁盘，然后标记与之对应的 redo log 哪些可以被覆盖的过程。</p><blockquote><p>具体的 checkpoint 过程涉及到 LSN（Log Sequeue Number），后续文章会具体讲解。</p></blockquote><h2 id="_7-总结" tabindex="-1"><a class="header-anchor" href="#_7-总结" aria-hidden="true">#</a> 7. 总结</h2><p>InnoDB 通过 redo log，保证了数据的 <strong>持久性</strong>，它的好处主要有两个：</p><ul><li><p>在 MySQL 宕机时，能保证重启后 <strong>已提交事务的记录都不会丢失</strong>，这也叫 <strong>crash-safe</strong> 能力；</p></li><li><p><strong>将数据页刷磁盘的随机 I/O 转换成 redo log 的顺序 I/O</strong>。</p></li></ul><p>redo log 是先缓存在 <strong>redo log buffer</strong> 中的，也需要刷入磁盘，它的刷盘机制有如下几种：</p><ul><li>MySQL <strong>正常关闭时</strong>；</li><li><strong>后台线性每隔 1 秒</strong>，就会将 redo log buffer 持久化到磁盘；</li><li>redo log buffer <strong>使用的内存空间大于一半时</strong>；</li><li>每次 <strong>事务提交时</strong>，可通过 <strong><code>innodb_flush_at_trx_commit</code> 参数</strong> 控制刷盘时机。</li></ul><p>其中 <code>innodb_flush_at_trx_commit</code> 参数有下面几种：</p><ul><li>参数为 <strong>0</strong>：事务提交时 <strong>不进行刷盘</strong>，把刷盘交给其他三种时机来进行；</li><li>参数为 <strong>1</strong>：事务提交时 <strong>将 redo log buffer 中的 redo log 同步到磁盘</strong>，1 也是它的默认值；</li><li>参数为 <strong>2</strong>：事务提交时 <strong>只将 redo log 写入到操作系统的缓冲区 Page Cache</strong>，此时还没有落盘。</li></ul><p>又讲到，redo log 文件是以文件组的形式存在的，相当于一个 <strong>环形文件</strong>，写入时可能会有覆盖操作，那么判断是否能进行覆盖的主要依据是 <strong>checkpoint 和 write pos</strong> 的位置。当不能进行覆盖时，会 <strong>阻塞</strong> MySQL 的更新操作，去 <strong>通过刷脏页来推动 checkpoint 向前移动</strong>。</p><h2 id="_8-参考文章" tabindex="-1"><a class="header-anchor" href="#_8-参考文章" aria-hidden="true">#</a> 8. 参考文章</h2>',41),y=o("li",null,"《MySQL 是怎样运行的》",-1),E=o("li",null,"《MySQL 实战 45 讲》",-1),x={href:"https://xiaolincoding.com",target:"_blank",rel:"noopener noreferrer"};function L(I,S){const n=s("router-link"),l=s("ExternalLinkIcon");return i(),a("div",null,[o("details",p,[_,o("nav",u,[o("ul",null,[o("li",null,[r(n,{to:"#_1-前言"},{default:t(()=>[e("1. 前言")]),_:1})]),o("li",null,[r(n,{to:"#_2-为什么需要-redo-log"},{default:t(()=>[e("2. 为什么需要 redo log？")]),_:1})]),o("li",null,[r(n,{to:"#_3-产生的-redo-log-直接写入磁盘吗"},{default:t(()=>[e("3. 产生的 redo log 直接写入磁盘吗？")]),_:1})]),o("li",null,[r(n,{to:"#_4-redo-log-刷盘时机"},{default:t(()=>[e("4. redo log 刷盘时机")]),_:1}),o("ul",null,[o("li",null,[r(n,{to:"#_4-1-事务提交控制的刷盘时机"},{default:t(()=>[e("4.1 事务提交控制的刷盘时机")]),_:1})])])]),o("li",null,[r(n,{to:"#_5-redo-log-文件组"},{default:t(()=>[e("5. redo log 文件组")]),_:1})]),o("li",null,[r(n,{to:"#_6-checkpoint"},{default:t(()=>[e("6. checkpoint")]),_:1})]),o("li",null,[r(n,{to:"#_7-总结"},{default:t(()=>[e("7. 总结")]),_:1})]),o("li",null,[r(n,{to:"#_8-参考文章"},{default:t(()=>[e("8. 参考文章")]),_:1})])])])]),h,o("p",null,[e("在 "),o("a",f,[e("了解 Buffer Pool"),r(l)]),e(" 中说过，BP 中的数据是不会立即刷回磁盘的，那么此时如果 MySQL 崩溃了，重启后还未来得及刷盘的脏页会丢失么？")]),b,o("p",null,[e("redo log buffer 是不在 Buffer Pool 里的（"),o("a",B,[e("了解 Buffer Pool"),r(l)]),e(" 中有提到），它有一块自己的连续地址空间。大小可以通过 "),m,e(" 调整，默认为 16MB。")]),k,o("ul",null,[y,E,o("li",null,[o("a",x,[e("小林 coding"),r(l)])])])])}const P=d(c,[["render",L],["__file","redo log：崩溃恢复神器.html.vue"]]);export{P as default};
