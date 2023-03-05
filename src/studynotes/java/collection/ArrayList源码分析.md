---
# 当前页面内容标题
title: ArrayList 源码分析
date: 2023-2-8
order: 2
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

<div class="addthis_inline_share_toolbox"></div>

---

::: details 本文内容
[[toc]]
:::



## 1. 介绍

ArrayList = Array + List，即数组 + 列表，它的底层是通过 **数组** 实现的，不过这个数组不像普通的数组，它可以在插入元素时按需进行 **动态扩容**。

## 2. 源码分析

### 2.1 初始化

先把初始化有关的源码搬出来：

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{
    /**
     * 默认初始容量大小
     */
    private static final int DEFAULT_CAPACITY = 10;

    /**
     * 空数组（用于空实例）。
     */
    private static final Object[] EMPTY_ELEMENTDATA = {};

    // 用于默认大小空实例的共享空数组实例。
    // 我们将其与 EMPTY_ELEMENTDATA 区分开来，以知道在添加第一个元素时容量需要增加多少。
    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     * 保存 ArrayList 数据的数组
     */
    transient Object[] elementData; // non-private to simplify nested class access

   /**
     * ArrayList 所包含的元素个数
     */
    private int size;

    /**
     * 带初始容量参数的构造函数（用户可以在创建 ArrayList 对象时自己指定集合的初始大小）
     */
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {
            this.elementData = EMPTY_ELEMENTDATA;
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }

    /**
     * 默认无参构造函数：构造一个初始化容量为 10 的空列表，当添加第一个元素的时候数组容量才变成 10
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }

    /**
     * 构造一个包含指定集合的元素的列表，按照它们由集合的迭代器返回的顺序。
     */
    public ArrayList(Collection<? extends E> c) {
        Object[] a = c.toArray();
        if ((size = a.length) != 0) {
            if (c.getClass() == ArrayList.class) {
                elementData = a;
            } else {
                elementData = Arrays.copyOf(a, size, Object[].class);
            }
        } else {
            // replace with empty array.
            elementData = EMPTY_ELEMENTDATA;
        }
    }
    
    /**
     * 修改 ArrayList 实例的容量为列表的当前大小，此操作可最大程度地减少 ArrayList 实例的存储空间。
     */
    public void trimToSize() {
        modCount++;
        if (size < elementData.length) {
            elementData = (size == 0)
              ? EMPTY_ELEMENTDATA
              : Arrays.copyOf(elementData, size);
        }
    }
    
    // ......
}
```

通过源码可知：

- 默认的无参构造器只构造了一个空列表。只有当添加第一个元素时，才会初始化数组的容量 `capacity`（默认为 10） 和大小 `size`；
- 带有初始容量参数的有参构造器会创建一个容量大小的数组（容量参数为 0 时只构造一个空列表）；

注意分清楚数组的 `capacity` 和 `size`：

![image-20230208170811700](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302081708563.png)

### 2.2 插入

ArrayList 对元素的插入，其实就是对数组的操作，只不过需要特定时候扩容。

插入操作分为普通插入（即向尾部插入）、指定位置插入。

::: tip 普通插入

:::

普通插入的代码如下：

```java
List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
list.add(3);
```

当使用普通插入依次插入元素时，`add(E e)` 方法实际上调用了 `add(E e, Object[] elementData, int s)` 方法，其实就是在末尾位置 `size` 处插入：

```java
public boolean add(E e) {
    modCount++;
    add(e, elementData, size);
    return true;
}

private void add(E e, Object[] elementData, int s) {
    // 如果末尾位置等于数组的容量，则先扩容
    if (s == elementData.length)
        elementData = grow();
    // 在末尾位置插入元素，size + 1
    elementData[s] = e;
    size = s + 1;
}
```

::: tip 指定位置插入

:::

指定位置插入的方法 `add(int index, E element)` 会先调用 `rangeCheckForAdd(index)` 方法：

```java
public void add(int index, E element) {
    rangeCheckForAdd(index);     
    // ......
}
```

可以发现 `rangeCheckForAdd(index)` 是一个范围检查，**根据 `size` 来进行判断的**，每插入一个元素 size 会 +1：

```java
private void rangeCheckForAdd(int index) {
    if (index > size || index < 0)
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}
```

::: info 考一考你

下面的代码会出现什么问题：

```java
class ListDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(8);
        // List<Integer> list = new ArrayList<>();
        
        list.add(3, 100);
    }
}
```

答案是会报错，错误如下：

![image-20230208165239025](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302081652623.png)

看错误信息发现索引 3 超过了边界，列表的大小 `size` 为 0：

- 因为 ArrayList 的无参/有参构造函数中除了初始化空列表和定义数组容量的操作外，并没有其他操作；
- 所以即使申请了 8 个容量长度的列表，但是指定位置插入操作是依赖 `size` 进行判断，所以会抛出 `IndexOutOfBoundsException` 异常。

:::

继续看 `add(int index, E element)` 方法的插入逻辑：

```java
public void add(int index, E element) {
    rangeCheckForAdd(index);
    modCount++;
    final int s;
    Object[] elementData;
    // size 等于 数组容量，则先扩容
    if ((s = size) == (elementData = this.elementData).length)
        elementData = grow();
    // 数据拷贝迁移
    System.arraycopy(elementData, index,
                     elementData, index + 1,
                     s - index);
    // 此时指定位置的元素已经往后移了，插入数据覆盖即可
    elementData[index] = element;
    size = s + 1;
}
```

核心是 `System.arraycopy()` 方法：

![image-20230208182320915](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302081823331.png)

它的作用是 **将数组从指定的源阵列（从指定位置开始）复制到目标阵列的指定位置**。所以在源码中的含义就是 **将数组从插入位置开始复制到插入位置的下一个位置**，这样插入位置的元素就往后移了。

所以，指定位置插入其实分为三步：

- 根据 `size` 进行范围检查；
- 使用 `System.arraycopy()` 做数据迁移；
- 向指定位置插入元素，size + 1。

### 2.3 删除

其实删除操作和上面指定位置插入的思路很像，先把源码搬出来：

```java
public E remove(int index) {
    // 根据 index 和 size 进行下标检查
    Objects.checkIndex(index, size);
    final Object[] es = elementData;

    @SuppressWarnings("unchecked") E oldValue = (E) es[index];
    fastRemove(es, index);

    return oldValue;
}
```

首先也需要检查删除的下标位置是否合法，也是根据 `size` 进行判断：

![image-20230208183004416](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302081830678.png)

最核心的代码是 `fastRemove()` 方法：

```java
// 跳过边界检查且不返回已删除值的专用删除方法。
private void fastRemove(Object[] es, int i) {
    modCount++;
    final int newSize;
    // 如果要删除的元素不是最后一个元素（size - 1 == i），则需要做数据迁移
    if ((newSize = size - 1) > i)
        System.arraycopy(es, i + 1, es, i, newSize - i);
    // 将最后一个位置的元素置为 null
    es[size = newSize] = null;
}
```

删除操作的步骤如下：

- 根据 `size` 进行范围检查；
- 使用 `System.arraycopy()` 做数据迁移，将要删除元素位置后面的元素复制到要删除元素的位置上（相当于将后面的元素向前移动一位）；
- 将最后一个位置的元素置为 null；

还有一个按指定元素删除的方法，其实和按下标删除类似，只是需要先找到这个指定元素的下标（如果存在多个，则删除首个），然后也是调用 `fastRemove()` 删除指定位置的元素：

```java
public boolean remove(Object o) {
    final Object[] es = elementData;
    final int size = this.size;
    int i = 0;
    // 寻找指定元素 o 的下标
    found: {
        if (o == null) {
            for (; i < size; i++)
                if (es[i] == null)
                    break found;
        } else {
            for (; i < size; i++)
                if (o.equals(es[i]))
                    break found;
        }
        return false;
    }
    // 若找到则调用 fastRemove() 进行指定位置删除
    fastRemove(es, i);
    return true;
}
```



### 2.4 扩容机制

从上面插入的源码分析可以得知，在进行插入时，如果元素个数超过数组容量时，就需要先进行扩容。

扩容代码的入口就是 `grow()` 方法，它直接返回一个 `grow(int minCapacity)` 方法：

- `grow(int minCapacity)` 方法的参数是所需的最小容量，由于插入元素都是一个一个地插入，所以在插入方法中调用的 `grow` 方法，最小容量就是原来的 `size` + 1。

```java
private Object[] grow() {
    return grow(size + 1);
}
```

它的具体实现如下：

```java
private Object[] grow(int minCapacity) {
    int oldCapacity = elementData.length;
    // 如果容量 > 0 或者列表不为空，则进行扩容
    if (oldCapacity > 0 || elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        // 在插入方法中返回 oldLength + oldCapacity >> 1
        int newCapacity = ArraysSupport.newLength(oldCapacity,
                                                  minCapacity - oldCapacity, /* minimum growth */
                                                  oldCapacity >> 1           /* preferred growth */);
        // 调用 Arrays.copyOf()，返回一个元素相同但容量为 newCapacity 的数组列表
        return elementData = Arrays.copyOf(elementData, newCapacity);
    } else {	// 否则就初始化列表
        return elementData = new Object[Math.max(DEFAULT_CAPACITY, minCapacity)];
    }
}
```

从中可以发现，在进行扩容时，新容量 `newCapacity` 是根据 `ArraysSupport.newLength()` 方法确定的。

::: tip ArraysSupport.newLength() 方法

:::

来看看它的具体实现：

```java
public static int newLength(int oldLength, int minGrowth, int prefGrowth) {
    // preconditions not checked because of inlining
    // assert oldLength >= 0
    // assert minGrowth > 0

    int prefLength = oldLength + Math.max(minGrowth, prefGrowth); // might overflow
    if (0 < prefLength && prefLength <= SOFT_MAX_ARRAY_LENGTH) {
        return prefLength;
    } else {
        // put code cold in a separate method
        return hugeLength(oldLength, minGrowth);
    }
}
```

`int prefLength = oldLength + Math.max(minGrowth, prefGrowth)`，在插入元素时：

- minGrowth 等于 `minCapacity - oldCapacity`，而 minCapacity 又等于 `size + 1`，所以 minGrowth = 1；
- prefGrowth 等于 `oldCapacity >> 1`，即为原容量的一半（当原容量为奇数时，向下取整）；

所以，在插入元素方法中调用的 `grow()` 方法，实际上 **prefLength = 原容量 + 原容量/2**。

当新容量 `prefLength` 未超过 `SOFT_MAX_ARRAY_LENGTH` 时，就直接返回该新容量，所以到此可以得出结论：

- 当插入元素需要扩容时，**容量会变为原来容量的约 1.5 倍**（当原容量为奇数时，向下取整）。

::: tip hugeLength() 方法

:::

> 注：`SOFT_MAX_ARRAY_LENGTH = Integer.MAX_VALUE - 8`

当新容量超过 `SOFT_MAX_ARRAY_LENGTH` 时，就要进入 `hugeLength()` 方法：

```java
private static int hugeLength(int oldLength, int minGrowth) {
    // 计算最小容量
    int minLength = oldLength + minGrowth;
    if (minLength < 0) { // overflow
        throw new OutOfMemoryError(
            "Required array length " + oldLength + " + " + minGrowth + " is too large");
    } else if (minLength <= SOFT_MAX_ARRAY_LENGTH) {
        return SOFT_MAX_ARRAY_LENGTH;
    } else {
        return minLength;
    }
}
```

`hugeLength()` 方法并不是按原容量的 1.5 倍进行扩容，而是按最小容量（原容量 + 所需最小容量）进行扩容：

- 如果最小容量超过了 `int` 的最大值，则抛出异常；
- 如果最小容量小于 `SOFT_MAX_ARRAY_LENGTH`，则新容量为就为 `SOFT_MAX_ARRAY_LENGTH`；
- 如果最小容量大于 `SOFT_MAX_ARRAY_LENGTH`，小于 `int` 的最大值，则新容量为这个最小容量；

::: info 为什么最小容量 minLength 超过 int 的最大值对应 minLength 小于 0 这个 if 分支？

计算机中的数据都以二进制表示，第一位表示符号位，例如 `Integer.MAX_VALUE` 用二进制表示为 `01111111 11111111 11111111 11111111`，如果再加上一个正数，则会进位，最后让符号位变为 1，即为负数。

比如，`Integer.MAX_VALUE + 1` 表示为：

![image-20230208201445610](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302082014547.png)

可以发现，符号位变成了 1，即超过了 int 的最大值后数值变为了负数。

:::

### 2.5 System.arraycopy() 和 Arrays.copyOf()

在 ArrayList 的源码中大量调用了这两个方法，比如上面讲的扩容操作以及指定位置插入等。

::: tip System.arraycopy()

:::

`System.arraycopy()` 方法是一个 native 方法，它的作用是 **将数组从指定的源阵列（从指定位置开始）复制到目标阵列的指定位置**。：

```java
    /**
    *   复制数组
    * @param src 源数组
    * @param srcPos 源数组中的起始位置
    * @param dest 目标数组
    * @param destPos 目标数组中的起始位置
    * @param length 要复制的数组元素的数量
    */
    public static native void arraycopy(Object src,  int  srcPos,
                                        Object dest, int destPos,
                                        int length);
```

示例：

```java
public class ArraycopyTest {
    public static void main(String[] args) {
        int[] arr = new int[5];
        arr[0] = 0; arr[1] = 1; arr[2] = 2;
        // 在 arr 数组从位置 1 开始，复制到 arr 数组中（从 2 位置开始填充），复制 2 个元素
        System.arraycopy(arr, 1, arr, 2, 2);
        arr[1] = 99;
        for (int a : arr) System.out.print(a + " ");
    }
}
```

结果：

```java
0 99 1 2 0 
```

:::tip Arrays.copyOf() 方法

:::

`copyOf()` 方法是 Arrays 类中的一个静态方法：

```java
    @IntrinsicCandidate
    public static <T,U> T[] copyOf(U[] original, int newLength, Class<? extends T[]> newType) {
        @SuppressWarnings("unchecked")
        // 申请一个 newType 类型的新数组
        T[] copy = ((Object)newType == (Object)Object[].class)
            ? (T[]) new Object[newLength]
            : (T[]) Array.newInstance(newType.getComponentType(), newLength);
        // 调用 System.arraycopy，将原数组中的数据进行拷贝
        System.arraycopy(original, 0, copy, 0,
                         Math.min(original.length, newLength));
        // 返回新数组
        return copy;
    }
```

`Arrays.copyOf()` 方法主要是为了给原有数组扩容，示例：

```java
public class CopyOfTest  {
    public static void main(String[] args) {
        int[] arr = new int[5];
        arr[0] = 0; arr[1] = 1; arr[2] = 2;
        arr = Arrays.copyOf(arr, 8);
        System.out.println(Arrays.toString(arr));
        System.out.println("len: " + arr.length);
    }
}
```

结果：

```java
[0, 1, 2, 0, 0, 0, 0, 0]
len: 8
```

::: info 两者的联系和区别

**联系**：

- `Arrays.copyOf()` 内部调用了 `System.arraycopy()` 方法；

**区别**：

- `arraycopy()` 需要目标数组，将原数组拷贝到你自己定义的数组里或者原数组，而且可以选择拷贝的起点和长度以及放入新数组中的位置；
- `copyOf()` 是系统自动在内部新建一个新容量的数组，并返回该数组。

:::

## 3. 参考文章

- [JavaGuide](https://javaguide.cn/)

