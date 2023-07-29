import{_ as l}from"./plugin-vue_export-helper-c27b6911.js";import{r as o,o as c,c as i,a as n,d as a,w as p,b as s,e as r}from"./app-80dc18e4.js";const u={},k={class:"hint-container details"},d=n("summary",null,"本文内容",-1),m={class:"table-of-contents"},g={class:"hint-container info"},y=n("p",{class:"hint-container-title"},"前言",-1),v={href:"https://aruni.me/studynotes/database/mysql/lock/MySQL%E4%B8%AD%E7%9A%84%E9%94%81.html",target:"_blank",rel:"noopener noreferrer"},b=n("h2",{id:"_1-行级锁回顾",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#_1-行级锁回顾","aria-hidden":"true"},"#"),s(" 1. 行级锁回顾")],-1),E={href:"https://aruni.me/studynotes/database/mysql/lock/MySQL%E4%B8%AD%E7%9A%84%E9%94%81.html#_4-%E8%A1%8C%E7%BA%A7%E9%94%81",target:"_blank",rel:"noopener noreferrer"},L=r('<p>什么情况需要加锁：</p><ul><li>快照读（也就是简单 select 语句）无需加锁，通过 MVCC 来实现各种隔离级别；</li><li>当前读（显示给 select 语句加锁）以及增删改才需要加锁，并且获取到的是数据的最新版本。</li></ul><p>行级锁分类：</p><ul><li>Record Lock：记录锁，只锁一条记录；</li><li>Gap Lock：间隙锁，锁一个区间（前开后开）；</li><li>Next-Key Lock：临键锁，是 Record Lock 和 Gap Lock 的组合，锁区间为前开后闭。</li></ul><h2 id="_2-行级锁加锁规则" tabindex="-1"><a class="header-anchor" href="#_2-行级锁加锁规则" aria-hidden="true">#</a> 2. 行级锁加锁规则</h2><p>MySQL 中，<strong>加锁的基本单位是 Next-Key Lock</strong>，但是在某些情况下，会退化为 Record Lock 或 Gap Lock。</p><p>这些情况可以大致分为以下几种：</p><ul><li>唯一索引的等值查询；</li><li>唯一索引的范围查询；</li><li>非唯一索引的等值查询；</li><li>非唯一索引的范围查询。</li></ul><p>下面就来看看这些情况具体都加了什么锁，需要注意的时，<strong>Gap Lock 只有在可重复读隔离级别下才会出现</strong>，这也是 MySQL 的默认隔离级别，所以以下实验都是基于可重复读隔离级别的。</p><p>实验表如下，id 字段为主键索引（唯一索引），a 字段是普通索引（非唯一索引）：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token comment">-- ----------------------------</span>\n<span class="token comment">-- Table structure for table</span>\n<span class="token comment">-- ----------------------------</span>\n<span class="token keyword">DROP</span> <span class="token keyword">TABLE</span> <span class="token keyword">IF</span> <span class="token keyword">EXISTS</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span><span class="token punctuation">;</span>\n<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token punctuation">(</span>\n  <span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span> <span class="token keyword">int</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>\n  <span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span> <span class="token keyword">int</span> <span class="token keyword">DEFAULT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>\n  <span class="token identifier"><span class="token punctuation">`</span>b<span class="token punctuation">`</span></span> <span class="token keyword">int</span> <span class="token keyword">DEFAULT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>\n  <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n  <span class="token keyword">KEY</span> <span class="token identifier"><span class="token punctuation">`</span>index_a<span class="token punctuation">`</span></span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span><span class="token punctuation">)</span> <span class="token keyword">USING</span> <span class="token keyword">BTREE</span>\n<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span><span class="token operator">=</span>utf8mb4 <span class="token keyword">COLLATE</span><span class="token operator">=</span>utf8mb4_general_ci<span class="token punctuation">;</span>\n\n<span class="token comment">-- ----------------------------</span>\n<span class="token comment">-- Records of table</span>\n<span class="token comment">-- ----------------------------</span>\n<span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>b<span class="token punctuation">`</span></span><span class="token punctuation">)</span> <span class="token keyword">VALUES</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>b<span class="token punctuation">`</span></span><span class="token punctuation">)</span> <span class="token keyword">VALUES</span> <span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>b<span class="token punctuation">`</span></span><span class="token punctuation">)</span> <span class="token keyword">VALUES</span> <span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token punctuation">(</span><span class="token identifier"><span class="token punctuation">`</span>id<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>a<span class="token punctuation">`</span></span><span class="token punctuation">,</span> <span class="token identifier"><span class="token punctuation">`</span>b<span class="token punctuation">`</span></span><span class="token punctuation">)</span> <span class="token keyword">VALUES</span> <span class="token punctuation">(</span><span class="token number">15</span><span class="token punctuation">,</span> <span class="token number">15</span><span class="token punctuation">,</span> <span class="token number">15</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token keyword">COMMIT</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-1-唯一索引等值查询" tabindex="-1"><a class="header-anchor" href="#_2-1-唯一索引等值查询" aria-hidden="true">#</a> 2.1 唯一索引等值查询</h3><p>当使用唯一索引进行等值查询时，分为记录是否存在两种情况：</p><ul><li><p>当查询的 <strong>记录存在</strong> 时，对该记录加的 Next-Key Lock 会 <strong>退化为 Record Lock</strong>；</p></li><li><p>当查询的 <strong>记录不存在</strong> 时，会 <strong>找到第一条大于该查询条件的临界记录</strong>，然后将这条临界记录加的 Next-Key Lock <strong>退化为 Gap Lock</strong>（因为加的 Gap Lock 能保证该查询的记录不会被其他事务插入）。</p><blockquote><p>Next-Key Lock 前开后闭，相当于把后闭去掉了，只锁区间。</p></blockquote></li></ul><div class="hint-container tip"><p class="hint-container-title">记录存在情况</p></div><p>执行下面语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">=</span> <span class="token number">1</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n<span class="token comment"># 不提交事务，锁在事务提交时会释放掉</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后进入 MySQL 客户端，使用下面命令来看具体加了什么锁（或者直接查看 performance_schema 数据库下的 data_locks 表）：</p><div class="language-mysql line-numbers-mode" data-ext="mysql"><pre class="language-mysql"><code>mysql&gt; SELECT * FROM performance_schema.data_locks\\G;\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291435288.png" alt="image-20230729143537126" loading="lazy"></p><ul><li>LOCK_TYPE 中，TABLE 表示表级锁，RECORD 表示行级锁；</li><li>在行级锁中，LOCK_MODE 中，会有如下数值，用来判断具体加的是行锁中的哪一类： <ul><li><code>LOCK_MODE: X</code>，加的是 Next-Key Lock；</li><li><code>LOCK_MODE: X, REC_NOT_GAP</code>，加的是 Record Lock；</li><li><code>LOCK_MODE: X, GAP</code>，加的是 Gap Lock；</li></ul></li><li>LOCK_DATA 表示加锁的记录，如果记录不存在，则表示加锁范围的右边界。</li></ul><p>通过上面分析可以发现，<strong>是在 1 这条记录上加的 Record Lock，锁住的是这一条记录</strong>。</p><div class="hint-container tip"><p class="hint-container-title">记录不存在情况</p></div><p>执行下面语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">=</span> <span class="token number">3</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>看看加了什么锁：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291446349.png" alt="image-20230729144620332" loading="lazy"></p><p>可以发现是 <strong>在 5 这条记录（第一条比 3 大的记录）上加的 Gap Lock，因此锁住的区间是 (1, 5)</strong>。</p><h3 id="_2-2-唯一索引范围查询" tabindex="-1"><a class="header-anchor" href="#_2-2-唯一索引范围查询" aria-hidden="true">#</a> 2.2 唯一索引范围查询</h3><p><strong>当进行唯一索引的范围查询过程中，对扫描到的记录都会加 Next-Key Lock</strong>，然后也会根据不同情况进行退化。</p><p>我们可以将范围查询分为大于、大于等于、小于、小于等于，下面就按这四种情况来做实验，看看都加了什么锁。</p><div class="hint-container tip"><p class="hint-container-title">大于情况</p></div><p>执行下面这条语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&gt;</span> <span class="token number">5</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>看看加了什么行级锁：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291512010.png" alt="image-20230729151214444" loading="lazy"></p><blockquote><p>Tip：我们的表中最后一条记录是 id = 15 的，但是 InnoDB 会用一个特殊的记录来标识最后一条记录，这条记录就是 supremum pseudo-record。</p></blockquote><p>可以发现加了如下几把锁：</p><ul><li>10 这条记录上加了 Next-Key Lock，锁区间为 (5, 10]；</li><li>15 这条记录上加了 Next-Key Lock，锁区间为 (10, 15]；</li><li>supremum pseudo-record 这条记录上加了 Next-Key Lock，锁区间为 (15, +∞]。</li></ul><p>具体的加锁过程是：</p><ul><li>要查找到 id 大于 5 的第一行记录，对该记录加 Next-Key Lock；</li><li>由于查询条件是大于，所以会继续往后扫描，扫描到的记录都会加锁，而且加的都是 Next-Key Lock。</li></ul><p>加 Next-Key Lock 可以保证在 id &gt; 5 的范围中，<strong>Gap Lock 确保其他事务不会插入 id &gt; 5 的新记录，Record Lock 确保其他事务不会修改 id &gt; 5 的已存在记录</strong>。这样才能 <strong>在 RR 隔离级别下，避免幻读（不是完全）和不可重复读问题</strong>。</p><p>所以，<strong>在遇到唯一索引的范围查询时，如果查询条件是大于，会将大于的记录都加上 Next-Key Lock</strong>，不会有任何退化。</p><div class="hint-container tip"><p class="hint-container-title">大于等于情况</p></div><p>执行下面这条语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&gt;=</span> <span class="token number">5</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况如下：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291539671.png" alt="image-20230729153845550" loading="lazy"></p><p>可以发现，除了有一条 Record 锁外，其他锁都和大于一样。</p><p>也可以很容易想到，<strong>由于有了等值查询，因此需要把等值的这条记录给锁上，而该记录之前的范围（id 小于 5 的范围）又没必要锁，因此就退化为 Record Lock，只锁这一条记录</strong>。</p><p>那如果 <strong>等值记录不存在呢</strong>？来看看：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&gt;=</span> <span class="token number">6</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291542162.png" alt="image-20230729154247861" loading="lazy"></p><p>可以发现，这时候就和大于是一样的了，由于 id = 6 这条记录不存在，没办法只锁这一条记录，所以只能把区间 (5, 10] 都上锁了。</p><div class="hint-container tip"><p class="hint-container-title">小于情况</p></div><p>执行下面的语句：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&lt;</span> <span class="token number">10</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291628670.png" alt="image-20230729154801691" loading="lazy"></p><ul><li><p>记录 1 上加了 Next-Key Lock，锁范围是 (-∞, 1]；</p><blockquote><p>InnoDB 中也有一条特殊的记录 infimum record，表示最小记录。</p></blockquote></li><li><p>记录 5 上加了 Next-Key Lock，锁范围是 (1, 5]；</p></li><li><p>记录 10 上加了 Gap Lock，锁范围是 (5, 10)。</p></li></ul><p>加锁步骤如下：</p><ul><li><p>首先扫描到的是记录 1 和记录 5，它们都比 10 小，因此加的是 Next-Key Lock；</p></li><li><p>再往后扫描到记录 10，此时扫描就停止了，因为 <strong>该记录是第一条不满足查询条件（id &lt; 10）的记录。</strong></p><p><strong>由于条件不是等值查询，没必要锁该记录，因此需要将 Next-Key Lock 退化为 Gap Lock</strong>。</p></li></ul><p>如果 <strong>查询条件的记录不在表中</strong>，也是同理，<strong>找到第一条不满足查询条件的记录</strong>，然后该记录加的是 Gap Lock，前面的记录全都加 Next-Key Lock 即可。</p><div class="hint-container tip"><p class="hint-container-title">小于等于情况</p></div><p>执行的语句如下：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&lt;=</span> <span class="token number">10</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291628262.png" alt="image-20230729162829338" loading="lazy"></p><p>此时就很好分析了，跟小于情况类似，<strong>但由于有等值条件，所以 id = 10 这条记录的 Next-Key Lock 就不能退化成 Gap Lock 了</strong>。</p><p>再来看看等值条件不在表中的例子：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> id <span class="token operator">&lt;=</span> <span class="token number">12</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291631947.png" alt="image-20230729163128961" loading="lazy"></p><p>由于 <strong>要扫描到第一条不满足条件的记录</strong>，所以会扫描到 id = 15 这条记录，而这条记录是没有必要加 Record Lock 的（与我们的条件无关），因此退化为了 Gap Lock。</p><h3 id="_2-3-非唯一索引等值查询" tabindex="-1"><a class="header-anchor" href="#_2-3-非唯一索引等值查询" aria-hidden="true">#</a> 2.3 非唯一索引等值查询</h3><p>首先提醒一点，<strong>在加锁时，只要扫描到的记录都会加锁，所以如果需要回表查主键索引时，不仅会在二级索引上加锁，也会在主键索引上加锁</strong>，</p><p>接下来就来看看非唯一索引的等值查询是如何加锁的，也分为等值查询的条件记录是否存在：</p><ul><li><p>当等值查询的条件 <strong>记录存在</strong> 时，由于不是唯一索引，所以需要像范围查询那样进行 <strong>扫描</strong>，<strong>首先找到第一条符合条件的，然后加上 Next-Key Lock，直到查找到第一条不符合条件的记录（临界记录）。这个扫描过程中，会对符合条件的二级索引记录加 Next-Key Lock，临界记录上的锁会退化为 Gap Lock</strong>。</p><p>与此同时，由于 <strong>等值查询的条件记录存在，所以需要在符合查询条件记录的主键索引上加 Record Lock</strong>，来防止主键索引上的记录被修改。</p></li><li><p>当等值查询的条件 <strong>记录不存在</strong> 时，基本和上面类似，只是不需要在主键索引上加锁了。</p></li></ul><p>我们先在数据库中加入一条非唯一索引值相同的记录：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291723045.png" alt="image-20230729172307068" loading="lazy"></p><div class="hint-container tip"><p class="hint-container-title">记录存在</p></div><p>执行语句如下：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> a <span class="token operator">=</span> <span class="token number">10</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291816685.png" alt="image-20230729181619433" loading="lazy"></p><blockquote><p>LOCK_DATA 包含了索引列和主键列。</p></blockquote><p>这里要注意看 INDEX_NAME，看在哪个索引上加了锁：</p><ul><li>在二级索引上，定位到该查询条件的首条记录，加上 Next-Key Lock。继续向后扫描，直到找到第一个不满足条件的记录（扫描过程对符合添加的记录都加的是 Next-Key Lock）；</li><li>找到临界记录后，即 <code>a = 15</code> 的记录，由于不用锁该记录，因此锁会退化为 Gap Lock；</li><li>由于扫描过程中扫描到的有两条记录，所以在主键索引中需要对这条件记录加 Record Lock。</li></ul><p>加锁图示如下：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291734446.png" alt="image-20230729173411797" loading="lazy"></p><p>也很好理解，由于非唯一索引可能会在缝隙中插入索引列相同的记录，所以肯定要把每个缝隙都锁上，而且两边也要有 Gap Lock。</p><div class="hint-container tip"><p class="hint-container-title">记录不存在</p></div><p>再来看看记录不存在的情况：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> a <span class="token operator">=</span> <span class="token number">12</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291816712.png" alt="image-20230729181653699" loading="lazy"></p><p>此时就比较简单了，扫描到第一条不满足条件的记录，也就是 <code>a = 15</code>，加一个 Gap Lock 即可保证不会在 (10, 15) 区间插入符合查询条件的记录。</p><h3 id="_2-4-非唯一索引范围查询" tabindex="-1"><a class="header-anchor" href="#_2-4-非唯一索引范围查询" aria-hidden="true">#</a> 2.4 非唯一索引范围查询</h3><p><strong>在非唯一索引的范围查询中，对二级索引加的都是 Next-Key Lock，不会有退化的情况</strong>。因为等值条件情况下，也有可能会插入相同的记录，所以 Record Lock 是必须的。</p><p>下面举个例子：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> a <span class="token operator">&gt;=</span> <span class="token number">10</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291822799.png" alt="image-20230729181740998" loading="lazy"></p><p>图示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291821368.png" alt="image-20230729182124069" loading="lazy"></p><blockquote><p>若是 a &gt; 10，则会从第一条符合条件的记录（a = 15）开始加锁，然后向后扫描，逐一加锁。</p></blockquote><p>再来看个小于的例子：</p><div class="language-sql line-numbers-mode" data-ext="sql"><pre class="language-sql"><code><span class="token keyword">BEGIN</span><span class="token punctuation">;</span>\n<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> <span class="token identifier"><span class="token punctuation">`</span>table<span class="token punctuation">`</span></span> <span class="token keyword">WHERE</span> a <span class="token operator">&lt;</span> <span class="token number">10</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>加锁情况：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202307291944601.png" alt="image-20230729183117135" loading="lazy"></p><blockquote><p>扫描到第一个不满足 a &lt; 10 的记录停止。</p></blockquote><h2 id="_3-总结" tabindex="-1"><a class="header-anchor" href="#_3-总结" aria-hidden="true">#</a> 3. 总结</h2><p>所有情况都做完实验后，可以发现，加锁是根据具体情况来加的，在不需要时尽力退化，减小锁的力度。</p><p>在分析加行锁时，所需的一些前置知识总结如下：</p><ul><li><p>行锁的类型有 Gap Lock、Record Lock 和 Next-Key Lock（Gap + Record）：</p><ul><li>Gap Lock 锁范围是前开后开；</li><li>Next-Key Lock 锁范围是前开后闭；</li><li>某条记录上有 Gap 锁时，该记录是=属于后区间。</li></ul></li><li><p>加锁的基本单位是 Next-Key Lock；</p></li><li><p>在唯一索引上加锁时，由于不存在重复的索引字段，因此某些情况可以将 Next-Key 退化：</p><ul><li>等值查询时： <ul><li>如果查询条件的记录存在，那么该记录的锁可退化为 Record Lock；</li><li>否则，需要查找到第一条不满足条件的记录，然后对该记录加的锁可以退化为 Gap-Lock。</li></ul></li><li>范围查询时： <ul><li>如果是大于，则需要从满足该查询条件的记录开始，往后扫描，不断加锁；</li><li>如果是小于，则从前往后一直扫描，一直加锁，直到扫描到不符合查询条件的第一条记录，该条记录的锁可退化为 Gap Lock，因为没必要锁这条不满足查询条件的记录；</li><li>如果是 &gt;= or &lt;=，那么在扫描到等值查询条件时，也会对锁进行退化。</li></ul></li></ul></li><li><p>非唯一索引的分析思路其实都一样，只要记住非唯一索引可能存在索引列相同的情况即可。</p></li></ul>',116);function h(w,_){const e=o("router-link"),t=o("ExternalLinkIcon");return c(),i("div",null,[n("details",k,[d,n("nav",m,[n("ul",null,[n("li",null,[a(e,{to:"#_1-行级锁回顾"},{default:p(()=>[s("1. 行级锁回顾")]),_:1})]),n("li",null,[a(e,{to:"#_2-行级锁加锁规则"},{default:p(()=>[s("2. 行级锁加锁规则")]),_:1}),n("ul",null,[n("li",null,[a(e,{to:"#_2-1-唯一索引等值查询"},{default:p(()=>[s("2.1 唯一索引等值查询")]),_:1})]),n("li",null,[a(e,{to:"#_2-2-唯一索引范围查询"},{default:p(()=>[s("2.2 唯一索引范围查询")]),_:1})]),n("li",null,[a(e,{to:"#_2-3-非唯一索引等值查询"},{default:p(()=>[s("2.3 非唯一索引等值查询")]),_:1})]),n("li",null,[a(e,{to:"#_2-4-非唯一索引范围查询"},{default:p(()=>[s("2.4 非唯一索引范围查询")]),_:1})])])]),n("li",null,[a(e,{to:"#_3-总结"},{default:p(()=>[s("3. 总结")]),_:1})])])])]),n("div",g,[y,n("p",null,[n("a",v,[s("上一篇文章"),a(t)]),s(" 中，介绍了 MySQL 中的锁类型，其中行级锁分为 Record Lock、Gap Lock 和 Next-Key Lock，那一条 SQL 语句要加行级锁时，应该加那个锁？具体是怎么加的呢？本文就来讲讲 MySQL 行级锁的加锁规则是怎样的。")])]),b,n("p",null,[s("详细看 "),n("a",E,[s("MySQL中的锁"),a(t)]),s("，下面只简单回顾几个重要的点。")]),L])}const N=l(u,[["render",h],["__file","行锁的加锁规则.html.vue"]]);export{N as default};
