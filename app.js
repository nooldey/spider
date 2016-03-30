//引入库
var express = require('express');
var app = express();

/*****核心功能代码部分****/

/* 第一个最简单的例子--express+输出"hello world" */
app.get('/',function(req,res){
    res.send('Hello World');
});

// /******本地测试基础设置（必须）******/
// //设置本地监听端口
// app.listen(3300,function(){
//     console.log('app is listening at port 3300');
// });
