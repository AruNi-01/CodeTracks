---
# 当前页面内容标题
title: AQS 入门：简单了解
date: 2023-2-27
order: 4
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

<div class="addthis_inline_share_toolbox"></div>

---

::: details 本文内容
[[toc]]
:::


## 1. 什么是 AQS

AQS 全称 AbstractQueuedSynchronizer，即抽象队列同步器，是 JUC 包下的一个 **构建锁和同步器的框架**。

AQS 是一个抽象类，内部提供了一些使用 `protected` 修饰的方法，意图就是让我们自己 **继承 AQS，重写这些模板方法，即可来构建自己的同步器**。

AQS 中大量 **使用 CAS 来提供乐观锁服务**，在发生冲突时使用自旋的方式进行重试，效率是比较高的。所以 JUC 包下的很多锁，并发组件等，许多都是由 AQS 构建而来的。例如常见的 `ReentrantLock`、`ReentrantReadWriteLock`、AQS 组件 `Semaphore` 和 `CountDownLatch` 等。

## 2. AQS 模板方法

AQS 基于模板方法模式，如果需要自定义自己的同步器，就需要继承 AQS，重写这些模板方法。

这些模板方法都使用 `protected` 修饰，而且没有被 `final` 或 `static` 修饰，因此可以被子类继承重写。

主要有如下几个模板方法供开发者使用：

- 与 **try 获取/释放** 相关：

    - 独占式：

        ```java
            // 尝试以独占模式获取
            protected boolean tryAcquire(int arg) {
                throw new UnsupportedOperationException();
            }
        
            // // 尝试以独占模式释放
            protected boolean tryRelease(int arg) {
                throw new UnsupportedOperationException();
            }
        ```

    - 共享式：

        ```java
            //  // 以共享模式获取
            protected int tryAcquireShared(int arg) {
                throw new UnsupportedOperationException();
            }
        
            // 以共享模式释放
            protected boolean tryReleaseShared(int arg) {
                throw new UnsupportedOperationException();
            }
        ```

- **判断同步器是否被当前线程独占** 的方法：

    ```java
        // 如果同步状态被当前（调用）线程以独占方式持有，则返回 true。
        protected boolean isHeldExclusively() {
            throw new UnsupportedOperationException();
        }
    ```

除了上面的模板方法外，AQS 中的其他方法都使用 `final` 或 `private` 修饰，无法被其他类重写。

这几个模板方法也很简单，其实就是 **对同步状态变量 `state` 的获取和释放**。

::: info 疑问一：为什么 AQS 抽象类中的模板方法不使用 abstract 修饰，而是都抛出一个异常？

因为 AQS 是许多同步器/锁的基础，它不提供具体的实现，每个同步器可以根据自己的特点进行自定义实现。

**而如果把向外提供的方法也用 `abstract` 修饰，那么其它子类在继承它的时候，则必须要重写全部抽象方法，除非子类也声明为抽象类**。

所以，为了方便子类 **按需实现** AQS 中的方法，AQS 就不能将这些方法定义为抽象方法，所以必须给出一个默认实现。

例如，ReentrantLock 是一个独占锁，它根本不需要 `tryAcquireShared()` 和 `tryReleaseShared()`。

:::

::: info 疑问二：那既然 AQS 抽象类中没有抽象方法，那为何还要定义为抽象类？

上面说了，AQS 只是给许多同步器/锁一个基石，让我们自己可以自定义实现各种特性的同步器。所以 **AQS 并不希望外界直接 new 一个 AQS 实例来使用**，因此定义成抽象类。

:::

接下来我们就使用 AQS，来构建一个简单的同步类。

### 2.1 自定义同步类

我们这里就自定义一个非常简单的同步锁，只有加锁解锁功能，代码如下：

```java
public class MyLatch {

    private final Sync sync;

    public MyLatch() {
        sync = new Sync();
    }

    public void lock() {
        // 获取
        sync.acquire(1);
    }

    public void unlock() {
        // 释放
        sync.release(1);
    }

    // 同步器 Sync 继承 AQS，重写模板方法
    private static class Sync extends AbstractQueuedSynchronizer {
        @Override
        protected boolean tryAcquire(int arg) {
            // CAS 将 state 从期望值 0 自旋地修改为 1（state 为 1 表示有锁状态）
            return compareAndSetState(0, 1);
        }

        @Override
        protected boolean tryRelease(int arg) {
            // 释放操作，将 state 置为 0（state 为 0 表示无锁状态）
            setState(0);
            return true;
        }
    }
}
```

- 定义一个 `Sync` 同步器，继承自 AQS，重写模板方法。逻辑很简单，获取锁就是使用 CAS 将 `state` 从 0 改成 1（0 表示无锁，1 表示有锁），释放锁就是将 `state` 设置回 0；
- `MyLatch` 是我们对外提供的同步锁接口，只提供了 `lock` 和 `unlock` 功能；

### 2.2 测试 MyLatch

下面进行测试。测试代码很简单，就是对一个竞争资源进行并发操作：

```java
public class MyLatchTest {
    // 存在竞争的资源 val
    private int val = 0;

    public static void main(String[] args) throws Exception {
        new MyLatchTest().test();
    }

    private void test() {
        // 开启 10 个线程模拟并发，都执行 add 方法
        for (int i = 0; i < 10; i++)
            new Thread(() -> add()).start();
    }

    private void add() {
        // 各线程并发执行 val++
        System.out.println(Thread.currentThread().getName() + ": 执行 +1 前 val=" + (val++) + "，执行 +1 后 val=" + val);
    }
}
```

输出结果：

![image-20230227171052139](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302271711104.png)

可以发现，因为 **`val++` 本身不是原子操作**，它分成了读取 val 的值，进行 +1 操作，写回 val 的值。所以在并发操作时，就出现了乱序错误。

接下来就要有请我们自定义的同步锁 `MyLatch` 闪亮登场了，我们让每个线程在执行 `val++` 操作前，都要获取到该锁，从而使得所有线程都按序进行。

想要实现这个效果，也很简单，直接在 `add()` 方法执行 `val++` 之前必须先获得锁，执行完之后再释放掉锁即可，代码如下：

```java
public class MyLatchTest {
    // 存在竞争的资源 val
    private int val = 0;

    // 使用自己自定义的同步锁
    private final MyLatch myLatch = new MyLatch();

    public static void main(String[] args) throws Exception {
        new MyLatchTest().test();
    }

    private void test() {
        // 开启 10 个线程模拟并发，都执行 add 方法
        for (int i = 0; i < 10; i++)
            new Thread(() -> add()).start();
    }

    private void add() {
        // 执行操作前上锁
        myLatch.lock();
        // 执行 val++ 操作
        System.out.println(Thread.currentThread().getName() + ": 执行 +1 前 val=" + (val++) + "，执行 +1 后 val=" + val);
        // 执行完后解锁
        myLatch.unlock();
    }
}
```

输出结果：

![image-20230227171653299](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302271716282.png)

可以看到，执行效果与我们预期相符，各线程一次执行 `val++`，最后保证了 val 的正确性。

### 2.3 常用工具类的实现

通过上面我们自定义的同步类，可以发现其实这些模板方法无非就是对 **同步状态变量 `state` 的获取和释放**，常用的锁和工具类也不例外。

下面就来简单的了解一下 ReentrantLock 和 CountDownLatch 对 AQS 的应用。

> 本文章只会简单的介绍它们的实现思想，不涉及具体的源码分析。

::: tip ReentrantLock

:::

**ReentrantLock** 是用 AQS 构建的一个 **可重入锁**，它的大致思想如下：

- `state` 初始化为 0，表示未锁定状态。一个线程在调用 `lock()` 方法时，会调用 `tryAcquire()` 独占该锁并将 `state` +1。之后其他线程再 `tryAcquire()` 时就会失败，**直到之前的线程调用 `unlock()` 将 `state` 设置为 0，其他线程才能获取该锁**。

- 它的 **可重入** 实现也很简单，当一个线程尝试获取锁时，会先判断当前获得锁的线程是否是本线程，如果是则判为加锁成功，将 **`state` 累加**。释放锁时，每释放一次就将 `state` -1，**直到 `state` 归零，才是真正的释放掉锁**。

::: tip CountDownLatch

:::

CountDownLatch 介绍：

- **CountDownLatch** 是一个 **减法计数器**，我们可以在初始化时指定任务的个数 `count`，每次调用 **`countDown()`** 方法都会将 **`count` -1**，调用 **`await()`** 会进行 **阻塞**，**直到 `count` 变为 0**；
- 所以 CountDownLatch 的应用场景就是等所有线程都将需要的资源准备完毕（每个线程准备完就执行一次 `countDown()`），主线程再执行后续任务（执行前调用 `await()`）。

实现思想：

- **将 `state` 初始化为 `count`**（一般让 count 与线程个数一致），子线程并行执行，每个子线程执行完就执行 `countDown()`，将 `state` -1。等到所有子线程都执行完毕后，此时 `state` 就为 0 了，就会执行 `unpark()` 恢复主线程，让主线程从 `await()` 函数返回，继续执行后面的任务。

## 3. AQS 底层原理

同步状态变量 `state` 在构建同步器时充当 **共享资源** 的角色，所有线程都要 **竞争到此资源的操作权，才能表示获取锁成功**。

AQS 的 **核心思想** 如下：

- 如果被请求的共享资源 **空闲**，则将当前请求该资源的线程设置为 **有效的工作线程**，然后将共享资源设置为 **锁定状态**；

- 如果被请求的共享资源被 **占用**，那么就将当前线程暂存到一个地方，以便后续唤醒。AQS 中使用一个 **同步等待队列 CLH 暂存获取不到锁的线程**。

    > 不要以为 CLH 很高大上，称之为 CLH 只是因为这个队列是由三个人发明的，CLH 是他们名字的首字母。

AQS 的主要架构思想如下：

![image-20230228130021521](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302281301851.png)

### 3.1 同步状态 state

在 AQS 中，表示同步状态的变量 `state` 尤为重要，所以，我们就从这个 `state` 入手，来看看 AQS 的底层实现到底是怎样的。

直接翻开 AQS 源码，找到 `state`：

![image-20230227192224318](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302271922443.png)

可以发现，它被 **volatile** 修饰。不难理解，在多线程并发的场景下，要保证共享变量的 **可见性**，即一个线程对 `state` 的值进行修改后，需要 **保证其他线程能及时看见 `state` 的最新值**。

接下来再去看看与 `state` 变量有关的三个操作方法：

```java
    // 获取 state
    protected final int getState() {
        return state;
    }

    // 修改 state
    protected final void setState(int newState) {
        state = newState;
    }

    // 修改 state，通过 CAS 的方式
    protected final boolean compareAndSetState(int expect, int update) {
        return U.compareAndSetInt(this, STATE, expect, update);
    }
```

可以发现，这三个方法都使用了 `final` 进行修饰，所以子类是无法重写它们的。

重点来看 **通过 CAS 修饰 `state`** 的方法。

CAS 全称 Compare And Swap，意为比较并交换，是一种 **实现同步的无锁算法**，它能保证一个变量在修改时具有 **原子性**。

它主要包含三个操作数：

- **内存位置 offset：当前需要修改的变量值在内存的什么位置**；
- **预期值 expect：修改变量之前期望该变量是什么值**；
- **新值 update：需要将变量修改成什么值**。

**CAS 核心思想：将内存位置的值与期望值做比较，若相同则将内存位置的值修改为新值，否则不做任何操作**。

**修改 `state` 通过 CAS 保证了原子性，`state` 又通过 volatile 保证了可见性**，因此在 AQS 中对 `state` 变量的操作是 **能保证并发安全的**。

### 3.2 同步等待队列 CLH

> 注：CLH 是单项队列，AQS 中的队列是 CLH 的变体 — **虚拟双向队列**，文中直称 CLH。

当线程获取锁失败时，就需要加入到等待队列中，以便后续唤醒，**AQS 中使用同步等待队列 CLH 来保存暂时获取不到锁的线程**。

CLH 是一个 **虚拟的双向队列**，之所以称之为虚拟，即不存在真正的队列实例，**只是存在节点与节点间的关联关系**。

那么节点之间如何进行关联呢？其实，就是一个 **双向链表**，通过前驱和后继指针，就能建立节点之间的联系。

在 AQS 中，CLH 是通过 `Node` 节点来实现的，**暂时获取不到锁的线程都会对应一个 `Node` 节点**。

`Node` 节点的定义如下：

```java
    /** CLH Nodes */
    abstract static class Node {
        volatile Node prev;       // initially attached via casTail
        volatile Node next;       // visibly nonnull when signallable
        Thread waiter;            // visibly nonnull when enqueued
        volatile int status;      // written by owner, atomic bit ops by others

        // Some methods......
    }
```

- `prev`：前驱节点；

- `next`：后继节点；

- `waiter`：当前等待的线程（暂时未获得锁的线程）；

- `status`：当前节点的状态，分为：

    - WAITING：等待状态，节点等待被唤醒；
    - CANCELLED：取消等待，将节点从队列中移除；
    - COND：节点放入了条件队列中。

    ![image-20230227210313442](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302272103310.png)

为了方便的获取首尾节点，AQS 类中定义了一个 `head` 和 `tail`，分别指向 CLH 队列的头尾：

```java
    /**
     * Head of the wait queue, lazily initialized.
     */
    private transient volatile Node head;

    /**
     * Tail of the wait queue. After initialization, modified only via casTail.
     */
    private transient volatile Node tail;
```

那么当一个线程获取到了锁，**其他线程再尝试获取锁时，就会加入到 CLH 双向队列中**，如下：

![image-20230227210535131](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302272105294.png)

> 第一个节点为虚节点，不存储任何信息，只用于占位。

## 4. AQS 应用场景

之前也提到过，一张表总结：

| 同步工具               | 与 AQS 的关联                                                |
| ---------------------- | ------------------------------------------------------------ |
| ReentrantLock          | `state` 变量值表示重入的次数，`state` 为 0 才为无锁状态，公平和非公平使用参数 `fair` 指定 `new ReentrantLock(boolean fair)` |
| ReentrantReadWriteLock | `state` 变量中的 16 位保存写锁持有的次数，剩下的 16 位保存读锁持有的次数 |
| Semaphore              | `state` 变量值表示信号量的当前计数，线程获取锁时会减少计数，释放锁时会增加计数，计数为 0 表示信号量已用完 |
| CountDownLatch         | `state` 变量值表示计数，每次释放锁（`countDown()`）计数器就减一，计数为 0 时，获取锁的操作（`await()`）才可以执行。 |
| ThreadPoolExecutor     | Worker 利用 `state` 实现对独占线程变量的设置（tryAcquire 和 tryRelease） |

## 5. 参考文章

- [JavaGuide](https://javaguide.cn)
- [AQS 源码分析（一）](https://www.bilibili.com/video/BV1Fd4y1b7Qp/?spm_id_from=333.788&vd_source=2716833caf2bf21200544dca2cc25e03)
- [深入理解 Java 并发框架 AQS 系列](https://www.cnblogs.com/xijiu/p/14522224.html)
- [从 ReentrantLock 的实现看 AQS 的原理及应用](https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html)