const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const cookieParser = require( 'cookie-parser' );
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const config = require( '../config/key' )
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

// 9. profileDancer
router.get('/api/users/profile/:role', function( req , res){
    //Register 입력시 이메일,pw 등등 정보 토큰
    res.sendFile(path.join(__dirname + "/../../client/static/templates/profileDancer.html"))
})

// 9. profileUser
router.get('/api/users/profileUser', function( req , res){

res.sendFile(path.join(__dirname + "/../../client/static/templates/profileUser.html"))
});


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
    console.log(data[0])
    res.render('mypage',data[0])
    })   
});

});

module.exports = router;

