---
# 当前页面内容标题
title: 第08章：Aware 感知容器对象
date: 2023-3-26
order: 8
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

在上一章中，我们对 Spring 框架添加了初始化/销毁方法的扩展，使得框架的功能更强大，现在的框架所提供的功能有：Bean 对象的定义和注册、在操作 Bean 过程中执行的 BeanFactoryPostProcessor、BeanPostProcessor、InitializingBean、DisposableBean 处理，以及在 XML 中新增的配置处理。

现在，我们希望能够 **获取 Spring 容器中的内部对象**，比如获取其中的 BeanFactory、BeanName、BeanClassLoader、ApplicationContext 等，获取后就可以进一步对框架进行扩展使用。

所以本章就提供了一个 **能感知容器的接口**，外部想要获取容器中的内部对象，只需要实现对应的接口，便可以获取到对应的内部对象。

由于能获取到的内部对象有多个，所以我们先定义一个标记接口 Aware（标签），再让具体的内部对象继承该接口，提供自己的写入方法，**在初始化 Bean 的时候将对应的内部对象写入，后续外部便可获取**。

整体设计如下：

![img](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303261029777.png)

- 需要注意的是，ApplicationContextAware 的写入比较特殊（不像 BeanFactory/BeanName 等可以直接在创建 Bean 的时候获取到），所以需要借助 BeanPostProcessor 进行写入。

## 2. 实现

BeanFactoryAware、BeanNameAware 和 BeanClassLoaderAware 比较简单，只需要继承 Aware 接口，然后提供对应的写入方法（`setXxx()`），最后在 AbstractAutowireCapableBeanFactory 类中的 `initializeBean()` 方法中感知即可：

```java
    private Object initializeBean(String beanName, Object bean, BeanDefinition beanDefinition) {
        // 写入需要被感知的 BeanFactory、BeanName 等，后续可直接获取。
        // ApplicationContextAwareProcessor 已经在 refresh() 时被提前加入到 BeanPostProcessors 中了，
        // 在下面的 applyBeanPostProcessorsBeforeInitialization() 中会取出来进行写入
        if (bean instanceof Aware) {
            if (bean instanceof BeanFactoryAware) {
                ((BeanFactoryAware) bean).setBeanFactory(this);
            }
            if (bean instanceof BeanClassLoaderAware) {
                ((BeanClassLoaderAware) bean).setBeanClassLoader(getBeanClassLoader());
            }
            if (bean instanceof BeanNameAware) {
                ((BeanNameAware) bean).setBeanName(beanName);
            }
        }
        
        // 1. 执行 BeanPostProcessor Before 处理（ApplicationContext 的写入在此方法中）
        Object wrappedBean = applyBeanPostProcessorsBeforeInitialization(bean, beanName);

        // 执行 Bean 对象的初始化方法
        try {
            invokeInitMethods(beanName, wrappedBean, beanDefinition);
        } catch (Exception e) {
            throw new BeansException("Invocation of init method of bean[" + beanName + "] failed", e);
        }

        // 2. 执行 BeanPostProcessor After 处理
        wrappedBean = applyBeanPostProcessorsAfterInitialization(wrappedBean, beanName);
        return wrappedBean;
}
```

**ApplicationContextAware** 的写入比较特殊，我们需要 **借助 BeanPostProcessor 的前置处理来进行**。具体来说，我们再提供一个 ApplicationContextAwareProcessor，实现 BeanPostProcessor，在前置处理方法中将 ApplicationContext 写入：

```java
/**
 * @desc: ApplicationContextAware 的写入比较特殊（不像 BeanFactory/BeanName 等可以直接在创建 Bean 的时候获取到）：
 * 由于 ApplicationContext 的获取并不能直接在创建 Bean 时候就可以拿到，所以需要在 refresh 操作时（刷新上下文），
 * 把 ApplicationContext 写入到一个包装的 BeanPostProcessor 中去，再由
 * AbstractAutowireCapableBeanFactory 中的 applyBeanPostProcessorsBeforeInitialization 方法调用。
 * @author: AruNi_Lu
 * @date: 2023/3/26
 */
public class ApplicationContextAwareProcessor implements BeanPostProcessor {

    private final ApplicationContext applicationContext;

    public ApplicationContextAwareProcessor(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof ApplicationContextAware) {
            ((ApplicationContextAware) bean).setApplicationContext(applicationContext);
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
}
```

接着，我们需要 **在 AbstractApplicationContext 类中的 `refresh()` 方法（刷新应用上下文）中，将此 ApplicationContextAwareProcessor 添加进 PostProcessor 容器**。

```java
public abstract class AbstractApplicationContext
        extends DefaultResourceLoader implements ConfigurableApplicationContext {

    @Override
    public void refresh() throws BeansException {
        // 1. 创建 BeanFactory，并加载 BeanDefinition
        refreshBeanFactory();

        // 2. 获取 BeanFactory
        ConfigurableListableBeanFactory beanFactory = getBeanFactory();

        // 3. 添加 ApplicationContextAwareProcessor，让继承自 ApplicationContextAware 的 Bean 对象都能感知所属的 ApplicationContext
        beanFactory.addBeanPostProcessor(new ApplicationContextAwareProcessor(this));

        // 4. 在 Bean 实例化之前，执行 BeanFactoryPostProcessor (Invoke factory processors registered as beans in the context.)
        invokeBeanFactoryPostProcessors(beanFactory);

        // 5. BeanPostProcessor 需要提前于其他 Bean 对象实例化之前执行注册操作
        registerBeanPostProcessors(beanFactory);

        // 6. 提前实例化单例 Bean 对象
        beanFactory.preInstantiateSingletons();

    }
    
    // ......   
}
```

**后续才能在 AbstractAutowireCapableBeanFactory 类中的 `applyBeanPostProcessorsBeforeInitialization()` 方法中获取到该 ApplicationContextAwareProcessor，然后执行该类实现的 `postProcessBeforeInitialization()`，在前置处理中将 ApplicationContext 写入**。

到此，整体的设计就完成了，还是比较清晰的。

下面看看项目目录结构的更变（绿色—新增、蓝色—修改）：

![image-20230326105253619](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303261052474.png)

类结构图如下：

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303261324711.png)

## 3. 测试

在 UserService 中实现感知容器对象的四个接口，实现对应的写入方法（`setXxx()`）。这样在 Bean 初始化的时候，就会调用我们实现的方法，将我们需要的内部对象写入进来，以便我们获取：

```java
public class UserService implements BeanNameAware, BeanClassLoaderAware, ApplicationContextAware, BeanFactoryAware {

    private ApplicationContext applicationContext;
    private BeanFactory beanFactory;

    private String uId;
    private String company;
    private String location;
    private UserDao userDao;


    @Override
    public void setBeanName(String name) {
        System.out.println("Bean Name is: " + name);
    }

    @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        System.out.println("ClassLoader: " + classLoader);
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        this.beanFactory = beanFactory;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    public String queryUserInfo() {
        return userDao.queryUserName(uId) + "，公司：" + company + "，地点：" + location;
    }

    // getter......
}
```

Test 方法：

```java
@Test
public void test_InitAndDestroy() {
    // 1. 初始化 BeanFactory
    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext("classpath:spring.xml");
    // 注册钩子
    applicationContext.registerShutdownHook();

    // 2. 获取 Bean 对象调用方法
    UserService userService = applicationContext.getBean("userService", UserService.class);
    String result = userService.queryUserInfo();
    System.out.println("测试结果：" + result);
    System.out.println("ApplicationContextAware: " + userService.getApplicationContext());
    System.out.println("BeanFactoryAware: " + userService.getBeanFactory());
}
```

输出结果：

```java
userDao 执行 init-method
ClassLoader: jdk.internal.loader.ClassLoaders$AppClassLoader@63947c6b
Bean Name is: userService
测试结果：孙悟空，公司：腾讯，地点：深圳
ApplicationContextAware: com.run.context.support.ClassPathXmlApplicationContext@4cf4d528
BeanFactoryAware: com.run.beans.factory.support.DefaultListableBeanFactory@77846d2c
userDao 执行 destroy-method

Process finished with exit code 0
```

可以看到，我们的 UserService 类已经可以从 Spring 框架中获取到容器对象了。

到目前位置，该 Spring 框架的 Bean 生命周期已经趋于完整，如下图所示：

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303281821704.png)

## 4. 流程

![](https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303261332648.png)

