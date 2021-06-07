const express = require('express');
const router = express.Router();
const path = require('path');
const { Dancer }   = require('../models/Dancer');
const { User }   = require('../models/User');
const config = require( '../config/key' );
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream')
const crypto=require('crypto')


// 1) DB 접속
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => {
console.log("MongoDB Connected...in profile.js ")}).catch( err => console.log( err ))


let gfs;
var connection = mongoose.connection;
connection.once('open',function(){
    gfs = Grid(connection.db,mongoose.mongo)
    gfs.collection('users')
})


var storage = new GridFsStorage({
    url: config.mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'users'
          };
          resolve(fileInfo);
        });
      });
    }
  });

const upload = multer({ storage });


// profileUser
router.get('/api/users/profileUser', function( req , res){

res.sendFile(path.join(__dirname + "/../../client/static/templates/profileUser.html"))
});

router.post('/api/users/profileUser',function(req,res){
    //x_auth 설정해주면서 main 창에서 로그인으로 인식됨

    var token = req.cookies.x_auth;

    //token decoding
    jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
        if(err){
            // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
            console.log("Incorrect or Expired Link");
            return res.status(400).json( { error: "Incorrect or Expired Link" });
     }

    const { k_name, e_name , email, password ,  username } = decodedToken;

    console.log("User info retracted from cookie")

    var user_data = {'k_name':k_name,'e_name':e_name , 'email':email, 'password':password , 'username':username}
    var user_total = Object.assign({}, user_data, req.body);
    console.log(user_total)
    var user = new User(user_total);

    console.log(user)

    user.save(function (err) {
        if (err)
        {
            console.log(err)
            console.log("Error in saving Dancer Profile", err);
            return res.status(200).json({ 'result' : "Error saving User"});
        }

        user.generateToken( (err, user) => {
            if(err) {
                console.log("Token not made")
                return res.status(400).send(err);
            }
        //active accoutn token 은 expire되므로 token바꿔줘야됨
        res.cookie('x_auth',user.token)
        // saved!

        console.log("user info saved into DB")
        return res.status(200).json({
            message : "Signup success", "success" : "true"

        }) // res.status.json
      });
    })
})})




module.exports = router;





/*  

< 쓰지 않는 route > 

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
                    Gender,
                    Workplace,
                    Youtube_Link,
                    Contact } = req.body;

                console.log("new info brought from req.body")

                setTimeout(function(){
                    let newDancer =  new Dancer( 
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
                        Gender,
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

                                res.cookie("role" , newDancer.role).redirect('/main')

                                return res.status(200).json({

                                    message : "Signup success", "success" : "true"

                                }) // res.status.json

                            }) // newDancer.save

                        }, 500)// setTime. out

                    }); // token decode

                }) // dancer collection 접근

        })// router 닫기 

*/

