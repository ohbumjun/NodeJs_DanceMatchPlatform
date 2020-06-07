var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// Salt를 만들때 10자리 Salt 를 만들어서, 그 Salt를 이용해서 비밀번호를 암호화 할 것이다
const saltRounds = 10
// jsonwebtoken을 import 한다 
const jwt = require('jsonwebtoken');
const config = require( '../config/key' );

mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected... ")).catch( err => console.log( err ))

var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

var userSchema = mongoose.Schema({
    // user 의 name 은 무엇인지
    k_name : {
        type : String,
    },
    e_name : {
        type : String,
        // maxlength는 자기가 주고 싶은 만큼 주기
        minlength : 1,
        maxlength : 50,
        trim: true,
        required : true
    },
    email: {
        type : String,
        // 어떤 분이, john ahn@naver.com 이렇게 쳤고, john 다음에 들어간 빈칸을 사라지게 해준다
        trim : true,
        unique: 1,
        required: true
    },
    password : {
        type : String ,
        minlength : 7,
        required: true
    },
    username : {
        type : String,
        maxlength : 50,
        required : true,
        unique : 1
    },
    // 이렇게 role을 주는 이유는, 어떤 user 는 관리자가 될 수도 있고, 일반 user 가 될 수도 있다
    role : {
        // 예를 들어, number 가 1이면 일반 user 인 것이다, 0이면 dancer이다 
        type : Number,
    },
    image : String,

    // 아래와 같은 token을 이용해서, 유효성 같은 것들을 관리할 수 있다
    token : {
        type: String
    },

    // token의 유효기간 : token이 사용할 수 있는 기간
    tokenExp : {
        type: Number
    },

    // 비밀번호찾기위한 데이터
    resetLink : {
        data : String,
        default : ''
    }
})


// 아래 User 는 위 모델의 이름을 적어준다
var User = mongoose.model('User', userSchema)
module.exports = { User }
