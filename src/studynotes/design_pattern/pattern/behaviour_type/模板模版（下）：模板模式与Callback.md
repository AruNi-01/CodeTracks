---
# 当前页面内容标题
title: 模板模式（下）：模板模式与 Callback
# 短标题，侧边栏、导航栏中显示
shortTitle: 模板模式（下）
date: 2023-07-16
order: 4
icon: write

# 分类
category:
 - 设计模式
tag:
 - 设计模式与范式

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

::: info 前言

在 [上一章](https://aruni.me/studynotes/design_pattern/pattern/behaviour_type/%E6%A8%A1%E6%9D%BF%E6%A8%A1%E5%BC%8F%EF%BC%88%E4%B8%8A%EF%BC%89%EF%BC%9A%E7%90%86%E8%A7%A3%E6%A8%A1%E6%9D%BF%E6%A8%A1%E5%BC%8F.html) 中，讲解了模板模式的原理和应用，其主要功能就是 **提高代码的复用性、基于扩展点可以在不改变源码的情况下方便的扩展功能**。

而我们常用的 Callback 回调技术，也能起到模板模式的两大作用，那他们有什么区别呢？

:::

## 1. 什么是回调？

**回调** 是一种 **双向调用** 关系，当调用一个 A 函数时，可以 **以某种方式将另一个 B 函数注册到 A 函数中**，在 A 函数执行时，可以在合适的时机 **反过来调用其注册进来的 B 函数**，这种机制就叫作回调。

那么如何将回调函数注册到某个函数中呢？

函数参数支持传递函数的编程语言可以直接通过参数来注册，比如 Golang、Python。

而像 Java，就需要使用包裹了回调函数的类对象来实现，这个对象称为回调对象。

下面先来看看 Golang 的实现，比较简单：

```go
func funcA() {
	// 调用 funcB，传入回调函数
	funcB(func(args ...any) {
		fmt.Printf("I am callback function. received args: %v\n", args)
	})
}

func funcB(callback func(args ...any)) {
	// funcB 逻辑...
	callback(1, "a") // 执行回调（funcA 传入的方法）
}

func main() {
	funcA()
}

// 输出：I am callback function. received args: [1 a]
```

再来看看 Java，其实就是把函数参数改成了某个接口的实现类，然后再调用类的回调方法：

```java
public interface ICallback {
  	void methodToCallback();
}

public class BClass {
    public void process(ICallback callback) {
        // 逻辑处理...
        callback.methodToCallback();	// 执行回调函数
        // 逻辑处理...
    }
}

public class AClass {
    public static void main(String[] args) {
        BClass b = new BClass();
        b.process(new ICallback() { 	// 回调对象
            @Override
            public void methodToCallback() {
                System.out.println("Call back me.");
            }
        });
    }
}
```

可以发现，**回调** 也具有 **复用和扩展** 的功能：

- 复用：BClass 类中的 `process()` 方法中的逻辑处理都可以复用，只是回调方法有所不同；
- 扩展：ICallback 接口中的回调方法可自行定义，扩展 `process()` 的功能。

回调还分为 **同步回调和异步回调**，同步回调是在 **函数返回之前** 执行回调函数，而异步回调则是在 **函数返回之后** 才执行回调函数（比如可以开启另一个线程去执行处理逻辑和回调函数）。

我们上面的例子就是一个同步回调，在 `process()` 返回之前执行了回调函数。

异步回调通常用在处理比较耗时的任务，如网络请求、IO 处理等。下面来看看一个异步的网络请求例子，为了方便就使用 Go 来编写了：

```go
// Result 响应结果
type Result struct {
	Data string
	Err  error
}

func requestAsync(url string, callback func(Result)) {
    // 异步处理
	go func() {
		// 模拟网络请求，睡眠一段时间
		time.Sleep(2 * time.Second)

		// 返回结果
		result := Result{
			Data: url + "'s response: {Hello, World!}",
			Err:  nil,
		}

		// 调用回调函数处理结果
		callback(result)
	}()
}

func main() {
	// 发起异步请求
	requestAsync("https://aruni.me", func(result Result) {
		if result.Err != nil {
			fmt.Println("Error:", result.Err)
		} else {
			fmt.Println("Data:", result.Data)
		}
	})

	// 继续处理其他任务

	fmt.Println("Waiting for response...")
	time.Sleep(3 * time.Second)
	fmt.Println("Done.")
}

/*
输出：
Waiting for response...
Data: https://aruni.me's response: {Hello, World!}
Done.
*/
```

判断一个回调是否是异步回调很简单，只需要看 **在调用回调方法时，是否需要等待该回调方法执行完毕，才能执行后续逻辑**，不需要则属于异步回调。

## 2. 模板模式 vs 回调

回调的原理和用法讲完后，来看看模板模式跟回调，到底有什么区别？

从 **应用场景** 来看，需要分为同步回调和异步回调：

- **同步回调**：与模板模式几乎一致，都是在一个大的算法骨架中，自由替换其中的几个步骤，起到代码复用和扩展的功能；
- **异步回调**：其实更像是 **观察者模式**，因为异步回调其实并不是按照某套算法骨架的顺序执行，而是在执行完算法骨架后，在某个时间点（有不同的规则）触发这个回调函数。

::: info 为了方便理解，再列举一个异步回调的例子

在 JVM 中有一个 shutdown hook（钩子函数 hook 是基于回调的一种应用），可以在程序中事先注册一个 JVM 关闭的 Hook，等到程序关闭前，JVM 会自动调用 Hook。代码实例如下：

```java
public class ShutdownHookDemo {
  
    private static class ShutdownHook extends Thread {
        public void run() {
            System.out.println("I am called during shutting down.");
        }
  }

    public static void main(String[] args) {
        // 注册一个 shutdown hook
        Runtime.getRuntime().addShutdownHook(new ShutdownHook());
    }
  
}
```

这样就完成了一个 Hook 的注册，下面来看看 `addShutdownHook()` 的源码实现：

```java
public class Runtime {
    public void addShutdownHook(Thread hook) {
        SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            sm.checkPermission(new RuntimePermission("shutdownHooks"));
        }
        // 实际调用 ApplicationShutdownHooks.add(hook);
        ApplicationShutdownHooks.add(hook);
    }
}

class ApplicationShutdownHooks {
    /* The set of registered hooks */
    private static IdentityHashMap<Thread, Thread> hooks;
    static {
            hooks = new IdentityHashMap<>();
        } catch (IllegalStateException e) {
            hooks = null;
        }
    }

    static synchronized void add(Thread hook) {
        if(hooks == null)
            throw new IllegalStateException("Shutdown in progress");

        if (hook.isAlive())
            throw new IllegalArgumentException("Hook already running");

        if (hooks.containsKey(hook))
            throw new IllegalArgumentException("Hook previously registered");

        hooks.put(hook, hook);
    }

    static void runHooks() {
        Collection<Thread> threads;
        synchronized(ApplicationShutdownHooks.class) {
            threads = hooks.keySet();
            hooks = null;
        }
		
        // 遍历 hooks，执行
        for (Thread hook : threads) {
            hook.start();
        }
        for (Thread hook : threads) {
            while (true) {
                try {
                    hook.join();
                    break;
                } catch (InterruptedException ignored) {
                }
            }
        }
    }
}
```

可以看到，当应用程序关闭时，JVM 会调用 `runHooks()` 方法，将注册进来的 Hooks 并发的执行。

我们在注册完 Hook 后，并不需要等待 Hook 执行完成，而是在程序关闭时，JVM 会执行这些 Hook，所以是一种异步调用。而 JVM 就像是观察者模式中的观察者，当发先程序要关闭时，就会触发之前注入的事件（Hook）。

:::

从 **代码实现** 来看，**回调和模板模式完全不同**：

- 回调基于 **组合关系** 来实现，把一个对象传递给另一个对象，是一种对象之间的关系；
- 模板模式基于 **继承关系** 来实现，子类重的抽象方法，是一种类之间的关系。

在设计原则中也说过，组合优于继承，所以回调其实比模板模式更加灵活，主要体现在下面几个方面：

- 像 Java 这种只支持单继承的语言，基于模板模式编写的子类，只能继承一个父类，即只具备一种能力；
- 回调可以使用匿名类（或直接传递函数）来创建回调对象，无需先定义类；而模板模式不同的实现就需要定义多个不同的子类；
- 模板方法中的步骤方法是抽象方法时，子类需要实现每一个方法；而回调则没有限制，只需要往模板方法中注入回调对象/方法即可。

