const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const { Dancer } = require('../models/Dancer')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

// 로그인 기능 : login
router.get('/api/users/login', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/login.html"))
})

router.get('/bg.js ', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/bg.js"))
})

router.post('/api/users/login', function(req,res){
    const { role } = req.body
    console.log("0th process: role is being checked ")
    console.log( `login process : role is ${role}`)
    // user 일 경우 
    if( role === 1){
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
                        // 토큰을 저장한다. 이번에는 쿠키에 저장한다 . x_auth 라는 이름으로
                        console.log("Login Success")
                        console.log('login token',user.token)
                        return res.cookie("x_auth" , user.token).status(200).json( { 
                            loginSuccess : true , 
                            userId : user._id ,
                            message : "success"
                            })
                        })
                    }) 
                })// User.findOneAndUpdate
            }else{
                //dancer 일 경우 

                // 1. 요청된 email을 데이터베이스에서 있는지 찾는다 
                    console.log("1st process : Email Check in DB is ongoing")
                    Dancer.findOne( { email : req.body.email }, ( err , dancer ) => {
                        // 만일 우리가 요청한 email이 db 에 없다면, dancer는 Null 값이 될 것이다
                        // dancer 라는 객체를 생성한다 
                        if(!dancer){

                            console.log("no email")

                            return res.status(200).json({
                                loginSuccess : false ,
                                message : "Noemail"
                            })
                        }

                        // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
                        // 아래 dancer 에는 각종 이메일 , 비밀번호 등이 모두 있을 것이다
                        console.log("2nd process : Password check is ongoing")
                        dancer.comparePassword( req.body.password , ( err , isMatch ) => {
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

                            // 3.비밀번호까지 맞다면 토큰을 생성하기
                            // generateToken이라는 method는 User.js 에 넣는다
                            console.log("3rd process : Token is being genrerated")
                            dancer.generateToken( (err, Dancer) => {
                                
                                // 성공시 user 라는 객체에 token을 넣어준다 ( generatetoken 함수 참고)

                                if(err) {
                                    console.log("Token not made")
                                    return res.status(400).send(err);
                                }

                                // 토큰을 저장한다. 이번에는 쿠키에 저장한다 . x_auth 라는 이름으로
                                console.log("Login Success")
                                console.log('login token',Dancer.token)
                                return res.cookie("x_auth" , Dancer.token).status(200).json( { 
                                    loginSuccess : true , 
                                    userId : Dancer._id ,
                                    message : "success"
                                    })
                                })
                            }) 
                        })// User.findOneAndUpdate

             }
         }) // login router 마무리 

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

    module.exports = router;