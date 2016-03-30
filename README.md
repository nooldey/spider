# 说明

本来是想学习python做爬虫的。

误打误撞用了node.js

懒得去改项目名了。

想学node.js 配合功能模块实现爬虫的，欢迎交流！

文件范例请勿直接执行！

## 目录说明

#### mm：
这里存放抓取下来的页面内容，包括正文和静态资源等

#### nodejsrobot-master:
来自 [WadeYu](http://www.cnblogs.com/wadeyu/) 是一个通用的网络爬虫，可以爬取指定网站的所有资源，内附使用说明README

#### nooldey-p
本人nooldey的nodejs爬虫练习，范例来自：[Node.js 包教不包会](https://github.com/alsotang/node-lessons) 感谢作者，让我开始爬虫入门。

--app1.js
用nodejs及模块实现
最基础的本地服务器搭建和内容输出
/+
认识爬虫：单进程简单爬虫抓取制定链接站点信息(superagent+cheerio)；

--app2.js
爬虫进阶：eventproxy + url + superagent + cheerio实现异步并发的爬虫，可抓取指定链接的指定信息；重点在于eventproxy的调用.

--app3.js
爬虫实践：为了将wordpress博客迁移到HEXO，定制编写的爬虫，实现抓取指定文章页面内容+图片抓取回本地+内容图片地址更新+生成本地markdown文件。
    采用async + fs + request + url + ……
亮点：
1. 实现并发数控制，避免被目标网站误认为恶意请求；
2. 图片资源拉取，省心省力，不用去手动下载；
3. 本地文件生成，自动完成的markdown，直接导入HEXO的source文件夹即可生成
4. 高效，快速，实测比app4的脚本 完成度、工作效率 都高，可以明显感受到。
缺陷：
1. 高度依赖目标页面的html结构，即DOM树，一旦目标页面更新，爬虫即失效。
2. 未定义http请求类型，未定义header信息，在网站访问日志中一眼就看出来。
3. 没有拉取CSS和JS文件资源。


--app4.js
爬虫实践： 同样是读取指定连接的文章，采用 eventproxy + fs + request + url + ……
适用：
    单页面请求、单链接信息抓取
缺陷：
1. 和app3相同的问题
2. 一旦请求超过100，容易造成目标网站的明显察觉，同一时间发起请求，无法控制并发
3. 其他

以上，欢迎共同学习。
http://zhuweisheng.com.cn/
