---
# 当前页面内容标题
title: HashMap 源码分析：功能实现
date: 2023-02-15
order: 4
# 当前页面图标
#icon: write
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

## **1. 前言**

> 注：本篇是 HashMap 源码分析的第二篇文章，建议先阅读 [上一篇文章](https://code.0x3f4.run/backend/java/collection/HashMap%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%EF%BC%9A%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html) 后，再阅读本篇会更清晰。

通过上一篇文章的学习，我们知道了 HashMap 基本数据结构的设计，现在来看看 HashMap 具体的功能实现又是如何设计的。

对于一个散列表数据结构的 HashMap 来说，往里面插入数据时，需要通过 key 值取得哈希值后，再计算下标，最后才把对应的数据放到这个位置里面。

但再这个过程中会遇到一些问题，比如；

1. 如果出现哈希值计算的下标碰撞了怎么办？
2. 如果碰撞了是进行扩容数组，还是把值存成链表结构？
3. 如果链表长度过长了，就会失去了散列表的性能（查询复杂度变高），怎么解决？

这些疑问点都会在后面的内容中逐步讲解。

## **2. 插入/更新操作**

### **2.1 插入流程**

先来个插入流程的总览：

![HashMap插入数据流程图](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132212109.png)

以上就是 HashMap 中一个数据插入的整体流程，包括了计算下标、何时扩容、何时链表转红黑树等，具体如下：

1. 先根据 key 通过扰动函数 `hash()` 获取哈希值；

    ![image-20230213221937083](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132219770.png)

2. 判断 `table` 是否为空或长度为 0，如果是则进行扩容（**说明初始化容量被延迟到了插入阶段**）；

    ![image-20230213222305767](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132223539.png)

3. 根据哈希值计算下标，如果该下标位置正好没有数据，则直接插入即可，否则就可能遇到了哈希冲突或者更新数据；

    ![image-20230213222452410](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132224572.png)

4. 如果当前下标位置恰好和插入数据的 key 相同，则直接将该位置的数据取出，后面进行更新（值覆盖）。

    否则就判断该数据是否为树节点，是则向树节点中进行插入操作，否则向链表中进行插入操作。

    > 注意：在向树节点中进行插入或者链表中进行插入的时候，可能也会遇到相同的 key，那么也是更新操作。

    ![image-20230213224813479](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132248593.png)

5. 如果链表中插入数据的时候，链表长度 >= 8，则进入 `treeifyBin()` 方法。（**此时还不是要把链表转换为红黑树，`treeifyBin()` 方法中还有一层判断**）；

    ![image-20230213225218760](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132252788.png)

6. 如果是更新操作，那么就返回 `oldValue` 了。否则将容量 +1，然后判断是否超过扩容阈值 `threshold`，是则进行 `resize()` 扩容，否则结束；

    ![image-20230213225907204](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132259311.png)

::: info 链表树化的条件：

上面说到，链表长度 >= 8，则进入 `treeifyBin()` 方法，此时并没有直接将链表树化，而是先判断容量是否小于 `MIN_TREEIFY_CAPACITY` 64。如果小于则只需要进行扩容，扩容后链表上的数据会被拆分散列的相应的桶节点上，也就把链表长度缩短了，大于才进行树化。

![image-20230213230410955](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132304813.png)

:::

::: info 为什么还要等容量 >= 64 才树化？

因为红黑树的查找效率虽然是 O(log n)，但是当插入元素是需要自平衡，是需要耗时的。**如果容量较小的话，那么不如考虑用空间换时间**，将 `table` 数组进行扩容，来减少链表的长度。

:::

### **2.2 源码分析**

通过上面的流程梳理后，现在再来看插入方法的这一大串源码（JDK 17），就清晰多了：

```java
public V put(K key, V value) {
    // 使用扰动函数获取哈希值，然后进入 putVal() 方法
    return putVal(hash(key), key, value, false, true);
}

/**
* @param onlyIfAbsent：如果为 true，则不改变已存在的值（即不进行更新操作，putIfAbsent() 时使用）
* @param evict：如果为 false，表示 table 处于创建模式（new HashMap<>(map) 构造函数时使用）
* @return 返回旧值，如果没有则返回 null
*/
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
               boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    // 初始化桶数组 table，table 被延迟到插入新数据时再进行初始化
    if ((tab = table) == null || (n = tab.length) == 0)
        n = (tab = resize()).length;
    // 如果桶中不包含键值对节点，则将新键值对节点的引用存入桶中即可
    if ((p = tab[i = (n - 1) & hash]) == null)
        tab[i] = newNode(hash, key, value, null);
    else {
        Node<K,V> e; K k;
        // 如果键的值以及节点 hash 等于链表中的第一个键值对节点时，则将 e 指向该键值对，后面进行更新操作
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            e = p;
            
        // 如果桶中的引用类型为 TreeNode，则调用红黑树的插入方法
        else if (p instanceof TreeNode)  
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            // 对链表进行遍历，并统计链表长度
            for (int binCount = 0; ; ++binCount) {
                // 链表中不包含要插入的键值对节点时（遇到空位置），则将该节点接在链表的最后
                if ((e = p.next) == null) {
                    p.next = newNode(hash, key, value, null);
                    // 如果链表长度大于等于树化阈值，则进入树化函数（还需要进一步判断容量是否 > =64）
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        treeifyBin(tab, hash);
                    break;
                }
                // 条件为 true，表示当前链表包含要插入的键值对，终止遍历，后面进行更新操作
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    break;
                p = e;
            }
        }
        
        // 判断要插入的键值对是否存在 HashMap 中
        if (e != null) { // existing mapping for key
            V oldValue = e.value;
            // onlyIfAbsent 表示是否仅在 oldValue 为 null 的情况下更新键值对的值（onlyIfAbsent 为 true 即不进行值的覆盖）
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            afterNodeAccess(e);
            return oldValue;
        }
    }
    ++modCount;
    // 键值对数量超过阈值时，则进行扩容
    if (++size > threshold)
        resize();
    afterNodeInsertion(evict);
    return null;
}
```

## **3. 扩容机制**

### **3.1 扩容流程**

HashMap 是基于数组 + 链表 + 红黑树实现的，但用于存放 key 的数组桶的长度是固定的，由初始化决定。

那么，随着数据的插入数量增加以及负载因子的作用下，就需要扩容来存放更多的数据。

而扩容中有一个非常重要的点，就是 JDK 1.8 中的优化操作，可以 **不需要再重新计算每一个元素的哈希值**，这在上一篇文章中已经讲到，机制如下图：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302132326473.png)

### **3.2 源码分析**

有了上面的源码分析经验，直接来看看扩容的源代码（JDK 17）：

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    // 如果容量不为空，则说明已经初始化。
    if (oldCap > 0) {
        // 如果容量达到最大1 << 30则不再扩容
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        
        // 按旧的容量和阀值的 2 倍计算新的容量和阀值
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    // 下面两个分支表示还未初始化容量
    else if (oldThr > 0) // initial capacity was placed in threshold
        // 走到此分支说明 oldCap = 0，而 oldThr > 0，则说明我们使用的是 HashMap(int initialCapacity) 构造器，
        // 因为在初始化容量的时候并没有直接初始化 table，而是将容量赋值给了 threshold，
        // 使用 threshold 变量暂时保存 initialCapacity 参数的值，所以现在才赋值给容量
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        // 此分支表示 oldCap = 0 且 oldThr = 0，这一部分也是和上面类似，
        // 只是调用的是无参构造器，无参构造器就只是对 loadFactor 进行了初始化
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    
    // newThr 还没计算，则使用阀值公式计算阈值
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    
    @SuppressWarnings({"rawtypes","unchecked"})
    // 初始化新的数组桶，用于存放 key
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    if (oldTab != null) {
        // 如果旧数组桶，oldCap 有值，则遍历将键值映射到新数组桶中
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    // 这里 split，是红黑树拆分操作。在重新映射时操作的。
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    // 这里是链表，如果当前是按照链表存放的，则将链表节点按原顺序进行分组，
                    // 因为元素不是在原来的位置上，就是在原来的位置 + oldCap 位置上，所以可以分为 2 组
                    do {
                        next = e.next;
                        // 使用到了上一篇文章讲的快速判断元素在新数组桶中的下标位置是多少
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    
                    // 将分组后的链表映射到桶中对应的位置上（原来位置 和 原来位置 + olaCap 位置）
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

整个扩容源码的大致流程如下：

1. 计算出新的 `newCap`、`newThr`，分为两种情况：
    1. 已经初始化过容量了：**将新容量扩大到原来的 2 倍**；
    2. 只是调用过构造函数，第一次插入时引起了扩容操作：给容量赋初始值；
2. 计算出来 newCap后，创建新的数组桶 `new Node[newCap]`；
3. 随着扩容后，原来那些因为哈希碰撞，**存放成链表和红黑树的元素，都需要进行拆分存放到新的位置中**。
    - **链表拆分**：通过上一篇文章的学习我们知道，扩容后元素的位置要么在原来的位置上，要么在原来位置 + oldCap 的位置上，所以拆分链表时就可以拆分成 2 组，最后分别将 2 组链表映射到 2 个对应的位置上（将链表头映射上去就行了）。
    - **红黑树拆分**：进入 `split()` 方法，思路跟链表拆分相同，也是将红黑树拆分成 2 组，不过如果拆分后的红黑树节点数量 <= `UNTREEIFY_THRESHOLD` 6，则会进行红黑树的链化。可以自己点开源码看看。

## **4. 链表和树的互转**

通过前面的学习我们知道：

- **当插入数据时，如果链表长度 >= 8，并且数组桶的容量 >= 64 时，就需要将链表转为红黑树**；
- **当进行扩容时，需要进行元素拆分，拆分后如果树节点数量 < 6，就需要将红黑树转回链表**；

现在我们就来看看链表和树之间到底是如何转化的。

### **4.1 链表树化**

HashMap 这种散列表的数据结构，最大的性能在于可以 O(1) 时间复杂度定位到元素。

但是由于哈希碰撞的存在，所以不得不在一个下标里存放多组数据，JDK 1.7 和 1.8 采取的方式是不同的：

- **JDK 1.7** 中只采用 **链表**，如果需要从链表中定位到数据的时间复杂度就是 O(n)，链表越长性能越差。
- **JDK 1.8** 中采用 **链表 + 红黑树**，把过长的链表也就是 8 个，优化为自平衡的红黑树结构，以此让定位元素的时间复杂度优化到近似于 O(log n)，这样来提升元素查找的效率。

但是因为在元素相对不多的情况下，链表的插入速度更快，所以综合考虑下设定 **链表阈值为 8 且容量阈值为 64** 时才进行红黑树转换操作。

::: info 为什么还要等容量 >= 64 才树化？

因为红黑树的查找效率虽然是 O(log n)，但是当插入元素是需要自平衡，是需要耗时的。**如果容量较小的话，那么不如考虑用空间换时间**，将 `table` 数组进行扩容，来减少链表的长度。

:::

**链表转红黑树的图示如下**：

![链表转红黑树](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302140032212.png)

通过这张图，基本可以有一个 `链表` 换行到 `红黑树` 的印象，接下来阅读下对应的源码：

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    // 不一定树化还可能只是扩容，取决于桶数组容量是否 >= 64 MIN_TREEIFY_CAPACITY 
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
    	// hd = head (头部)，tl = tile (结尾)
        TreeNode<K,V> hd = null, tl = null;
        do {
            // 将普通节点转换为树节点（只是 new TreeNode），此时还不是红黑树，也就是说还不平衡
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;    // 在树转换过程中会记录链表的顺序，主要方便后续树转链表和拆分
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            // 将树节点进行红黑树操作，需要循环比较，染色、旋转，属于红黑树的相关知识。
            hd.treeify(tab);
    }
}
```

这一部分链表树化的操作并不复杂，复杂点在于下一层的红黑树转换上。

以上源码主要包括的知识点如下：

1. 链表树化的条件有两点，链表长度 >= 8、桶容量 >= 64，否则只是扩容，不会树化。
2. 链表树化的过程中是先由链表转换为树节点，此时的树可能不是一颗平衡树。**同时在树转换过程中会记录链表的顺序**，`tl.next = p`，这主要 **方便后续树转链表和拆分**。
3. 链表转换成树完成后，在进行红黑树的转换。先简单介绍下，红黑树的转换需要染色和旋转，以及比对大小。

::: info 在树化过程中是如何记录链表的顺序的？

在 `treeifyBin()` 方法中可以看到在进行树化的时候，记录了节点的 `next`（`tl.next = p`），在树结构 `TreeNode` 中是没有 `next` 变量的，记录这个干什么？

在源码中可以发现，`next` 变量是 HashMap 的 `Node` 结构中的，所以可以判断：就是通过这个 `next` 来记录链表的顺序的。

![image-20230214010430475](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302140104038.png)

:::

### **4.2 红黑树链化**

扩容后，原来那些因为哈希碰撞，**存放成链表和红黑树的元素，都需要进行拆分存放到新的位置中**。

在 **红黑树拆分** 时，首先进入 `split()` 方法，思路跟链表拆分相同，也是将红黑树拆分成 2 组，不过如果拆分后的红黑树节点数量 <= `UNTREEIFY_THRESHOLD` 6，则会进行红黑树的链化。

![image-20230214011218036](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302140112104.png)

在上面链表转红黑树中重点提到了 **在转换树的过程中，记录了原有链表的顺序**。

那么这就简单了，红黑树转链表时候，直接把 TreeNode 转换为 Node 即可，源码如下：

```java
final Node<K,V> untreeify(HashMap<K,V> map) {
    Node<K,V> hd = null, tl = null;
    // 按序遍历 TreeNode，this 指当前 TreeNode，Node 是它的父类，Node<K,V> q = this 属于多态写法
    for (Node<K,V> q = this; q != null; q = q.next) {
    	// TreeNode 替换 Node
        Node<K,V> p = map.replacementNode(q, null);
        if (tl == null)
            hd = p;
        else
            tl.next = p;	// 构建 Node 链表
        tl = p;
    }
    return hd;
}

// 替换方法
Node<K,V> replacementNode(Node<K,V> p, Node<K,V> next) {
    return new Node<>(p.hash, p.key, p.value, next);
}
```

因为记录了链表关系，所以替换过程很容易，直接按序遍历 TreeNode，然后构建 Node 链表即可。

所以好的数据结构可以让操作变得更加容易高效。

## **5. 查找**

HashMap 查找的流程如下：

![HashMap查找流程图](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202302151333658.png)

接下来再结合源码（JDK 17），来分析这段流程，如下；

```java
public V get(Object key) {
    Node<K,V> e;
    // 调用 getNode() 获取 key 对应的节点
    return (e = getNode(key)) == null ? null : e.value;
}

final Node<K,V> getNode(Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n, hash; K k;
    // table 不为空，并且 tab[i] 不为空，才进行查找
    if ((tab = table) != null && (n = tab.length) > 0 &&
        // 计算下标，(n - 1) & hash，hash 是经过扰动函数计算出来的
        (first = tab[(n - 1) & (hash = hash(key))]) != null) {
        if (first.hash == hash && // 第一个节点就是要查找的节点，则直接返回
            ((k = first.key) == key || (key != null && key.equals(k))))
            return first;
        if ((e = first.next) != null) {
            // TreeNode 节点直接调用红黑树的查找方法，时间复杂度 O(logn)
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            // 如果是链表就依次遍历查找
            do {
                if (e.hash == hash &&
                    ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
}
```

以上查找的代码还是比较简单的，过程如下：

1. table 为空或者 `tab[i]` 为空，则直接结束。计算下标 `i` （`(n - 1) & hash`）时的哈希值使用了扰动函数；
2. 确定了桶数组下标位置，接下来就是对红黑树和链表进行查找和遍历操作了。

## **6. 删除**

删除操作分为查找和删除，需要先查找到对应的节点，再进行删除操作。源码（JDK 17）如下：

```java
public V remove(Object key) {
    Node<K,V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null ?
        null : e.value;
}

final Node<K,V> removeNode(int hash, Object key, Object value,
                           boolean matchValue, boolean movable) {
    Node<K,V>[] tab; Node<K,V> p; int n, index;
    
    // 这段是查找代码
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (p = tab[index = (n - 1) & hash]) != null) {
        Node<K,V> node = null, e; K k; V v;
        if (p.hash == hash &&
            ((k = p.key) == key || (key != null && key.equals(k))))
            node = p;
        else if ((e = p.next) != null) {
            if (p instanceof TreeNode)
                node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
            // 链表的查找，记录下被删除节点和它的前一个节点，即可完成删除
            else {
                do {
                    if (e.hash == hash &&
                        ((k = e.key) == key ||
                         (key != null && key.equals(k)))) {
                        node = e;	// 记录被删除节点 node
                        break;
                    }
                    p = e;	// 记录被删除节点的前一个节点
                } while ((e = e.next) != null);
            }
        }
        
        // 这段是删除代码。红黑树需要平衡，因为删除后会破坏平衡性，链表的删除更加简单。
        if (node != null && (!matchValue || (v = node.value) == value ||
                             (value != null && value.equals(v)))) {
            // 树节点的删除
            if (node instanceof TreeNode)
                ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
            // 如果删除节点是 tab[i] 位置的首节点，则将 tab[i] 位置更新成删除节点的下一个节点
            else if (node == p)
                tab[index] = node.next;
            // 否则就是链表的删除
            else
                p.next = node.next;
            ++modCount;
            --size;
            afterNodeRemoval(node);
            return node;
        }
    }
    return null;
}
```

删除操作的主要流程如下：

1. 先进行查找（逻辑与查找源码类似）；
2. 再进行删除：
    1. 如果是树节点，则需要调用对应的删除方法；
    2. 如果是下标位置的首节点，则更新首节点；
    3. 如果是链表，则进行链表的删除即可；

