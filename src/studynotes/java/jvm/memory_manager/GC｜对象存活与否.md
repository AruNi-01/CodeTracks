---
# 当前页面内容标题
title: GC｜对象存活与否
date: 2023-08-20
order: 3
# 当前页面图标
#icon: write
# 分类
category:
  - Java
# 标签
tag:
  - JVM

sticky: false
# 是否收藏在博客主题的文章列表中，当填入数字时，数字越大，排名越靠前。
star: false
# 是否将该文章添加至文章列表中
article: true
# 是否将该文章添加至时间线中
timeline: true
---
 

::: details 本文内容
[[toc]]
:::



## 1. GC 需要回收什么？

我们知道，[Java 内存运行时区域](https://aruni.me/studynotes/java/jvm/memory_manager/%E8%BF%90%E8%A1%8C%E6%97%B6%E6%95%B0%E6%8D%AE%E5%8C%BA%E5%9F%9F.html) 分为线程私有和线程共享两部分：

- **线程私有**：程序计数器、Java 栈、本地方法栈；
- **线程共享**：堆、方法区。

对于 **线程私有** 的内存区域都是 **随线程而生，随线程而灭**，因此无需过多考虑内存回收的问题。**随着方法或者线程的结束，内存自然就回收掉了**。

但是对于 **线程共享** 的内存区域，有着很显著的不确定性，**只有在运行时再能确定会创建哪些对象，而且创建出来的对象也不会自己消失**，所以就需要 **垃圾收集器来管理这部分内存**。

另外，对于方法区来说，由于回收的判定条件非常严苛，垃圾收回的性价比比较低，所以我们重点是看 **Java 堆上的垃圾收回**，尤其是在新生代中，一次垃圾回收通常能清理 70% 到 90% 的内存空间。

## 2. 判断对象存活与否

知道了要回收哪里的垃圾后，接着要搞清楚哪些对象可以被当成垃圾呢？这就涉及到常见的两种 **判断对象是否存活的算法** 了，它们分别是 **引用计数法** 和 **可达性分析算法**。

### 2.1 引用计数法

**引用计数法** 非常简单，只需要 **在对象中添加一个引用计数器**，当 **该对象被引用时，计数器就加一；引用取消时，计数器就减一**。这样在 **计数器为零的时候，该对象就是不会被使用了**。

引用计数法虽然占用了一些额外的内存空间来存放计数器，但它的原理简单，判定效率也高，所以在大多数情况下表现还不错。

但是，引用计数法有个很大的 **缺点**，就是会存在 **对象之间循环引用** 的问题，这也是现今的 JVM 都没有选用该方法的原因。

什么是循环引用呢？下面举一个简单的例子：

```java
public class MyObj {
    public Object instance = null;
}

MyObj objA = new MyObj();
MyObj objB = new MyObj();
// 让 objA、objB 的 instance 变量互相引用对方
objA.instance = objB;
objB.instance = objA;

// 此时把 objA、objB 置为空
objA = null;
objB = null;
```

通过上面的实例可以发生，虽然最后把 objA、objB 都置为 null 了，但其实它们还被对方的 instance 变量所引用着，也就是各自的引用计数器都为 1，还不能被 GC 回收，但它们又都被直为 null 了，后面不会再使用了，这就造成了内存被白白的占用。

### 2.2 可达性分析算法

另一种常用的算法是 **可达性分析算法**，在该算法下，有一个 **GC Root 集合**，里面保存的都是一些 GC Root，这些 **GC Root 会把一系列的引用关系连接起来**，形成一条条的 **引用链**。

这时 **从 GC Root 的根对象作为起点，沿着引用链向下搜索，如果某个对象从 GC Root 不可达**，也就是 **该对象没有任何一条引用链可以到 GC Root**，那么就能证明 **该对象不会再被使用了**。

例如下面的 object5、object6 和 object7 都是不可达 GC Root 的，所以会被判定为可回收的对象。

![image-20230820215119259](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202308202151421.png)

在 Java 中，**可以作为 GC Root 的对象** 主要包括以下几种：

- **在 Java 栈中引用的对象**；
- **在方法区中类静态变量引用的对象**；
- **在方法区中常量引用的对象**；
- **本地方法栈中 Native 方法引用的对象**；
- **被同步锁（synchronized 关键字）持有的对象**。

## 3. finalize - 最后的援救

现在常用的 JVM 都是使用的可达性分析算法来判定对象存活与否，那么当一个对象被判定为不可达对象时，它一定会被下一轮 GC 消灭吗？

其实，它们还有一次被援救的机会，那就是 `finalize()` 方法，这是 Object 类的一个方法，也就是说，所有的类都会继承这个方法。

**当一个对象被标记为不可达对象后，会进行一轮检查，看该对象是否要执行 `finalize()` 方法**，检查手段是：

- **该对象是否重写了父类 Object 的 `finalize()` 方法**；

- **该 `finalize()` 方法是否已经被执行过了**。

  > 因为 **任何一个对象的 `finalize()` 方法都只会被系统自动调用一次**。

如果确定了该对象要执行 `finalize()` 方法，则会把该对象放入一个 F-Queue 队列中，之后会由一个叫做 Finalizer 线程去执行它们的 `finalize()` 方法。

当然了，为了避免执行 `finalize()` 方法的时间过长、或者发生死循环，所以并不会等该方法执行完毕，而是会有个时间限制。

**在执行 `finalize()` 方法时**，如果对象在该方法中成功拯救了自己，即 **重新与引用链上的任何一个对象建立关联**，那么该对象就会被移出回收集合中，从而 **拯救成功**。

下面给出一个援救的例子：

```java
public class FinalizeEscapeGC {
  
    public static FinalizeEscapeGC SAVE_HOOK = null;
  
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("finalize method executed!");
        FinalizeEscapeGC.SAVE_HOOK = this;	// 自救
    }
  
	public static void main(String[] args) throws Throwable {
        SAVE_HOOK = new FinalizeEscapeGC();
    
        // 对象第一次成功拯救自己
        SAVE_HOOK = null;
        System.gc();
        // 因为 Finalizer 优先级较低，暂停 0.5 秒，等待它
        Thread.sleep(500);
        if (SAVE_HOOK != null) {
        	System.out.println("yes, i am still alive :)");
        } else {
        	System.out.println("no, i am dead :(");
        }

        // 这次自救却失败了，因为系统只会自动执行一个 finalize 方法
        SAVE_HOOK = null;
        System.gc();
        Thread.sleep(500);
        if (SAVE_HOOK != null) {
        	System.out.println("yes, i am still alive :)");
        } else {
        	System.out.println("no, i am dead :(");
        }
	}
}
```

输出：

```text
finalize method executed!
yes, i am still alive :)
no, i am dead :(
```

不过并 **不推荐使用 `finalize()` 方法来拯救对象**，因为该方法的 **运行代价高、不一定会被执行完毕、无法确定各对象的调用顺序**，官方也不推荐使用该方法。

## 4. 总结

垃圾收集器主要是回收 Java 堆中一些不使用的对象，要知道哪些对象是不会使用的，就涉及到两种对象判活算法：

- 引用计数法；
- 可达性分析算法。

由于 **引用计数法存在循环引用的问题**，会导致不使用对象占用的内存空间无法被回收，因此通常都是使用可达性分析算法。

在 **可达性分析算法** 中，存在着一些 GC Root，要判断该对象是否可被回收，只需看 **该对象是否存在一条可达 GC Root 的引用链** 即可。

最后提到了 **finalize 方法**，它虽然 **可以拯救不可达 GC Root 的对象**，但由于它的 **执行代价高、不确定性大**，所以也不推荐使用了。




