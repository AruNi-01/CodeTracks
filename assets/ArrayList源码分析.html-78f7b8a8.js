const n=JSON.parse(`{"key":"v-3cabc5e3","path":"/studynotes/java/collection/ArrayList%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90.html","title":"ArrayList 源码分析","lang":"zh-CN","frontmatter":{"title":"ArrayList 源码分析","date":"2023-2-8","order":2,"icon":"write","category":["Java"],"tag":["集合"],"sticky":false,"star":false,"article":true,"timeline":true,"description":"本文内容 1. 介绍 ArrayList = Array + List，即数组 + 列表，它的底层是通过 数组 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 动态扩容。 2. 源码分析 2.1 初始化 先把初始化有关的源码搬出来： public class ArrayList&lt;E&gt; extends AbstractList&lt;E&gt; implements List&lt;E&gt;, RandomAccess, Cloneable, java.io.Serializable { /** * 默认初始容量大小 */ private static final int DEFAULT_CAPACITY = 10; /** * 空数组（用于空实例）。 */ private static final Object[] EMPTY_ELEMENTDATA = {}; // 用于默认大小空实例的共享空数组实例。 // 我们将其与 EMPTY_ELEMENTDATA 区分开来，以知道在添加第一个元素时容量需要增加多少。 private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {}; /** * 保存 ArrayList 数据的数组 */ transient Object[] elementData; // non-private to simplify nested class access /** * ArrayList 所包含的元素个数 */ private int size; /** * 带初始容量参数的构造函数（用户可以在创建 ArrayList 对象时自己指定集合的初始大小） */ public ArrayList(int initialCapacity) { if (initialCapacity &gt; 0) { this.elementData = new Object[initialCapacity]; } else if (initialCapacity == 0) { this.elementData = EMPTY_ELEMENTDATA; } else { throw new IllegalArgumentException(\\"Illegal Capacity: \\"+ initialCapacity); } } /** * 默认无参构造函数：构造一个初始化容量为 10 的空列表，当添加第一个元素的时候数组容量才变成 10 */ public ArrayList() { this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA; } /** * 构造一个包含指定集合的元素的列表，按照它们由集合的迭代器返回的顺序。 */ public ArrayList(Collection&lt;? extends E&gt; c) { Object[] a = c.toArray(); if ((size = a.length) != 0) { if (c.getClass() == ArrayList.class) { elementData = a; } else { elementData = Arrays.copyOf(a, size, Object[].class); } } else { // replace with empty array. elementData = EMPTY_ELEMENTDATA; } } /** * 修改 ArrayList 实例的容量为列表的当前大小，此操作可最大程度地减少 ArrayList 实例的存储空间。 */ public void trimToSize() { modCount++; if (size &lt; elementData.length) { elementData = (size == 0) ? EMPTY_ELEMENTDATA : Arrays.copyOf(elementData, size); } } // ...... }","head":[["meta",{"property":"og:url","content":"https://aruni.me/docs/studynotes/java/collection/ArrayList%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90.html"}],["meta",{"property":"og:site_name","content":"AruNi's domain"}],["meta",{"property":"og:title","content":"ArrayList 源码分析"}],["meta",{"property":"og:description","content":"本文内容 1. 介绍 ArrayList = Array + List，即数组 + 列表，它的底层是通过 数组 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 动态扩容。 2. 源码分析 2.1 初始化 先把初始化有关的源码搬出来： public class ArrayList&lt;E&gt; extends AbstractList&lt;E&gt; implements List&lt;E&gt;, RandomAccess, Cloneable, java.io.Serializable { /** * 默认初始容量大小 */ private static final int DEFAULT_CAPACITY = 10; /** * 空数组（用于空实例）。 */ private static final Object[] EMPTY_ELEMENTDATA = {}; // 用于默认大小空实例的共享空数组实例。 // 我们将其与 EMPTY_ELEMENTDATA 区分开来，以知道在添加第一个元素时容量需要增加多少。 private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {}; /** * 保存 ArrayList 数据的数组 */ transient Object[] elementData; // non-private to simplify nested class access /** * ArrayList 所包含的元素个数 */ private int size; /** * 带初始容量参数的构造函数（用户可以在创建 ArrayList 对象时自己指定集合的初始大小） */ public ArrayList(int initialCapacity) { if (initialCapacity &gt; 0) { this.elementData = new Object[initialCapacity]; } else if (initialCapacity == 0) { this.elementData = EMPTY_ELEMENTDATA; } else { throw new IllegalArgumentException(\\"Illegal Capacity: \\"+ initialCapacity); } } /** * 默认无参构造函数：构造一个初始化容量为 10 的空列表，当添加第一个元素的时候数组容量才变成 10 */ public ArrayList() { this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA; } /** * 构造一个包含指定集合的元素的列表，按照它们由集合的迭代器返回的顺序。 */ public ArrayList(Collection&lt;? extends E&gt; c) { Object[] a = c.toArray(); if ((size = a.length) != 0) { if (c.getClass() == ArrayList.class) { elementData = a; } else { elementData = Arrays.copyOf(a, size, Object[].class); } } else { // replace with empty array. elementData = EMPTY_ELEMENTDATA; } } /** * 修改 ArrayList 实例的容量为列表的当前大小，此操作可最大程度地减少 ArrayList 实例的存储空间。 */ public void trimToSize() { modCount++; if (size &lt; elementData.length) { elementData = (size == 0) ? EMPTY_ELEMENTDATA : Arrays.copyOf(elementData, size); } } // ...... }"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-02-12T15:24:23.000Z"}],["meta",{"property":"article:tag","content":"集合"}],["meta",{"property":"article:published_time","content":"2023-02-08T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2023-02-12T15:24:23.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"ArrayList 源码分析\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2023-02-08T00:00:00.000Z\\",\\"dateModified\\":\\"2023-02-12T15:24:23.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"1. 介绍","slug":"_1-介绍","link":"#_1-介绍","children":[]},{"level":2,"title":"2. 源码分析","slug":"_2-源码分析","link":"#_2-源码分析","children":[{"level":3,"title":"2.1 初始化","slug":"_2-1-初始化","link":"#_2-1-初始化","children":[]},{"level":3,"title":"2.2 插入","slug":"_2-2-插入","link":"#_2-2-插入","children":[]},{"level":3,"title":"2.3 删除","slug":"_2-3-删除","link":"#_2-3-删除","children":[]},{"level":3,"title":"2.4 扩容机制","slug":"_2-4-扩容机制","link":"#_2-4-扩容机制","children":[]},{"level":3,"title":"2.5 System.arraycopy() 和 Arrays.copyOf()","slug":"_2-5-system-arraycopy-和-arrays-copyof","link":"#_2-5-system-arraycopy-和-arrays-copyof","children":[]}]},{"level":2,"title":"3. 参考文章","slug":"_3-参考文章","link":"#_3-参考文章","children":[]}],"git":{"createdTime":1675866314000,"updatedTime":1676215463000,"contributors":[{"name":"AruNi-01","email":"1298911600@qq.com","commits":2}]},"readingTime":{"minutes":9.98,"words":2995},"filePathRelative":"studynotes/java/collection/ArrayList源码分析.md","localizedDate":"2023年2月8日","excerpt":"<details class=\\"hint-container details\\"><summary>本文内容</summary>\\n\\n</details>\\n<h2> 1. 介绍</h2>\\n<p>ArrayList = Array + List，即数组 + 列表，它的底层是通过 <strong>数组</strong> 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 <strong>动态扩容</strong>。</p>\\n<h2> 2. 源码分析</h2>\\n<h3> 2.1 初始化</h3>\\n<p>先把初始化有关的源码搬出来：</p>\\n<div class=\\"language-java line-numbers-mode\\" data-ext=\\"java\\"><pre class=\\"language-java\\"><code><span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">class</span> <span class=\\"token class-name\\">ArrayList</span><span class=\\"token generics\\"><span class=\\"token punctuation\\">&lt;</span><span class=\\"token class-name\\">E</span><span class=\\"token punctuation\\">&gt;</span></span> <span class=\\"token keyword\\">extends</span> <span class=\\"token class-name\\">AbstractList</span><span class=\\"token generics\\"><span class=\\"token punctuation\\">&lt;</span><span class=\\"token class-name\\">E</span><span class=\\"token punctuation\\">&gt;</span></span>\\n        <span class=\\"token keyword\\">implements</span> <span class=\\"token class-name\\">List</span><span class=\\"token generics\\"><span class=\\"token punctuation\\">&lt;</span><span class=\\"token class-name\\">E</span><span class=\\"token punctuation\\">&gt;</span></span><span class=\\"token punctuation\\">,</span> <span class=\\"token class-name\\">RandomAccess</span><span class=\\"token punctuation\\">,</span> <span class=\\"token class-name\\">Cloneable</span><span class=\\"token punctuation\\">,</span> <span class=\\"token class-name\\"><span class=\\"token namespace\\">java<span class=\\"token punctuation\\">.</span>io<span class=\\"token punctuation\\">.</span></span>Serializable</span>\\n<span class=\\"token punctuation\\">{</span>\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 默认初始容量大小\\n     */</span>\\n    <span class=\\"token keyword\\">private</span> <span class=\\"token keyword\\">static</span> <span class=\\"token keyword\\">final</span> <span class=\\"token keyword\\">int</span> <span class=\\"token constant\\">DEFAULT_CAPACITY</span> <span class=\\"token operator\\">=</span> <span class=\\"token number\\">10</span><span class=\\"token punctuation\\">;</span>\\n\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 空数组（用于空实例）。\\n     */</span>\\n    <span class=\\"token keyword\\">private</span> <span class=\\"token keyword\\">static</span> <span class=\\"token keyword\\">final</span> <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span><span class=\\"token punctuation\\">]</span> <span class=\\"token constant\\">EMPTY_ELEMENTDATA</span> <span class=\\"token operator\\">=</span> <span class=\\"token punctuation\\">{</span><span class=\\"token punctuation\\">}</span><span class=\\"token punctuation\\">;</span>\\n\\n    <span class=\\"token comment\\">// 用于默认大小空实例的共享空数组实例。</span>\\n    <span class=\\"token comment\\">// 我们将其与 EMPTY_ELEMENTDATA 区分开来，以知道在添加第一个元素时容量需要增加多少。</span>\\n    <span class=\\"token keyword\\">private</span> <span class=\\"token keyword\\">static</span> <span class=\\"token keyword\\">final</span> <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span><span class=\\"token punctuation\\">]</span> <span class=\\"token constant\\">DEFAULTCAPACITY_EMPTY_ELEMENTDATA</span> <span class=\\"token operator\\">=</span> <span class=\\"token punctuation\\">{</span><span class=\\"token punctuation\\">}</span><span class=\\"token punctuation\\">;</span>\\n\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 保存 ArrayList 数据的数组\\n     */</span>\\n    <span class=\\"token keyword\\">transient</span> <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span><span class=\\"token punctuation\\">]</span> elementData<span class=\\"token punctuation\\">;</span> <span class=\\"token comment\\">// non-private to simplify nested class access</span>\\n\\n   <span class=\\"token doc-comment comment\\">/**\\n     * ArrayList 所包含的元素个数\\n     */</span>\\n    <span class=\\"token keyword\\">private</span> <span class=\\"token keyword\\">int</span> size<span class=\\"token punctuation\\">;</span>\\n\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 带初始容量参数的构造函数（用户可以在创建 ArrayList 对象时自己指定集合的初始大小）\\n     */</span>\\n    <span class=\\"token keyword\\">public</span> <span class=\\"token class-name\\">ArrayList</span><span class=\\"token punctuation\\">(</span><span class=\\"token keyword\\">int</span> initialCapacity<span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        <span class=\\"token keyword\\">if</span> <span class=\\"token punctuation\\">(</span>initialCapacity <span class=\\"token operator\\">&gt;</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n            <span class=\\"token keyword\\">this</span><span class=\\"token punctuation\\">.</span>elementData <span class=\\"token operator\\">=</span> <span class=\\"token keyword\\">new</span> <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span>initialCapacity<span class=\\"token punctuation\\">]</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token punctuation\\">}</span> <span class=\\"token keyword\\">else</span> <span class=\\"token keyword\\">if</span> <span class=\\"token punctuation\\">(</span>initialCapacity <span class=\\"token operator\\">==</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n            <span class=\\"token keyword\\">this</span><span class=\\"token punctuation\\">.</span>elementData <span class=\\"token operator\\">=</span> <span class=\\"token constant\\">EMPTY_ELEMENTDATA</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token punctuation\\">}</span> <span class=\\"token keyword\\">else</span> <span class=\\"token punctuation\\">{</span>\\n            <span class=\\"token keyword\\">throw</span> <span class=\\"token keyword\\">new</span> <span class=\\"token class-name\\">IllegalArgumentException</span><span class=\\"token punctuation\\">(</span><span class=\\"token string\\">\\"Illegal Capacity: \\"</span><span class=\\"token operator\\">+</span>\\n                                               initialCapacity<span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token punctuation\\">}</span>\\n    <span class=\\"token punctuation\\">}</span>\\n\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 默认无参构造函数：构造一个初始化容量为 10 的空列表，当添加第一个元素的时候数组容量才变成 10\\n     */</span>\\n    <span class=\\"token keyword\\">public</span> <span class=\\"token class-name\\">ArrayList</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        <span class=\\"token keyword\\">this</span><span class=\\"token punctuation\\">.</span>elementData <span class=\\"token operator\\">=</span> <span class=\\"token constant\\">DEFAULTCAPACITY_EMPTY_ELEMENTDATA</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token punctuation\\">}</span>\\n\\n    <span class=\\"token doc-comment comment\\">/**\\n     * 构造一个包含指定集合的元素的列表，按照它们由集合的迭代器返回的顺序。\\n     */</span>\\n    <span class=\\"token keyword\\">public</span> <span class=\\"token class-name\\">ArrayList</span><span class=\\"token punctuation\\">(</span><span class=\\"token class-name\\">Collection</span><span class=\\"token generics\\"><span class=\\"token punctuation\\">&lt;</span><span class=\\"token operator\\">?</span> <span class=\\"token keyword\\">extends</span> <span class=\\"token class-name\\">E</span><span class=\\"token punctuation\\">&gt;</span></span> c<span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span><span class=\\"token punctuation\\">]</span> a <span class=\\"token operator\\">=</span> c<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">toArray</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token keyword\\">if</span> <span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">(</span>size <span class=\\"token operator\\">=</span> a<span class=\\"token punctuation\\">.</span>length<span class=\\"token punctuation\\">)</span> <span class=\\"token operator\\">!=</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n            <span class=\\"token keyword\\">if</span> <span class=\\"token punctuation\\">(</span>c<span class=\\"token punctuation\\">.</span><span class=\\"token function\\">getClass</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span> <span class=\\"token operator\\">==</span> <span class=\\"token class-name\\">ArrayList</span><span class=\\"token punctuation\\">.</span><span class=\\"token keyword\\">class</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n                elementData <span class=\\"token operator\\">=</span> a<span class=\\"token punctuation\\">;</span>\\n            <span class=\\"token punctuation\\">}</span> <span class=\\"token keyword\\">else</span> <span class=\\"token punctuation\\">{</span>\\n                elementData <span class=\\"token operator\\">=</span> <span class=\\"token class-name\\">Arrays</span><span class=\\"token punctuation\\">.</span><span class=\\"token function\\">copyOf</span><span class=\\"token punctuation\\">(</span>a<span class=\\"token punctuation\\">,</span> size<span class=\\"token punctuation\\">,</span> <span class=\\"token class-name\\">Object</span><span class=\\"token punctuation\\">[</span><span class=\\"token punctuation\\">]</span><span class=\\"token punctuation\\">.</span><span class=\\"token keyword\\">class</span><span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n            <span class=\\"token punctuation\\">}</span>\\n        <span class=\\"token punctuation\\">}</span> <span class=\\"token keyword\\">else</span> <span class=\\"token punctuation\\">{</span>\\n            <span class=\\"token comment\\">// replace with empty array.</span>\\n            elementData <span class=\\"token operator\\">=</span> <span class=\\"token constant\\">EMPTY_ELEMENTDATA</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token punctuation\\">}</span>\\n    <span class=\\"token punctuation\\">}</span>\\n    \\n    <span class=\\"token doc-comment comment\\">/**\\n     * 修改 ArrayList 实例的容量为列表的当前大小，此操作可最大程度地减少 ArrayList 实例的存储空间。\\n     */</span>\\n    <span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">void</span> <span class=\\"token function\\">trimToSize</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        modCount<span class=\\"token operator\\">++</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token keyword\\">if</span> <span class=\\"token punctuation\\">(</span>size <span class=\\"token operator\\">&lt;</span> elementData<span class=\\"token punctuation\\">.</span>length<span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n            elementData <span class=\\"token operator\\">=</span> <span class=\\"token punctuation\\">(</span>size <span class=\\"token operator\\">==</span> <span class=\\"token number\\">0</span><span class=\\"token punctuation\\">)</span>\\n              <span class=\\"token operator\\">?</span> <span class=\\"token constant\\">EMPTY_ELEMENTDATA</span>\\n              <span class=\\"token operator\\">:</span> <span class=\\"token class-name\\">Arrays</span><span class=\\"token punctuation\\">.</span><span class=\\"token function\\">copyOf</span><span class=\\"token punctuation\\">(</span>elementData<span class=\\"token punctuation\\">,</span> size<span class=\\"token punctuation\\">)</span><span class=\\"token punctuation\\">;</span>\\n        <span class=\\"token punctuation\\">}</span>\\n    <span class=\\"token punctuation\\">}</span>\\n    \\n    <span class=\\"token comment\\">// ......</span>\\n<span class=\\"token punctuation\\">}</span>\\n</code></pre><div class=\\"line-numbers\\" aria-hidden=\\"true\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div>","autoDesc":true}`);export{n as data};
