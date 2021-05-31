const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const { Dancer } = require('../models/Dancer')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );
const jwt = require('jsonwebtoken');
// mailgun, email account acivation
const _ = require('lodash'); 
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox7de21197a67843cba3b19ca2e899ec14.mailgun.org';
const mg = mailgun({ apiKey: "07424c709ace08ce574c0895c854437e-913a5827-c6a0af4b", domain: DOMAIN });

// 로그인 기능 : login
router.get('/api/users/login', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/login.html"))
})

router.get('/bg.js ', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/bg.js"))
})

router.post('/api/users/login', function(req,res){
        // 1. 요청된 email을 데이터베이스에서 있는지 찾는다 
            User.findOne( { email : req.body.email }, ( err , user ) => {
                // 만일 우리가 요청한 email이 db 에 없다면, user는 Null 값이 될 것이다
                if(!user){
                    console.log("no email")
                    return res.status(200).json({
                        loginSuccess : false ,
                        message : "Noemail"
                    })
                }
                // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
                // 아래 user 에는 각종 이메일 , 비밀번호 등이 모두 있을 것이다
                user.comparePassword( req.body.password , ( err , isMatch ) => {
                    // 2번째 argument는 callback function이다
                    // db안에 들어있는 비밀번호를 비교한다 . 만약 맞다면, 비밀번호가 맞다는 것을 isMatch로 가져온다 
                    // method는 user model에서 만든다 
                    if(!isMatch){
                        console.log("no password")
                        return res.status(200).json({ 
                            loginSuccess : false , 
                            message : "NoPassword"
                        })
                    }
                    // 비밀번호까지 맞다면 토큰을 생성하기
                    // generateToken이라는 method는 User.js 에 넣는다
                    user.generateToken( (err, user) => {
                        if(err) {
                            console.log("Token not made")
                            return res.status(400).send(err);
                        }              
                        return res.cookie("x_auth" , user.token).status(200).json( { 
                            loginSuccess : true , 
                            email:user.email,
                            userId : user._id ,
                            message : "success"
        
                        })
                        })
                    }) 
                })// User.findOneAndUpdate
            })

    // 6. 인증 Auth
    // 가운데 인자 auth는 User.js 에서 가져온다
    router.get('/api/users/auth' , auth , ( req , res) => {
        // endpoint에 와서, 3번째 인자로 준 콜백함수를 실행하기 전에, auth , 즉, middleware 에서 무언가를 실행하는 것이다
        // 여기까지 왔다는 것은 미들웨어를 통과해 왔다는 얘기이고, 그말은 Authentication이 True 라는 말이다 
        // 즉, 이제는 3번째 cb 함수로 넘어갈 수 있다는 것이다 
        res.status(200).json({
            // middleware에서 req에 token, user 를 넣었기에 아래와 같은 코드를 사용할 수 있다
            _id : req.user._id ,
            // 이 user 가 admin user 인지 아닌지
            // role : 0일반 유저, 0이 아니면, 관리자 
            isAdmin : req.user.role === 0 ? false : true ,
            isAuth : true ,
            email : req.user.email ,
            name : req.user.name ,
            role : req.user.role ,
            image : req.user.image
        })
        // 이렇게 정보를 전달해주면, 어떤 페이지에서든지 그 정보를 사용할 수 있다 
    })

    
// 로그아웃
router.get('/api/users/logout' , auth , ( req , res ) => {

    console.log("logout start")
    let token = req.cookies.x_auth;
    console.log("token brought")

    jwt.verify(token, "accountactivatekey123", function( err, decodedToken){

        if(err){
            // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
            console.log("Incorrect or Expired Link");
            return res.status(200).json( { "result" : "LinkError" });
        }
    
            User.findOneAndUpdate( { token },
                // 여기서는 token을 지워준다
                {$set:{token:''}}
                , ( err, user) => {
                    if(err){
                        console.log("token related error")
                        return res.json({ success : false , err});
                    } 
                    //쿠키지우기
                    res.clearCookie("x_auth")

                    console.log("cookie deleted")

                    res.redirect('/')
                    
                })
             });
});


// 비밀번호 찾기
router.get('/api/users/forgetPassword', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/forgetPassword.html"))
})

router.post('/api/users/forgetPassword', ( req , res ) => {
    // 사용자가 email을 입력하게 한다. 그 email 주소로 링크가 보내질 것이고, 그것을 클릭하면, 새로운 비밀번호로 바꾸는 과정

    // 아래는 client에서 보낸 email을 받기
    var user  = User(req.body);
    var email = user.email;

    console.log("forget Password proceeding");
    console.log(email);

    User.findOne( { email }, ( err, user) => {
        // 해당 이메일이 없는 경우에 대한 error handling
        if( err || !user){
            console.log("User with this email does not exist")
            return res.status(400).json( { error : "User with this email does not exists" , "result" : "User with this email does not exists" });
        }

        // email 보내기 , 위의 email account와 달리, token에는 그저 id 만 넣는다. 왜냐하면 난(위에) email도 있고  user 도 있으니까
        const token = jwt.sign({ _id: user._id}, "accountactivatekey123", { expiresIn :"20m" } );
        console.log("token made")
        const data = {
            from: 'danceprojectmb@naver.com',
            to: email,
            subject: 'Reset Password Link',
            html : `
                <h2>Please click on given link to reset your password</h2>
                <a href = "http://localhost:4000/api/users/resetPassword/${token}">http://localhost:4000/api/users/resetPassword/${token}</a>
            `
        };

        // Just logic( I can have my own if I want) : while we send email we need to fill resetLink property with certain value.
        // we need to check. whether this property is filled with certain value or not

        // resetLink from userModel
        return user.updateOne({ resetLink : token} , function( err, success){
            if(err){
                console.log("reset link error")
                return res.status(400).json( { error : 'reset password link error' , 'result' : 'reset password link error, contact Us'});
            }else{
                // send email 
                mg.messages().send(data, function (error, body) {
                    if(error){

                        console.log("mail send process not working");
                        return res.status(400).json({
                            error : error.message
                        })
                    }
                    console.log("email send success")
                    return res.status(200).json({message : 'Email has been Sent, kindly follow the instructions', 'success': 'true'});
    /* 만약 성공하면, email로 link가 보내질 거고, user는 그 link를 클릭하면, 비밀번호를 바꾸는 페이지로 이동할 것이다
    client side에서는 다른 route 가 있을 것이고
    그 route에서 비밀번호 변경을 수행할 것이다 
    만약 user가 그 해당 페이지에서 새로운 password를 입력하고 button을 클릭하게 되면 
    해당 token이, user가 타고 들어온 token이 matches the same user with property "resetLink"일 것이다
    즉, 이 방법을 통해 we can actually verify if this same user is trying to actually reset this password
    */ 
                });
            }
        });
    })
})

// resetPAssword Route : 비밀번호 reset
router.get('/api/users/resetPassword/:token', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/resetPassword.html"))
})

router.post('/api/users/resetPassword/:token', function( req , res){
    // resetLink(token)과 새로 입력한 password 받기 
    const { resetLink, newPass } = req.body;
    // 만약 link가 존재한다면

if( resetLink ){
    // 현재 resetLink는 token이고, 우리는 이 token을 decode 할 것이다
    // 우리는 forgotPassword에서 token을 만들 때 id를 사용해서 token을 만들었기 때문에, 이를 decode 하면 우리는 다시 id를 얻게 될 것이다 

    jwt.verify( resetLink , "accountactivatekey123" , function( error, decodedData ){

        // 우리는 expire의 기한을 20m으로 주었다. if we get the same link and passed after 20m, even if we send it to reset password with new password , then it's gonna send an error that token has already been expired
        if(error){
            console.log("Incorrect token or it is expired")
            return res.status(401).json({
                error: "Incorrect token or it is expired", "result":"Incorrect token or it is expired"
            })
        }
        // error가 없다면 find and user which user we should allow who can change his password

        // token that we send to an email should match this token and this is how we are going to check which user should need to reset 
        User.findOne( { resetLink } , ( error, user ) => {
            // we've got user who has to reset his password
            // error : user exist but user with same token does not exist
            if( error || !user){
                console.log("User with this token does not exist")
                alert("Token Expired, Retry please")
                setTimeout(() => {
                    return res.status(400).json( { error : "User with this token does not exist", "result": "User with this token does not exist"});
                }, 2000);
            }
            // no error : update a password with new password
            // create an object which includes password field which we can pass a new password
            // 참고: lodash library를 활용 : array 뿐만 아니라, object, collection 등을 다룰 때 간편하게 해주기
            const obj = {
                password : newPass
            }
            // update object in DB, when we pass any kind of properties
            // by below code, new password is going to be updatd within this user
            user = _.extend(user, obj )
            // update 이후 save it into DB
            user.save( ( error, result) => {
                if(error){
                    console.log("reset password error");
                    return res.status(400).json({
                        error: "reset password error", 'result' : 'reset password error'
                    })
                } else{
                        console.log("Your password has been changed")
                        return res.status(200).json({ message : "Your password has been changed", 'success': 'true'})
                    }
                })
            })
        }); // jwt verify
    }else{
        // link가 존재하지 않는다면 에러를 보낸다. ex. client-side haven't sent any kind of token or reset from the URL that we sent
            console.log("Authentication Error")
            return res.status(401).json( { error : "Authentication Error", 'result' : 'Authentication Error' });
    }
})

    module.exports = router;