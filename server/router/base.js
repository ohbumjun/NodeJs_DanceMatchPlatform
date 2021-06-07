const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')

const mongoose = require('mongoose')
const config = require( '../config/key' )
// 1) DB 접속
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected... in base.js")).catch( err => console.log( err ))

var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

// root 주소 Route
router.get('/',function(req,res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/index.html"))
    })

// main
router.get('/main',function(req,res){
    //req.cook
    console.log(req.cookies)
    var login = Object.keys(req.cookies).includes('x_auth')?true:false
    res.render('base',{login:login})
})

// 검색
router.post('/ajax_send_test',function(req,res)
{   //req parsing
    var genre=req.body.genre;
    var place=req.body.place;
    var datas;
    console.log(req.body)
    //mongodb query
    connection.db.collection("dancer", function(err, collection){
        collection.find(req.body).toArray(function(err, data){
         //검색 개수 보여주기
        var result = 'ok'
        var numdata=data.length;
        var respondData={'result':result,'data':data,'numdata':`${numdata} Results`}
        res.json(respondData)
        })   
    });
})

module.exports = router;