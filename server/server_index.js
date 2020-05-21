var express = require('express')
var path = require('path');
var app = express()
var bodyParser = require('body-parser')
const port = 4000
// 비밀번호 설정을 위한 코드. key.js 에서 가져온다
const config = require('./config/key');
const cookieParser = require('cookie-parser')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require('./middleware/auth');

// css, js 파일들 적용
app.use(express.static(__dirname + '/../client/static/'))
// bodyParser: client가 보낸 정보를 Server가 받게 한다
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// app 실행하기. 4000 port를 listen 하게 되면, 뒤의 내용을 출력하기
app.listen(port , () => console.log(`Example app Listening on port ${port}!`))

// Mongoose를 이용해서, 우리 어플리케이션과 MongoDB 연결하기. 한동 너꺼는 너가 user, pw 만들어서 연결하삼
const mongoose = require('mongoose')

mongoose.connect( config.mongoURI , {
    useNewUrlParser : true,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected... ")).catch( err => console.log( err ))

// 1. root 주소 Route
app.get('/',function(req,res){
res.sendFile(path.join(__dirname + "/../client/static/templates/index.html"))
})

//login 후 mainpage
app.get('/main',function(req,res){
    res.sendFile(path.join(__dirname + "/../client/static/templates/base.html"))
    })

// 2. 검색 Route
app.post('/api/users/searchby',function(req,res){
res.json(req.body)
})

// 3. 회원가입 Route
// user 를 가져온다
const { User } = require('./models/User')
app.post('/api/users/register', ( req , res) => {
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면, 그것들을 DB에 넣어준다
    const user = new User(req.body)
    /* body 에는 json 형태로 
     {
         id : "hello"
         pw : "123"
     } 이렇게 들어있고, 이와 같이 client에서 넘어온 정보를 req.body에 보내주는 역할이 바로 위에서 작성한 bodyParser 라는 코드이다 */
    user.save( ( err , userInfo ) => {
        // err 가 있을 경우, json 형식으로 성공못했다 라고 띄우기
        console.log("hello")
        if(err) return res.json( { success : false } )
        // 성공시
        return res.status(200).json( { success : true })
    })
})

// 4. 로그인 기능 : login
app.post('/api/users/login', ( req , res ) =>{
    
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다 
    User.findOneAndUpdate( { email : req.body.email }, ( err , user ) => {
        // 만일 우리가 요청한 email이 db 에 없다면, user는 Null 값이 될 것이다
        if(!user){
            return res.json({
                loginSuccess : false ,
                message : "제공된 이메일에 해당하는 유저가 없습니다"
            })
        }
    })

    // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    // 아래 user 에는 각종 이메일 , 비밀번호 등이 모두 있을 것이다
    user.comparePassword( req.body.password , ( err , isMatch) => {

        // 2번째 argument는 callback function이다
        // db안에 들어있는 비밀번호를 비교한다 . 만약 맞다면, 비밀번호가 맞다는 것을 isMatch로 가져온다 
        // method는 user model에서 만든다 
        if(!isMatch){
            return res.json({ loginSuccess : false , message : "비밀번호가 틀렸습니다"})
        }

        // 비밀번호까지 맞다면 토큰을 생성하기
        // generateToken이라는 method는 User.js 에 넣는다
        user.generateToken( (err, user) => {
            if(err) return res.status(400).send(err);
            // 토큰을 저장한다. 이번에는 쿠키에 저장한다 
            res.cookie("x_auth" , user.token).status(200).json( { loginSuccess : true , userId : user._id })
            })
        })
    })

    // 4. 인증 Auth
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

    // 5. 로그아웃
    app.get('/api/users/logout' , auth , ( res , req ) => {
        // User 모델을 가져와서, user를 찾아서 그 data를 update 시켜준다
        User.findOneByUpdate( { _id : req.user._id},
            // 여기서는 token을 지워준다
            { token : ""})
            , ( err, user) => {
                if(err) return res.json({ success : false , err});
                return res.status(200).send({
                    success: true
                })
            }
    })