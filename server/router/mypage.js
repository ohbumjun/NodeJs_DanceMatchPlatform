const express = require('express');
const router = express.Router();
const path = require('path');
const { dancer }   = require('../models/Dancer');
const { User }   = require('../models/User');
const config = require( '../config/key' );
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// 1) DB 접속
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected... ")).catch( err => console.log( err ))
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

// 1. User
router.post('/profile/update_user',function(req,res)
{

    var x_auth = req.cookies.x_auth
    //업데이트할 변수명
    var name = req.body.name
    //업데이트할 값
    var value = req.body.value
    console.log('name')
    //x-auth token으로 찾아서 update
    connection.db.collection("users", function(err, collection){
        collection.updateOne({'token':x_auth},{$set:{[name]:value}}, //변수명을 mongoose column 명으로 사용하고 싶을 때 [name]->e_name
        {upsert:true });
        if(err)
        {
            console.log(err)
            res.status(404)
        }
        var result='ok'
        var respondData={'result':result}
        res.json(respondData)
})
})


router.get('/api/users/mypage', function( req , res){

    var x_auth = req.cookies.x_auth
    console.log('x_auth',x_auth)

    connection.db.collection("users", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){
            //검색 개수 보여주기

            // data는 collection에서 user , 혹은 dancer 정보를 받아오는 것이고, 그것을 mypageDancer 라는 router 에다가 넘겨주는 것이다 
        console.log(data[0])
        res.render('mypage',data[0])
        })   
    });
});


// 2. Dancer
router.get('/api/users/mypageDancer', function( req , res){

    var x_auth = req.cookies.x_auth

    console.log('x_auth',x_auth)

    connection.db.collection("dancers", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){
            //검색 개수 보여주기
        console.log(data[0])
        res.render('mypageDancer',data[0])
        })   
    });
});

module.exports = router;