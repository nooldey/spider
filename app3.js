var async = require('async');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var fs = require('fs'); //文件管理 模块 用于生成markdown文件
var request = require('request');

//初始化，定义来源链接/入口地址
var sourceUrl = 'http://uiv5.com/';
var pageUrls = []; //用来放置分页单页的地址
for(var i = 1; i < 3; i++) {
    pageUrls.push(sourceUrl + '?paged=' + i);
};
var postUrls = []; //用来放置文章链接地址
var posts = []; //用来放置抓取的文章内容

//生成markdown文件
var createPost = function(posts){
    //远程爬取图片
    var getImg = function(src,content){
        var _c = content;
        src.forEach(function(src){
            //获取单条图片地址后缀
            var suffx = src.match(/(\/.\w+)|(\.\w+$)/gi).pop();
            //获取文件名并按新规则命名
            var nameStr = src.split('/');
            //将链接地址按照分隔符拆分成数组，原：2015/10/22/png.png
            //选取数组的第5个之后的所有元素，用分隔符合并起来，新：2015-10-22-png.png
            var newName = nameStr.slice(5).join("-");
            //远程拉取图片到本地
            request(src).pipe(fs.createWriteStream("./mm/imgs/" + newName));
            //替换content中的图片地址
            var conImg = "./imgs/" + newName;
            _c = _c.replace(src,conImg);
            _c = _c.replace(src,conImg);
        });
        return _c;
    };
    //开始生成本地文件
    posts.forEach(function(post){
        var title = post.title;
        var tags = post.tags;
        var date = post.date;
        var content = post.content.replace(/^\s+/,"");
        var markdown = '';
        //匹配content中的img，替换img地址并拉取到本地
        var $ = cheerio.load(content);
        if ( $("p img").length > 0 ) {
            var srcs = [];
            $("p img").each(function(idx,img){
                if ($(img).attr("src").match(/\w+\.?\w+\.com/) == "uiv5.com") {
                    src = $(img).attr("src");
                    srcs.push(src);
                };
            });
            content = getImg(srcs,content);
        }
        //生成markdown内容
        markdown = "title: " + title + "\ndate: " + date + "\ntags:\n" + tags + "\n\n---\n\n" + content + "\n";
        //创建文件
        fs.writeFile("./mm/" + title + ".md",markdown);
        console.log("生成markdown完毕！");
    });
};

//从文章链接入口,逐个获取文章内容
var getPosts = function(postUrls){
    async.mapLimit(postUrls,5,function(postUrl,callback){
        //开始获取文章内容
        superagent.get(postUrl)
            .end(function(err,result){
                if(err){return console.error(err);}
                //获取单篇文章内容
                var $ = cheerio.load(result.text,{decodeEntities:false});
                var tags = $('.single-post .entry-info .tags').text().trim();
                var dateTag = $('.single-post .entry-info').text().trim();
                var date = dateTag.replace(tags,'').replace(/[\s+/]/g,'');
                var post = {
                    "title": $('.single-post h2.entry-title').text().trim(),
                    "href": postUrl,
                    "tags": tags,
                    "date": date,
                    "content": $('.single-post .entry-content').html()
                };
                posts.push(post);
                callback(null,postUrl);
            });
    },function(err,result){
        console.log("已完成文章：");
        console.log(result);
        createPost(posts);
    });
};

//执行环节：匹配pageUrls中的单个入口地址，获取入口地址页面的文章链接集合
var fetchUrl = function (pageUrl,callback) {
    // 通过代理获取入口页的文章链接，放到数组postUrls中
    superagent.get(pageUrl)
        .end(function(err,res){
            if (err) {return console.error(err);}
            //cheerio引入后，调用方式和jquery类似
            var $ = cheerio.load(res.text);
            //获取文章链接
            $('#container .post .summary a').each(function (idx, element) {
                var $element = $(element);
                //利用url进行链接补全
                //var postUrl = url.resolve(sourceUrl, $element.attr('href'));
                var postUrl = $element.attr('href');
                postUrls.push(postUrl);
            });
            callback(null,pageUrl);
        });
};

//执行内容：获取page页面上的文章链接，并存储到数组中返回。
// 控制读取页面page并发数为5，避免被识别为恶意请求，返回获取结果
async.mapLimit(pageUrls, 5, function (pageUrl, callback) {
    //执行单元
    fetchUrl(pageUrl,callback);
}, function (err, res) {
    console.log("已完成页面：");
    console.log(res);
    getPosts(postUrls);
});
