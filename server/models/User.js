const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

// Schema 생성하기
const userSchema = mongoose.Schema({
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

// 비밀번호 암호화 시키기
// 아래와 같이 index.js에서, 정보를 DB에 save ( user.save( ( err , doc) 하기 전에, 아래의 코드를 거쳐서 암호화를 거친 후에, 그 다음에 DB에 저장하는 원리이다 
userSchema.pre('save', function( next ){

    // this : userSchema 전체를 가리킨다
    var user = this
    
    // 우리는 비밀번호 혹은 사용자 정보등을 변경할 때가 있다. 아래와 같은 코드를 추가해주지 않으면, 비밀번호가 아니라 email을 변경해주더라도 , password 를 다시 암호화하는 과정을 거친다. password만 고치면 암호화하게 끔 조건을 주는 것이다.

    if( user.isModified('password')){
        // gensalt : salt를 생성한다 ( saltRounds 란 salt 가 몇글자인지를 나타내는 것이다 )
        // Salt를 이용해서 비밀번호를 암호화 한다
        bcrypt.genSalt( saltRounds , function( err , salt){
            if(err) return next(err);
    
            // bcrypt.hash의 첫번째 인자로는, 우리가 넣는 비밀번호가 들어가야 한다
            bcrypt.hash( user.password, salt , function ( err , hash ){
                // hash : 암호화된 비밀번호
                if(err) return next(err);
                user.password = hash;
    
            });
        })

    }

    next();
})

// 2번째로 나오는 User 란, 위에서 우리가 지정한 model의 이름을 말하는 것이다. 
var User = mongoose.model('User', userSchema )

// 위 모델을 따른 파일에서도 쓸 수 있게 export 해주기
module.exports = { User }