//引入http库
var superagent = require("superagent");
//引入node jquery
var cheerio = require("cheerio");
//引入url
var url = require("url");
//引入并发库
var async = require("async");
//引入文件管理
var fs = require("fs");
//引入request
var request = require("request");

var emufan = "http://uiv5.com";

//存储需要爬取的links
var getlinks = [];
//存储每一页爬取到的文章links
var postlinks = [];

//生成links
for (var i = 0; i < 3; i++) {
  getlinks.push(emufan + "/?paged=" + i);
}

//控制并发爬取每一页的文章
var fetchUrl = function(url,callback){
  //设置header信息，post浏览器代理信息
    superagent.post('/api/pet').set('Content-Type','application/json')
    .send({name:"ssn",pet:"tobi"}).set('Accept', 'application/json').set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36').end(null);

  //发起一个get请求，请求完毕的结果存储在res.text当中
  superagent.get(url).end(function(err,res){
    if (err) {
      return console.log(err);
    }
    // 先抓取后存储res.txt 抓取完毕后采用数组的形式传给callback
    // 传回抓取的links，不传回抓取数据，否则最后合并后会出现二维数组
    var $ = cheerio.load(res.text);
    var href = $(".summary > a");
    href.each(function(index,elem){
      postlinks.push($(elem).attr("href"));
    });
    callback(null,url + "finished");
  })
};


/*
*callback为maplimit中的callback
*callback(err,data)第一个为错误，第二个为数据
*/
//异步请求 循环getlinks中的链接并发数为5
async.mapLimit(getlinks,5,function(url,callback){
  //每次循环调用fetchUrl函数，将url和callback返回
  fetchUrl(url,callback);
},function(err,result){
  //getlinks 全部爬取后的结果组合在一起成为一个数组存储在result中
  console.log('获取文章链接完毕，存储在“postlinks”，开始抓取文章标题和内容')
  console.log(result)
  console.log(postlinks)
  getPost(postlinks)
});


//控制并发爬取文章标题和内容
var getPost = function(data){
  //并发5，循环data数组
  async.mapLimit(data,5,function(url,callback){
    superagent.get(url).end(function(err,res){
      if(err){console.log("错误，当前url为" + data)}
      //decodeEntities:false 不花花为HTML
      var $ = cheerio.load(res.txt,{decodeEntities:false})
      console.log("抓取url：" + url);
      var _a=[]; //临时存储每篇文章中的img src
      var _as=[]; //临时存储每页文章中的a href
      $(".single-post .entry-content").find("img.alignnone").each(function(index,elem){
        //匹配域名
        if ($(elem).attr("src").match(/\w+\.?\w+\.com/)=="www.uiv5.com") {
          _a.push($(elem).attr("src"));
          _as.push($(elem).parentNote("a").attr("href"));
        }
      })
      //利用对象存储获取到的标题，内容，img src,a href
      var _o = {
        "title": $(".single-post > .entry-title").text(),
        "content": $(".single-post .entry-content").html(),
        "imgs": {"imgsrc":_a,"ahref":_as}
      }
      callback(null,_o)
    })
  },function(err,result){
    console.log("全部抓取完毕");
    //fs.writeFile("./over.html",JSON.stringify(result))
    //生成本地文件
    createPost(result);
  });
}


//生成markdown文件
var createPost = function(data){
  //爬取远程图片并重命名
  var getImg = function(nowelem,nowelemcontent){
    /*nowelemcontent: 当前文章的内容
    * nowelem: 当前文章需要替换的imgs里面有imgsrc和ahref
    */
    var _c = nowelemcontent;
    //循环替换 a imgsrc
    nowelem.imgsrc.forEach(function(n,e){
      //获取后缀
      var suffx = n.match(/(\/.\w+)|(\.\w+$)/gi).pop()
      //获取文件名
      var filename = "".sustring.call(n,match(/(\/.\w+)|(\.\w+$)/gi).splice(-2,1),1)
      var _d = new Data();
      //命名
      var overname = "./mm/imgs/"+_d.getFullYear()+"-"+(_d.getMonth()+1)+"-"+_d.getDate()+"-"+filename+suffx;
      //拉取远程图片到本地
      request(nowelem.ahref[e]).pipe(fs.createWriteStream(overname))
      //替换src
      _c = _c.replace(n,overname)
      _c = _c.replace(nowelem.ahref[e],overname);
    });
    return c;
  }

  //开始循环，存储变量
  data.forEach(function(elem,index){
    var _content = elem.content
    if (elem["imgs"].imgsrc[0]) {
      //这里返回的是已经替换过的内容
      _content = getImg(elem["imgs"],content);
    }
    //替换下一行的空格，爬取下来有缩进会被MD误认为代码
    _content = _content.replace(/^\s+/,"");

    /* hexo 文章格式为
    * title: xxxx
    * date: xxxx-xx-xx xx:xx:xx
    * tags:
    *   - tag
    * 注意，title和date冒号后必须有空格
    */
    var content = "title: "+elem.title+"\ndata: 2016-10-14 22:58:38\ntags:\n---\r\n"+_content+"\n\n\n\n"+JSON.stringify(elem.imgs)
    //创建文件
    fs.writeFile("./mm/"+index+"ver.md",content);
  })
}
