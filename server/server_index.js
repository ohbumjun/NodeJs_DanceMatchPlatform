var express = require('express')
var app = express();
var bodyParser = require('body-parser')
const config = require( './config/key' );
const port = 4000
const { auth } = require( './middleware/auth' );
// 비밀번호 설정을 위한 코드. key.js 에서 가져온다
var mongoose = require('mongoose')
const cookieParser = require( 'cookie-parser' );
const path = require('path');
const cors = require('cors');
require('dotenv').config();
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

// 2) Router 들 
// root, main, 검색
const root = require('./router/base.js');
app.use( root )

// register route
const register = require('./router/register.js');
app.use( register)

// activeAccount
const activeAccount = require('./router/activateAccount.js');
app.use( activeAccount)

// Login route
const login = require('./router/login.js');
app.use( login)

// Logout route
const logout = require('./router/logout.js');
app.use( logout )

// Password Find route
const forget = require('./router/forgetPassword.js');
app.use( forget )

// 비밀번호 reset Route
const reset = require('./router/resetPassword.js');
app.use( reset )

// Profile Dancer, User Route
const profile = require('./router/profile.js');
app.use( profile )

const board = require('./router/board.js')
app.use(board)