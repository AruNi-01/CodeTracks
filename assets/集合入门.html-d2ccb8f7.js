import{_ as l,W as s,X as r,Z as t,a0 as i,a1 as a,Y as o,F as d,$ as n}from"./framework-a3d2fe6d.js";const c={},h={class:"hint-container details"},p=t("summary",null,"本文内容",-1),u={class:"table-of-contents"},g=o('<h2 id="_1-集合概念" tabindex="-1"><a class="header-anchor" href="#_1-集合概念" aria-hidden="true">#</a> 1. 集合概念</h2><p>Java 集合框架主要包括两种类型的容器:</p><ul><li>集合（Collection），存储一个元素集合;</li><li>图（Map），存储键/值对映射。</li></ul><p>Collection 接口又有 3 种子接口类型分别为 List、Set 和 Queue，再下面是一些子接口和实现类。</p><p>Map 接口下有常见的 HashMap、Hashtable 实现类，以及SortedMap 子接口。</p><p>常见集合的主要关系图如下所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302071815641.png" alt="img"></p><p>我们比较常用的接口有 4 个：</p><ul><li>List：有序、可重复；</li><li>Set：无序、不可重复；</li><li>Queue：有序、可重复，可以按特定的规则来确定先后顺序；</li><li>Map：键值对（key-value）存储，key 无序、不可重复；value 无序、可重复。</li></ul><h2 id="_2-collection" tabindex="-1"><a class="header-anchor" href="#_2-collection" aria-hidden="true">#</a> 2. Collection</h2><h3 id="_2-1-list" tabindex="-1"><a class="header-anchor" href="#_2-1-list" aria-hidden="true">#</a> 2.1 List</h3><p>List 接口是一个有序的 Collection，使用此接口能够精确的控制每个元素插入的位置，能够通过索引下标来访问 List 中的元素，第一个元素的索引为 0，而且允许有相同的元素。</p><h4 id="_2-1-1-arraylist" tabindex="-1"><a class="header-anchor" href="#_2-1-1-arraylist" aria-hidden="true">#</a> 2.1.1 ArrayList</h4><div class="hint-container info"><p class="hint-container-title">底层数据结构：</p><p>ArrayList 是一个 <strong>动态数组</strong>，底层数据结构是 <strong><code>Object[]</code> 数组</strong>，可以任意的添加或删除元素，支持快速随机访问。</p></div><div class="hint-container info"><p class="hint-container-title">插入/删除受元素位置影响：</p><p>ArrayList 采用数组存储，所以插入/删除元素的时间复杂度受元素位置的影响。 比如：执行 <code>add(E e)</code> 方法的时候， ArrayList 会默认在将指定的元素追加到此列表的末尾，这种情况时间复杂度就是 O(1)；</p><p>但是如果要在指定位置 i 插入/删除元素的话（<code>add(int index, E element)</code>）时间复杂度就为 O(n-i)。因为在进行上述操作的时候集合中第 i 和第 i 个元素之后的（n-i）个元素都要执行向后位/向前移一位的操作。</p></div><div class="hint-container info"><p class="hint-container-title">内存空间占用：</p><p>ArrayList 的空间浪费主要体现在列表的 <strong>结尾会预留一定的容量空间</strong>。</p></div><div class="hint-container info"><p class="hint-container-title">扩容机制：</p><p>默认初始容量为 10，可以在创建 ArrayList 对象时指定容量；</p><p>每次扩容之后容量都会变为原来的 1.5 倍左右，左右是因为扩容公式为：新容量 = 原容量 + (原容量 &gt;&gt; 1)，当原容量是奇数时，会向下取整。</p></div><div class="hint-container info"><p class="hint-container-title">使用场景：</p><p>元素需要 <strong>频繁修改/查找</strong>。</p></div><div class="hint-container tip"><p class="hint-container-title">常用方法</p></div><table><thead><tr><th style="text-align:left;">方法</th><th style="text-align:left;">描述</th></tr></thead><tbody><tr><td style="text-align:left;">boolean add(Object element)</td><td style="text-align:left;">向列表的尾部添加指定的元素</td></tr><tr><td style="text-align:left;">E get(int index)</td><td style="text-align:left;">返回列表中指定位置的元素</td></tr><tr><td style="text-align:left;">void add(int index, Object element)</td><td style="text-align:left;">在列表的指定位置插入指定元素</td></tr><tr><td style="text-align:left;">E set(int i, Object element)</td><td style="text-align:left;">将索引 i 位置元素替换为元素 element 并返回被替换的元素</td></tr><tr><td style="text-align:left;">void clear()</td><td style="text-align:left;">从列表中移除所有元素</td></tr><tr><td style="text-align:left;">boolean contains(Object o)</td><td style="text-align:left;">如果列表包含指定的元素，则返回 true</td></tr><tr><td style="text-align:left;">E remove(int index)</td><td style="text-align:left;">移除列表中指定位置的元素，并返回被删元素</td></tr><tr><td style="text-align:left;">boolean remove(Object o)</td><td style="text-align:left;">移除集合中第一次出现的指定元素</td></tr></tbody></table><h4 id="_2-1-2-linkedlist" tabindex="-1"><a class="header-anchor" href="#_2-1-2-linkedlist" aria-hidden="true">#</a> 2.1.2 LinkedList</h4><div class="hint-container info"><p class="hint-container-title">底层数据结构：</p><p>LinkedList 中的元素 <strong>在逻辑上有序</strong>（每一个节点里存到下一个节点的地址），底层数据结构为 <strong>双向链表</strong>（JDK1.6 之前为循环链表，JDK1.7 取消了循环）。不支持快速随机访问。</p></div><div class="hint-container info"><p class="hint-container-title">插入/删除受元素位置影响：</p><p>LinkedList 采用链表存储，所以在头尾插入或者删除元素不受元素位置的影响，时间复杂度为 O(1)；</p><p>如果是要在指定位置 i 插入和删除元素的话（<code>add(int index, E element)</code>，<code>remove(Object o)</code>）， 时间复杂度为 O(n) ，因为需要先移动到指定位置再插入。</p></div><div class="hint-container info"><p class="hint-container-title">内存空间占用：</p><p>LinkedList 的空间花费体现在它的 <strong>每一个元素都需要消耗更多的空间</strong>（因为要存放直接后继和直接前驱以及数据）。</p></div><div class="hint-container info"><p class="hint-container-title">使用场景：</p><p>在项目中一般是不会使用到 LinkedList，需要用到 LinkedList 的场景几乎都可以使用 ArrayList 来代替，并且性能通常会更好。</p></div><div class="hint-container tip"><p class="hint-container-title">常用方法</p></div><table><thead><tr><th style="text-align:left;">方法</th><th style="text-align:left;">描述</th></tr></thead><tbody><tr><td style="text-align:left;">boolean add(E e)</td><td style="text-align:left;">链表末尾添加元素</td></tr><tr><td style="text-align:left;">void add(int index, E element)</td><td style="text-align:left;">向指定位置插入元素</td></tr><tr><td style="text-align:left;">void addFirst(E e)</td><td style="text-align:left;">元素添加到头部</td></tr><tr><td style="text-align:left;">void addLast(E e)</td><td style="text-align:left;">元素添加到尾部</td></tr><tr><td style="text-align:left;">boolean remove(Object o)</td><td style="text-align:left;">删除某一元素</td></tr><tr><td style="text-align:left;">E remove(int index)</td><td style="text-align:left;">删除指定位置的元素</td></tr><tr><td style="text-align:left;">E removeFirst()</td><td style="text-align:left;">删除并返回第一个元素</td></tr><tr><td style="text-align:left;">E removeLast()</td><td style="text-align:left;">删除并返回最后一个元素</td></tr><tr><td style="text-align:left;">E get(int index)</td><td style="text-align:left;">返回指定位置的元素</td></tr><tr><td style="text-align:left;">E getFirst()</td><td style="text-align:left;">返回第一个元素</td></tr><tr><td style="text-align:left;">E getLast()</td><td style="text-align:left;">返回最后一个元素</td></tr><tr><td style="text-align:left;">int indexOf(Object o)</td><td style="text-align:left;">查找指定元素从前往后第一次出现的索引</td></tr><tr><td style="text-align:left;">int size()</td><td style="text-align:left;">返回链表元素个数</td></tr><tr><td style="text-align:left;">boolean contains(Object o)</td><td style="text-align:left;">判断是否含有某一元素</td></tr><tr><td style="text-align:left;">void clear()</td><td style="text-align:left;">清空链表</td></tr></tbody></table><h4 id="_2-1-3-vector" tabindex="-1"><a class="header-anchor" href="#_2-1-3-vector" aria-hidden="true">#</a> 2.1.3 Vector</h4><div class="hint-container info"><p class="hint-container-title">Vector 是 List 的古老实现类，底层数据结构为 Object[] 数组，是线程安全的（加了 synchronized 锁）。</p></div><h3 id="_2-2-set" tabindex="-1"><a class="header-anchor" href="#_2-2-set" aria-hidden="true">#</a> 2.2 Set</h3><p>Set 接口存储一组唯一，无序的对象。</p><p>无序性和不可重复性的含义：</p><ul><li><strong>无序性</strong>：不等于随机性，无序性是指存储的数据在底层数组中 <strong>并非按照数组索引的顺序添加</strong> ，而是 <strong>根据数据的哈希值决定的</strong>。</li><li><strong>不可重复性</strong>：添加的元素按照 <code>equals()</code> 判断时 ，返回 false，需要同时重写 <code>equals()</code> 方法和 <code>HashCode()</code> 方法。</li></ul><h4 id="_4-2-1-hashset" tabindex="-1"><a class="header-anchor" href="#_4-2-1-hashset" aria-hidden="true">#</a> 4.2.1 HashSet</h4><div class="hint-container info"><p class="hint-container-title">HashSet 是基于 HashMap 来实现的（key 为 Set 的元素，value 为空对象），所以 HashSet 的源码非常少，许多方法都是直接调用 HashMap 的。元素唯一，线程不安全。</p></div><div class="hint-container info"><p class="hint-container-title">底层数据结构：哈希表（基于HashMap实现）。</p></div><div class="hint-container info"><p class="hint-container-title">如何检查重复：</p><p>当把对象加入 HashSet 时，HashSet 会 <strong>先计算对象的 hashcode 值</strong> 来判断对象加入的位置，同时也会与其他加入的对象的 hashcode 值作比较：</p><ul><li>如果没有相符的 hashcode，HashSet 会假设对象没有重复出现；</li><li>但是如果发现有相同 hashcode 值的对象，这时会 <strong>调用 <code>equals()</code> 方法</strong> 来检查 hashcode 相等的对象是否真的相同。如果两者相同，HashSet 就不会让加入操作成功。</li></ul></div><div class="hint-container info"><p class="hint-container-title">应用场景：不需要保证元素插入和取出的顺序。</p></div><h4 id="_4-2-2-linkedhashset" tabindex="-1"><a class="header-anchor" href="#_4-2-2-linkedhashset" aria-hidden="true">#</a> 4.2.2 LinkedHashSet</h4><div class="hint-container info"><p class="hint-container-title">LinkedHashSet 是一个哈希表和链表的结合，所以具有 Set 集合不重复的特点，同时具有可预测的迭代顺序。有序，元素唯一，线程不安全。</p></div><div class="hint-container info"><p class="hint-container-title">应用场景：保证元素的插入和取出顺序满足 FIFO 的场景。</p></div><h4 id="_4-2-3-treeset" tabindex="-1"><a class="header-anchor" href="#_4-2-3-treeset" aria-hidden="true">#</a> 4.2.3 TreeSet</h4><div class="hint-container info"><p class="hint-container-title">底层数据结构：红黑树，元素有序，排序方式有自然排序和定制排序。元素唯一，线程不安全。</p></div><div class="hint-container info"><p class="hint-container-title">应用场景：支持对元素自定义排序规则的场景。</p></div><h3 id="_4-3-queue" tabindex="-1"><a class="header-anchor" href="#_4-3-queue" aria-hidden="true">#</a> 4.3 Queue</h3><p>Queue 是单端队列，只能从一端插入元素，另一端删除元素，实现上一般遵循 FIFO。</p><p>Queue 根据 <strong>因为容量问题而导致操作失败后处理方式的不同</strong> 可以分为两类方法：一种在操作失败后会 <strong>抛出异常</strong>，另一种则会 <strong>返回特殊值</strong>。</p><p>具体方法的对于处理方式如下：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072047110.png" alt="image-20230207204754422"></p><h4 id="_4-3-1-子接口-deque" tabindex="-1"><a class="header-anchor" href="#_4-3-1-子接口-deque" aria-hidden="true">#</a> 4.3.1 子接口 Deque</h4><div class="hint-container info"><p class="hint-container-title">Deque 扩展了 Queue 的接口，增加了在队首和队尾进行插入和删除的方法。同样根据失败后处理方式的不同分为两类：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072048228.png" alt="image-20230207204718224"></p></div><div class="hint-container info"><p class="hint-container-title">Deque 是双端队列，在队列的两端均可插入或删除元素，Deque 还提供有 push() 和 pop() 等其他方法，可用于模拟栈。</p></div><div class="hint-container info"><p class="hint-container-title">LinkedList 和 ArrayDeque 都是 Deque 的实现类，它们的区别如下：</p><ul><li>ArrayDeque 是基于 <strong>可变长的数组和双指针</strong> 来实现，而 LinkedList 则通过 <strong>链表</strong> 来实现；</li><li>ArrayDeque 不支持存储 NULL 数据，但 LinkedList 支持；</li><li>ArrayDeque 是在 JDK1.6 才被引入的，而 LinkedList 早在 JDK1.2 时就已经存在；</li><li>ArrayDeque 插入时可能存在扩容过程, 不过均摊后的插入操作依然为 O(1)。虽然 LinkedList 不需要扩容，但是每次插入数据时均需要申请新的堆空间，均摊性能相比更慢。</li><li>从性能的角度上，选用 ArrayDeque 来实现队列要比 LinkedList 更好。此外，ArrayDeque 也可以用于实现栈。</li></ul></div><h4 id="_4-3-2-priorityqueue" tabindex="-1"><a class="header-anchor" href="#_4-3-2-priorityqueue" aria-hidden="true">#</a> 4.3.2 PriorityQueue</h4><div class="hint-container info"><p class="hint-container-title">PriorityQueue 是在 JDK1.5 中被引入的，其与 Queue 的区别在于元素出队顺序是与优先级相关的，即总是优先级最高的元素先出队。PriorityQueue 利用了二叉堆的数据结构来实现的，底层使用可变长的数组来存储数据。</p></div><div class="hint-container info"><p class="hint-container-title">PriorityQueue 的特性：</p><ul><li>PriorityQueue 通过堆元素的上浮和下沉，实现了在 O(logn) 的时间复杂度内插入元素和删除堆顶元素；</li><li>PriorityQueue 是 <strong>非线程安全的</strong>，且不支持存储 NULL 和 non-comparable 的对象；</li><li>PriorityQueue 默认是小顶堆，但可以接收一个 Comparator 作为构造参数，从而来自定义元素优先级的先后；</li><li>PriorityQueue 的典型例题包括堆排序、求第K大的数、带权图的遍历等。</li></ul></div><h3 id="_4-4-collections-工具类" tabindex="-1"><a class="header-anchor" href="#_4-4-collections-工具类" aria-hidden="true">#</a> 4.4 Collections 工具类</h3><p><strong><code>Collections</code> 工具类常用方法</strong>：</p><ul><li>排序</li><li>查找，替换操作</li><li>同步控制（不推荐，需要线程安全的集合类型时请考虑使用 JUC 包下的并发集合）</li></ul><div class="hint-container info"><p class="hint-container-title">排序：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072057903.png" alt="image-20230207205659652"></p></div><div class="hint-container info"><p class="hint-container-title">查找、替换：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072059679.png" alt="image-20230207205901412"></p></div><div class="hint-container info"><p class="hint-container-title">同步控制：</p><ul><li><p>Collections 提供了多个 <code>synchronizedXxx()</code> 方法·，该方法可以将指定集合包装成线程同步的集合，从而解决多线程并发访问集合时的线程安全问题。HashSet、TreeSet、ArrayList、LinkedList、HashMap、TreeMap 都是线程不安全的。Collections 提供了多个静态方法可以把他们包装成线程同步的集合。</p></li><li><p>最好不要用下面这些方法，效率非常低，需要线程安全的集合类型时请考虑使用 JUC 包下的并发集合：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072100347.png" alt="image-20230207210027156"></p></li></ul></div><h2 id="_3-map" tabindex="-1"><a class="header-anchor" href="#_3-map" aria-hidden="true">#</a> 3. Map</h2><p>Map 接口存储一组键值对象，提供 key（键）到 value（值）的映射。</p><p>Map 的 key 不允许重复（<code>Map 的 keySet() 返回的是 key 的 Set 集合</code>），而 Map 的 value 值是可以重复的（<code>Map 的 values() 返回类型是 Collection</code>）。</p><p>Map 中的 key 组成一个Set集合，所以可以通过 <code>keySet() </code>方法返回所有 key，<code>values()</code> 方法返回所有 value。</p><p>Set 底层也是通过 Map 实现的，只不过 value 都是空对象的 Map。</p><h3 id="_3-1-hashmap" tabindex="-1"><a class="header-anchor" href="#_3-1-hashmap" aria-hidden="true">#</a> 3.1 HashMap</h3><p>HashMap 特性如下：</p><ul><li>key，value 都允许为 null，但 null 作为键只能有一个，null 作为值可以有多个；</li><li>线程不安全，因为线程安全问题，HashMap效率比 Hashtable 高；</li></ul><h4 id="_3-1-1-底层数据结构" tabindex="-1"><a class="header-anchor" href="#_3-1-1-底层数据结构" aria-hidden="true">#</a> 3.1.1 底层数据结构</h4><div class="hint-container tip"><p class="hint-container-title">JDK 1.7：数组+链表</p></div><p>JDK1.8 之前的 HashMap 通过 key 的 hashCode 经过扰动函数处理过后得到 hash 值，然后通过 <code>(n - 1) &amp; hash</code> 判断当前元素存放的位置（这里的 n 指的是数组的长度），如果当前位置存在元素的话，就判断该元素与要存入的元素的 hash 值以及 key 是否相同：</p><ul><li><p>如果相同的话，直接覆盖更新；</p></li><li><p><strong>不相同就通过拉链法解决冲突</strong>，如下图所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072117952.png" alt="image-20230207211728514"></p></li></ul><blockquote><p>扰动函数指的就是 HashMap 的 hash 方法。使用 hash 方法也就是扰动函数是为了防止一些实现比较差的 <code>hashCode()</code> 方法 换句话说使用扰动函数之后可以减少碰撞。</p></blockquote><div class="hint-container tip"><p class="hint-container-title">JDK 1.8：数组+链表+红黑树</p></div><p>JDK1.8 以后的 HashMap 在解决哈希冲突时有了较大的变化，当 <strong>链表长度大于阈值</strong>（默认为 8）（将链表转换成红黑树前会判断，如果当前数组的长度小于 64，那么会选择先进行数组扩容，而不是转换为红黑树）时，<strong>将链表转化为红黑树</strong>，以减少搜索时间。</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072133026.png" alt="image-20230207213356119"></p><p>因为红黑树是一颗自平衡的二叉查找树，查找效率高。由于平衡二叉树不能自平衡，调整所需的次数比红黑树多，所以采用红黑树。</p><h4 id="_3-1-2-初始容量和扩容大小" tabindex="-1"><a class="header-anchor" href="#_3-1-2-初始容量和扩容大小" aria-hidden="true">#</a> 3.1.2 初始容量和扩容大小</h4><div class="hint-container tip"><p class="hint-container-title">初始容量</p></div><p>创建时不指定容量：</p><ul><li>不指定容量时，<strong>不会初始化容量，只会初始化一个加载因子 loadFactor</strong>；</li><li><strong>当执行插入方法时，才会初始化容量，默认大小为 16</strong>；</li><li>之后 <strong>每次扩容时容量为原来的 2 倍</strong></li></ul><p>创建时指定容量：</p><ul><li>HashMap 会将其 <strong>扩充为 2 的幂次方大小</strong>；</li><li>若指定容量不是 2 的幂次方，则会向上寻找最近的 2 的幂次方大小的数</li></ul><div class="hint-container tip"><p class="hint-container-title">扩容大小</p></div><p>每次扩大到 <strong>原来容量的 2 倍</strong>，至于为什么每次扩容到原来的 2 倍，原因如下：</p><ul><li><p>原因一：要 <strong>维持容量为 2 的幂次方</strong>；</p></li><li><p>原因二：<strong>在扩容后进行 rehash（重新计算旧数组元素在新数组地址） 时可以尽可能的减少元素位置的移动</strong>。从下面一个简单的扩容示例可以看出，数组初始长度为 2 的幂次方，随后以 2 倍扩容的方式扩容，元素在新表中的位置要么不动，要么有规律的出现在新表中（二的幂次方偏移量），这样会使扩容的效率大大提高。</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072141745.png" alt="image-20230207214107459"></p></li></ul><div class="hint-container tip"><p class="hint-container-title">HashMap 的长度为什么是 2 的幂次方？</p></div><p>为了能让 HashMap 存取高效，尽量较少碰撞，也就是要尽量把数据分配均匀。</p><p>Hash 值的范围值 -2147483648 到 2147483647，前后加起来大概 40 亿的映射空间，只要哈希函数映射得比较均匀松散，一般应用是很难出现碰撞的。</p><p>但问题是一个 40 亿长度的数组，内存是放不下的，所以这个散列值是不能直接拿来用的。用之前还要 <strong>先做对数组的长度取模运算，得到的余数才能用来要存放的位置也就是对应的数组下标</strong>。这个数组下标的计算方法是 <code>(n - 1) &amp; hash</code>（n 代表数组长度）。</p><p><code>(n - 1) &amp; hash</code> 的设计：</p><ul><li>我们首先可能会想到采用 % 取余的操作来实现。但是 <strong>取余 (%) 操作中如果除数是 2 的幂次，则等价于与其除数减一的与 (&amp;) 操作</strong>（也就是说 <code>hash % length == hash &amp; (length - 1)</code> 的前提是 length 是 2 的 n 次方）；</li><li>采用二进制位操作 &amp;，相对于 % 能够提高运算效率；</li><li>这就解释了 HashMap 的长度为什么是 2 的幂次方。</li></ul><p>除了使用 &amp; 更加高效外，最重要的是 <strong>使用（n - 1）&amp; hash 得到的下标位置可以均匀的散布在数组中，减少哈希冲突</strong>。 ‌n 若是 2 的幂次方，则 n-1 的二进制就是 <code>11111***111</code> 这样的形式，那么 (n-1) 与 hash 进行位运算不仅效率很高，而且能均匀的散列，因为 1 只有和 1 进行 &amp; 运算时结果才为 1，所以 <strong>只有哈希值的 1 的位置都相同时，才会出现哈希冲突</strong>。</p><p>就拿数组长度为 4 来说，4 - 1 = 3 的二进制为 011：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072148618.png" alt="image-20230207214823497"></p><h4 id="_3-1-3-何时扩容" tabindex="-1"><a class="header-anchor" href="#_3-1-3-何时扩容" aria-hidden="true">#</a> 3.1.3 何时扩容</h4><p><strong>loadFactor 加载因子</strong>：</p><ul><li><p>loadFactor 加载因子是 <strong>控制数组存放数据的疏密程度</strong>，loadFactor 越趋近于 1，那么数组中存放的数据 (entry) 也就越多，也就越密，也就是会让链表的长度增加，loadFactor 越小，也就是趋近于 0，数组中存放的数据 (entry) 也就越少，也就越稀疏。</p></li><li><p>loadFactor <strong>太大导致查找元素效率低，太小导致数组的利用率低，存放的数据会很分散</strong>。loadFactor 的默认值为 0.75f 是官方给出的一个比较好的临界值。</p></li><li><p>给定的默认容量为 16，负载因子为 0.75。Map 在使用过程中不断的往里面存放数据，<strong>当数量达到了 16 * 0.75 = 12</strong> 就需要将当前 16 的容量进行扩容，而扩容这个过程涉及到 rehash、复制数据等操作，所以非常消耗性能。</p></li></ul><p><strong>threshold</strong>：</p><ul><li><code>threshold = capacity * loadFactor</code>，当 Size &gt;= threshold 的时候，那么就要考虑对数组的扩增了，也就是说，这个的意思就是 <strong>衡量数组是否需要扩增的一个标准</strong>。</li></ul><p>扩容后，会重新计算每个元素的 hash 值，使每个元素尽量放在原本的位置上。所以扩容会遍历所有元素，十分耗时。</p><p>不管是链表还是红黑树，都会进行 rehash，相当于重新 put 进 Map 中，该形成链表形成链表，该转为红黑树转为红黑树。</p><h4 id="_3-1-4-put-过程" tabindex="-1"><a class="header-anchor" href="#_3-1-4-put-过程" aria-hidden="true">#</a> 3.1.4 put() 过程</h4><ol><li>首先判断数组是否为空或者长度是否为 0，是则先进行初始的扩容，<strong>默认大小为 16</strong>。</li><li>然后定位到的数组位置，若没有元素则直接插入。</li><li>如果定位到的数组位置有元素，则有如下步骤： <ul><li>如果 key 相同，说明是更新元素，则直接覆盖；</li><li>如果 key 不同，说明哈希冲突了，则判断 p 是否为一个树节点： <ul><li>如果是则将元素添加到红黑树上；</li><li>如果不是则遍历链表，插入到链表尾部；</li></ul></li></ul></li></ol><p>详细过程如下图所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302072211375.png" alt="image-20230207221137230"></p><h4 id="_3-1-5-get-过程" tabindex="-1"><a class="header-anchor" href="#_3-1-5-get-过程" aria-hidden="true">#</a> 3.1.5 get() 过程</h4><ol><li>首先根据 hash 方法获取到 key 的 hash 值，然后通过 <code>hash &amp; (len - 1)</code> 获取 key 所对应的 Node 数组下标；</li><li>首先判断此结点是否为空，是则返回空；是否就是要找的值，若是则直接返回该值；否则进入第二个结点；</li><li>接着判断第二个结点是否为空，是则返回空，不是则判断此时数据结构是链表还是红黑树；</li><li>链表结构进行顺序遍历查找操作，满足条件则直接返回该结点。链表遍历完都没有找到则返回空；</li><li>红黑树结构则执行相应的 getTreeNode( ) 查找操作。</li></ol><h3 id="_3-2-hashtable" tabindex="-1"><a class="header-anchor" href="#_3-2-hashtable" aria-hidden="true">#</a> 3.2 Hashtable</h3><p>Hashtable 特性如下：</p><ul><li>底层数据结构：<strong>数组+链表</strong>；</li><li><strong>线程安全</strong>（方法都经过 synchronized 修饰）；</li><li>Hashtable 不允许有 null 键和 null 值，否则会抛出 NullPointerException；</li><li>基本被淘汰，不要在代码中使用</li></ul><p>实现线程安全的方式：</p><ul><li><p>使用 synchronized 来保证线程安全，因为是全局锁，<strong>效率非常低</strong>；</p></li><li><p>当一个线程访问同步方法时，其他线程也访问同步方法，可能会进入阻塞或轮询状态。如使用 put 添加元素，另一个线程不能使用 put 添加元素，也不能使用 get，竞争越激烈效率越低。</p></li></ul><p>初始容量和扩容大小：</p><ul><li>创建时不指定容量：默认大小为 11，之后每次扩容时容量为原来的 2n+1；</li><li>创建时指定容量：Hashtable 直接使用给定的大小。</li></ul><h3 id="_3-3-treemap" tabindex="-1"><a class="header-anchor" href="#_3-3-treemap" aria-hidden="true">#</a> 3.3 TreeMap</h3><p>TreeMap 特性如下：</p><ul><li><p>底层数据结构：<strong>红黑树</strong>；</p></li><li><p>TreeMap 和 HashMap 都继承自AbstractMap ，但是 TreeMap 还实现了 NavigableMap 接口和 SortedMap 接口：</p><ul><li>实现 NavigableMap 接口让 TreeMap 有了 <strong>对集合内元素的搜索的能力</strong>。例如：返回集合中小于大于某一值的元素等类似操作；</li><li>实现 SortedMap 接口让 TreeMap 有了 <strong>对集合中的元素根据键排序的能力</strong>。默认是按 key 的升序排序，不过我们也可以指定排序的比较器。</li></ul></li></ul>',120);function f(y,v){const e=d("router-link");return s(),r("div",null,[t("details",h,[p,t("nav",u,[t("ul",null,[t("li",null,[i(e,{to:"#_1-集合概念"},{default:a(()=>[n("1. 集合概念")]),_:1})]),t("li",null,[i(e,{to:"#_2-collection"},{default:a(()=>[n("2. Collection")]),_:1}),t("ul",null,[t("li",null,[i(e,{to:"#_2-1-list"},{default:a(()=>[n("2.1 List")]),_:1})]),t("li",null,[i(e,{to:"#_2-2-set"},{default:a(()=>[n("2.2 Set")]),_:1})]),t("li",null,[i(e,{to:"#_4-3-queue"},{default:a(()=>[n("4.3 Queue")]),_:1})]),t("li",null,[i(e,{to:"#_4-4-collections-工具类"},{default:a(()=>[n("4.4 Collections 工具类")]),_:1})])])]),t("li",null,[i(e,{to:"#_3-map"},{default:a(()=>[n("3. Map")]),_:1}),t("ul",null,[t("li",null,[i(e,{to:"#_3-1-hashmap"},{default:a(()=>[n("3.1 HashMap")]),_:1})]),t("li",null,[i(e,{to:"#_3-2-hashtable"},{default:a(()=>[n("3.2 Hashtable")]),_:1})]),t("li",null,[i(e,{to:"#_3-3-treemap"},{default:a(()=>[n("3.3 TreeMap")]),_:1})])])])])])]),g])}const x=l(c,[["render",f],["__file","集合入门.html.vue"]]);export{x as default};
