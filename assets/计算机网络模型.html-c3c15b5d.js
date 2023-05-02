import{_ as i,Z as l,$ as p,a3 as n,a1 as t,a4 as o,a2 as s,a0 as c,E as a}from"./framework-63f054a3.js";const g={},d={class:"hint-container details"},h=n("summary",null,"本文内容",-1),_={class:"table-of-contents"},u=c('<h2 id="_1-什么是网络模型" tabindex="-1"><a class="header-anchor" href="#_1-什么是网络模型" aria-hidden="true">#</a> 1. 什么是网络模型</h2><p>网络世界是错综复杂的，一条数据要经过许多设备和不同的协议栈，才能到达目的地。如果把所有的设备和相关的协议揉成一团，是非常不容易维护和发展的。所以专家们就抽象出 <strong>网络模型</strong>，<strong>每层模型只负责自己的事情</strong>。这就将一个庞大复杂的网络，转化为了若干个较小的局部问题。</p><p>每一层模型只需对其上层和下层提供对应的服务或者接口，按照规定的协议进行数据传输，即可将整个网络串联起来，而且对某一层的设备或协议进行单独改进，也不会影响到其他层。</p><h3 id="_1-1-网络模型层次划分" tabindex="-1"><a class="header-anchor" href="#_1-1-网络模型层次划分" aria-hidden="true">#</a> 1.1 网络模型层次划分</h3><p>常见的网络模型有三种，分别是 <strong>OSI 七层模型、TCP/IP 五层模型和 TCP/IP 四层模型</strong>。</p><p>OSI 七层模型是最早、最标准的网络模型，每一层划分的很细，功能也很聚焦。但是在真正实施起来的时候，会存在以下问题：</p><ul><li>需要为每层定义不同的协议，协议实现太复杂、实现时间长；</li><li>层次划分太细，有些层的功能重叠；</li><li>不利于协议的发展和维护。</li></ul><p>所以，我们一般在学习网络模型时，只需要学习后面两个就行了，七层模型只需进行了解。</p><p>OSI 七层模型分为应用层、表示层、会话层、传输层、网络层、数据链路层和物理层。</p><p>TCP/IP <strong>五层模型</strong> 把应用层、表示层和会话层合并为应用层，将网络分成 <strong>应用层、传输层、网络层、数据链路层和物理层</strong>，而 <strong>四层模型</strong> 则进一步将 <strong>数据链路层和物理层</strong> 合并为 <strong>网络接口层</strong>。</p><p>这三种模型的对应关系如下：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303011904050.png" alt="image-20230301190410548"></p><p>我们主要学习的是 TCP/IP 的五层模型。</p><h3 id="_1-2-每层对应的功能、协议、设备是什么" tabindex="-1"><a class="header-anchor" href="#_1-2-每层对应的功能、协议、设备是什么" aria-hidden="true">#</a> 1.2 每层对应的功能、协议、设备是什么</h3><p>一张图了解每层对应的功能、协议和设备：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303012001233.png" alt="image-20230301200116945"></p><p>接下来分别对每一层进行讲解。</p><h2 id="_2-应用层" tabindex="-1"><a class="header-anchor" href="#_2-应用层" aria-hidden="true">#</a> 2. 应用层</h2><p>应用层在网络模型的最上层，我们平时使用的应用程序，都是在应用层。</p><p><strong>应用层</strong> 只负责 <strong>向应用程序提供网络服务</strong>，而 <strong>不用管数据是如何进行传输</strong>。就像寄快递，我们只负责将快递交给快递员，而不用管快递如何运输，</p><p>应用层通过应用层协议给用户提供网络服务，常用的有：</p><ul><li><strong>HTTP</strong>：提供点到点之间的超文本传输服务；</li><li><strong>DNS</strong>：提供域名解析服务，将域名解析成对应的 IP 地址；</li><li>FPT：提供文件传输服务；</li><li>SMTP：提供邮件传输服务。</li></ul><h2 id="_3-传输层" tabindex="-1"><a class="header-anchor" href="#_3-传输层" aria-hidden="true">#</a> 3. 传输层</h2><p>应用层的数据包会传输给传输层，传输层主要服务给应用层提供网络支持。</p><p>传输层有两个传输协议，分别是 <strong>TCP 和 UDP</strong>。它们会建立、维护、管理自己的连接（UDP 无连接），以供应用层使用。</p><div class="hint-container info"><p class="hint-container-title">TCP 协议</p><p>TCP 传输协议需要 <strong>建立连接</strong>，它提供 <strong>可靠的、基于字节流的传输服务</strong>。大多数应用都是使用 TCP 协议进行数据传输，因为它能让数据包可靠的到达目的地。</p><p>为了提供可靠的传输，TCP 有了许多特性，如需要建立连接、流量控制、拥塞控制、重传机制等。</p></div><div class="hint-container info"><p class="hint-container-title">UDP 协议</p><p><strong>UDP</strong> 传输协议 <strong>不需要建立连接</strong>，只负责简单的收发数据包，所以不需要过多的特性，而且传输效率较高，常用于对数据可靠性要求没那么高的场景。</p></div><p>需要知道的是，应用需要传输的数据包可能会非常大，为了合理控制传输效率，当数据包大小 <strong>超过 MSS</strong>（Maximum Segment Size，最大报文段长度）时，就需要将数据包 <strong>分块传输</strong>。这样即使传输过程有一个分块丢失了，也只需要重传这一个，大大提高了传输效率。</p><p>TCP 会在数据包上添加 TCP 头部，形成 TCP 报文。另外，为了区分数据包是属于哪个应用进程的，一般在发送数据包时会将应用进程的 <strong>端口号</strong> 也携带上，保存到 TCP 报文头部。</p><h2 id="_4-网络层" tabindex="-1"><a class="header-anchor" href="#_4-网络层" aria-hidden="true">#</a> 4. 网络层</h2><p>网络层常使用的协议有 IP 和 ICMP。IP 协议会将传输层的报文作为数据，再加上 IP 头部，封装成 IP 报文。如果 IP 报文大小 <strong>超过 MTU</strong>（Maximum Transmission Unit，最大传输单元），就会再次进行 <strong>分片</strong>。</p><p>进行数据传输的两台设备之间并不是通过一条网线连接的，而是通过 <strong>多个网关、路由器、交换机等网络设备连接起来的</strong>，那么就会形成很多条网络路径，因此就需要 <strong>通过不断的路由跳转，数据包才能到达目的地</strong>。</p><p>这就是网络层负责的内容，它会进行 <strong>IP 地址和路由器的选择</strong>，判断出数据库应该发往哪儿。</p><p><strong>IP 寻址更像是导航，指导数据包应该发往哪儿，而路由更像在操作方向盘，进行真正路径的选择</strong>。</p><p>例如，我要将数据发送给 IP 为 192.168.31.1 的目标，那么根据路由表规则（路由表中会有目的地址和下一跳地址），就会指明应该先将数据发给哪个路由器，然后再进行多次转发，最终到达目的地。</p><h2 id="_5-数据链路层" tabindex="-1"><a class="header-anchor" href="#_5-数据链路层" aria-hidden="true">#</a> 5. 数据链路层</h2><p>收到 IP 报文后，数据链路层会在 IP 报文的头部和尾部再加上一个 MAC 头部，然后封装成 <strong>数据帧</strong>，发送到网络上。</p><p>在 IP 头部中有目的地的 IP 地址，通过 IP 地址可以判断数据包要发往哪儿，但是 <strong>在以太网中，这个思路是行不通的</strong>。</p><div class="hint-container info"><p class="hint-container-title">以太网</p><p>以太网就是一种在「局域网」内，把附近的设备连接起来，使它们之间可以进行通讯的技术。</p><p>例如，电脑上的以太网接口、以太网交换机、路由器的以太网口，网线等，都是以太网的组成部分。</p></div><p><strong>以太网在判断数据包的目的地时，和 IP 的方式不同</strong>，因此必须采用相匹配的方式才能在以太网中将数据包发往目的地，而这个方式，就是 <strong>MAC 地址</strong>。</p><p>MAC 头部是以太网使用的头部，它包含了接收方和发送方的 MAC 地址等信息，可以通过 <strong>ARP 协议 获取对方的 MAC 地址</strong>。</p><p>也就是说，需要使用 MAC 地址才能标识网络上的设备，才知道具体发往哪个地方。<strong>每台设备的 MAC 地址是唯一的，而 IP 地址不唯一</strong>（每个局域网内的 IP 地址才唯一）。</p><blockquote><p>举个公司的例子，把 IP 地址比喻成工号，公司可以回收或者给别人用，或者在不不同的子公司也可以存在完全一样的工号。</p><p>有的公司员工离职后再回来，工号重新编。有的公司工号是永久编号，你离职了这个工号就空着，你回来了这个工号还是你的。所以完全看分配的策略，规则比较灵活。</p><p>而 Mac 就是一个设备一个编号号，规则不灵活，类似你的身份证号，你出生就有了，一生不变。</p></blockquote><h2 id="_6-物理层" tabindex="-1"><a class="header-anchor" href="#_6-物理层" aria-hidden="true">#</a> 6. 物理层</h2><p>物理层会在数据帧的头部添加一个 <strong>前导码</strong>，使数据包成为比特流，然后负责数据比特流的传输，比特流在真正传输过程中会转换成对应的信号，然后发送到传输介质中。如下所示：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202203251802258.png" alt="image-20220304134758719"></p><h2 id="_7-总结" tabindex="-1"><a class="header-anchor" href="#_7-总结" aria-hidden="true">#</a> 7. 总结</h2><p>现在再来回顾一下这个图，就清晰多了：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303012001233.png" alt="image-20230301200116945"></p><p>数据包在被传输的时候，需要添加一系列的头部，数据包被层层封装的示意图如下：</p><p><img src="https://run-notes.oss-cn-beijing.aliyuncs.com/notes/202303012215047.png" alt="image-20230301221552876"></p><h2 id="_8-参考文章" tabindex="-1"><a class="header-anchor" href="#_8-参考文章" aria-hidden="true">#</a> 8. 参考文章</h2>',52),P={href:"https://xiaolincoding.com",target:"_blank",rel:"noopener noreferrer"},f={href:"https://www.bilibili.com/video/BV1c4411d7jb/?spm_id_from=333.337.search-card.all.click&vd_source=2716833caf2bf21200544dca2cc25e03",target:"_blank",rel:"noopener noreferrer"};function m(I,b){const r=a("router-link"),e=a("ExternalLinkIcon");return l(),p("div",null,[n("details",d,[h,n("nav",_,[n("ul",null,[n("li",null,[t(r,{to:"#_1-什么是网络模型"},{default:o(()=>[s("1. 什么是网络模型")]),_:1}),n("ul",null,[n("li",null,[t(r,{to:"#_1-1-网络模型层次划分"},{default:o(()=>[s("1.1 网络模型层次划分")]),_:1})]),n("li",null,[t(r,{to:"#_1-2-每层对应的功能、协议、设备是什么"},{default:o(()=>[s("1.2 每层对应的功能、协议、设备是什么")]),_:1})])])]),n("li",null,[t(r,{to:"#_2-应用层"},{default:o(()=>[s("2. 应用层")]),_:1})]),n("li",null,[t(r,{to:"#_3-传输层"},{default:o(()=>[s("3. 传输层")]),_:1})]),n("li",null,[t(r,{to:"#_4-网络层"},{default:o(()=>[s("4. 网络层")]),_:1})]),n("li",null,[t(r,{to:"#_5-数据链路层"},{default:o(()=>[s("5. 数据链路层")]),_:1})]),n("li",null,[t(r,{to:"#_6-物理层"},{default:o(()=>[s("6. 物理层")]),_:1})]),n("li",null,[t(r,{to:"#_7-总结"},{default:o(()=>[s("7. 总结")]),_:1})]),n("li",null,[t(r,{to:"#_8-参考文章"},{default:o(()=>[s("8. 参考文章")]),_:1})])])])]),u,n("ul",null,[n("li",null,[n("a",P,[s("小林 coding"),t(e)])]),n("li",null,[n("a",f,[s("计算机网络微课堂"),t(e)])])])])}const x=i(g,[["render",m],["__file","计算机网络模型.html.vue"]]);export{x as default};
