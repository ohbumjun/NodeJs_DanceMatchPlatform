const mongoose = require("mongoose")

const DancerSchema = mongoose.Schema({
    name : {
        type : String ,
        maxlength : 50
    } ,
    email : {
        type : String,
        // trim : 이메일 안에서, 사용자가 작성한 공백을 제거해주기
        trim : true,
        // 똑같은 이메일은 쓰지 못하게 하기
        unique: 1
    } ,
    password : {
        type : String,
        //최소 8글자 이상 작성하기
        minlength : 8
    },
    // 0.관리자인지 1.일반유저 2.댄서 인지
    role : {
        // Number가 1이면 관리자, 0이면 일반 유저
        type : Number,
        // 임의로 지정해주지 않는다면, role은 0으로 주겠다. 일반유저로 지정해주겠다
        default : 0

    },
    token : {
        type : String
    },
    // token의 유효기간
    tokenExp : {
        type : Number
    }
})