import{_ as r,Z as s,$ as c,a3 as l,a1 as e,a4 as t,a2 as i,a0 as d,E as n}from"./framework-63f054a3.js";const _={},h={class:"hint-container details"},u=l("summary",null,"本文内容",-1),f={class:"table-of-contents"},p=d('<div class="hint-container tip"><p class="hint-container-title">人生中第一次面试，有点小紧张，都搞忘记录音了，所以第一篇面经是回忆版。</p></div><h2 id="一面-2023-2-12" tabindex="-1"><a class="header-anchor" href="#一面-2023-2-12" aria-hidden="true">#</a> 一面（2023/2/12）</h2><h3 id="框架" tabindex="-1"><a class="header-anchor" href="#框架" aria-hidden="true">#</a> 框架</h3><ul><li>SpringBoot 常用注解</li><li>@SpringBootApplication 了解吗？它是哪几个注解的组合？</li><li>用 MyBatis 写 SQL 的方式有哪些？使用注解的方式具体怎么写？</li><li>如果是单表有没有什么其他方式？（应该是看会不会 MyBatisPlus）</li></ul><h3 id="项目" tabindex="-1"><a class="header-anchor" href="#项目" aria-hidden="true">#</a> 项目</h3><ul><li>点赞功能是怎么实现的？key 是如何设计的？（用 Redis 实现的点赞）</li><li>那用户的点赞总数呢？点赞数要 +1 是怎么处理的？先查出原来的点赞数，+1 后再 set 回去吗？</li><li>用户查看自己点赞了哪些帖子又是怎么实现的呢？</li><li>你项目中 Elasticsearch 用来做什么的？</li><li>Kafka 用来做什么？</li><li>用户怎么收到通知的呢？（上面说到 Kafka 用来做系统通知）</li><li>那用户每次都需要刷新才能看到新的通知？有没有什么好的解决方案？（上面说到用户加载页面的时候从数据库中直接查询出来）</li><li>那就是要轮询？你知道 WebSocket 吗？（上面说通过异步请求的方式获取）</li></ul><h3 id="数据库" tabindex="-1"><a class="header-anchor" href="#数据库" aria-hidden="true">#</a> 数据库</h3><ul><li>多表查询有什么方式？</li><li>内连接和外连接有什么区别？</li><li>我想去重怎么办？排序呢？分组呢？分组有条件呢？</li><li>怎么分页查询？你的项目中是怎么做的？</li><li>如果 limit 后面只跟一个参数呢？</li><li>MySQL 的存储引擎有哪几种？它们有什么区别？</li><li>什么情况下使用 InnoDB，什么情况下使用 MyISAM 呢？</li><li>事务的隔离级别有哪几种？MySQL 默认的是哪种？解决了什么问题？</li></ul><hr>',9),m={href:"https://www.wolai.com/aruni-01/kBpvxVG92vp39Ym7oomAKB",target:"_blank",rel:"noopener noreferrer"};function k(x,B){const a=n("router-link"),o=n("ExternalLinkIcon");return s(),c("div",null,[l("details",h,[u,l("nav",f,[l("ul",null,[l("li",null,[e(a,{to:"#一面-2023-2-12"},{default:t(()=>[i("一面（2023/2/12）")]),_:1}),l("ul",null,[l("li",null,[e(a,{to:"#框架"},{default:t(()=>[i("框架")]),_:1})]),l("li",null,[e(a,{to:"#项目"},{default:t(()=>[i("项目")]),_:1})]),l("li",null,[e(a,{to:"#数据库"},{default:t(()=>[i("数据库")]),_:1})])])])])])]),p,l("blockquote",null,[l("p",null,[i("附带答案版本："),l("a",m,[i("壹沓科技"),e(o)])])])])}const v=r(_,[["render",k],["__file","日常实习-壹沓科技.html.vue"]]);export{v as default};
