---
# 当前页面内容标题
title: 第09章：对象作用域和 FactoryBean
date: 2023-3-28
order: 9
icon: write

# 分类
category:
 - 框架
tag:
 - Spring

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


## 1. 设计

目前我们的 Spring IOC 容器已经趋于完整，但还有一些可以扩展的地方。例如，我们业务中可能需要 **不同作用域的 Bean 对象**，但目前我们只支持单例 Bean，因此可以再添加对原型 Bean（prototype bean）的支持。

此外，**交给 Spring 管理的 Bean 对象，不一定都是我们用类创建出来的**。比如在 MyBatis 这样的 ORM 框架中，我们并没有手动去创建任何操作数据库的 Bean 对象。所以我们就需要 **把复杂且以代理方式动态变化的对象，也注册到 Bean 容器中**。

因此本章主要就是完成 **对 Bean 作用域的扩充**，以及 **把复杂的 Bean 对象交给 Spring 容器管理**。

想要实现上述功能并不复杂，因为我们之前的设计以及预留好了许多扩展点，只需要在合适的位置接入对应的功能实现即可。

整体设计结构图如下：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303281848243.png)

- 对于 `SCOPE_SINGLETON` 和 `SCOPE_PROTOTYPE` 作用域对象的创建获取方式，主要区分在 `AbstractAutowireCapableBeanFactory#createBean()` 创建完对象后是否放入单例容器缓存中，不放入则每次获取都会重新创建；
- createBean 执行对象的创建······初始化等操作后，就可以判断该对象是否是一个 FactoryBean 对象（即复杂的 Bean 对象），如果是则执行 `getObject()` 获取该具体的 FactoryBean 对象。

## 2. 实现

### 2.1 作用域的实现

在 BeanDefinition 中添加 `singleton` 和 `prototype` 两个属性，用于把从 `spring.xml` 中解析到的 Bean 对象的作用范围填充到属性中。

对应的，也需要在 `XmlBeanDefinitionReader#doLoadBeanDefinitions()` 中读取出 scope 标签，然后设置进 BeanDefinition。

然后，就可以在 `AbstractAutowireCapableBeanFactory#createBean()` 中修改对应的逻辑了：

- 判断 Bean 的作用域，是单例模式才执行 `addSingleton()`，创建 Bean 后加入到单例容器缓存中；
- `registerDisposableBeanIfNecessary()` 方法中，非 Singleton 类型的 Bean 就不用执行销毁方法了。

### 2.2 FactoryBean 的实现

我们新增一个 `FactoryBean<T>` 的接口，提供一个 `getObject()` 方法，**让实现了该接口的类，这样就可以在实现类中的 `getObject()` 方法中先创建复杂且以代理方式动态变化的 Bean 对象，然后返回，Spring 容器即可获取到该复杂的 Bean 对象**。

也就是说，**FactoryBean 不会去管你这个对象是如何创建出来的，只要外部实现了 FactoryBean 接口，并实现了 `getObject()` 的具体逻辑，最后返回一个 Bean 对象给 Spring 容器，它就能接管外部创建的复杂的 Bean 对象**。这样能使 Spring 容器更灵活的将一些复杂的 Bean 对象加入进来，一般都是给第三方框架（如 MyBatis、JPA、Hibernate）来使用。

既然提供了一个 FactoryBean，那肯定要为它提供 **注册、获取的服务**，如果是单例对象，则还需要为它提供一个 **缓存容器**。所以新增一个 **FactoryBeanRegistrySupport** 抽象类（继承自 DefaultSingletonBeanRegistry 主要是为了后续的 AbstractBeanFactory 类），如下所示：

```java
/**
 * @desc: 关于 FactoryBean 此类对象的注册/获取操作
 * @author: AruNi_Lu
 * @date: 2023/3/28
 */
public abstract class FactoryBeanRegistrySupport extends DefaultSingletonBeanRegistry {

    /**
     * FactoryBean 创建的单例对象的缓存: FactoryBean name -> object
     */
    private final Map<String, Object> factoryObjectCache = new ConcurrentHashMap<>();

    /**
     * 从缓存中获取 FactoryBean 类对象
     */
    protected Object getCachedObjectForFactoryBean(String beanName) {
        Object object = this.factoryObjectCache.get(beanName);
        // NULL_OBJECT 为内部空单例对象的标志，不是 null，而是 new Object()
        return (object != NULL_OBJECT ? object : null);
    }

    /**
     * 获取 FactoryBean 类对象的方法，如果是单例则还需要像缓存策略一样，先查出来在写入缓存
     */
    protected Object getObjectFromFactoryBean(FactoryBean factoryBean, String beanName) {
        if (factoryBean.isSingleton()) {
            Object object = this.factoryObjectCache.get(beanName);
            if (object == null) {
                object = doGetObjectFromFactoryBean(factoryBean, beanName);
                this.factoryObjectCache.put(beanName, (object != null ? object : NULL_OBJECT));
            }
            return (object != NULL_OBJECT ? object : null);
        } else {
            return doGetObjectFromFactoryBean(factoryBean, beanName);
        }
    }

    /**
     * 通过 FactoryBean#getObject() 方法获取该 FactoryBean
     */
    private Object doGetObjectFromFactoryBean(final FactoryBean factoryBean, final String beanName) {
        try {
            return factoryBean.getObject();
        } catch (Exception e) {
            throw new BeansException("FactoryBean threw exception on object[" + beanName + "] creation", e);
        }
    }

}
```

添加了 FactoryBean 的支持后，就需要在 AbstractBeanFactory 类中扩展创建对象的逻辑。具体来说，就是在获取 Bean 的方法 `doGetBean()` 中，需要判断是否是 FactoryBean，如果是则需要调用 FactoryBeanRegistrySupport 中的方法进行获取。

那么为了让 AbstractBeanFactory 类具有操作 FactoryBeanRegistrySupport 中方法的权力，所以我们现在让 AbstractBeanFactory 继承 FactoryBeanRegistrySupport，所以上面才会让 FactoryBeanRegistrySupport 继承 DefaultSingletonBeanRegistry。这里就相当于在中间插入一个类，让整个继承链更丰富。

AbstractBeanFactory 改变部分的代码如下：

```java
public abstract class AbstractBeanFactory
        extends FactoryBeanRegistrySupport implements ConfigurableBeanFactory {
    
    // ......
    
    /**
     * 抽取 doGetBean 方法：真正获取 Bean 的方法，带有参数
     * @param name Bean 的名字
     * @param args 具体参数
     */
    protected <T> T doGetBean(final String name, final Object[] args) {
        Object sharedInstance = getSingleton(name);
        // 能从单例 bean 缓存中获取 bean 则可直接返回
        if (sharedInstance != null) {
            // 如果是 FactoryBean，则需要调用 FactoryBean#getObject()
            return (T) getObjectForBeanInstance(sharedInstance, name);
        }

        // 创建 bean 并返回（先要获取 BeanDefinition）
        BeanDefinition beanDefinition = getBeanDefinition(name);
        Object bean = createBean(name, beanDefinition, args);

        // 如果是 FactoryBean，则需要调用 FactoryBean#getObject()
        return (T) getObjectForBeanInstance(bean, name);
    }

    /**
     * 抽取出一个方法来判断是否是 FactoryBean
     * @param beanInstance
     * @param beanName
     * @return
     */
    private Object getObjectForBeanInstance(Object beanInstance, String beanName) {
        // 如果不是 FactoryBean，直接返回即可
        if (!(beanInstance instanceof FactoryBean)) {
            return beanInstance;
        }

        // 先从 FactoryBean 缓存中获取（包括单例的缓存为空，以及原型模式）
        Object object = getCachedObjectForFactoryBean(beanName);

        // 如果缓存为空，则再调用 getObjectFromFactoryBean() 获取
        if (object == null) {
            FactoryBean<?> factoryBean = (FactoryBean<?>) beanInstance;
            object = getObjectFromFactoryBean(factoryBean, beanName);
        }

        return object;
    }
    
    // ......
    
}
```

### 2.3 目录结构

到此，所有的设计就完成了，来看看目录结构的更变（绿色—新增、蓝色—修改）：

![image-20230329174527792](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303291745319.png)

### 2.4 类结构图

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303291833492.png)

## 3. 测试

本章我们删掉 UserDao，定义一个 IUserDao 接口，以便通过 FactoryBean 做一个自定义对象的代理操作：

```java
public interface IUserDao {

    String queryUserName(String uId);

}
```

相应地，把 UserService 中依赖地 UserDao 换成 IUserDao 类型：

```java
public class UserService {

    private String uId;
    private String company;
    private String location;
    private IUserDao userDao;

    public String queryUserInfo() {
        return userDao.queryUserName(uId) + "," + company + "," + location;
    }

    // ...getter/setter
}

```

现在来到了最关键的一步，我们定义一个代理类 ProxyBeanFactory，实现 FactoryBean 接口，用于模拟 UserDao 的原有功能，类似于 MyBatis 框架中的代理操作：

```java
public class ProxyBeanFactory implements FactoryBean<IUserDao> {
    @Override
    public IUserDao getObject() throws Exception {
        // InvocationHandler 的代理对象，当有方法调用的时候，则执行代理对象的功能。
        InvocationHandler handler = (proxy, method, args) -> {

            Map<String, String> map = new HashMap<>();
            map.put("10001", "孙悟空");
            map.put("10002", "猪八戒");
            map.put("10003", "沙悟净");

            return "你被代理了 " + method.getName() + ": " + map.get(args[0].toString());
        };
        return (IUserDao) Proxy.newProxyInstance(Thread.currentThread().getContextClassLoader(), new Class[]{IUserDao.class}, handler);
    }

    @Override
    public Class<?> getObjectType() {
        return IUserDao.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }
}
```

`spring.xml` 配置文件也需要做对应的修整：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans>

    <!-- 把 proxyUserDao 这个代理对象，注入到 userService 的 userDao 中。
    与上一章节相比，去掉了 UserDao 实现类，转而用代理类替换 -->
    <bean id="proxyUserDao" class="com.run.test.bean.ProxyBeanFactory"/>

    <!-- 配置作用域 -->
    <bean id="userService" class="com.run.test.bean.UserService" scope="prototype">
        <property name="uId" value="10001"/>
        <property name="company" value="腾讯"/>
        <property name="location" value="深圳"/>
        <property name="userDao" ref="proxyUserDao"/>
    </bean>

</beans>
```

测试原型模式：

```java
@Test
public void test_prototype() {
    // 1.初始化 BeanFactory
    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring.xml");
    applicationContext.registerShutdownHook();   

    // 2. 获取Bean对象调用方法
    UserService userService01 = applicationContext.getBean("userService", UserService.class);
    UserService userService02 = applicationContext.getBean("userService", UserService.class);
    
    // 3. 在 spring.xml 配置文件中，设置了 scope="prototype" 这样就每次获取到的对象都应该是一个新的对象。
    System.out.println(userService01);
    System.out.println(userService02);    

}

```

测试结果：

```java
com.run.test.bean.UserService@5a61f5df
com.run.test.bean.UserService@3551a94

Process finished with exit code 0
```

可以看到 `UserService@5a61f5df`、`UserService@3551a94` 两个对象的内存地址是不同的，所以我们得到的是不同的对象，证明原型模式是生效的。

测试代理对象：

```java
@Test
public void test_factory_bean() {
    // 1.初始化 BeanFactory
    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring.xml");
    applicationContext.registerShutdownHook(); 

    // 2. 调用代理方法
    UserService userService = applicationContext.getBean("userService", UserService.class);
    System.out.println("测试结果：" + userService.queryUserInfo());
}
```

测试结果：

```java
测试结果：你被代理了 queryUserName：孙悟空,腾讯,深圳

Process finished with exit code 0
```

可以看到，代理类 ProxyBeanFactory 已经替换了 UserDao 的功能。说明我们通过代理生成的对象，成功返回给 Spring 容器并交给其管理了。

## 4. 流程

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303292154159.png)

