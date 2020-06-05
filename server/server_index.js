var express = require('express')
var path = require('path');
var app = express();
var bodyParser = require('body-parser')
const port = 4000
const jwt = require('jsonwebtoken');
// 비밀번호 설정을 위한 코드. key.js 에서 가져온다
const mongoose = require('mongoose')
const cookieParser = require( 'cookie-parser' );
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( './middleware/auth' );
const cors = require('cors');
const config = require( './config/key' );
require('dotenv').config();
// mailgun, email account acivation
const _ = require('lodash'); 
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxbb6bc74926b942a59d3a57aa4ef125cb.mailgun.org';
const mg = mailgun({ apiKey: "dfdc195b79c8b6b34660247f60937e06-7fba8a4e-a6d4194a", domain: DOMAIN });
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'../client/views'))
// css, js 파일들 적용
app.use(express.static(__dirname +'/../client/static'))

// DB 연결코드
// bodyParser: client가 보낸 정보를 Server가 받게 한다
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())

// app 실행하기. 4000 port를 listen 하게 되면, 뒤의 내용을 출력하기
app.listen(port , () => console.log(`Example app Listening on port ${port}!`))

// ERR_EMPTY_RESPONSE 방지
app.use(function(req, res, next) {
    console.log('request', req.url, req.body, req.method);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
    if(req.method === 'OPTIONS') {
        res.end();
    }
    else {
        next();
    }
});


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

// 1. root 주소 Route
app.get('/',function(req,res){
res.sendFile(path.join(__dirname + "/../client/static/templates/index.html"))
})

//login 후 mainpage
// app.get('/main',function(req,res){
//     res.sendFile(path.join(__dirname + "/../client/static/templates/base.html"))
//     })
//ejs template 사용
app.get('/main',function(req,res){
    
    //req.cook
    console.log(req.cookies)
    var login = Object.keys(req.cookies).includes('x_auth')?true:false
    res.render('base',{login:login})
})
// 2. 검색 Route
app.post('/ajax_send_test',function(req,res)
{   //req parsing
    var genre=req.body.genre;
    var place=req.body.place;
    var datas;
    //mongodb query
    connection.db.collection("dancer", function(err, collection){
        collection.find({Place:place}).toArray(function(err, data){
        //검색 개수 보여주기
        var result = 'ok'
        var numdata=data.length;
        var respondData={'result':result,'data':data,'numdata':`${numdata} Results`}
        res.json(respondData)
        })   
    });
})
// 3. 회원가입 Route
const { User } = require('./models/User')
app.get('/api/users/register', function( req , res){
    res.sendFile(path.join(__dirname + "/../client/static/templates/register.html"))
})
app.post('/api/users/register', function( req , res ){
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면, 그것들을 DB에 넣어준다
    const { k_name, e_name , email, password ,  username, role } = req.body;
    
    // email account activaiton
    setTimeout( function(){
        User.findOne( { email }).exec( ( err, user ) => {
            
        if(user){
            console.log("User with this email already exists", "success")
            return res.status(200).json( {
                error : "User with this email already exists", "success" : "emailexists"
            });
        }
        // create Token using data sent from user : 즉, 접속이메일로 링크가 보내지고, 그 순간 token이 만들어지는데, 이 token을 통해, user가 자기 이메일에서 링크로 이동하게 되면, 그 링크를 통해 들어온 token을 verify해서, 회원가입을 시키는 원리
        const token = jwt.sign({ k_name, e_name , email, password , username, role }, "accountactivatekey123", { expiresIn : "20m"});
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
                console.log(error.message);
                return res.status(200).json({
                    error : error.message,
                    "success":"message error"
                })
            }
            console.log("last message")

                return res.status(200).json({message : 'Email has been Sent, kindly activate your account' , "success" : "true"})
                });
            })
        },500) // setTimeout
    });

    // 4. Account Activation
app.get('/api/users/activateAccount/:token:token', function( req , res){
    res.sendFile(path.join(__dirname + "/../client/static/templates/activateAccount.html"))
    
})

app.post('/api/users/activateAccount/:token', function( req , res){
    
    var user  = User(req.body);
    console.log("I'm not only one")
    
    console.log( user.token )
    
    var token = user.token;

    setTimeout(function(){
        // token이 존재한다면 
        if( token ){
            console.log("token exist")
            // link를 타고 들어오면 그 token을 verify 하고 이용하게 한다
            jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
                if(err){
                    // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
                    console.log("Incorrect or Expired Link");
                    return res.status(400).json( { error: "Incorrect or Expired Link" });
                }
    
            const { k_name, e_name , email, password ,  username, role } = decodedToken;

                // 해당 이메일이 DB에 있는 확인하기
                User.findOne({ email}).exec( ( err , user ) => {
                    if(user){
                        console.log("user with this email already exist")
    
                        return res.status(400).json( { 'result' : "User with this email already exist"});
                    }
                    let newUser = new User( { k_name, e_name , email, password ,  username, role});
                    newUser.save( ( err, success) => {
                        newUser.save( ( err, success ) => {
                            if(err){
                                console.log("Error in signup while account activation", err);
    
                                return res.status(400).json({ 'result' : "Error activating Account"});
                            }

                            console.log("Signup Success . Your info is saved")
                            return res.status(200).json({
                                message : "Signup success", "success" : "true"
                            })
                        })
                    }) // newUser.save
                })
            }) // jwt.verify 
        }else{
            // token 이 없다면 
    
            console.log("No token exist")
            return res.status(200).json({ 'result' : 'Something went wrong'})
            }

    }, 1000)
    }) // app.post('/api/users/activateAccount 끝

// 5. 로그인 기능 : login
app.get('/api/users/login', function( req , res){
    res.sendFile(path.join(__dirname + "/../client/static/templates/login.html"))
})

app.get('/bg.js ', function( req , res){
    res.sendFile(path.join(__dirname + "/../client/static/templates/bg.js"))
})

app.post('/api/users/login', function(req,res){
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
                    return res.cookie("x_auth" , user.token).status(200).json( { 
                        loginSuccess : true , 
                        userId : user._id ,
                        message : "success"
                            })
                        })
                    }) 
            })// User.findOneAndUpdate
    })

    // 6. 인증 Auth
    // 가운데 인자 auth는 User.js 에서 가져온다
    app.get('/api/users/auth' , auth , ( req , res) => {
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

    // 7. 로그아웃
    app.get('/api/users/logout' , auth , ( req,res ) => {
        console.log('logging out')
        // User 모델을 가져와서, user를 찾아서 그 data를 update 시켜준다
        User.findOneAndUpdate( { _id : req.user._id},
            // 여기서는 token을 지워준다
            { token : ""}
            , ( err, user) => {
                if(err) return res.json({ success : false , err});
                //쿠키지우기
                res.clearCookie("x_auth")
                res.redirect('/main')
                // res.status(200).json({
                //     success: true
                // })
            })
        })

    // 8. 비밀번호 찾기
    app.get('/api/users/forgetPassword', function( req , res){
        res.sendFile(path.join(__dirname + "/../client/static/templates/forgetPassword.html"))
    })

    app.post('/api/users/forgetPassword', ( req , res ) => {
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


    // 8. 비밀번호 reset
    app.get('/api/users/resetPassword/:token', function( req , res){
        res.sendFile(path.join(__dirname + "/../client/static/templates/resetPassword.html"))
    })

    app.post('/api/users/resetPassword/:token', function( req , res){

        
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
                    return res.status(400).json( { error : "User with this token does not exist", "result": "User with this token does not exist"});
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

    // 9. profileDancer
    app.get('/api/users/profileDancer', function( req , res){
        res.sendFile(path.join(__dirname + "/../client/static/templates/profileDancer.html"))
    })

     // 9. profileUser
     app.get('/api/users/profileUser', function( req , res){
        res.sendFile(path.join(__dirname + "/../client/static/templates/profileUser.html"))
    })