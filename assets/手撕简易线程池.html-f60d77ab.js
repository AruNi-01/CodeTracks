import{_ as c}from"./plugin-vue_export-helper-c27b6911.js";import{r as o,o as i,c as l,b as n,e as a,w as p,d as s,a as u}from"./app-7ee45750.js";const k={},r={class:"hint-container details"},d=n("summary",null,"本文内容",-1),v={class:"table-of-contents"},m={class:"hint-container info"},b=n("p",{class:"hint-container-title"},"前言",-1),w={href:"http://code.0x3f4.run/backend/java/concurrency/%E4%B8%BA%E4%BD%95%E6%8E%A8%E8%8D%90%E4%BD%BF%E7%94%A8%E7%BA%BF%E7%A8%8B%E6%B1%A0.html",target:"_blank",rel:"noopener noreferrer"},y=n("p",null,"我会从一个最简单的版本开始，一步步找出问题，然后提出解决思路，最后编码实现，最后完成一个基本功能完备的线程池。",-1),h={href:"https://github.com/AruNi-01/JavaConcurrency/tree/master/src/main/java/com/run/threadpool",target:"_blank",rel:"noopener noreferrer"},T=u(`<h2 id="_1-定义线程池接口" tabindex="-1"><a class="header-anchor" href="#_1-定义线程池接口" aria-hidden="true">#</a> 1. 定义线程池接口</h2><p>首先定义一个 <strong>线程池接口</strong>，向外表明该线程池提供了哪些功能，这也符合面向接口编程的思想。</p><p>一个 <strong>简单的线程池只需要具备如下几点功能</strong>：</p><ul><li>向线程池中 <strong>添加任务并执行</strong>；</li><li>设置线程池饱和时的 <strong>拒绝策略</strong>；</li><li><strong>关闭线程池</strong>。</li></ul><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 线程池接口
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 添加任务并执行</span>
    <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 优雅关闭，等待已添加的任务执行完毕后再关闭</span>
    <span class="token keyword">void</span> <span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_2-线程池的简单实现" tabindex="-1"><a class="header-anchor" href="#_2-线程池的简单实现" aria-hidden="true">#</a> 2. 线程池的简单实现</h2><p>接下来定义一个线程池接口的简单实现类，实现基础功能。不过在这之前，肯定需要定义一个 <strong>工作线程</strong>，用于 <strong>执行任务</strong>，不然线程池中放什么呢？</p><h3 id="_2-1-定义工作线程" tabindex="-1"><a class="header-anchor" href="#_2-1-定义工作线程" aria-hidden="true">#</a> 2.1 定义工作线程</h3><p>最简单的工作线程无非就是 <strong>从任务队列中取出任务来执行</strong>，所以我们定义一个任务队列，让线程从中不断取任务执行即可。</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 工作线程
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token annotation punctuation">@Deprecated</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span><span class="token punctuation">{</span>

    <span class="token comment">// 任务队列（阻塞）</span>
    <span class="token keyword">private</span> <span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 构造函数，将 taskQueue 注入进来，方便从中取任务执行
     * <span class="token keyword">@param</span> <span class="token parameter">taskQueue</span> 任务队列
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>taskQueue <span class="token operator">=</span> taskQueue<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 重写 run 方法，让线程执行时从任务队列中取任务执行
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
        <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
                <span class="token comment">// take()：阻塞直到从队列中取到任务</span>
                <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">为什么要用阻塞队列？</p><ul><li>如果使用非阻塞队列，那么任务队列为空时，线程只能通过 <strong>轮询/间断轮询来获取新任务</strong>，是有 <strong>资源消耗和延迟</strong> 的；</li><li>可以在非阻塞队列的基础上，实现一个 <strong>阻塞/唤醒机制</strong>，但会带来更多的编码。</li></ul></div><h3 id="_2-2-简易线程池" tabindex="-1"><a class="header-anchor" href="#_2-2-简易线程池" aria-hidden="true">#</a> 2.2 简易线程池</h3><p>为了实现线程池，我们需要定义如下几个变量：</p><ul><li><code>initialSize</code>：线程池初始化的线程数量；</li><li><code>taskQueue</code>：阻塞的任务队列，用于存放任务；</li><li><code>threads</code>：存放所有工作线程的集合；</li><li><code>isShutdown</code>：标志线程池是否已关闭。</li></ul><p>由于 WorkerThread 类属于线程池，所以可以使用内部类，这样就不用传递 taskQueue 了，内部类中可以直接使用外部类的成员变量。</p><p>下面就是实现了 ThreadPool 接口的简易线程池了，：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 简易线程池实现类
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleThreadPool</span> <span class="token keyword">implements</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 初始化线程池时的线程数量</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> initialSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列（阻塞）</span>
    <span class="token keyword">private</span> <span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">;</span>

    <span class="token comment">// 存放工作线程的集合</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WorkerThread</span><span class="token punctuation">&gt;</span></span> workers<span class="token punctuation">;</span>

    <span class="token comment">// 标志线程池是否已关闭</span>
    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> isShutdown <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * 内部类，工作线程
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span> <span class="token punctuation">{</span>

        <span class="token doc-comment comment">/**
         * 重写 run 方法，让线程执行时从任务队列中取任务执行
         */</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token comment">// take()：阻塞直到从队列中取到任务</span>
                    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                    workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 线程数量
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>initialSize <span class="token operator">=</span> initialSize<span class="token punctuation">;</span>
        taskQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedBlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>initialSize<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 初始化线程池时，创建并调用 start 方法启动工作线程</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> initialSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加任务并执行，由于使用了阻塞队列，因此无需通知工作线程
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 线程池已关闭后，不允许再添加任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>isShutdown<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token string">&quot;ThreadPool is shutdown.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 关闭线程池（优雅）：
     * 1. 修改 isShutdown 标志；
     * 2. 遍历所有工作线程，中断它们（interrupt() 方法并不会立即执行中断，取决于其线程本身）
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        isShutdown <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">WorkerThread</span> thread <span class="token operator">:</span> workers<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            thread<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-3-测试" tabindex="-1"><a class="header-anchor" href="#_2-3-测试" aria-hidden="true">#</a> 2.3 测试</h3><p>进行一个简单的测试：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Test</span>
<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">testV1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
    <span class="token class-name">SimpleThreadPool</span> pool <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">10</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        pool<span class="token punctuation">.</span><span class="token function">execute</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&quot;: executing task...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span> 	<span class="token comment">// 主线程等待任务执行完毕</span>
    pool<span class="token punctuation">.</span><span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">/* 输出：
Thread-0: executing task...
Thread-1: executing task...
Thread-2: executing task...
Thread-1: executing task...
Thread-0: executing task...
Thread-1: executing task...
Thread-2: executing task...
Thread-1: executing task...
Thread-0: executing task...
Thread-2: executing task...
*/</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-优化-自定义线程池的基本参数" tabindex="-1"><a class="header-anchor" href="#_3-优化-自定义线程池的基本参数" aria-hidden="true">#</a> 3. 优化：自定义线程池的基本参数</h2><p>上面简易实现的线程池中，还存在如下问题：</p><ul><li><strong>没有指定任务队列的大小</strong>，如果有大量任务添加时，内存很快就会被用完，从而导致异常；</li><li>初始化线程池时 <strong>线程数量固定死</strong>，这样如果后续任务增多时，可能之前设置的线程数远远不够，造成性能问题；</li></ul><p>下面我们就来对线程池进行优化，可以做出如下调整：</p><ul><li>在构造器中增加任务队列的大小；</li><li>添加一些可动态调整线程数量的成员变量，例如最大线程数、核心线程数。我们参考 Java ThreadPool 的设计： <ul><li>当活跃线程数小于核心线程数时，启动一个新的工作线程来执行任务；</li><li>当活跃线程数大于核心线程数时，将任务添加到任务队列，等空闲的工作线程来执行；</li><li>当任务队列已满，且工作线程未达到最大线程数时，启动临时工作线程来执行任务；</li><li>当任务队列已满，且工作线程已达到最大线程数时，该任务不可执行。</li></ul></li></ul><p>优化后的 SimpleThreadPool 如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 简易线程池实现类
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleThreadPool</span> <span class="token keyword">implements</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 初始化线程池时的线程数量</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> initialSize<span class="token punctuation">;</span>

    <span class="token comment">// 核心线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">;</span>

    <span class="token comment">// 最大线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列大小</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列（阻塞）</span>
    <span class="token keyword">private</span> <span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">;</span>

    <span class="token comment">// 存放工作线程的集合</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WorkerThread</span><span class="token punctuation">&gt;</span></span> workers<span class="token punctuation">;</span>

    <span class="token comment">// 标志线程池是否已关闭</span>
    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> isShutdown <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>


    <span class="token doc-comment comment">/**
     * 内部类，工作线程
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span> <span class="token punctuation">{</span>

        <span class="token doc-comment comment">/**
         * 重写 run 方法，让线程执行时从任务队列中取任务执行
         */</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token comment">// take()：阻塞直到从队列中取到任务</span>
                    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                    workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>initialSize <span class="token operator">=</span> initialSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>coreSize <span class="token operator">=</span> coreSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>maxSize <span class="token operator">=</span> maxSize<span class="token punctuation">;</span>
        taskQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedBlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>queueSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>initialSize<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 初始化线程池时，创建并调用 start 方法启动工作线程</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> initialSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加任务并执行，由于使用了阻塞队列，因此无需通知工作线程
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 线程池已关闭后，不允许再添加任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>isShutdown<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token string">&quot;ThreadPool is shutdown.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 当前工作线程数 &lt; 核心线程数时，启动新的线程来执行任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> coreSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>    <span class="token comment">// check 任务队列是否已满，未满则添加进入，已满则进入分支</span>
            <span class="token comment">// 当前工作线程数 &lt; 最大线程数时，启动新的（临时）线程来执行任务</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> maxSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token string">&quot;Failed to execute. Too many tasks.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 启动新的工作线程，将任务放入队列中以执行
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">addWorkerThread</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 关闭线程池（优雅）：
     * 1. 修改 isShutdown 标志；
     * 2. 遍历所有工作线程，中断它们（interrupt() 方法并不会立即执行中断，取决于其线程本身）
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        isShutdown <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">WorkerThread</span> thread <span class="token operator">:</span> workers<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            thread<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_4-优化-饱和拒绝策略" tabindex="-1"><a class="header-anchor" href="#_4-优化-饱和拒绝策略" aria-hidden="true">#</a> 4. 优化：饱和拒绝策略</h2><p>限制了任务队列的大小，那么 <strong>当队列满时，且线程数量已达最大，还有任务到来</strong>，应该怎么办？</p><p>直接像上面那样，抛出一个异常，并不是一个最佳的方式，设计得并不够优雅。</p><p>此时我们可以设计一个 <strong>饱和拒绝策略</strong>，当无法执行该任务时，根据不同的拒绝策略来处理该任务。主要的策略有：</p><ul><li>直接抛出异常，也就是我们上面的做法（不推荐）；</li><li>忽略该任务；</li><li>阻塞当前线程；</li></ul><p>可以发现，拒绝策略可以有多种，因此使用接口来定义，让不同的策略去具体实现自己的逻辑。我们只需要在线程池实现类中提供一个拒绝策略的成员变量，让使用者传入具体的拒绝策略即可。</p><h3 id="_4-1-定义拒绝策略接口" tabindex="-1"><a class="header-anchor" href="#_4-1-定义拒绝策略接口" aria-hidden="true">#</a> 4.1 定义拒绝策略接口</h3><p>定义一个拒绝策略接口 RejectedExecutionHandler，提供一个拒绝执行的方法：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 饱和拒绝策略接口
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>

    <span class="token doc-comment comment">/**
     * 拒绝执行（任务）
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 被拒绝的任务
     * <span class="token keyword">@param</span> <span class="token parameter">pool</span> 哪个线程池拒绝
     */</span>
    <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">,</span> <span class="token class-name">ThreadPool</span> pool<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-2-abortpolicy" tabindex="-1"><a class="header-anchor" href="#_4-2-abortpolicy" aria-hidden="true">#</a> 4.2 AbortPolicy</h3><p>直接抛出异常的策略实现类：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 抛出异常策略
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AbortPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">,</span> <span class="token class-name">ThreadPool</span> pool<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span><span class="token string">&quot;Task queue is full and maximum number of threads has been reached&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-discardpolicy" tabindex="-1"><a class="header-anchor" href="#_4-3-discardpolicy" aria-hidden="true">#</a> 4.3 DiscardPolicy</h3><p>在实现一个丢弃策略：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 拒绝任务策略
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DiscardPolicy</span> <span class="token keyword">implements</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">rejectedExecution</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">,</span> <span class="token class-name">ThreadPool</span> pool<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 拒绝该任务，什么也不做</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Discard task: &quot;</span> <span class="token operator">+</span> task<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-4-simplethreadpool-中添加拒绝策略" tabindex="-1"><a class="header-anchor" href="#_4-4-simplethreadpool-中添加拒绝策略" aria-hidden="true">#</a> 4.4 SimpleThreadPool 中添加拒绝策略</h3><p>最后，在 SimpleThreadPool 中添加拒绝策略，完整代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 简易线程池实现类
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleThreadPool</span> <span class="token keyword">implements</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 初始化线程池时的线程数量</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> initialSize<span class="token punctuation">;</span>

    <span class="token comment">// 核心线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">;</span>

    <span class="token comment">// 最大线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列大小</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列（阻塞）</span>
    <span class="token keyword">private</span> <span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">;</span>

    <span class="token comment">// 存放工作线程的集合</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WorkerThread</span><span class="token punctuation">&gt;</span></span> workers<span class="token punctuation">;</span>

    <span class="token comment">// 标志线程池是否已关闭</span>
    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> isShutdown <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

    <span class="token comment">// 默认拒绝策略</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">static</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token constant">DEFAULT_REJECT_HANDLER</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AbortPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 拒绝策略</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">RejectedExecutionHandler</span> rejectedExecutionHandler<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 内部类，工作线程
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span> <span class="token punctuation">{</span>
        <span class="token doc-comment comment">/**
         * 重写 run 方法，让线程执行时从任务队列中取任务执行
         */</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token comment">// take()：阻塞直到从队列中取到任务</span>
                    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">take</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                    workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">(</span>initialSize<span class="token punctuation">,</span> coreSize<span class="token punctuation">,</span> maxSize<span class="token punctuation">,</span> queueSize<span class="token punctuation">,</span> <span class="token constant">DEFAULT_REJECT_HANDLER</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     * <span class="token keyword">@param</span> <span class="token parameter">rejectedHandler</span> 饱和拒绝策略
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">,</span> <span class="token class-name">RejectedExecutionHandler</span> rejectedHandler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>initialSize <span class="token operator">=</span> initialSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>coreSize <span class="token operator">=</span> coreSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>maxSize <span class="token operator">=</span> maxSize<span class="token punctuation">;</span>
        taskQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedBlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>queueSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>initialSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>rejectedExecutionHandler <span class="token operator">=</span> rejectedHandler<span class="token punctuation">;</span>

        <span class="token comment">// 初始化线程池时，创建并调用 start 方法启动工作线程</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> initialSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加任务并执行，由于使用了阻塞队列，因此无需通知工作线程
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 线程池已关闭后，不允许再添加任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>isShutdown<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token string">&quot;ThreadPool is shutdown.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 当前工作线程数 &lt; 核心线程数时，启动新的线程来执行任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> coreSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>    <span class="token comment">// check 任务队列是否已满，未满则添加进入，已满则进入分支</span>
            <span class="token comment">// 当前工作线程数 &lt; 最大线程数时，启动新的（临时）线程来执行任务</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> maxSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">// 使用饱和拒绝策略</span>
                rejectedExecutionHandler<span class="token punctuation">.</span><span class="token function">rejectedExecution</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 启动新的工作线程，将任务放入队列中以执行
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">addWorkerThread</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 关闭线程池（优雅）：
     * 1. 修改 isShutdown 标志；
     * 2. 遍历所有工作线程，中断它们（interrupt() 方法并不会立即执行中断，取决于其线程本身）
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        isShutdown <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">WorkerThread</span> thread <span class="token operator">:</span> workers<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            thread<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_5-优化-自调节工作线程数" tabindex="-1"><a class="header-anchor" href="#_5-优化-自调节工作线程数" aria-hidden="true">#</a> 5. 优化：自调节工作线程数</h2><p>我们在上面添加了一个最大线程数，当任务量增多时，可以启动一些临时线程来处理任务。</p><p>那么 <strong>当任务量消减回去时，这些临时的线程其实是可以销毁的</strong>，只保留核心线程即可，毕竟一直开启也比较消耗资源。</p><p>所以我们就需要动态的调节工作线程数，那怎么实现呢？</p><p>其实很简单，只需要给这些临时线程设置一个 <strong>存活时间</strong>，到时间后，把他们从工作线程集合中移除销毁即可。</p><p>为了判断某空闲是否已到达线程存活时间，需要在工作线程的 run 方法中 <strong>不断更新该线程最后一次执行任务的时间</strong>。</p><p>同时，我们需要利用阻塞队列的一个 <code>poll()</code> 方法，它可以接受一个最大阻塞时间的参数。</p><h3 id="_5-1-simplethreadpool-中添加空闲线程存活时间" tabindex="-1"><a class="header-anchor" href="#_5-1-simplethreadpool-中添加空闲线程存活时间" aria-hidden="true">#</a> 5.1 SimpleThreadPool 中添加空闲线程存活时间</h3><p>在 SimpleThreadPool 中添加空闲线程存活时间：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 简易线程池实现类
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleThreadPool</span> <span class="token keyword">implements</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 其他代码略</span>

    <span class="token comment">// 临时线程存活时间</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     * <span class="token keyword">@param</span> <span class="token parameter">keepAliveTime</span> 临时线程存活时间
     * <span class="token keyword">@param</span> <span class="token parameter">unit</span> 临时线程存活时间单位
     * <span class="token keyword">@param</span> <span class="token parameter">rejectedHandler</span> 饱和拒绝策略
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">,</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">,</span> <span class="token class-name">RejectedExecutionHandler</span> rejectedHandler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>initialSize <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token operator">||</span> coreSize <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token operator">||</span> maxSize <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token operator">||</span> maxSize <span class="token operator">&lt;</span> coreSize <span class="token operator">||</span> keepAliveTime <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>initialSize <span class="token operator">=</span> initialSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>coreSize <span class="token operator">=</span> coreSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>maxSize <span class="token operator">=</span> maxSize<span class="token punctuation">;</span>
        taskQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedBlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>queueSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>initialSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>keepAliveTime <span class="token operator">=</span> unit<span class="token punctuation">.</span><span class="token function">toNanos</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>rejectedExecutionHandler <span class="token operator">=</span> rejectedHandler<span class="token punctuation">;</span>

        <span class="token comment">// 初始化线程池时，创建并调用 start 方法启动工作线程</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> initialSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
	
    <span class="token comment">// 其他代码略</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-2-改造-workerthread" tabindex="-1"><a class="header-anchor" href="#_5-2-改造-workerthread" aria-hidden="true">#</a> 5.2 改造 WorkerThread</h3><p>重点在于 WorkerThread 的 run 方法，改造后如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>    <span class="token doc-comment comment">/**
     * 内部类，工作线程
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span> <span class="token punctuation">{</span>
        <span class="token doc-comment comment">/**
         * 重写 run 方法，让线程执行时从任务队列中取任务执行
         */</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 记录该工作线程最后执行任务的时间</span>
            <span class="token keyword">long</span> lastActiveTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token comment">// poll()：阻塞直到从队列中取到任务，或者到达超时时间</span>
                    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">.</span><span class="token constant">NANOSECONDS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                    <span class="token keyword">if</span> <span class="token punctuation">(</span>task <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;WorkerThread %s, executing task: %s\\n&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;My Task...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                        <span class="token comment">// 执行完任务后更新 lastActiveTime</span>
                        lastActiveTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span> coreSize <span class="token operator">&amp;&amp;</span>
                            <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> lastActiveTime <span class="token operator">&gt;=</span> keepAliveTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token comment">// 临时线程已到达存活时间，则从工作线程集合中移除，然后跳出循环</span>
                        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;Temp worker thread %s, exit workers queue\\n&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token keyword">break</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                    workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_6-simplethreadpool-最终版" tabindex="-1"><a class="header-anchor" href="#_6-simplethreadpool-最终版" aria-hidden="true">#</a> 6. SimpleThreadPool 最终版</h2><p>SimpleThreadPool 最后的代码如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token doc-comment comment">/**
 * <span class="token keyword">@desc</span>: 简易线程池实现类
 * <span class="token keyword">@author</span>: AruNi_Lu
 * <span class="token keyword">@date</span>: 2023-07-01
 */</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SimpleThreadPool</span> <span class="token keyword">implements</span> <span class="token class-name">ThreadPool</span> <span class="token punctuation">{</span>

    <span class="token comment">// 初始化线程池时的线程数量</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> initialSize<span class="token punctuation">;</span>

    <span class="token comment">// 核心线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">;</span>

    <span class="token comment">// 最大线程数</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列大小</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">;</span>

    <span class="token comment">// 任务队列（阻塞）</span>
    <span class="token keyword">private</span> <span class="token class-name">BlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Runnable</span><span class="token punctuation">&gt;</span></span> taskQueue<span class="token punctuation">;</span>

    <span class="token comment">// 存放工作线程的集合</span>
    <span class="token keyword">private</span> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">WorkerThread</span><span class="token punctuation">&gt;</span></span> workers<span class="token punctuation">;</span>

    <span class="token comment">// 标志线程池是否已关闭</span>
    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">boolean</span> isShutdown <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

    <span class="token comment">// 默认拒绝策略</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">static</span> <span class="token class-name">RejectedExecutionHandler</span> <span class="token constant">DEFAULT_REJECT_HANDLER</span> <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AbortPolicy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 拒绝策略</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">RejectedExecutionHandler</span> rejectedExecutionHandler<span class="token punctuation">;</span>

    <span class="token comment">// 临时线程存活时间</span>
    <span class="token keyword">private</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">;</span>

    <span class="token doc-comment comment">/**
     * 内部类，工作线程
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">WorkerThread</span> <span class="token keyword">extends</span> <span class="token class-name">Thread</span> <span class="token punctuation">{</span>
        <span class="token doc-comment comment">/**
         * 重写 run 方法，让线程执行时从任务队列中取任务执行
         */</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 记录该工作线程最后执行任务的时间</span>
            <span class="token keyword">long</span> lastActiveTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

            <span class="token comment">// 循环从 taskQueue 中取任务执行</span>
            <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isInterrupted</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">isEmpty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token comment">// poll()：阻塞直到从队列中取到任务，或者到达超时时间</span>
                    <span class="token class-name">Runnable</span> task <span class="token operator">=</span> taskQueue<span class="token punctuation">.</span><span class="token function">poll</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">.</span><span class="token constant">NANOSECONDS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                    <span class="token keyword">if</span> <span class="token punctuation">(</span>task <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;WorkerThread %s, executing task: %s\\n&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token string">&quot;My Task...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        task<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

                        <span class="token comment">// 执行完任务后更新 lastActiveTime</span>
                        lastActiveTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&gt;</span> coreSize <span class="token operator">&amp;&amp;</span>
                            <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">currentTimeMillis</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> lastActiveTime <span class="token operator">&gt;=</span> keepAliveTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token comment">// 临时线程已到达存活时间，则从工作线程集合中移除，然后跳出循环</span>
                        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;Temp worker thread %s, exit workers queue\\n&quot;</span><span class="token punctuation">,</span> <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">currentThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token keyword">break</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 当线程阻塞时，收到 interrupt 信号会抛出 InterruptedException，故在此捕获处理</span>
                    workers<span class="token punctuation">.</span><span class="token function">remove</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token keyword">break</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     * <span class="token keyword">@param</span> <span class="token parameter">keepAliveTime</span> 临时线程存活时间
     * <span class="token keyword">@param</span> <span class="token parameter">unit</span> 临时线程存活时间单位
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">,</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">(</span>initialSize<span class="token punctuation">,</span> coreSize<span class="token punctuation">,</span> maxSize<span class="token punctuation">,</span> queueSize<span class="token punctuation">,</span> keepAliveTime<span class="token punctuation">,</span> unit<span class="token punctuation">,</span> <span class="token constant">DEFAULT_REJECT_HANDLER</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 构造函数，初始化线程池
     * <span class="token keyword">@param</span> <span class="token parameter">initialSize</span> 初始化线程数
     * <span class="token keyword">@param</span> <span class="token parameter">coreSize</span> 核心线程数
     * <span class="token keyword">@param</span> <span class="token parameter">maxSize</span> 最大线程数
     * <span class="token keyword">@param</span> <span class="token parameter">queueSize</span> 任务队列大小
     * <span class="token keyword">@param</span> <span class="token parameter">keepAliveTime</span> 临时线程存活时间
     * <span class="token keyword">@param</span> <span class="token parameter">unit</span> 临时线程存活时间单位
     * <span class="token keyword">@param</span> <span class="token parameter">rejectedHandler</span> 饱和拒绝策略
     */</span>
    <span class="token keyword">public</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialSize<span class="token punctuation">,</span> <span class="token keyword">int</span> coreSize<span class="token punctuation">,</span> <span class="token keyword">int</span> maxSize<span class="token punctuation">,</span> <span class="token keyword">int</span> queueSize<span class="token punctuation">,</span> <span class="token keyword">long</span> keepAliveTime<span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span> unit<span class="token punctuation">,</span> <span class="token class-name">RejectedExecutionHandler</span> rejectedHandler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>initialSize <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token operator">||</span> coreSize <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token operator">||</span> maxSize <span class="token operator">&lt;=</span> <span class="token number">0</span> <span class="token operator">||</span> maxSize <span class="token operator">&lt;</span> coreSize <span class="token operator">||</span> keepAliveTime <span class="token operator">&lt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalArgumentException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>initialSize <span class="token operator">=</span> initialSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>coreSize <span class="token operator">=</span> coreSize<span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>maxSize <span class="token operator">=</span> maxSize<span class="token punctuation">;</span>
        taskQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">LinkedBlockingQueue</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>queueSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ArrayList</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span>initialSize<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>keepAliveTime <span class="token operator">=</span> unit<span class="token punctuation">.</span><span class="token function">toNanos</span><span class="token punctuation">(</span>keepAliveTime<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span>rejectedExecutionHandler <span class="token operator">=</span> rejectedHandler<span class="token punctuation">;</span>

        <span class="token comment">// 初始化线程池时，创建并调用 start 方法启动工作线程</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> initialSize<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 添加任务并执行，由于使用了阻塞队列，因此无需通知工作线程
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">execute</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 线程池已关闭后，不允许再添加任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>isShutdown<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IllegalStateException</span><span class="token punctuation">(</span><span class="token string">&quot;ThreadPool is shutdown.&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 当前工作线程数 &lt; 核心线程数时，启动新的线程来执行任务</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> coreSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>    <span class="token comment">// check 任务队列是否已满，未满则添加进入，已满则进入分支</span>
            <span class="token comment">// 当前工作线程数 &lt; 最大线程数时，启动新的（临时）线程来执行任务</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>workers<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> maxSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token function">addWorkerThread</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token comment">// 使用饱和拒绝策略</span>
                rejectedExecutionHandler<span class="token punctuation">.</span><span class="token function">rejectedExecution</span><span class="token punctuation">(</span>task<span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 启动新的工作线程，将任务放入队列中以执行
     * <span class="token keyword">@param</span> <span class="token parameter">task</span> 任务
     */</span>
    <span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">addWorkerThread</span><span class="token punctuation">(</span><span class="token class-name">Runnable</span> task<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">WorkerThread</span> workerThread <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">WorkerThread</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workerThread<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        workers<span class="token punctuation">.</span><span class="token function">add</span><span class="token punctuation">(</span>workerThread<span class="token punctuation">)</span><span class="token punctuation">;</span>
        taskQueue<span class="token punctuation">.</span><span class="token function">offer</span><span class="token punctuation">(</span>task<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token doc-comment comment">/**
     * 关闭线程池（优雅）：
     * 1. 修改 isShutdown 标志；
     * 2. 遍历所有工作线程，中断它们（interrupt() 方法并不会立即执行中断，取决于其线程本身）
     */</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        isShutdown <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">WorkerThread</span> thread <span class="token operator">:</span> workers<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            thread<span class="token punctuation">.</span><span class="token function">interrupt</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>测试：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token annotation punctuation">@Test</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">testV2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span>
        <span class="token class-name">SimpleThreadPool</span> pool <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SimpleThreadPool</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token number">8</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token class-name">TimeUnit</span><span class="token punctuation">.</span><span class="token constant">MILLISECONDS</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 控制任务数量，不要让饱和拒绝策略触发</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">12</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            pool<span class="token punctuation">.</span><span class="token function">execute</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
                <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> j <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> j <span class="token operator">&lt;</span> <span class="token number">100</span><span class="token punctuation">;</span> j<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">try</span> <span class="token punctuation">{</span>
                        <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">InterruptedException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">RuntimeException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
                    <span class="token punctuation">}</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token class-name">Thread</span><span class="token punctuation">.</span><span class="token function">sleep</span><span class="token punctuation">(</span><span class="token number">10_000_000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>   <span class="token comment">// 让主线程一直睡眠，方便我们观察结果</span>
        pool<span class="token punctuation">.</span><span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们定义了核心线程数为 3，最大线程数为 5，任务队列大小为 8。所以任务数量 &gt;= 13 （5 + 8）时，就会触发拒绝策略；当所有任务都执行完毕时，会有 2（5 - 3）个临时线程被移除：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>WorkerThread Thread-0, executing task: My Task...
WorkerThread Thread-3, executing task: My Task...
WorkerThread Thread-1, executing task: My Task...
WorkerThread Thread-2, executing task: My Task...
WorkerThread Thread-4, executing task: My Task...
WorkerThread Thread-1, executing task: My Task...
WorkerThread Thread-2, executing task: My Task...
WorkerThread Thread-0, executing task: My Task...
WorkerThread Thread-3, executing task: My Task...
WorkerThread Thread-4, executing task: My Task...
WorkerThread Thread-2, executing task: My Task...
WorkerThread Thread-1, executing task: My Task...
Temp worker thread Thread-0, exit workers queue
Temp worker thread Thread-3, exit workers queue
...... 阻塞 ......
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,65);function f(g,S){const e=o("router-link"),t=o("ExternalLinkIcon");return i(),l("div",null,[n("details",r,[d,n("nav",v,[n("ul",null,[n("li",null,[a(e,{to:"#_1-定义线程池接口"},{default:p(()=>[s("1. 定义线程池接口")]),_:1})]),n("li",null,[a(e,{to:"#_2-线程池的简单实现"},{default:p(()=>[s("2. 线程池的简单实现")]),_:1}),n("ul",null,[n("li",null,[a(e,{to:"#_2-1-定义工作线程"},{default:p(()=>[s("2.1 定义工作线程")]),_:1})]),n("li",null,[a(e,{to:"#_2-2-简易线程池"},{default:p(()=>[s("2.2 简易线程池")]),_:1})]),n("li",null,[a(e,{to:"#_2-3-测试"},{default:p(()=>[s("2.3 测试")]),_:1})])])]),n("li",null,[a(e,{to:"#_3-优化-自定义线程池的基本参数"},{default:p(()=>[s("3. 优化：自定义线程池的基本参数")]),_:1})]),n("li",null,[a(e,{to:"#_4-优化-饱和拒绝策略"},{default:p(()=>[s("4. 优化：饱和拒绝策略")]),_:1}),n("ul",null,[n("li",null,[a(e,{to:"#_4-1-定义拒绝策略接口"},{default:p(()=>[s("4.1 定义拒绝策略接口")]),_:1})]),n("li",null,[a(e,{to:"#_4-2-abortpolicy"},{default:p(()=>[s("4.2 AbortPolicy")]),_:1})]),n("li",null,[a(e,{to:"#_4-3-discardpolicy"},{default:p(()=>[s("4.3 DiscardPolicy")]),_:1})]),n("li",null,[a(e,{to:"#_4-4-simplethreadpool-中添加拒绝策略"},{default:p(()=>[s("4.4 SimpleThreadPool 中添加拒绝策略")]),_:1})])])]),n("li",null,[a(e,{to:"#_5-优化-自调节工作线程数"},{default:p(()=>[s("5. 优化：自调节工作线程数")]),_:1}),n("ul",null,[n("li",null,[a(e,{to:"#_5-1-simplethreadpool-中添加空闲线程存活时间"},{default:p(()=>[s("5.1 SimpleThreadPool 中添加空闲线程存活时间")]),_:1})]),n("li",null,[a(e,{to:"#_5-2-改造-workerthread"},{default:p(()=>[s("5.2 改造 WorkerThread")]),_:1})])])]),n("li",null,[a(e,{to:"#_6-simplethreadpool-最终版"},{default:p(()=>[s("6. SimpleThreadPool 最终版")]),_:1})])])])]),n("div",m,[b,n("p",null,[s("在 "),n("a",w,[s("上一篇文章"),a(t)]),s(" 中，理解了线程池的使用方法和核心原理后，接下来我们就手撸一个简易版的线程。")]),y,n("p",null,[s("项目地址："),n("a",h,[s("https://github.com/AruNi-01/JavaConcurrency/tree/master/src/main/java/com/run/threadpool"),a(t)])])]),T])}const _=c(k,[["render",f],["__file","手撕简易线程池.html.vue"]]);export{_ as default};
