---
# 当前页面内容标题
title: 观察者模式（下）：实现一个 EventBus 框架
# 短标题，侧边栏、导航栏中显示
shortTitle: 观察者模式（下）
date: 2023-06-18
order: 2
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

在上一篇文章中，我们知道了 **观察者模式有几种不同的实现方式**：

- **同步阻塞**：经典实现方式，主要为了代码解耦；
- **异步非阻塞**：除了解耦外，也能提高执行效率；
- **进程内**：上面两种就属于进程内，在同一个程序中执行的；
- **进程间**：更加彻底的解耦，一般基于 MQ 实现。

那么本篇文章将聚焦于异步非阻塞的方式，实现一个类似 Google Guava EventBus 的通用框架，对观察者模式进行封装，让其在项目中使用更简便。

:::

## 1. 异步非阻塞方式的简易实现

我们先来看看最简单的异步非阻塞方式实现的观察者模式，不用考虑通用型、复用性等，实现起来是非常容易的。

还是拿 [观察者模式（上）：理解观察者模式](https://aruni.me/docs/studynotes/design_pattern/pattern/behaviour_type/%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F%EF%BC%88%E4%B8%8A%EF%BC%89%EF%BC%9A%E7%90%86%E8%A7%A3%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F.html) 中的例子说明，有两种实现方式：

- 创建一个新线程去执行每个监听者需要执行的方法，其他代码不变：

  ```java
  class RegisterPromotionListener implements RegisterListener {
      private PromotionService promotionService;
  
      @Override
      public void handleRegisterSuccess(long userId) {
          // 启动一个线程去执行
          new Thread(() -> promotionService.issueNewUserExperienceCash(userId)).start();
      }
  }
  ```

- 在被监听者者的 `notifyListeners()` 方法中使用线程池来执行每个观察者的方法，其他代码不变：

  ```java
  // 触发器（被监听者）
  class RegisterDispatcher {
      private List<RegisterListener> listeners = new ArrayList<>();
  
      private Executor executor = Executors.newFixedThreadPool(3);
  
      public void addListener(RegisterListener listener) {
          listeners.add(listener);
      }
  
      public void removeListener(RegisterListener listener) {
          listeners.remove(listener);
      }
  
      public void notifyListeners(long userId) {
          for (RegisterListener listener : listeners) {
              // 使用线程池去执行该任务
              executor.execute(() -> listener.handleRegisterSuccess(userId));
          }
      }
  }
  ```

上面的实现方式虽然可行，但 **无法做到复用**，如果有多个业务模块都需要使用到异步非阻塞的观察者模式，那么每个业务模块都要实现一遍。

如果需求更极端一点，我们想要 **在同步阻塞和异步非阻塞之间灵活切换**，那就要 **不停地修改对应的代码**，也不符合 “对扩展开放，对修改关闭” 原则

那如何解决呢？造个轮子呗。我们知道，框架的作用主要就是 **隐藏实现细节、降低开发难度、做到代码复用、解耦业务与非业务代码，让程序员聚焦业务的开发**。

所以我们也可以将异步非阻塞的观察者模式抽象成一个框架来使用，这就是本章要实现的 EventBus。

## 2. Guava 的 EventBus

### 2.1 使用 EventBus

**EventBus** 意为 “事件总线”，它提供了 **观察者模式的骨架代码**，基于它我们能很方便的在业务中使用观察者模式。

Google 的 Guava EventBus 是一个比较著名的 EventBus 框架，它支持同步阻塞和异步非阻塞模式。

我们还是通过上一章的例子，来看看 Guava EventBus 有哪些好用的功能。Guava EventBus 改造后的代码如下：

```java
// 无需实现任何 Listener 接口
class RegisterPromotionListener {
    private PromotionService promotionService;

    // 使用 @Subscribe 声明监听者
    @Subscribe
    public void handleRegisterSuccess(Long userId) {
        promotionService.issueNewUserExperienceCash(userId);
    }
}

class RegisterNotificationListener {
    private NotificationService notificationService;

    @Subscribe
    public void handleRegisterSuccess(Long userId) {
        notificationService.sendInboxMessage(userId, "Welcome...");
    }
}

class UserController {
    private UserService userService;

    private static final int DEFAULT_EVENTBUS_THREAD_POOL_SIZE = 20;
    // eventBus = new EventBus(); // 同步阻塞模式
    private EventBus eventBus = new AsyncEventBus(Executors.newFixedThreadPool(DEFAULT_EVENTBUS_THREAD_POOL_SIZE));

    public Long register(String telephone, String password) {
        // 省略输入参数的校验代码
        // 省略 userService.register() 异常的 try-catch 代码
        long userId = userService.register(telephone, password);

        addListenerOfRegister();

        // 通过 eventBus.post 派发消息（触发被 @Subscribe 注解的方法）
        eventBus.post(userId);

        return userId;
    }

    // 添加 Register 相关的 Listener，实际场景可以把 List 作为参数，由外部调用者决定要注入什么 Listener
    private void addListenerOfRegister() {
        List<Object> listeners = new ArrayList<>();
        listeners.add(new RegisterNotificationListener());
        listeners.add(new RegisterPromotionListener());
        setRegisterListeners(listeners);
    }
  
    // 向 eventBus 中注册监听者
    private void setRegisterListeners(List<Object> listeners) {
        for (Object listener : listeners) {
            eventBus.register(listener);
        }
    }
}
```

使用 EventBus 后，与之前的方式相比，主要有以下几点的异同：

- 都需要使用 register 方法注册 Listener：
  - 之前的方式：使用一个 List 容器保存所有 Listener，register 方法就是向 List 中添加 Listener；
  - EventBus：无需容器，直接使用 eventBus 的 register 方法即可。
- 都需要调用某个方法通知 Listener：
  - 之前的方式：使用 Dispatcher 提供的 notify 方法（遍历 List，执行 Listener 的业务逻辑）；
  - EventBus：使用 eventBus 的 post 方法即可。
- **基于 EventBus 无需定义 Listener 接口**，任意类型的对象都可以注册到 EventBus 中，通过 `@Subscribe` 来标明。

### 2.2 Guava EventBus 主要组件

下面来看看 Guava EventBus 中的主要类和函数。

::: tip EventBus、AsyncEventBus

Guava EventBus 对外暴露的所有接口都封装在 EventBus 类中，其中：

- **EventBus 是同步阻塞的观察者模式**；
- **AsyncEventBus** 继承自 EventBus，提供了 **异步非阻塞的观察者模式**。

具体使用方式如下：

```java
EventBus eventBus = new EventBus(); // 同步阻塞模式
EventBus eventBus = new AsyncEventBus(Executors.newFixedThreadPool(8))；// 异步阻塞模式
```

:::



::: tip register() 函数

EventBus 使用 **`register()` 来注册观察者**。函数签名如下：

```java
public void register(Object object);
```

它可以接受 **任何类型（Object）的观察者**。而经典实现方式中，`register()` 接受的类对象必须要实现某同一父观察者接口。

:::



::: tip unregister() 函数

与上面的 `register()` 相对，用来 **从 EventBus 中删除一个观察者**，函数签名如下：

```java
public void unregister(Object object);
```

:::



::: tip post() 函数

EventBus 使用 **`post()` 函数给观察者发送消息**，函数签名如下：

```java
public void post(Object event);
```

与经典的观察者模式不同，当调用 `post()` 函数发送消息时，并不是发送给所有的观察者，而是 **发送给可匹配的观察者**，可匹配指 **能接收的消息类型是发送消息（post 函数中定义的 event）类型的同类或父类**。

什么意思呢？举个例子你就懂了。假如：

- Listener_A 能接收的消息类型是 Msg_A；
- Listener_B 能接收的消息类型是 Msg_B；
- Listener_C 能接收的消息类型是 Msg_C；

其中：

- Msg_A 是 Msg_B 的父类。

当发送消息时，能接收到消息的可匹配观察者情况如下：

```java
public class Listener_A {
    // Listener_A 能接收的消息类型是 Msg_A
	@Subscribe
	public void handleMessage(Msg_A msgA) {
    	// ......
    }
}
public class Listener_B {
    // Listener_B 能接收的消息类型是 Msg_B，但 Msg_B 继承自 Msg_A，所以此时 Listener_A 也能收到消息
	@Subscribe
	public void handleMessage(Msg_B msgB) {
    	// ......
    }
}
// Listener_C 和 Msg_A、Msg_B、Msg_C 的定义略

// 使用
Msg_A MsgA = new Msg_A();
Msg_B MsgB = new Msg_B();
Msg_C MsgC = new Msg_C();

post(MsgA); 	// => Listener_A 接收到消息
post(MsgB); 	// => Listener_A、Listener_B 接收到消息
post(MsgC); 	// => Listener_C 接收到消息
```

也就是说 post 函数 **不仅会把消息发送给该消息所对应的 Listener，还会发给该消息类型的父类对应的 Listener**。

每个 Listener 能接收的消息类型就是用 `@Subscribe` 注解标明。

:::



::: tip @Subscribe 注解

EventBus 通过 **`@Subscribe` 注解标明某个函数能接收哪种类型的消息**。具体使用示例如下：

```java
public ListenerA {
    //...省略其他属性和方法...

    @Subscribe
    public void f1(PMsg event) { //... }

    @Subscribe
    public void f2(QMsg event) { //... }
}
```

EventBus 整体流程如下：

1. **通过 `register()` 函数将 ListenerA 类对象注册进 EventBus 时，EventBus 会根据 `@Subscribe` 注解找到 `f1()` 和 `f2()`，并将两个函数能接收的消息类型记录下来**（PMsg -> f1，QMsg -> f2）；
2. **通过 `post(Object event)` 发送消息时，EventBus 会通过之前的记录（消息类型 -> 函数），根据参数 event 调用相应的函数**。

所以我们在使用 Guava EventBus 时，一般都会定义自己的 event，然后使用 Listener 进行订阅（监听）event，等待消息的发送（使用 post）。

:::

参考 Guava EventBus 的设计，我们下面就来简单的实现一下我们自己的 EventBus。

## 3. 自己实现一个 EventBus 框架

### 3.1 EventBus 核心点剖析

通过上面的分析，可以发现 EventBus 中最核心的就是 **`register()` 和 `post()`** 的实现，所以我们先来分析下这两个函数如何实现。

下面是这两个函数的实现原理图：

![image-20230618174104603](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202306181741954.png)

可以发现，两个函数都使用到了 **Observer 注册表，它记录了消息类型和可接收函数的对应关系**：

- 当调用 `register()` 注册观察者时，EventBus 通过解析 `@Sebscribe` 注解，生成 Observer 注册表；
- 当调用 `post()` 发送消息时，EventBus 通过注册表找到相应的可接收消息的函数，然后通过反射来动态地创建对象、执行相应的函数。

而对于同步阻塞和异步非阻塞的实现，唯一的差异只在于：是在一个线程内依次执行相应的函数，还是使用一个线程池来执行。

### 3.2 EventBus 具体实现

通过了上面的原理分析，下面的实现就比较简单了，整个 EventBus 由 5 个类组成：EventBus、AsyncEventBus、Subscribe、ObserverAction、ObserverRegistry。

::: tip Subscribe

:::

SubScribe 是一个注解，用于 **标明观察者中的哪个函数可以接受消息**。

```java
/**
 * @desc: 用于标明观察者中的哪个函数可以接受消息
 * 注解 @Beta 是 Guava 中一个表示处于 Beta 阶段的 API（无影响）
 * @author: AruNi_Lu
 * @date: 2023-06-18
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Beta
public @interface Subscribe {
}
```



::: tip ObserverAction

:::

**ObserverAction 类用来表示 `@Subscribe` 注解的方法**，其中：

- target 表示观察者类；
- method 表示观察者类中的方法。

该类主要用在 ObserverRegistry 的 Observer 注册表中。

```java
/**
 * @desc: 用来表示 @Subscribe 注解的方法
 * @author: AruNi_Lu
 * @date: 2023-06-18
 */
public class ObserverAction {
    private Object target;
    private Method method;

    public ObserverAction(Object target, Method method) {
        // Preconditions.checkNotNull() 由 google.common.base 提供
        this.target = Preconditions.checkNotNull(target);
        this.method = method;

        // 暴力破解，使其具有直接访问和修改私有元素的能力
        this.method.setAccessible(true);
    }

    /**
     * 执行方法
     * @param event method 方法的参数
     */
    public void execute(Object event) {
        try {
            method.invoke(target, event);
        } catch (IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

}
```



::: tip ObserverRegistry

:::

ObserverRegistry 类就是 Observer 注册表，也是最复杂的一个类，框架中的核心逻辑都在这个类中。

该类大量使用了 Java 的反射语法，还有一个比较巧妙的 CopyOnWriteArraySet 的使用。

> **CopyOnWriteArraySet** 使用的是 **写时复制技术**，用来解决 **读写时的并发问题**。
>
> 具体来说，在写入数据时，会创建出一个新的 set，然后将原始数据 clone 到新的 set 中，在新的 set 中进行写操作，这样就不会影响读操作。等新的 set 中写入数据完成后，再用新的 set 替换老的 set 即可。
>
> 不用担心并发写问题，因为 **CopyOnWriteArraySet 会通过加锁的方式避免并发写问题**。

该类的实现如下：

```java
/**
 * @desc: Observer 注册表
 * @author: AruNi_Lu
 * @date: 2023-06-18
 */
public class ObserverRegistry {

    // Observer 注册表
    private ConcurrentMap<Class<?>, CopyOnWriteArraySet<ObserverAction>> registry = new ConcurrentHashMap<>();

    /**
     * 注册 observer
     * @param observer observer 类
     */
    public void register(Object observer) {
        // 获取该 observer 类的所有 ObserverAction
        Map<Class<?>, Collection<ObserverAction>> observerActions = findAllObserverActions(observer);

        // 遍历所有 ObserverAction，添加到 registry
        for (Map.Entry<Class<?>, Collection<ObserverAction>> entry : observerActions.entrySet()) {
            Class<?> eventType = entry.getKey();
            Collection<ObserverAction> eventActions = entry.getValue();
            
            CopyOnWriteArraySet<ObserverAction> registeredEventActions = registry.get(eventType);

            // 初始化，避免并发场景下出现错误
            if (registeredEventActions == null) {
                registry.putIfAbsent(eventType, new CopyOnWriteArraySet<>());
                registeredEventActions = registry.get(eventType);
            }
            registeredEventActions.addAll(eventActions);
        }
    }

    /**
     * 获取与该 event 向匹配的所有 ObserverAction（发送消息类型的同类或父类）
     * @param event event
     * @return 所有 ObserverAction
     */
    public List<ObserverAction> getMatchedObserverActions(Object event) {
        List<ObserverAction> matchedObservers = new ArrayList<>();

        Class<?> postedEventType = event.getClass();
        for (Map.Entry<Class<?>, CopyOnWriteArraySet<ObserverAction>> entry : registry.entrySet()) {
            Class<?> eventType = entry.getKey();
            CopyOnWriteArraySet<ObserverAction> eventActions = entry.getValue();

            // 判断 eventType 是否由 postedEventType 派生而来，是说明该 eventType 对应的 eventActions 符合条件
            if (eventType.isAssignableFrom(postedEventType)) {
                matchedObservers.addAll(eventActions);
            }
        }
        return matchedObservers;
    }

    /**
     * 获取该 observer 类的所有 ObserverAction
     * @param observer observer 类
     * @return 所有 eventType 和其对应的 ObserverAction
     */
    private Map<Class<?>, Collection<ObserverAction>> findAllObserverActions(Object observer) {
        Map<Class<?>, Collection<ObserverAction>> observerActions = new HashMap<>();

        Class<?> clazz = observer.getClass();

        // 获取该类所有使用了 @Subscribe 标注的方法，遍历将其添加进 observerActions
        for (Method method : getAnnotatedMethods(clazz)) {
            Class<?>[] parameterTypes = method.getParameterTypes();
            Class<?> eventType = parameterTypes[0];

            // 初始化
            if (!observerActions.containsKey(eventType)) {
                observerActions.put(eventType, new ArrayList<>());
            }
            observerActions.get(eventType).add(new ObserverAction(observer, method));
        }
        return observerActions;
    }

    /**
     * 获取该类使用了 @Subscribe 标注的方法
     * @param clazz 类
     * @return 符合条件的方法集合
     */
    private List<Method> getAnnotatedMethods(Class<?> clazz) {
        List<Method> annotatedMethods = new ArrayList<>();

        for (Method method : clazz.getDeclaredMethods()) {
            // 判断该方法是否用了 @Subscribe 标注
            if (method.isAnnotationPresent(Subscribe.class)) {
                Class<?>[] parameterTypes = method.getParameterTypes();
                // 方法的参数必须只有一个
                Preconditions.checkArgument(parameterTypes.length == 1,
                        "Method %s has @Subscribe annotation but has %s parameters."
                                + "Subscriber methods must have exactly 1 parameter.",
                        method, parameterTypes.length);
                annotatedMethods.add(method);
            }
        }
        return annotatedMethods;
    }

}

```



::: tip EventBus

:::

EventBus 的实现是同步阻塞的，但是我们也使用到了线程池 Executor，因为这样可以做到代码复用，很容易就实现了后面的 AsyncEventBus（可以直接继承 EventBus）。

> `MoreExecutors.directExecutor()` 是 Google Guava 提供的工具类，该 Executor 实际上是单线程。

```java
/**
 * @desc: 同步阻塞的观察者模式
 * @author: AruNi_Lu
 * @date: 2023-06-18
 */
public class EventBus {

    private Executor executor;
    private ObserverRegistry registry = new ObserverRegistry();

    public EventBus() {
        // MoreExecutors.directExecutor()，Guava 提供的单线程 Executor
        this(MoreExecutors.directExecutor());
    }

    protected EventBus(Executor executor) {
        this.executor = executor;
    }

    public void register(Object object) {
        registry.register(object);
    }
    
    public void post(Object event) {
        // 获取消息可匹配的函数
        List<ObserverAction> observerActions = registry.getMatchedObserverActions(event);
        
        for (ObserverAction observerAction : observerActions) {
            executor.execute(() -> observerAction.execute(event));
        }
    }
}

```



::: tip AsyncEventBus

:::

AsyncEventBus 的实现就非常简单了，继承 EventBus，直接从外部传进来一个 Executor，再调用父类的构造器即可：

```java
/**
 * @desc: 异步非阻塞的观察者模式
 * @author: AruNi_Lu
 * @date: 2023-06-18
 */
public class AsyncEventBus extends EventBus {
    public AsyncEventBus(Executor executor) {
        super(executor);
    }
}

```


到此，一个简易的 Eventbus 框架就完成了，可以将上面 Guava EventBus 的类全部替换成我们自己写的，来测试下看看效果是否一样。

当然了，在细节方面，Guava 做了很多优化，比如在注册表中查找消息可匹配函数的算法，这些可以去 Guava 源码中学习。


