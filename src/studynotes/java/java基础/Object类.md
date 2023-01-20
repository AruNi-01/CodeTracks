---
# 当前页面内容标题
title: Object 类
# 当前页面图标
icon: write
# 分类
category:
  - Java
# 标签
tag:
  - Java 基础

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

## 1. Object 介绍

**Object 类是所有类的父类**，任何一个类都 **间接或直接继承** 至 Object 类，所有对象（包括数组）都实现了此类的方法。

如果一个类没有直接明确继承哪一个类，那么它就是 Object 的直接子类：

```java
// 隐式继承
class User {
}

// 显示继承
class User extends Object {
}
```

因此，Object 类可以接受所有 **引用数据类型**，通过向下转为需要的类型使用。

```java
Object o = new User(1, "张三");
User user = (User) o;
```



Object 主要提供了以下 11 个方法：

```java
/**
 * 返回当前运行时对象的 Class 对象
 */
public final native Class<?> getClass()
    
/**
 * 返回对象的哈希码，主要使用在哈希表中，比如 HashMap、HashSet 等
 */
public native int hashCode()
    
/**
 * 比较 2 个对象的内存地址是否相等，String 类对该方法进行了重写以用于比较字符串的值是否相等
 */
public boolean equals(Object obj)
    
/**
 * 创建并返回当前对象的一份拷贝
 */
protected native Object clone() throws CloneNotSupportedException
    
/**
 * 返回对象的 字符串 表示形式，建议 Object 所有的子类都重写这个方法。
 */
public String toString()
    
/**
 * 唤醒一个在此对象监视器上等待的线程(监视器相当于就是锁的概念)，如果有多个线程在等待只会任意唤醒一个。
 */
public final native void notify()
    
/**
 * 跟 notify 一样，唯一的区别就是会唤醒在此对象监视器上等待的所有线程，而不是一个线程。
 */
public final native void notifyAll()
    
/**
 * 暂停线程的执行。注意：sleep 方法没有释放锁，而 wait 方法释放了锁 ，timeout 是等待时间。
 */
public final native void wait(long timeout) throws InterruptedException
    
/**
 * 多了 nanos 参数，这个参数表示额外时间（以毫微秒为单位），所以超时的时间还需要加上 nanos 毫秒。。
 */
public final void wait(long timeout, int nanos) throws InterruptedException
    
/**
 * 跟之前的 2 个 wait 方法一样，只不过该方法一直等待，没有超时时间这个概念
 */
public final void wait() throws InterruptedException
    
/**
 * 实例被垃圾回收器回收的时候触发的操作，JDK 9 已弃用
 */
protected void finalize() throws Throwable { }
```

## 2. equals() 和 == 的区别

`==` 对于基本类型和引用类型的作用效果是不同的：

- 对于 **基本数据类型** ，`==` 比较的是值；
- 对于 **引用数据类型**，`==` 比较的是对象的 **内存地址**；

因为 Java 只有 **值传递**，所以，对于 == 来说，不管是比较基本数据类型，还是引用数据类型的变量，其 **本质比较的都是值**，只不过 **引用类型** 变量存的值是 **对象的地址**。

`equals()` 用于判断两个对象是否相等。`equals()` 方法存在于 `Object` 类中，而 `Object` 类是所有类的直接或间接父类，因此 **所有的类都有 `equals()` 方法**。

`equals()` 方法存在两种使用情况：

- 类没有重写 `equals()` 方法：使用的是默认的 `Object` 类的 `equals()` 方法，直接使用 “==” 比较；
- 类重写了 `equals()` 方法：我们一般都重写 `equals()` 方法来比较两个对象中的 **属性** 是否相等；若它们的属性相等，则返回 true；

示例：

```java
class Test {
    public static void main(String[] args) {
        User user1 = new User(1, "张三");
        User user2 = new User(1, "张三");
        System.out.println(user1.equals(user2));	// false
    }
}

class User {
    int id;
    String name;
    
    // 构造函数略
}
```

可以发现，当没有重写 equals 方法时，默认使用 Object 的 equals 方法，直接使用 “==” 比较，两个对象的地址值肯定不一样，返回 false。

接下来自己重写 equals 方法，要求对象的值相同即可返回 true：

```java
class Test {
    public static void main(String[] args) {
        User user1 = new User(1, "张三");
        User user2 = new User(1, "张三");
        System.out.println(user1.equals(user2));	// true
    }
}

class User {
    int id;
    String name;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        User user = (User) o;
        return this.id == user.id && this.name.equals(user.name);
    }
    
    // 构造函数略
}
```

## 3. hashCode() 有什么用？

### 3.1 hashCode() 的作用

`hashCode()` 的作用是获取哈希码（`int` 整数），也称为散列码。这个哈希码的作用是确定该对象在哈希表中的索引位置。

`hashCode()` 定义在 JDK 的 `Object` 类中，这就意味着 Java 中的任何类都包含有 `hashCode()` 函数。

另外需要注意的是： `Object` 的 `hashCode()` 方法是本地方法，也就是用 C 语言或 C++ 实现的，该方法通常用来将对象的内存地址转换为整数之后返回。

散列表存储的是键值对(key-value)，它的特点是：**能根据 “键” 快速的检索出对应的 “值”。这其中就利用到了哈希码！（可以快速找到所需要的对象）**

### 3.2 为什么需要 hashCode？

以 “`HashSet` 如何检查重复” 为例子来说明为什么要有 `hashCode`：

- 当把对象加入 `HashSet` 时，`HashSet` 会先计算对象的 `hashCode` 值来判断对象加入的位置，同时也会与其他已经加入的对象的 `hashCode` 值作比较；
- 如果没有相同的 `hashCode`，`HashSet` 会假设对象没有重复出现；
- 但是如果发现 **有相同 `hashCode` 值的对象**，这时会 **调用 `equals()` 方法** 来检查 `hashCode` 相等的对象是否真的相同：
    - 如果两者相同，`HashSet` 就不会让其加入操作成功。
    - 如果 **不同** 的话，说明发生了哈希冲突，就会 **重新散列到其他位置**。

可以发现，HashSet 会先使用 hashCode 来判断是否有重复元素，只有当 HashCode 相等时（发生了哈希冲突），才会调用 equals 方法进一步判断对象是否真的相等。这样我们就 **大大减少了 `equals` 的调用次数，提高了执行速度**。

因此，`hashCode()` 和 `equals()` 其实都是用于比较两个对象是否相等，只不过 hashCode() 的说服力没有那么强，毕竟 hashCode 存在哈希冲突。

因为存在哈希冲突的可能，因此 **两个对象的 `hashCode` 值相等并不代表两个对象就相等**。

现在问题又来了，既然 `hashCode()` 没有 `equals()` 说服力强，那为什么还需要 `hashCode()` 呢？直接使用 `equals()` 不就好了吗？？

这是因为在一些容器（比如 `HashMap`、`HashSet`）中，有了 `hashCode()` 之后，**判断元素是否在对应容器中的效率会更高**（参考添加元素进 `HashSet` 的过程）。

总结下来就是：

- 如果两个对象的 `hashCode` 值相等，那这两个对象不一定相等（哈希碰撞）；
- 如果两个对象的 `hashCode` 值相等，且 `equals()` 也返回 `true`，才认为这两个对象相等；
- 如果两个对象的 `hashCode` 值不相等，那么直接肯定这两个对象不相等；

### 3.3 重写 equals() 时必须重写 hashCode() ？

每个类的用途不一样，因此下面分为 **该类是否被散列表使用** 来讨论。

::: tip 类不会被散列表使用
:::

当我们不在 HashSet，HashTable，HashMap 等等这些 **本质是散列表** 的数据结构中用到这个类时，`equals()` 用来比较该类的两个对象是否相等，而 **hashCode() 则根本使用不到**。

因为不是散列表的结构中，不会调用什么 `hashCode()` 方法，所以 **重不重写都没关系**。

::: tip 类会被散列表使用
:::

当该类会被散列表使用时，该类的 `hashCode()` 和 `equals` 是有关系的：

- 如果两个对象相等，那么它们的 hashCode() 值一定相同。这里的 “对象相等” 是指通过 `equals()` 比较两个对象时返回 true；
- 如果两个对象的 **hashCode 相等**，**它们的 `equals()` 不一定相等**。因为存在 **哈希冲突**；

因为散列表的数据结构 HashSet、HashMap 等在方法中都会调用 `hashCode()` 方法，所以为了安全，必须重写 `hashCode()`。

**若没有重写 `hashCode()`，会有什么问题呢**？

在添加对象时：如果 **只重写了 equals**，那么只要 **值相等**，我们就认为对象相等，但若这两个对象的 **哈希值不相等**，在 **HashSet 中根据哈希值** 来判断两个对象是否相等时就会 **认为这两个对象不相等**，因此将它们 **都装入集合中**，这显然是有问题的。

例如，下面我们只重写了 `equals()`，可以发现，我们认为两个对象的值相等就是相同了，但由于它们的 hashCode 不同，HashSet 将它们都添加进集合了：

```java
class Test {
    public static void main(String[] args) {
        User user1 = new User(1, "aaa"), user2 = new User(1, "aaa");
        HashSet<User> set = new HashSet<>();
        set.add(user1); set.add(user2);
        for (User user : set) System.out.println(user);
    }
}
/* 输出：
User{id=1, name='aaa'}
User{id=1, name='aaa'}
*/

class User {
    int id;
    String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;
        return this.id == user.id && this.name.equals(user.name);
    }
    
    // 构造方法、toString() 略
}
```

现在我们重写 `hashCode()`，根据 id 和 name 属性来生成 hashCode，保证对象的属性值相同，hashCode 也相同。此时 HashSet 中只有一个对象：

```java
class Test {
    public static void main(String[] args) {
        User user1 = new User(1, "aaa"), user2 = new User(1, "aaa");
        HashSet<User> set = new HashSet<>();
        set.add(user1); set.add(user2);
        for (User user : set) System.out.println(user);
    }
}
/* 输出：
User{id=1, name='aaa'}
*/

class User {
    int id;
    String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;
        return this.id == user.id && this.name.equals(user.name);
    }
    
    @Override
    public int hashCode() {
        // 根据 id 和 name 属性来生成 hashCode
        return Objects.hash(id, name);
    }
    
    // 构造方法、toString() 略
}
```

如果你翻开过 String 类的源码，会发现 String 类不仅重写了 `equals()`，还重写了 `hashCode()` 方法，因为 String 类是我们编程时使用得最多的类，也常常将它用作 HashMap 的 key，而 HashMap 的 key 是不可以重复的。正因为 String 类已经帮我们重写好了相关方法，所以我们使用 String 类时才如此方便安全。

## 4. 参考文章
- [Java Guide](https://javaguide.cn/)