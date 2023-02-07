---
# 当前页面内容标题
title: volatile 详解
date: 2022-12-27
order: 2
# 当前页面图标
icon: write
# 分类
category:
 - Java
# 标签
tag:
 - 并发编程

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

## 1. 认识 volatile

volatile 关键字是一个轻量级的同步机制，一般作用于 **变量**，在并发场景下保证了内存的 **可见性**，以及 **避免了指令的重排序**。

volatile 三大特性：

- **保证可见性**；
- **不保证原子性**；
- **禁止指令重排**；

::: info 并发编程的三个重要特性：
- **可见性**：一个线程对共享变量进行了修改，其他线程可以立刻看到修改后的最新值；
- **原子性**：一次或多次操作，要么全都执行，要么全都不执行（volatile 不保证、可以使用锁机制）；
- **有序性**：代码在执行过程中的先后顺序，编译器及处理器会对指令进行重排优化后在执行；
:::

## 2. JMM 介绍

> 详细的 JMM 讲解在 [Java 内存模型](https://aruni.me/posts/2022-12-16-Java%20%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B.html)

Java 内存模型抽象了线程和主存之间的关系，主要由三部分构成：**1 个主内存、n 个线程、n 个本地（工作）内存**，共享数据就在它们三者之间来回倒腾。

线程之间的共享变量存储在主内存（Main Memory）中，每个线程都有一个私有的本地内存（Local Memory），本地内存中存储了该线程以读/写共享变量的副本。

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202212142203111.png)

在当前的 Java 内存模型下，**线程可以把变量保存在本地内存**（比如机器的寄存器）中，而 **不是直接在主存中进行读写**。这就可能造成 **一个线程在主存中修改了一个变量的值，而另外一个线程还继续使用它在寄存器中的变量值的拷贝，造成数据的不一致**。

要解决这个问题，就需要把变量声明为 **volatile** ，这就指示 JVM，这个变量是共享且不稳定的，**每次使用它都要到主存中 read 最新值，然后 load 回本地内存，再供线程 use**。即保证了共享变量的 **可见性**。

## 3. volatile 底层原理

### 3.1 如何保证可见性？

上面也说到，在 JMM 中每个线程都有自己的本地内存，线程对于变量的读写都要在本地内存中进行，而不能直接读写主存中的变量。同时，线程之间的本地内存不共享，不能直接互相访问，需要通过主存来完成。

这里很容易产生一个 **误解**：如果一个变量被标记成了 volatile 变量，那么这个变量的值就 **不会被加载进线程的工作内存中，而是直接在主内存上进行读写**。

实际上并不是这样的，因为这需要为 volatile 变量的读写设置一套特殊的规则，显然不合适。

即使是 volatile 变量，也是从工作内存中读取的，只是它 **有特殊的操作顺序规定**，使得看起来像是直接在主内存中读写一样。

首先，**在对 volatile 变量进行读/写操作时，必须去主内存拉取新值/将新值更新进主内存**。即：

- 在线程 **读** 变量时，必须先从主内存中 read，再 load 进本地内存后，才供线程 use；
- 在线程 **写** 变量时，把变量 assign 到本地内存后，必须进行 store，然后 write 进主内存；

现在已经保证了对变量的写操作可以时刻同步进主内存，接下来还需要一个规则，要保证每次读操作都在写操作后面执行，这样能保证 **读操作读取到的是最新值**。这个规则就是 Happens-Before 规则。

**Happens-Before 规则** 中要求：**对 volatile 变量的写操作必须在对该变量的读操作之前执行**。

如下图所示：

![image-20221227151320803](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202212271554517.png)

有了 Happens-Before 规则后：

- 绿色箭头：程序次序规则保证；
- 紫色箭头：volatile 规则保证；
- 蓝色箭头：传递性规则保证；

即保证了线程 B 的读操作读取到的是最新值，保证了可见性。

不过还需要 **注意**：在进行读写操作时，要保证执行顺序，因为 **读写 volatile 变量的操作并不是原子的**。无论是读还是写，都分为了 **3 个命令**（read -> load -> use 或 assign -> store -> write），若出现线程 A 的 write 操作发生在线程 B 的 use 操作之后，此时线程 B 在主内存中读取到的数据就是旧数据。

所以，在进行读操作时，**必须等写操作把 3 个命令都指向完后，才能进行读**。

::: tip 计算机硬件层面
:::

那么在计算机硬件层面是如何做到的呢？其实，在执行了 volatile 变量的赋值后，还会 **额外增加一个 lock 前缀指令**，这个指令会 **将当前 CPU 的 Cache 写入主内存，并无效化其他 CPU 的 Cache**，相当于执行 assign 后，有进行了 store -> write。

这使得 **其他 CPU 可以立即看见 volatile 变量的修改。因为其他 CPU 在读取 volatile 变量时，会发现缓存已过期，于是不得不去主存中拉取最新的值**，也就是被迫在 use 前进行了一次 read -> load。

lock 指令就是一个原子操作。原子操作是指不会被线程调度机制打断的操作；这种操作一旦开始，就一直运行到结束，中间不会有任何 context switch （切换到另一个线程）。

### 3.2 如何禁止指令重排？

volatile 是通过编译器在生成字节码时，在指令序列中添加 “**内存屏障**” 来禁止指令重排序的。

Java 编译器会在生成指令系列时在适当的位置会插入内存屏障指令来禁止特定类型的处理器重排序。

为了实现 volatile 内存语义，JMM 针对编译器制定的 volatile 重排序规则表：

![image-20221227155357106](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202212271554260.png)

从上图可以看出：

- 当第二个操作是 volatile 写时，不管第一个操作是什么，**都不能重排序**。
  这个规则确保 **volatile 写之前的操作不会被编译器重排序到此操作之后**。
- 当第一个操作是 volatile 读时，不管第二个操作是什么，**都不能重排序**。
  这个规则确保 **volatile 读之后的操作不会被编译器重排序到此操作之前**。
- 当第一个操作是 volatile 写，第二个操作是 volatile 读或写时，不能重排序。

对于编译器来说，发现一个最优布置来最小化插入屏障的总数几乎不可能，为此，JMM 采取保守策略。

下面是基于保守策略（能加屏障就都加）的 JMM 内存屏障插入策略：

- 在每个 volatile 写操作的前面插入一个 StoreStore 屏障。
- 在每个 volatile 写操作的后面插入一个 StoreLoad 屏障。
- 在每个 volatile 读操作的后面插入一个 LoadLoad 屏障。
- 在每个 volatile 读操作的后面插入一个 LoadStore 屏障。

上述内存屏障插入策略虽然非常保守，但它可以保证在任意处理器平台，任意的程序中都能得到正确的volatile 内存语义。

volatile 写插入内存屏障后生成的指令序列示意图：

![image-20221227160418688](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202212271604166.png)

图中的 StoreStore 屏障可以保证在 volatile 写之前，其前面的所有普通写操作已经对任意处理器可见了。这是因为 StoreStore 屏障将保障上面所有的普通写在 volatile 写之前刷新到主内存。

volatile 写后面的 StoreLoad 屏障。此屏障的作用是避免 volatile 写与后面可能有的volatile 读/写操作重排序。

volatile 读插入内存屏障后生成的指令序列示意图：

![image-20221227161243751](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202212271612845.png)

图中的 LoadLoad 屏障用来禁止处理器把上面的 volatile 读与下面的普通读重排序。LoadStore 屏障用来禁止处理器把上面的 volatile 读与下面的普通写重排序。

上述 volatile 写和 volatile 读的内存屏障插入策略非常保守。在实际执行时，只要不改变 volatile 写-读的内存语义，编译器可以根据具体情况省略不必要的屏障。

### 3.3 为何不保证原子性？

一个变量简单的读取和赋值操作是原子性的，但将一个变量赋值给另外一个变量的操作不是原子性的。

Java 内存模型（JMM）仅仅保障了变量的基本 **读取** 和 **赋值** 操作是原子性的，其他均不会保证的。如果想要使某段代码块要求具备原子性，就需要使用 synchronized 关键字、Lock 锁、Atomic 各种类型的原子类来实现。

所以，Java 中只有对 **基本类型变量的赋值和读取是原子操作**，如 `i = 1` 的赋值操作。但是像 `j = i` 或者 `i++` 这样的操作都 **不是原子操作**，因为他们都进行了多次原子操作，比如先读取 `i` 的值，再将 `i` 的值赋值给 `j`，两个原子操作加起来就不是原子操作了。



## 4. volatile 和 synchronized 的区别

synchronized 关键字和 volatile 关键字是两个互补的存在，而不是对立的存在。

volatile 关键字是线程同步的轻量级实现，所以 volatile 性能肯定比 synchronized 好。

但是 **volatile** 关键字 **只能用于变量**，而 **synchronized** 可以 **修饰方法** 以及 **代码块** 。

**volatile** **保证数据的可见性**，可以 **禁止指令重排**，但 **不能保证数据的原子性**；

**synchronized 关键字能保证可见性和原子性，但不能禁止指令重排**。

因此 synchronized 和 volatile 通常配合起来使用，保证并发的安全。

## 5. volatile 应用场景

### 5.1 状态标志

在并发操作中，如果需要有一个状态标志变量，用于某些判断，那么可以将这个状态标志变量用 volatile 修饰。

例如，**AQS 同步器框架中的 `state` 同步状态标志，就是使用 volatile 修饰的**。

许多使用 AQS 实现的同步器，如 ReentrantLock、CountDownLatch、Semaphore 等，他们在被并发访问时，都需要先获取 `state` 来判断是否能执行后续的操作，所以同步状态 `state` 的可见性是非常重要的，否则可能会出现加锁错误等等 Bug。

### 5.2 单例模式

在单例模式的双重检测锁（DCL）模式下，实例变量是需要用 volatile 修饰的，原因在代码中：

```java
public class LazySingletonDCL {
    private LazySingletonDCL() {}

    /**
     * volatile 防止指令重排：
     * 因为在 instance = new LazySingletonDCL(); 时分为三步：
     * 1. 分配内存空间
     * 2. 执行构造方法，初始化对象；
     * 3. 把这个对象指向分配的空间
     *
     * 如果线程1 的执行顺序是 132，那么线程2 在线程1 执行到第三步时，
     * 发现 instance 不为 null，则直接返回，此时线程2 获取到的 instance 其实是还没有实例化的。
     */
    private static volatile LazySingletonDCL instance;

    // 不使用 synchronized 加锁，自己判断是否需要加锁
    public LazySingletonDCL getInstance() {
        if (instance == null) {
            // 当判断实例为空时，别的线程可能插队实例化
            // 所以在这里先锁住整个类，锁住后不可能插队了，再判断一次再实例化
            synchronized (LazySingletonDCL.class) {
                if (instance == null) {
                    instance = new LazySingletonDCL();
                }
            }
        }
        return instance;
    }
}
```

### 5.3 volatile bean 模式

**volatile bean 模式** 的基本原理是：很多框架为易变数据的持有者（例如 HttpSession）提供了容器，但是放入这些容器中的对象必须是线程安全的。 这就导致了 **从容器中获取的数据可能是旧数据**。

在 **volatile bean 模式** 中，JavaBean 的所有数据成员都是  **volatile** 类型的，并且 getter 和 setter 方法必须非常普通 —— 除了获取或设置相应的属性外，不能包含任何逻辑。

```java
public class User {
    private volatile String name;
    private volatile int age;

    public void setName(String name) { this.name = name; }
    public void setAge(int age) { this.age = age; }
    public String getName() { return name; }
    public int getAge() { return age; }
}
```

### 5.4 开销较低的读－写锁策略

如果读操作远远超过写操作，可以结合使用内部锁和 volatile 变量来减少公共代码路径的开销。

线程安全的计数器使用 `synchronized` 确保增量操作是原子的，并使用 `volatile` 保证当前结果的可见性。

如果更新不频繁的话，该方法可实现更好的性能，因为读路径的开销仅仅涉及 volatile 读操作，这通常要优于一个无竞争的锁获取的开销。

```java
public class CheesyCounter {
    private volatile int value;

    public int getValue() { return value; }
    
    public synchronized int increment() { return value++; }
}
```

## 6. 参考文章

- [《Java 并发编程实战》阅读笔记](https://github.com/TangBean/Java-Concurrency-in-Practice)

- [《Java 并发编程的艺术》](https://book.douban.com/subject/26591326/)

- [Java Guide](https://javaguide.cn/)

- [Java 理论与实践：正确使用 volatile 变量](https://cloud.tencent.com/developer/article/1340711#:~:text=%EE%80%80volatile%20bean%20%E6%A8%A1%E5%BC%8F%EE%80%81%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%8E%9F%E7%90%86%E6%98%AF%EF%BC%9A%E5%BE%88%E5%A4%9A%E6%A1%86%E6%9E%B6%E4%B8%BA%E6%98%93%E5%8F%98%E6%95%B0%E6%8D%AE%E7%9A%84%E6%8C%81%E6%9C%89%E8%80%85%EF%BC%88%E4%BE%8B%E5%A6%82%20HttpSession%EF%BC%89%E6%8F%90%E4%BE%9B%E4%BA%86%E5%AE%B9%E5%99%A8%EF%BC%8C%E4%BD%86%E6%98%AF%E6%94%BE%E5%85%A5%E8%BF%99%E4%BA%9B%E5%AE%B9%E5%99%A8%E4%B8%AD%E7%9A%84%E5%AF%B9%E8%B1%A1%E5%BF%85%E9%A1%BB%E6%98%AF%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%E7%9A%84%E3%80%82%20%E5%9C%A8%20%EE%80%80volatile%20bean%20%E6%A8%A1%E5%BC%8F%EE%80%81%E4%B8%AD%EF%BC%8CJavaBean,%EE%80%80volatile%EE%80%81%20%E7%B1%BB%E5%9E%8B%E7%9A%84%EF%BC%8C%E5%B9%B6%E4%B8%94%20getter%20%E5%92%8C%20setter%20%E6%96%B9%E6%B3%95%E5%BF%85%E9%A1%BB%E9%9D%9E%E5%B8%B8%E6%99%AE%E9%80%9A%20%E2%80%94%E2%80%94%20%E9%99%A4%E4%BA%86%E8%8E%B7%E5%8F%96%E6%88%96%E8%AE%BE%E7%BD%AE%E7%9B%B8%E5%BA%94%E7%9A%84%E5%B1%9E%E6%80%A7%E5%A4%96%EF%BC%8C%E4%B8%8D%E8%83%BD%E5%8C%85%E5%90%AB%E4%BB%BB%E4%BD%95%E9%80%BB%E8%BE%91%E3%80%82)