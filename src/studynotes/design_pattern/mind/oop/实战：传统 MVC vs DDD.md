---
# 当前页面内容标题
title: 实战：传统 MVC vs DDD
date: 2023-03-18
order: 6
#icon: write

# 分类
category:
 - 设计模式
tag:
 - 设计原则与思想

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

[上一篇文章](https://aruni.me/studynotes/design_pattern/mind/oop/理论：传统%20MVC%20vs%20DDD.html) 我们从理论的角度讲解了基于贫血模型的传统开发模式和基于充血的 DDD 开发模式。

下面使用一个简单的虚拟钱包系统，来体会一下这两种开发模式分别是怎样用的，有什么区别。

:::

## 1. 钱包业务背景

许多应用都会为每个用户开设一个系统内的虚拟钱包账户，例如微信中的零钱。

这个虚拟钱包的核心功能支持用户充值、提现、支付、余额查询、交易流水（记录）查询，就像下面这样：

> 此外，可能还会支持一些冻结、透支等。

![image-20230317160126140](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171601472.png)

下面先来看看功能的业务实现流程。

## 2. 业务实现流程

### 2.1 充值

用户可通过第三方支付渠道，把自己银行卡内的钱充值到虚拟钱包中。

这个过程可以分解为三个主要的流程：

1. 从用户的银行账户转账到 APP 的公共银行账户上；
2. 将用户充值的金额加到虚拟钱包余额上；
3. 记录这笔交易流水。

![image-20230317160807552](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171608372.png)

### 2.2 支付

用户使用钱包内的余额，支付购买 APP 内的商品。其实支付过程就是一个转账过程，即从用户的钱包转钱到商家的钱包中，然后也需要记录这笔交易流水。

![image-20230317161016824](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171610606.png)

### 2.3 提现

提现就是充值的逆过程，将用户钱包中的余额提现到自己的银行卡中。即扣减用户钱包中的余额，从 APP 公共银行账户转账到用户的银行账户中，然后记录这笔交易流水。

![image-20230317161316492](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171613408.png)

### 2.4 查询余额

查询余额就是查询用户虚拟钱包中的余额数字即可。

### 2.5 查询交易流水

我们目前只有三种类型的交易流水：充值、支付和提现。

在查询交易流水时，只需要将之前记录的交易流水按照时间、类型等条件过滤后，显示出来即可。

## 3. 设计思路

通过刚刚的分析，可以发现在业务流程主要是跟两个系统打交道，一个是虚拟钱包，一个是三方支付（使用银行卡、微信、支付宝充值等）。

因此，我们先基于此给业务进行划分，给系统解耦，将整个钱包系统拆分为虚拟钱包系统和三方支付系统。

![image-20230317162215311](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171622224.png)

下面主要从虚拟钱包系统出发，来看看如何设计与实现。

如果要支持钱包的这五个核心功能，虚拟钱包系统需要对应实现的操作如下：

![image-20230317162431929](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171624764.png)

其中，支付会涉及到两个账户的余额加减操作。而查询交易流水，所涉及到的信息有点多，主要有如下：

![image-20230317162615123](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303171626990.png)

可以发现，交易流水中包含 **两个钱包账号**，分给是入账钱包账号和出账钱包账号。为什么要有两个呢？主要是为了 **兼容支付功能**，它涉及两个账户的交易。而对于充值和提现则只需要记录一个钱包账户即可。

到此，整个虚拟钱包系统的设计思路就完成了，下面进入实际开发，来看看如何基于贫血模型的传统开发模式和基于充血模型的 DDD 开发模式，来实现这样一个系统？

## 4. 基于贫血模型的传统开发模式

其实，这就是一个典型的 Web 后端项目。使用 MVC 开发模式的话，只需对应地建立三层结构即可。

Controller 和 VO 负责暴露接口，主要就是调用 Service 的方法，所以省略了具体的实现：

```java
public class VirtualWalletController {
    // 通过构造函数或者 IOC 框架注入
    private VirtualWalletService virtualWalletService;

    // 查询余额
    public BigDecimal getBalance(Long walletId) { ... }
    // 出账
    public void debit(Long walletId, BigDecimal amount) { ... } 
    // 入账
    public void credit(Long walletId, BigDecimal amount) { ... } 
    // 转账
    public void transfer(Long fromWalletId, Long toWalletId, BigDecimal amount) { ...} 
    // 省略查询交易流水 transaction 的接口
}
```

Service 和 BO 负责核心业务逻辑的处理，下面的代码省略了一些校验，如钱包是否存在，amount 是否小于 0 等。

> Repository 和 Entity 负责数据存取，就是和数据库打交道，这里就不展示了。

交易类型枚举类：

```java
public Enum TransactionType {
  DEBIT,
  CREDIT,
  TRANSFER;
}
```

BO：

```java
public class VirtualWalletBo {
    private Long id;
    private Long createTime;
    private BigDecimal balance;
    // 省略 getter/setter/constructor 方法
}
```

Service：

```java
public class VirtualWalletService {
    // 通过构造函数或者IOC框架注入
    private VirtualWalletRepository walletRepo;
    private VirtualWalletTransactionRepository transactionRepo;

    // 获取虚拟钱包 BO
    public VirtualWalletBo getVirtualWallet(Long walletId) {
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        VirtualWalletBo walletBo = convert(walletEntity);
        return walletBo;
    }
    
    // 查询余额
    public BigDecimal getBalance(Long walletId) {
        return walletRepo.getBalance(walletId);
    }

    @Transactional
    public void debit(Long walletId, BigDecimal amount) {
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        BigDecimal balance = walletEntity.getBalance();
        if (balance.compareTo(amount) < 0) {
            throw new NoSufficientBalanceException(...);
        }
        // 记录交易流水
        VirtualWalletTransactionEntity transactionEntity = new VirtualWalletTransactionEntity();
        transactionEntity.setAmount(amount);
        transactionEntity.setCreateTime(System.currentTimeMillis());
        transactionEntity.setType(TransactionType.DEBIT);
        transactionEntity.setFromWalletId(walletId);
        transactionRepo.saveTransaction(transactionEntity);
        walletRepo.updateBalance(walletId, balance.subtract(amount));
    }

    @Transactional
    public void credit(Long walletId, BigDecimal amount) {
        VirtualWalletTransactionEntity transactionEntity = new VirtualWalletTransactionEntity();
        transactionEntity.setAmount(amount);
        transactionEntity.setCreateTime(System.currentTimeMillis());
        transactionEntity.setType(TransactionType.CREDIT);
        transactionEntity.setFromWalletId(walletId);
        transactionRepo.saveTransaction(transactionEntity);
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        BigDecimal balance = walletEntity.getBalance();
        walletRepo.updateBalance(walletId, balance.add(amount));
    }

    @Transactional
    public void transfer(Long fromWalletId, Long toWalletId, BigDecimal amount) {
        VirtualWalletTransactionEntity transactionEntity = new VirtualWalletTransactionEntity();
        transactionEntity.setAmount(amount);
        transactionEntity.setCreateTime(System.currentTimeMillis());
        transactionEntity.setType(TransactionType.TRANSFER);
        transactionEntity.setFromWalletId(fromWalletId);
        transactionEntity.setToWalletId(toWalletId);
        transactionRepo.saveTransaction(transactionEntity);
        debit(fromWalletId, amount);
        credit(toWalletId, amount);
    }
}
```

这样就完成了基本的业务，可以发现 Controller 层的 VO、Service 层的 BO、Repository 层的 Entiry 都是贫血模型，即都是数据与方法相分离（它们中只有数据，对应的逻辑方法在在对应的层中），是典型的面向过程编程的风格。

## 5. 基于充血模型的 DDD 开发模式

之前讲到了，DDD 开发模式与 MVC 相比，**主要区别就在 Service 层**，所以下面重点来看看 DDD 开发模式的 Service 层如何实现。

在 DDD 开发模式下， 我们 **把虚拟钱包 VirtualWallet 类设计成一个充血的 Domain 领域模型**，并将原来在 Service 类中的部分业务逻辑移动到 VirtualWallet 类中，**让 Service 类的实现依赖 VirtualWallet 类**。

VirtualWallet 类：

```java
public class VirtualWallet { 	// Domain 领域模型 (充血模型)
    private Long id;
    private Long createTime = System.currentTimeMillis();;
    private BigDecimal balance = BigDecimal.ZERO;

    public VirtualWallet(Long preAllocatedId) {
        this.id = preAllocatedId;
    }

    public BigDecimal balance() {
        return this.balance;
    }

    public void debit(BigDecimal amount) {
        if (this.balance.compareTo(amount) < 0) {
            throw new InsufficientBalanceException(...);
        }
        this.balance = this.balance.subtract(amount);
    }

    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAmountException(...);
        }
        this.balance = this.balance.add(amount);
    }
}
```

VirtualWalletService 类：

```java
public class VirtualWalletService {
    // 通过构造函数或者 IOC 框架注入
    private VirtualWalletRepository walletRepo;
    private VirtualWalletTransactionRepository transactionRepo;

    public VirtualWallet getVirtualWallet(Long walletId) {
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        VirtualWallet wallet = convert(walletEntity);
        return wallet;
    }

    // 查询余额
    public BigDecimal getBalance(Long walletId) {
        return walletRepo.getBalance(walletId);
    }

    @Transactional
    public void debit(Long walletId, BigDecimal amount) {
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        VirtualWallet wallet = convert(walletEntity);
        wallet.debit(amount);	// 直接通过 wallet 调用
        // 记录交易流水
        VirtualWalletTransactionEntity transactionEntity = new VirtualWalletTransactionEntity();
        transactionEntity.setAmount(amount);
        transactionEntity.setCreateTime(System.currentTimeMillis());
        transactionEntity.setType(TransactionType.DEBIT);
        transactionEntity.setFromWalletId(walletId);
        transactionRepo.saveTransaction(transactionEntity);
        walletRepo.updateBalance(walletId, wallet.balance());
    }

    @Transactional
    public void credit(Long walletId, BigDecimal amount) {
        VirtualWalletEntity walletEntity = walletRepo.getWalletEntity(walletId);
        VirtualWallet wallet = convert(walletEntity);
        wallet.credit(amount);
        VirtualWalletTransactionEntity transactionEntity = new VirtualWalletTransactionEntity();
        transactionEntity.setAmount(amount);
        transactionEntity.setCreateTime(System.currentTimeMillis());
        transactionEntity.setType(TransactionType.CREDIT);
        transactionEntity.setFromWalletId(walletId);
        transactionRepo.saveTransaction(transactionEntity);
        walletRepo.updateBalance(walletId, wallet.balance());
    }

    @Transactional
    public void transfer(Long fromWalletId, Long toWalletId, BigDecimal amount) {
        // ...跟基于贫血模型的传统开发模式的代码一样...
    }
}
```

这就是基于充血模型的开发模式，主要是 **将 Service 层抽象出一个 Domain 领域模型，负责跟业务逻辑相关的实现，将数据和逻辑方法都放到 Domain 类中**。

可以看出，现在的领域模型 VirtualWallet 类很单薄，包含的业务逻辑很简单，这相对于原来的贫血模型的设计思路貌似没多大优势。

确实，这也是大部分业务系统都使用贫血模型开发的原因。但是，**如果虚拟钱包系统需要支持更加复杂的业务逻辑，那充血模型的优势就能显现出来了**。比如，要支持透支一定额度和冻结部分余额的功能。这时候，我们重新来看一下 VirtualWallet 类的实现代码：

```java
public class VirtualWallet {
    private Long id;
    private Long createTime = System.currentTimeMillis();;
    private BigDecimal balance = BigDecimal.ZERO;
    private boolean isAllowedOverdraft = true;	// 是否允许透支
    private BigDecimal overdraftAmount = BigDecimal.ZERO;	// 透支金额
    private BigDecimal frozenAmount = BigDecimal.ZERO;	// 冻结金额

    public VirtualWallet(Long preAllocatedId) {
        this.id = preAllocatedId;
    }

    // 冻结/解冻、增/减透支金额、开/关透支
    public void freeze(BigDecimal amount) { ... }
    public void unfreeze(BigDecimal amount) { ...}
    public void increaseOverdraftAmount(BigDecimal amount) { ... }
    public void decreaseOverdraftAmount(BigDecimal amount) { ... }
    public void closeOverdraft() { ... }
    public void openOverdraft() { ... }

    public BigDecimal balance() {
        return this.balance;
    }

    public BigDecimal getAvaliableBalance() {
        BigDecimal totalAvaliableBalance = this.balance.subtract(this.frozenAmount);
        if (isAllowedOverdraft) {
            totalAvaliableBalance += this.overdraftAmount;
        }
        return totalAvaliableBalance;
    }

    public void debit(BigDecimal amount) {
        BigDecimal totalAvaliableBalance = getAvaliableBalance();
        if (totoalAvaliableBalance.compareTo(amount) < 0) {
            throw new InsufficientBalanceException(...);
        }
        this.balance = this.balance.subtract(amount);
    }

    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAmountException(...);
        }
        this.balance = this.balance.add(amount);
    }
}
```

此时，**Domain 类中的业务逻辑就丰富了起来**，后续在其他地方，都能 **复用** 这个类的业务逻辑。

## 6. 思考题

::: tip 在基于充血模型的 DDD 开发模式中，将业务逻辑移动到 Domain 中，Service 类变得很单薄，但为什么没有完全将 Service 类删掉？

:::

这时候不妨从另一个角度来回答这个问题，Service 类在这种情况下担当的职责是什么？哪些功能逻辑会放到 Service 类中？

区别于 Domain 的职责，Service 类主要有下面几个职责：

- **Service 类负责和 Repository 交流**。在上面的代码实现中，VirtualWalletService 类负责从 Repository 层中获取数据库中的数据，然后转换成领域模型 VirtualWallet，然后 **由领域模型 VirtualWallet 来完成业务逻辑**，最后再通过 Repository 层将数据存回数据库；

    > 可以想一下，为什么不直接让领域模型 VirtualWallet 与 Repository 打交道？因为我们想 **保持领域模型的独立性**，不与任何其他层（Repository 层）的代码或开发框架（Spring、MyBatis）耦合在一起，**将流程性的代码逻辑（如从 DB 中获取数据、映射数据）与领域模型的业务逻辑解耦**，从而让 **领域模型更加可复用**。

- **Service 类负责跨领域模型的业务聚合功能**。VirtualWalletService 类中的 `tansfer()` 转账函数会 **涉及到两个钱包的操作**，因此这部分逻辑无法放到 VirtualWallet 中，所以暂且放到 VirtualWalletService 类中。当然，随着 **转账业务变得复杂后**，也可以将转账业务抽取出来，设计成一个 **独立的领域模型**；

- **Service 类负责一些非功能性及三方系统交互的工作**。比如幂等、事务、发邮件、发信息、记录日志、调用其他系统的 RPC 接口等，都可以放到 Service 类中。

::: tip 在基于充血模型的 DDD 开发模式中，只是将 Service 层改造成了充血模型，是否有必要将 Controller 层和 Repository 层也进行充血领域建模呢？

:::

答案是 **没有必要**。Controller 层主要负责暴露接口，Repository 层主要负责和数据库打交道，在我们实际编码中也发生，**这两层的业务逻辑并不多**，所以即便设计成充血模型，**类也非常单薄**，看起来很奇怪。

虽然这是一种面向过程的编程风格，但我们只要控制好可能出现的副作用，一样可以开发出优秀的软件。那这里的 **副作用怎么控制呢**？

从 Repository 层的 **Entity** 来说，即使它被设计成了贫血模型，违反了封装特性，有被任意代码修改数据的风险。**但 Entity 的声明周期是有限的，我们把它传递到 Service 层后，就会转化为 BO 或 Domain**，再继续处理后续的业务逻辑。Entity 的声明周期到此就结束了，所以并不会被到处修改。

再从 Controller 层的 **VO** 来说，VO 其实是一种 DTO（Data Transfer Object，数据传输对象）。它主要 **作为接口的数据传输层载体，将数据发给其他系统**。从功能上来说，**它理应不包含业务逻辑、只包含数据**，所以设计成贫血模型也是较为合理的。

## 7. 总结

基于充血的 DDD 开发模式与基于贫血模型的传统开发模式相比，主要区别就在 **Service 层**，我们把原来在 Service 类中的业务逻辑移动到了 Domain 领域模型中，**让 Service 类的实现依赖于 Domain 类**。

**Domain 类主要负责与真正的业务逻辑相关的实现**，而不与其他层（Repository 层）打交道、也不与具体使用的框架（Spring、MyBatis）耦合。**它就单单只负责与该领域相关的业务逻辑，大大地提高了内聚度，让代码复用性更高**。

而并 **不会将 Service 层完全删掉**，主要是需要 **负责一些不适合放在 Domain 类中的功能**，例如与 Repository 层打交道、跨领域模型的业务聚合、幂等事务等非功能性的工作。

而 Repository 层的 **Entity** 和 Controller 层的 **VO** **不设计成充血模型**，主要是因为 **Entity 的声明周期有限、VO 只是单纯作为一种 DTO，是数据传输的载体**，所以继续使用贫血模型也是没有问题的。所以，**充血模型是业务的精确抽象**。在该抽象的地方用充血模型来处理，在不需要抽象如只需要数据传递的地方用贫血模型来处理。
