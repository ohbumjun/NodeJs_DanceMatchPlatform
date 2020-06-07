const mongoose = require("mongoose")

const DancerSchema = mongoose.Schema({
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
    },

    // 전문장르
    genre : {
        type : String,
        default: ''
    } ,

    Lesson_Purpose : {
        type : String,
        default :''
    },
    Lesson_Type : {
        type : String,
        default :''
    },
    Lesson_Day : {
        type : String,
        default :''
    },
    Lesson_Time : {
        type : String,
        default :''
    },
    Lesson_Purpose : {
        type : String,
        default :''
    },
    Lesson_Purpose : {
        type : String,
        default :''
    }
})