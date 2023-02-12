---
# 当前页面内容标题
title: HashMap 源码分析：数据结构
date: 2023-2-10
order: 3
# 当前页面图标
icon: write
# 分类
category:
 - Java
# 标签
tag:
 - 集合

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

> 本文来源 [bugstack](https://bugstack.cn/)，加上了自己的理解！

## **1. 介绍**

HashMap 最早出现在 JDK 1.2 中，主要用于存放键值对（key-value），底层基于散列算法实现，是 **线程不安全的**。

HashMap 中允许 null 键和 null 值，但 **null 作为 key 只能有一个**，null 作为 value 可以有多个。

HashMap 涉及到的知识点非常多，设计的思想也很优秀，其中包括：**散列表实现、扰动函数、初始化容量、负载因子、扩容元素拆分、链表树化/红黑树化、插入、查找、删除、遍历** 等。

本章分为两部分讲解 HashMap 的源码分析，第一部分着重于数据结构的使用上，包括散列表实现、扰动函数、初始化容量、负载因子、扩容元素拆分；第二部分着重于功能的实现，包括链表树化/红黑树化、插入、查找、删除、遍历等。

## **2. 最简单的 HashMap**

学习 HashMap 前，最好的方式是先了解这是一种怎么样的数据结构来存放数据。现今的 HashMap 很复杂，所以先从基本出发，来看看一个最简单、最根本的 HashMap 是什么样子的。

**提出问题**：假设有 7 个字符串，需要存放到数组中，但要求在获取每个元素的时候时间复杂度是 O(1)。也就是说不能通过循环遍历的方式进行获取， 而是要定位到数组 ID 直接获取相应的元素。

**解决方案**：如果需要通过 ID 从数组中获取元素，那么就需要把每个字符串都计算出一个在数组中的位置 ID。字符串获取 ID 有什么方式？ 一个字符串最直接的获取跟数字相关的信息就是 HashCode，可是 HashCode 的取值范围太大了 `[-2147483648, 2147483647]`，不可能直接使用。那么就需要使用 HashCode  与数组长度做取模运算，得到一个可以在数组中出现的位置。如果说有两个元素经运算得到相同的 ID，那么这个数组 ID 下就存放两个字符串，这是一种解决哈希冲突的简单方法。

其实就是把字符串散列到数组中，下面来具体实现一下这个简单的 HashMap。

```java
public class SimpleHashMap {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("HashCode");
        list.add("Map");
        list.add("Index");
        list.add("Key");
        list.add("Value");
        list.add("put");
        list.add("remove");

        // 存放的数组
        String[] tab = new String[8];

        // 存入数组
        for (String val : list) {
            // 得到索引位置（hashCode() 方法可能返回负数）
            int idx = Math.abs(val.hashCode()) % tab.length;
            System.out.println("ID: " + idx + "，值：" + val);

            // 该索引位置还没有元素，则直接存放
            if (tab[idx] == null) {
                tab[idx] = val;
            } else {    // 否则连接存放（模拟链表）
                tab[idx] += " -> " + val;
            }
        }

        System.out.println("存放结果：" + Arrays.toString(tab));
    }
}
```

测试结果：

```java
ID: 3，值：HashCode
ID: 4，值：Map
ID: 2，值：Index
ID: 7，值：Key
ID: 1，值：Value
ID: 7，值：put
ID: 4，值：remove
存放结果：[null, Value, Index, HashCode, Map -> remove, null, null, Key -> put]

Process finished with exit code 0
```

这样就完成了一个简单 HashMap 的设计，将元素散列存放到数组中，最后通过字符串元素的索引 ID 进行获取对应的字符串。

::: info 最简单的 HashMap 有哪些问题？

上面这个最简单的 HashMap 只能算得上是一个散列数据存储的雏形，在实际使用中是有很多问题的：

- 如果 **哈希碰撞严重**，那么一个索引位置就可能存放多个元素，这样定位后再查找仍需要很长时间；
- 在计算索引 ID 时，使用的是 **取模操作**，效率不及位运算；
- 存储元素的数组越小，哈希碰撞几率越大，但数组增大又会消耗更多的空间，**如何衡量时间与空间**？
- 随着元素的不断增加，数组长度不足时需要 **扩容**，如何把原有的元素重新散列到新的位置上。

以上这些问题可以归纳为：**扰动函数、初始化容量、负载因子、扩容方法以及链表和红黑树转换的使用** 等。

:::

## **3. 扰动函数**

在 HashMap 存放元素时候有这样一段代码来处理哈希值，这是 **散列值扰动函数**，用于优化散列效果：

```java
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
```

### **3.1 为什么使用扰动函数**

理论上来说字符串的 hashCode是一个 int 类型值，那可以直接作为数组下标了，且不会出现碰撞。但是这个 hashCode 的取值范围是 `[-2147483648, 2147483647]`， 有将近 40 亿的长度，谁也不能把数组初始化的这么大，内存也是放不下的。

默认初始化的 Map 大小是 16 个长度（`DEFAULT_INITIAL_CAPACITY = 1 << 4`），所以获取的 Hash 值并不能直接作为下标使用，需要与数组长度进行取模运算得到一个下标值，也就是上面做的散列例子。

那么 HashMap 源码这里不只是直接获取哈希值，**还进行了一次扰动计算**，`(h = key.hashCode()) ^ (h >>> 16)`。把哈希值右移 16 位，也就正好是自己 **长度的一半**，之后 **与原哈希值做异或运算**，这样就 **混合了原哈希值中的高位和低位**，**增大了随机性**。计算方式如下图：

![扰动函数](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302091627591.png)

使用扰动函数就是为了 **增加随机性**，让数据元素 **更加均衡的散列，减少碰撞**。

### **3.2 实验验证扰动函数**

从上面的分析可以看出，扰动函数使用了哈希值的高半区和低半区做异或，混合原始哈希码的高位和低位，以此来加大低位区的随机性。

但看不到实验数据的话，这终究是一段理论，具体这段哈希值真的被增加了随机性没有，并不知道。所以这里我们要做一个实验，这个实验是这样做；

1. 选取 10 万个单词词库；
2. 定义 128 位长度的数组格子；
3. 分别计算在扰动和不扰动下，10 万单词的下标分配到 128 个格子的数量；
4. 统计各个格子数量，生成波动曲线。如果扰动函数下的波动曲线相对更平稳，那么证明扰动函数有效果。

下面的索引下标计算方法中，`disturbHashIdx()` 使用了扰动函数，`hashIdx()` 没有使用扰动函数：

```java
public class Disturb {
    // 使用扰动函数
    public static int disturbHashIdx(String key, int size) {
        return (size - 1) & (key.hashCode() ^ (key.hashCode() >>> 16));
    }

    // 未使用扰动函数
    public static int hashIdx(String key, int size) {
        return (size - 1) & key.hashCode();
    }
}
```

测试方法：

```java
// 10 万单词已经初始化到 words 中
public void test_disturb() {
    Map<Integer, Integer> map = new HashMap<>(16);
    for (String word : words) {
        // 使用扰动函数
        int idx = Disturb.disturbHashIdx(word, 128);
        // 不使用扰动函数
        // int idx = Disturb.hashIdx(word, 128);
        if (map.containsKey(idx)) {
            Integer integer = map.get(idx);
            map.put(idx, ++integer);
        } else {
            map.put(idx, 1);
        }
    }
    System.out.println(map.values());
}
```

以上分别统计两种函数下的下标值分配，最终将统计结果放到 Excel 中生成图表：

- **未使用扰动函数**：

    ![未使用扰动函数](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302091627728.png)

- **使用扰动函数**：

    ![使用扰动函数](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302091627119.png)

从这两种的对比图可以看出来，**在使用了扰动函数后，数据分配的更加均匀了**。

数据分配均匀，也就是散列的效果更好，减少了 hash 的碰撞，让数据存放和获取的效率更佳。

## **4. 初始化容量和负载因子**

### **4.1 (n - 1) & hash 的设计**

在上面简单 HashMap 的实现中，计算索引时使用的是 **取模操作**，这是最简单、效率比较低的设计方案。在真正的 HashMap 中，**计算索引的方式是 `(n - 1) & hash`**，为什么要这么设计呢？

::: info 位运算比取模运算效率高

首先的一个原因就是 **取模运算的效率较低**，数据量越大，取模运算消耗的时间比位运算越多。

当 HashMap 的容量足够大，一旦触发扩容机制，需要进行 rehash（将原来的元素重新计算新的索引位置，放到新的表中），那么当大量元素进行索引值的计算时，运行时间是很长的。

:::

::: info 疑问：(n - 1) & hash 和 hash % n 的结果是等价的吗？

使用 `(n - 1) & hash` 计算出来的下标和 `hash % n` 能一样吗？如果不一样的话怎么能将元素散列到数组中？

这就是为什么 **HashMap 的容量一定要是 2 的幂次方**。当 n 为 2 的幂次方时，满足一个公式：**(n - 1) & hash = hash % n**。

:::

::: info (n - 1) & hash 能保证索引不越界

在上面简单 HashMap 的实现中，为了防止字符串的 hashCode 为负数，我们对计算出来的 hashCode 进行了取绝对值运算。

> **hashCode 为什么会有负数**？
>
> 字符串计算哈希码的方法是：每个字符的 ASCII 码 +（31 × 前一个字符的哈希码），第一个字符的的哈希码就为它的 ASCII 码。具体实现如下：
>
> ```java
>  public static int hashCode(byte[] value) {
>      int h = 0;
>      int length = value.length >> 1;
>      for (int i = 0; i < length; i++) {
>          h = 31 * h + getChar(value, i);
>      }
>      return h;
>  }
> ```
>
> 所以当字符串足够长时，哈希码相加到最后是会超过 int 的最大值的，就变成了负数。

而采用 `(n - 1) & hash` 的设计方法，**当 n 是 2 的幂次方时，n - 1 的二进制表示为末尾都是连续的 1**（`011111` 这样的形式，前面补 0 来充满 32 位即可）。

当 (n - 1) 和 hash 做与运算时，n - 1 一定是正数，符号位为 0，所以不论 hash 的值是正还是负，进行 `&` 运算后符号位一定为 0（正数）。

:::

### **4.2 初始化容量**

从上面知道，**HashMap 的容量一定要是 2 的幂次方**，HashMap 的默认初始化容量是 16（2^4）。

如果我们自己将 HashMap 的容量初始化为 17（`new HashMap<>(17)`），会发生什么呢？

在 HashMap 的初始化方法中，有这样一段代码：

```java
    public HashMap(int initialCapacity, float loadFactor) {
        // 容量合法性校验...
        
        this.loadFactor = loadFactor;
        this.threshold = tableSizeFor(initialCapacity);
    }
```

- `loadFactor` 是 HashMap 的加载因子，默认为 0.75；

- 阈值 `threshold`，它通过 `tableSizeFor()` 方法进行计算，返回值的是 **大于等于 `initialCapacity` 的最小 2 次幂**。

::: danger 注意：

HashMap 中并没有容量这个属性，**初始化时直接将容量赋值给了阈值 `threshold`**，而且并没有初始化 `table`。

当插入第一个元素时，才会初始化 `table` 和设置重新计算阈值 `threshold`，后面会详细讲解。

:::

所以如果我们将初始化容量设置为 17 的话，HashMap 会自动给我们将容量设置成大于等于 `initialCapacity` 的最小 2 次幂，即 32（2^5）。

我们可以利用反射机制，来验证一下以上结论：

```java
public class Solution {
    public static void main(String[] args) throws Exception {
        Map<Object, Object> map = new HashMap<>(17);
        Class<? extends Map> mapClass = map.getClass();

        // HashMap 中没有 capacity 这个属性，但通过 capacity() 方法可以获取（其实就是返回 table.length）
        Method capacityMethod = mapClass.getDeclaredMethod("capacity");
        Field thresholdField = mapClass.getDeclaredField("threshold");
        capacityMethod.setAccessible(true);
        thresholdField.setAccessible(true);

        System.out.println("容量：" + capacityMethod.invoke(map) + "，阈值：" + thresholdField.get(map));
        map.put(1, 1);
        System.out.println("---插入元素后，阈值才重新计算---");
        System.out.println("容量：" + capacityMethod.invoke(map) + "，阈值：" + thresholdField.get(map));
    }
}
```

测试结果：

```java
容量：32，阈值：32
---插入元素后，阈值才重新计算---
容量：32，阈值：24
```

### **4.3 负载因子**

HashMap 中的负载因子默认为 0.75：

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

**负载因子的作用**：

- 负载因子决定了 **数据量** 多少了以后进行扩容；

因为我们的元素是经过散列后存放到数组中的，所以可能会出现有些位置有多个元素，有些位置始终没有元素。这就可能导致 **即使数据量大于容量时，数组的位置还没被占满，而某些位置又出现了大量的碰撞，这样在查找时性能极低**。

所以，要选择一个合理的大小下进行扩容，加载因子的默认值为 0.75，**阈值 `threshold` 等于 `capacity * loadFactor`**，**HashMap 是根据阈值来进行扩容的**，也就是说当阈值容量占了 3/4 时赶紧扩容，以减少 Hash 碰撞。

0.75 是一个默认构造值，在创建 HashMap 也可以调整：

- 如果想 **提高查找效率**，则可以 **将负载因子调小**，以减少碰撞。但会导致更容易扩容，浪费了空间；
- 如果想 **节约存储空间**，则可以 **将负载因子调大**，以延迟扩容的时机。但会导致更多的哈希碰撞，降低了查找效率。

> 0.75 是 JVM 团队经过大量测试得出的最合适的值，平衡了时间和空间。

## **5. 扩容元素拆分**

数组长度不足了就需要扩容，扩容后的容量为 **之前的 2 倍**，因为需要维持容量是 2 的幂次方。

扩容最直接的问题，就是需要把元素拆分到新的数组中。

拆分元素的过程中，原 JDK1.7 中会需要重新计算哈希值，重新映射进新的数组中。

但是到 **JDK1.8 中已经进行优化，不再需要重新计算哈希值，提升了拆分的性能**，设计的非常巧妙。

### **5.1 如何做到不重新计算哈希值?**

我们先来写个示例，来看看容量为 16 的 HashMap 扩容到 32 后，索引值有什么规律。

```java
public class Test {
    public static void main(String[] args) throws Exception {
        List<String> list = new ArrayList<>();
        list.add("jlkk");
        list.add("lopi");
        list.add("jmdw");
        list.add("e4we");
        list.add("io98");
        list.add("nmhg");
        list.add("vfg6");
        list.add("gfrt");
        list.add("alpo");
        list.add("vfbh");
        list.add("bnhj");
        list.add("zuio");
        list.add("iu8e");
        list.add("yhjk");
        list.add("plop");
        list.add("dd0p");
        for (String key : list) {
            int hash = hash(key);
            System.out.println("字符串：" + key
                    + "\t idx(cap=16时)：" + ((16 - 1) & hash)
                    + "\t idx(cap=32时)：" + ((32 - 1) & hash)
                    + "\t [hash&16=" + Integer.toBinaryString(hash & 16) + "]");
        }
    }

    // 使用扰动函数计算 hash 值
    public static int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
}
```

在上面的示例中，我们将每个字符串分别在容量为 16 和 32 时的索引值求了出来（计算方式和 HashMap 相同），同时还将 hash 值和 16（旧容量） 进行 `&` 运算的结果打印了出来，至于为什么要打印这个结果，看了下面的输出就知道了。

```java
字符串：jlkk	 idx(cap=16时)：3	 idx(cap=32时)：19	 [hash&16=10000]
字符串：lopi	 idx(cap=16时)：14	 idx(cap=32时)：14	 [hash&16=0]
字符串：jmdw	 idx(cap=16时)：7	 idx(cap=32时)：7	 [hash&16=0]
字符串：e4we	 idx(cap=16时)：3	 idx(cap=32时)：19	 [hash&16=10000]
字符串：io98	 idx(cap=16时)：4	 idx(cap=32时)：20	 [hash&16=10000]
字符串：nmhg	 idx(cap=16时)：13	 idx(cap=32时)：13	 [hash&16=0]
字符串：vfg6	 idx(cap=16时)：8	 idx(cap=32时)：8	 [hash&16=0]
字符串：gfrt	 idx(cap=16时)：1	 idx(cap=32时)：17	 [hash&16=10000]
字符串：alpo	 idx(cap=16时)：7	 idx(cap=32时)：7	 [hash&16=0]
字符串：vfbh	 idx(cap=16时)：1	 idx(cap=32时)：1	 [hash&16=0]
字符串：bnhj	 idx(cap=16时)：0	 idx(cap=32时)：0	 [hash&16=0]
字符串：zuio	 idx(cap=16时)：8	 idx(cap=32时)：24	 [hash&16=10000]
字符串：iu8e	 idx(cap=16时)：8	 idx(cap=32时)：8	 [hash&16=0]
字符串：yhjk	 idx(cap=16时)：8	 idx(cap=32时)：8	 [hash&16=0]
字符串：plop	 idx(cap=16时)：9	 idx(cap=32时)：9	 [hash&16=0]
字符串：dd0p	 idx(cap=16时)：14	 idx(cap=32时)：14	 [hash&16=0]
```

分析上面的数据可以得出一个 **重要结论**：

- **原哈希值与旧容量（oldCap）16 进行 `&` 运算**：
    - **如果结果等于 0，则下标位置不变**；
    - **如果结果不为 0，那么新的位置则是原来位置上加 16（oldCap）**。

所以在扩容后就不需要重新计算每一个元素的哈希值就可以快速判断新的位置，大大提高了扩容效率。

至于为什么用原哈希值与旧容量做 `&` 运算，就能得出新位置是否需要加上原来的的容量，请往下看。

### **5.2 hash & oldCap 的设计**

下图就是旧容量 16 向新容量 32 扩容的过程：

![数据迁移](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302092359284.png)

可以发现：

- 对 31 取模保留低 5 位，对 15 取模保留低 4 位，**两者的差异就在于第 5 位是否为 1**，是的话则需要加上增量，为 0 的话则不需要改变；

- 其中黄色区域元素 `zuio` 因计算结果 `hash & oldCap` 低位第 5 位为 1，所以导致结果不为 0，则被迁移到下标位置 24；

    ![image-20230210001022386](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302100010911.png)

- 同时还是用重新计算哈希值（`hash & 32 - 1 = 24`）的方式验证了，确实分配到 24 的位置。

::: info 为什么用 hash & oldCap 就能判断是否要加上增量：

因为是 **扩容到原来的 2 倍**，所以 `扩容后的 n - 1 的值` 就是 `原来 n - 1 的值` 往高位补了一个 1，**而这个补 1 的位置（低位的第 5 位）就是 `oldCap` 中 1 的位置**。仍然是原始长度为 16 举例：

```java
 old:
 10: 0000 1010
 15: 0000 1111
 &:  0000 1010 
 
 new:
 10: 0000 1010
 31: 0001 1111
 &:  0000 1010 
```

从上面的示例可以很轻易的看出, 两次计算下标的差别只是 **第二次参与位 比 第一次 左边有一位从 0 变为 1，而这个变化的 1 刚好是 `oldCap`**。那么只需要判断原 key 的 hash 值的这个位上是否为 1 即可，若是 1 则需要移动至 oldCap + i 的槽位，若为 0 则不需要移动。

![image-20230210004127429](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302100041551.png)

:::

这也是 **HashMap 的容量为什么要保证是 2 的幂次方的原因之一**，所以 HashMap 的设计既巧妙又是环环相扣的。

> 提示：HashMap 功能实现的源码分析在下一篇文章！

