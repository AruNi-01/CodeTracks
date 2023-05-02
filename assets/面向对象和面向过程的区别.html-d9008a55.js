import{_ as e,Z as a,$ as i,a3 as t,a1 as n,a4 as s,a0 as l,E as c,a2 as r}from"./framework-63f054a3.js";const d={},p={class:"hint-container details"},g=t("summary",null,"本文内容",-1),_={class:"table-of-contents"},h=l('<h2 id="_1-什么是面向过程" tabindex="-1"><a class="header-anchor" href="#_1-什么是面向过程" aria-hidden="true">#</a> 1. 什么是面向过程</h2><p>面向过程可以和面向对象类比起来，也分为面向过程编程和面向过程编程语言，这里只讲一下面向过程编程。</p><p>面向过程编程也是一种编程范式或风格。它以 <strong>过程</strong>（方法、操作）作为组织代码的基本单元，主要特点是 <strong>数据与方法相分离</strong>。</p><blockquote><p>比如在一个 <code>.c</code> 文件中，数据定义在 <code>struct</code> 结构体中，而方法定义在外面。</p></blockquote><p>面向过程编程其实是一种 <strong>流程化</strong> 的风格，具体来说，因为它的数据与数据相关的方法是分开定义的，所以我们在开发某个功能时，一般就只考虑这个功能分为哪些步骤，然后根据步骤来定义所需的数据和方法，最后直接串联起来使用这些方法（执行流程），也就完成了这个功能。</p><p>而面向对象编程，恰恰与面向过程编程相反，它以 <strong>对象</strong>（类和对象）作为组织代码的基本单元，主要特点是 <strong>数据与方法绑定在一起，定义在类中</strong>。</p><h2 id="_2-面向对象编程有哪些优势" tabindex="-1"><a class="header-anchor" href="#_2-面向对象编程有哪些优势" aria-hidden="true">#</a> 2. 面向对象编程有哪些优势</h2><h3 id="_2-1-oop-更能应对大规模复杂的程序" tabindex="-1"><a class="header-anchor" href="#_2-1-oop-更能应对大规模复杂的程序" aria-hidden="true">#</a> 2.1 OOP 更能应对大规模复杂的程序</h3><p>如果某个程序比较简单，就是实现一个具体的功能，那么也许使用面向过程编程会更加简单、高效。比如实现一个脚本，具体功能就是将文字提取到文件中，那么用面向过程编程，直接定义一系列实现该功能的方法，如 <code>readWords()</code> -&gt; <code>output2File()</code>，这个程序就完成了。</p><p>但是，对于一些 <strong>大规模复杂的程序，并非只有一条主线</strong>，如果把整个程序的处理流程画出来，会是一个网状结构。如果我们用面向过程编程，把每一条处理流程都写出来，就会比较难。</p><p>而面向对象编程是以类为思考对象，在进行编程时，我们<strong>并不是先思考如何将复杂的流程拆解成为一个个的方法，而是曲线救国，先去思考如何给业务建模，如何将需求翻译为类，如何给类之间建立交互关系</strong>。当我们把相关的类都设计出来后，再像搭积木一样，<strong>按照处理流程，将类组装起来使用，从而完成某个功能</strong>。这种开发模式，在面对复杂程序的时候，思路就会更新清晰。</p><h3 id="_2-2-oop-代码更容易复用、扩展和维护" tabindex="-1"><a class="header-anchor" href="#_2-2-oop-代码更容易复用、扩展和维护" aria-hidden="true">#</a> 2.2 OOP 代码更容易复用、扩展和维护</h3><p>我们别忘了，<strong>面向对象编程提供封装、抽象、继承和多态这些特性</strong>，所以能方便我们编写出更加容易复用、扩展、维护的代码，下面具体来说说。</p><div class="hint-container info"><p class="hint-container-title">封装</p><p><strong>封装</strong> 特性提供了 <strong>信息隐藏和数据访问保护，只允许外部通过类中暴露的有限的数据访问方法来进行数据访问，提高了易维护性</strong>。而面向过程编程数据可以被任意方法随意修改，因此不利于代码的维护。</p></div><div class="hint-container info"><p class="hint-container-title">抽象</p><p>再来看看 <strong>抽象</strong>，我们知道，函数本身就是一种抽象，它隐藏了具体的实现，所以在使用时只需要了解函数有什么功能，而不用了解它是如何实现的。从函数这一点来看，面向过程编程和面向对象编程都支持，差别不大。</p><p>但是，面向对象编程还提供了其他的抽象特性的实现方式，例如 <strong>基于接口实现抽象</strong>，它可以在 <strong>不改变原有实现的情况下，轻松替换成新的实现逻辑，提高了代码的可扩展性</strong>。</p></div><div class="hint-container info"><p class="hint-container-title">继承</p><p><strong>继承</strong> 是面向对象编程特有的一个特性之一，如果<strong>两个类中需要使用到相同的属性或方法</strong>，那么就可以把些相同的属性或方法抽取出来，放在一个父类中，<strong>让子类继承该父类</strong>。这样子类就可以 <strong>复用父类中的代码了</strong>，避免了重复编写相同的代码，<strong>提高了复用性</strong>。</p></div><div class="hint-container info"><p class="hint-container-title">多态</p><p><strong>多态</strong> 是另一个面向对象编程特有的特性，如果需要修改一个功能实现，就可以通过实现一个新的子类，在子类中重写原来的功能逻辑，<strong>在运行时就可以实现子类替换父类，从而调用子类重写的方法</strong>。而不用再原来的功能代码上做修改，这就遵从了 “对修改关闭、对扩展开放” 的设计原则，提高了代码的扩展性。</p></div><p>所以基于面向对象免除这四大特性，可以更轻松地写出容易复用、扩展和维护的代码。当然，利用面向过程编程也可以实现，但没有四大特性的帮助，付出的代价可能就要高一些。</p><h2 id="_3-总结" tabindex="-1"><a class="header-anchor" href="#_3-总结" aria-hidden="true">#</a> 3. 总结</h2><p><strong>面向过程编程</strong> 主要特点是 <strong>数据与方法相分离</strong>，它是一种 <strong>流程化</strong> 的风格，它只关注某个功能的 <strong>执行流程</strong>，适合简单的程序。</p><p>而 <strong>面向对象编程</strong> 是将 <strong>数据与方法绑定起来，定义在类中</strong>，关注的是如何建模，如何定义类、决定类之间的交互方式。</p><p>面向对象编程相比面向过程编程，主要含有如下优势：</p><ul><li>更加能应对复杂、大型的程序开发；</li><li>基于四大特性，使编写出来的代码更加容易扩展、复用、维护。</li></ul>',23);function u(f,v){const o=c("router-link");return a(),i("div",null,[t("details",p,[g,t("nav",_,[t("ul",null,[t("li",null,[n(o,{to:"#_1-什么是面向过程"},{default:s(()=>[r("1. 什么是面向过程")]),_:1})]),t("li",null,[n(o,{to:"#_2-面向对象编程有哪些优势"},{default:s(()=>[r("2. 面向对象编程有哪些优势")]),_:1}),t("ul",null,[t("li",null,[n(o,{to:"#_2-1-oop-更能应对大规模复杂的程序"},{default:s(()=>[r("2.1 OOP 更能应对大规模复杂的程序")]),_:1})]),t("li",null,[n(o,{to:"#_2-2-oop-代码更容易复用、扩展和维护"},{default:s(()=>[r("2.2 OOP 代码更容易复用、扩展和维护")]),_:1})])])]),t("li",null,[n(o,{to:"#_3-总结"},{default:s(()=>[r("3. 总结")]),_:1})])])])]),h])}const x=e(d,[["render",u],["__file","面向对象和面向过程的区别.html.vue"]]);export{x as default};
