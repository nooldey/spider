//引入库
var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');
var app = express();

/*****核心功能代码部分****/

/* 第一个最简单的例子--express+输出"hello world" */
// app.get('/',function(req,res){
//     res.send('Hello World');
// });


/*爬虫例子：用superagent和cheerio简单爬虫，获取cnodejs网站文章title+href+author*/
app.get('/',function(req,res,next){
    superagent.get('https://cnodejs.org/')
    .end(function(err,sres){
        if (err) {
            return next(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
        var $ = cheerio.load(sres.text);
        var items = [];
        /*
        * html结构：
        *   #topic_list > .cell >.topic_title = title + href
        *   #topic_list > .cell >.user_avatar > img = author
        */
        $('#topic_list .cell').each(function(idx,element){
            var $post = $(element).find('.topic_title');
            var $author = $(element).find('.user_avatar img');
            items.push({
                title: $post.attr('title'),
                href: $post.attr('href'),
                author: $author.attr('title')
            });
        });
        res.send(items);
    });
});

/******本地测试基础设置（必须）******/
//设置本地监听端口
app.listen(3000,function(){
    console.log('app is listening at port 3000');
});
