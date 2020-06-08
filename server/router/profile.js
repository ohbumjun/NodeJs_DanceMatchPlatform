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

// 9. profileDancer
router.get('/api/users/profileDancer', function( req , res){
    
    //Register 입력시 이메일,pw 등등 정보 토큰
    res.sendFile(path.join(__dirname + "/../../client/static/templates/profileDancer.html"))

})

router.post('/api/users/profileDancer', function( req , res){

    console.log("Dancer Server is working");

    connection.db.collection("dancer", function(err, collection){

        console.log("Dancer collection connected");

        if(err){
            console.log("Dancer Collection connection Error");
        }

        var token = req.cookies.x_auth;

        console.log("token brought");

        //token decoding
        jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
            if(err){
                // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
                console.log("Incorrect or Expired Link");

                return res.status(200).json( { 'result' : "Incorrect or Expired Link" });
        }

            const { k_name, e_name , email, password ,  username, role } = decodedToken;
            
            console.log("existing info brought from cookie, token")
                    
                const { 
                    genre,
                    Lesson_Purpose,
                    Lesson_Type,
                    Lesson_Day,
                    Lesson_Time,
                    Age,
                    Sex,
                    Workplace,
                    Youtube_Link,
                    Contact } = req.body;

                console.log("new info brought from req.body")

                setTimeout(function(){
                    let newDancer =  new dancer( 
                        { 
                        k_name, 
                        e_name , 
                        email, 
                        password ,  
                        username, 
                        role,
                        genre,
                        Lesson_Purpose,
                        Lesson_Type,
                        Lesson_Day,
                        Lesson_Time,
                        Age,
                        Sex,
                        Workplace,
                        Youtube_Link,
                        Contact 
                    });

                    newDancer.save( ( err, success) => {

                            console.log("Dancer profile saving process ongoing");

                            if(err){

                                console.log("Error in saving Dancer Profile", err);
                                return res.status(200).json({ 'result' : "Error saving Dancer"});
                            }

                                console.log("Dancer Profile Input Success")

                                return res.status(200).json({

                                    message : "Signup success", "success" : "true"

                                }) // res.status.json

                            }) // newDancer.save

                        }, 500)// setTime. out

                    }); // token decode

                }) // dancer collection 접근

        })// router 닫기 

// profileUser
router.get('/api/users/profileUser', function( req , res){

res.sendFile(path.join(__dirname + "/../../client/static/templates/profileUser.html"))
});

router.post('/api/users/save_user_info',function(req,res){
    //x_auth 설정해주면서 main 창에서 로그인으로 인식됨

    var token = req.cookies.x_auth;

    //token decoding
    jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
        if(err){
            // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
            console.log("Incorrect or Expired Link");
            return res.status(400).json( { error: "Incorrect or Expired Link" });
     }

    const { k_name, e_name , email, password ,  username, role } = decodedToken;
        User.findOneAndUpdate({email: email}, {$set:req.body},(err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
    
        console.log('doc',doc);
    });

    
    })


    res.redirect('/main')

})


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

