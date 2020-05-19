var express = require('express')
var path = require('path');
var app = express()
var bodyParser = require('body-parser')
const port = 4000
// 비밀번호 설정을 위한 코드. key.js 에서 가져온다
const config = require('./config/key');

// css, js 파일들 적용
app.use(express.static(__dirname + '/../client/static'))
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
res.sendFile(path.join(__dirname + "/../client/templates/base.html"))
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
        if(err) return res.json( { success : false } )

        // 성공시
        return res.status(200).json( { success : true })
    })


})

