import{_ as a}from"./plugin-vue_export-helper-c27b6911.js";import{r as s,o as i,c as d,a as t,d as o,w as r,b as n,e as _}from"./app-4a9cb391.js";const p={},c={class:"hint-container details"},g=t("summary",null,"本文内容",-1),h={class:"table-of-contents"},u={class:"hint-container info"},f=t("p",{class:"hint-container-title"},"前言",-1),S={href:"https://aruni.me/studynotes/design_pattern/mind/design_principle/%E5%B8%B8%E8%A7%81%E8%AE%BE%E8%AE%A1%E5%8E%9F%E5%88%99.html",target:"_blank",rel:"noopener noreferrer"},m=_('<h2 id="_1-kiss-和-yagni-原则" tabindex="-1"><a class="header-anchor" href="#_1-kiss-和-yagni-原则" aria-hidden="true">#</a> 1. KISS 和 YAGNI 原则</h2><p><strong>KISS</strong>（Keep It Simple and Stupid）称为 <strong>尽量保持简单</strong> 原则，意思是 <strong>代码要写得足够简单、易懂</strong>。这样的代码才具有可读性和可维护性。</p><p>需要注意的是，这里的简单并不是代码行数少就简单，也不是逻辑复杂的代码就违背可 KISS 原则，例如：</p><ul><li>代码行数少，但逻辑很复杂，实现难度大，可读性差，也违背了 KISS 原则；</li><li>本身问题就复杂，那么用复杂的方法解决，并不违背 KISS 原则。</li></ul><p>至于怎么写出满足 KISS 原则的代码，下面有几条比较好的指导原则：</p><ul><li>不要使用同事可能不懂的技术来实现代码；</li><li>不要重复造轮子，要善于使用已有的工具类；</li><li>不要过度优化。</li></ul><p><strong>YAGNI</strong>（You Ain&#39;t Gonna Need It）称为 <strong>你不会需要它</strong> 原则，意思是 <strong>不要做过度的设计，但是也需要预留好扩展点</strong>。</p><p>YAGNI 原则主要是让我们不要去设计目前使用不到的模块，需要的时候再实现。当然也要提前预留好扩展点，方便需要的时候实现。</p><p>需要注意的是：<strong>KISS 原则讲的是 “如何做”（尽量保持简单）的问题，而 YAGNI 原则说的是 “要不要做”（当前不需要的就不要做）的问题</strong>。</p><h2 id="_2-dry-原则" tabindex="-1"><a class="header-anchor" href="#_2-dry-原则" aria-hidden="true">#</a> 2. DRY 原则</h2><p><strong>DRY</strong>（Don&#39;t Repeat Yourself）称为 <strong>不要重复自己</strong> 原则，意思是 <strong>不要写重复的代码</strong>。</p><p>需要注意的是，评判代码是否重复并不是简单的看代码是否长得一样，而要 **从代码的实现逻辑、功能语义和代码执行是否重复 **的角度来具体分析判断：</p><ul><li>如果代码的实现逻辑相似，但是表达的语义不同，就不算违背 DRY 原则；</li><li>如果代码的功能重复，尽管实现逻辑不同，也违背 DRY 原则；</li><li>如果代码中存在重复执行（同一代码段中执行了2+次相同的代码），也违背 DRY 原则。</li></ul><h2 id="_3-lod-法则" tabindex="-1"><a class="header-anchor" href="#_3-lod-法则" aria-hidden="true">#</a> 3. LOD 法则</h2><p>利用 LOD 法则，可以帮我们实现代码的 “高内聚、低耦合”。下面就先来看看什么是 “高内聚、低耦合”。</p><h3 id="_3-1-何为-高内聚、低耦合" tabindex="-1"><a class="header-anchor" href="#_3-1-何为-高内聚、低耦合" aria-hidden="true">#</a> 3.1 何为 “高内聚、低耦合”？</h3><p>“<strong>高内聚、低耦合</strong>” 是一个非常重要的设计思想，用于 <strong>提高代码的可读性和可维护性，缩小功能改动带来的代码改动范围</strong>。</p><p>所谓 <strong>高内聚</strong>，就是指 <strong>相近的功能应该放到同一个类中，不相近的功能不要放到同一个类中</strong>。相近的功能往往会被同时修改，放到同一个类中，修改会比较集中，代码容易维护。实际上，<strong>单一职责原则</strong> 就是实现代码高内聚一个非常有效的原则。</p><p>所谓 <strong>低耦合</strong>，就是指 <strong>类于类之间的依赖关系简单清晰</strong>。这样即使两个类有依赖关系，一个类的代码改动也不会/很少导致依赖类的代码改动。实际上，<strong>依赖注入、接口隔离、基于接口而非实现编程</strong>，以及下面要讲的 <strong>LOD 法则</strong>，都是为了实现代码的低耦合。</p><h3 id="_3-2-lod-法则" tabindex="-1"><a class="header-anchor" href="#_3-2-lod-法则" aria-hidden="true">#</a> 3.2 LOD 法则</h3><p><strong>LOD</strong>（Law Of Demeter）称为 <strong>迪米特法则</strong>，很明显这不是一个见名知意的法则。</p><p>LOD 法则的描述是：每个模块只应该了解哪些与它关系密切的模块的有限知识。或者说，每个模块之和自己的朋友说话，不和陌生人说话。</p><blockquote><p>英文描述：Each unit should have only limited knowledge about other units: only units “closely” related to the current unit. Or: Each unit should only talk to its friends; Don’t talk to strangers.</p></blockquote><p>这描述也是非常的抽象，下面再来看看王争老师的定义：<strong>不该有直接依赖关系的类之间，不要有依赖；有依赖关系的类之间，尽量只依赖必要的接口</strong>。</p><p>迪米特法则是希望减少类之间的耦合，让类越独立越好，所以不该直接依赖的两个类，不要有依赖。</p><p>而有依赖关系的类之间，尽量只依赖必要的接口，意思就是如果一个类只使用了某个类的部分功能，那么可以考虑把某个类抽象成两个或多个接口，让这个类只实现有这部分功能的接口即可。也体现了 “基于接口而非实现编程”，结合起来说就是 “基于最小接口而非最大实现编程”。</p><p>使用迪米特法则的最大好处就是一旦某个类发生了部分变化，<strong>只会有较少的其他类受该部分的影响</strong>。</p>',27);function D(I,k){const e=s("router-link"),l=s("ExternalLinkIcon");return i(),d("div",null,[t("details",c,[g,t("nav",h,[t("ul",null,[t("li",null,[o(e,{to:"#_1-kiss-和-yagni-原则"},{default:r(()=>[n("1. KISS 和 YAGNI 原则")]),_:1})]),t("li",null,[o(e,{to:"#_2-dry-原则"},{default:r(()=>[n("2. DRY 原则")]),_:1})]),t("li",null,[o(e,{to:"#_3-lod-法则"},{default:r(()=>[n("3. LOD 法则")]),_:1}),t("ul",null,[t("li",null,[o(e,{to:"#_3-1-何为-高内聚、低耦合"},{default:r(()=>[n("3.1 何为 “高内聚、低耦合”？")]),_:1})]),t("li",null,[o(e,{to:"#_3-2-lod-法则"},{default:r(()=>[n("3.2 LOD 法则")]),_:1})])])])])])]),t("div",u,[f,t("p",null,[n("本篇文章是 "),t("a",S,[n("常见设计原则"),o(l)]),n(" 的续篇，主要简单地讲解剩下的几种设计原则，有：DRY 原则、KISS 原则、YAGNI 原则、LOD 法则。")])]),m])}const x=a(p,[["render",D],["__file","设计原则补充.html.vue"]]);export{x as default};
