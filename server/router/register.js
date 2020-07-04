const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const { Dancer } = require('../models/Dancer')
const jwt = require('jsonwebtoken');
// mailgun, email account acivation
const _ = require('lodash'); 
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox7de21197a67843cba3b19ca2e899ec14.mailgun.org';
const mg = mailgun({ apiKey: "07424c709ace08ce574c0895c854437e-913a5827-c6a0af4b", domain: DOMAIN });


//  회원가입 Route
router.get('/api/users/register', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/register.html"))
})

router.post('/api/users/register', function( req , res ){

    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면, 그것들을 DB에 넣어준다
    const { k_name, e_name , email, password , username } = req.body;

        console.log("User registration process ongoing")

            User.findOne( { email }).exec( ( err, user ) => {
            // email이나 username이 db에 이미 있으면, user가 true 가 될 것이다
            if(user){
                console.log("User with this email already exists");
                return res.status(200).json( {
                    error : "User with this email already exists", "success" : "emailexists"
                });
            }
                User.findOne( { username }).exec( ( err, user ) => {
                    // email이나 username이 db에 이미 있으면, user가 true 가 될 것이다
                    if(user){
                        console.log("User with this username already exists");
                        return res.status(200).json( {
                            error : "User with this username already exists", "success" : "usernameexists"
                        });
                    }

                    // create Token using data sent from user : 즉, 접속이메일로 링크가 보내지고, 그 순간 token이 만들어지는데, 이 token을 통해, user가 자기 이메일에서 링크로 이동하게 되면, 그 링크를 통해 들어온 token을 verify해서, 회원가입을 시키는 원리
                    const token = jwt.sign({ k_name, e_name , email, password , username}, "accountactivatekey123", { expiresIn : "30m"})
                    console.log(token)
                    const data = {
                        from: "danceprojectmb@naver.com" ,
                        to : email,
                        subject : "Account Activation Link",
                        html : `
                            <h2>Please click on given link to acivate your account: Please complete your registration process in 30 minutes</h2>
                            <a href = "http://localhost:4000/api/users/activateAccount/${token}">http://localhost:4000/api/users/activateAccount/${token}</a>
                        `
                    };
                    mg.messages().send(data, function (error, body) {
                        if(error){
                            console.log("Err : " , error.message);
                            return res.status(400).json({
                                error : error.message,
                                "success":"message error"
                            })
                        }
                    
                        return res.status(200).json({message : 'Email has been Sent, kindly activate your account' , "success" : "true"})
                        }); // mg.messages.send
                    }) // username find
                });// email find
            
        });



    module.exports = router;