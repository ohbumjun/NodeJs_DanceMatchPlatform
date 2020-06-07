const express = require('express');
const router = express.Router();
const path = require('path');
const { Dancer }   = require('../models/Dancer');
const config = require( '../config/key' );
var mongoose = require('mongoose')

mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected.. in Profile.js ")).catch( err => console.log( err ))

var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

// profileDancer
router.get('/api/users/profileDancer', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/profileDancer.html"))
})

router.post('/api/users/profileDancer', function( req , res){

connection.db.collection("dancers", function(err, collection){

    if(err){
        console.log("Dancer Collection connection Error");
    }

    const { genre,
        Lesson_Purpose,
        Lesson_Type,
        Lesson_Day,
        Lesson_Time,
        Age,
        Sex,
        Workplace,
        Youtube_Link,
        Contact } = req.body;

    setTimeout(function(){
        let newDancer =  new Dancer( 
            { 
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
                if(err){
                    console.log("Error in saving Dancer Profile", err);
                    return res.status(400).json({ 'result' : "Error saving Dancer"});
                }
                console.log("Dancer Profile Input Success")
                return res.status(200).json({
                    message : "Signup success", "success" : "true",'register_who':reigster_who
                })
            }) // newUser.save
        }, 500)// setTime. out
    })// dancer collection 접근
})

// profileUser
router.get('/api/users/profileUser', function( req , res){
res.sendFile(path.join(__dirname + "/../../client/static/templates/profileUser.html"))
});

module.exports = router;