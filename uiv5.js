/*
* 用 superagent + eventproxy 控制并发
*
*/


// 引入库
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var fs = require('fs'); //文件管理 模块 用于生成markdown文件
var request = require('request');

// 初始化
var sourceUrl = 'http://uiv5.com/';
var postUrls = sourceUrl + '/?paged=2';

// 核心代码
superagent.get(postUrls)
    .end(function(err,res){
        if(err){
            return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(res.text);
        //首页所有链接
        $('#container .post .summary a').each(function (idx, element) {
          var $element = $(element);
          var href = url.resolve(sourceUrl, $element.attr('href'));
          topicUrls.push(href);
        });
        console.log(topicUrls);

        //下面进行异步并发
        var ep = new eventproxy();
        //命令EP重复监听topicUrls.length次
        ep.after('topic_html',topicUrls.length,function(topics){
            topics = topics.map(function(topicPair){
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];
                var $ = cheerio.load(topicHtml,{decodeEntities:false});
                //存储单篇文章的data
                var post = {
                    "title": $('.single-post h2.entry-title').text().trim(),
                    "href": topicUrl,
                    "tags": $('.single-post .entry-info .tags').text().trim(),
                    "Data": $('.single-post .entry-info').text().trim(),
                    "content": $('.single-post .entry-content').html()
                };
                return post;
            });
                createPost(topics);
                //console.log(topics);
        });

        //生成markdown文件
        var createPost = function(topics){
            //远程爬取图片并拉取到本地重命名
            var getImg = function(src,content){
                var _c = content;
                src.forEach(function(src){
                    //获取单条图片地址后缀
                    var suffx = src.match(/(\/.\w+)|(\.\w+$)/gi).pop();
                    //获取文件名并按新规则命名
                    var nameStr = src.split('/');
                    var newName = nameStr.slice(5).join("-");
                    //远程拉取图片到本地
                    request(src).pipe(fs.createWriteStream("./mm/imgs/" + newName));
                    //替换content中的图片地址
                    var conImg = "./imgs/" + newName;
                    _c = _c.replace(src,conImg);
                    _c = _c.replace(src,conImg);
                });
                return _c;
            }

            //开始循环获取单篇文章data并生成md
            topics.forEach(function(post){
                var title = post.title;
                var tags = post.tags;
                var Data = post.Data;
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
                markdown = "title: " + title + "\ndata: " + Data + "\ntags:\n" + tags + "\n\n---\n\n" + content + "\n";
                //创建文件
                fs.writeFile("./mm/" + title + ".md",markdown);
            });
        }

        //开始循环
        topicUrls.forEach(function(topicUrl){
            superagent.get(topicUrl)
                .end(function(err,res){
                    console.log('fetch: ' + topicUrl + ' successful');
                    ep.emit('topic_html',[topicUrl,res.text]);
                });
        });

    });
