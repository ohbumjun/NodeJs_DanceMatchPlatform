const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// Salt를 만들때 10자리 Salt 를 만들어서, 그 Salt를 이용해서 비밀번호를 암호화 할 것이다
const saltRounds = 10
// jsonwebtoken을 import 한다 
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    // user 의 name 은 무엇인지
    k_name : {
        type : String,
        // maxlength는 자기가 주고 싶은 만큼 주기
        minlength : 2,
        maxlength : 50
    },
    e_name : {
        type : String,
        // maxlength는 자기가 주고 싶은 만큼 주기
        minlength : 3,
        maxlength : 50,
        trim: true,
        required : true
    },
    email: {
        type : String,
        // 어떤 분이, john ahn@naver.com 이렇게 쳤고, john 다음에 들어간 빈칸을 사라지게 해준다
        trim : true,
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
    }
})

userSchema.plugin(require('mongoose-beautiful-unique-validation'));


// user 가 입력한 영어이름은 대문자로 바꿔준다
userSchema.methods.uppercase = function(){
    this.e_name = this.e_name.toUppercase()
    return this.e_name;
}


// 아래와 같이 index.js 에서, 정보를 DB에 save ( user.save((err , doc) 를 하기 전에, 암호화를 거친다
// 아래를 거친 후에 위의 코드 user.save 가 실행되는 원리이다
userSchema.pre('save', function(next) {

    //여기서 this는, 위의 userSchema 전체를 가리킨다
    var user = this;

    // 그런데, 우리는 비밀번호 혹은 사용자 정보등을 변경할 때가 있다. 아래와 같은 if 조건을 추가해주지 않으면. 비밀번호가 아니라 email을 변경해주더라도 password를 다시 암호화하는 과정을 거친다. 그것을 원치 않기 때문에, 우리는 비밀번호를 수정할 때만, 비밀번호를 다시 암호화하는 과정을 거치게 하고 싶다
    if( user.isModified('password') ){
        // 비밀번호를 암호화 시킨다
        // genSalt : Salt를 만들기, saltRounds 가 필요함 
        // err가 나면 바로 user.save로 가서 정보를 저장한다
        bcrypt.genSalt(saltRounds, function( err, salt) {
            if(err) return next(err)
            // 만약 salt가 정상적으로 가져와지게 된다면, bcrypt.hash의 첫번째 argument로는 user.password를 넣는데, 이것은 암호화되지 않은 raw 비밀번호를 의미한다 . 2번째는 salt, 3번째는 call back function 을 넣는다. 여기서 hash란, 암호화된 비밀번호를 말한다
            bcrypt.hash( user.password, salt, function ( err, hash ) {
                if( err ) return next(err)
                // user.password를 hash로 교체해준다
                user.password = hash;
                // 완성이 됬으면. index.js 에 있는 user.save로 돌아간다 
                next();
            });
        });
    } // isModified 
    else{ // 비밀번호를 바꾸는 게 아니라, 다른 것을 바꿀 때는 그냥 next 로 가게 한다
        next();
    }


})

// 토큰 생성
userSchema.methods.generateToken = function(cb){

    var user = this;
    // jsonwebtoken을 이용해서 token 생성하기
    //jsonwebtoken이 담긴 jwt를 sign을 이용하여 합쳐주면 된다
    // 즉, user._id + 'secretToken' => token을 만들어주는 것이다. 그리고 나중에 token을 해석할 때, secretToken을 넣어주면, user._id가 나오게 된다. 즉, 이 사람이 누구인지를 알 수 있게 되는 것이다
    // 나중에 token을 해석할 때, secretToken을 넣어주면, user._id 가 나오는 것이다 ( 다른 말로 하면, token을 decode 하게 되면, user._id 가 나오게 되는 것이다 )
    var token = jwt.sign( user._id.toHexString() , 'secretToken')

    // 그리고 생성한 token을 userSchema의 token field에 넣어준다
    user.token = token

    // 비밀번호까지 맞다면 토큰을 생성하기
    user.save(function ( err, user ){
        if(err) return cb(err)
        // err 가 없다면, error는 없고, user 정보만 전달해준다
        cb( null, user)

    })
}

userSchema.methods.comparePassword = function(plainPassword , cb){

    var user = this;

    // plainPassword : 1234567 > 암호화된 비밀번호와 같은지 체크해야 하므로, 1234567을 암호화 한 이후에 서로 맞는지를 체크해야 한다
    // 첫번째 인자는 날것 그대로, 두번째 인자는 암호화된 password
    bcrypt.compare(plainPassword , this.password , function(err , isMatch){
        if(err) return cb(err)
        // err는 없고, 비밀번호는 같다
        cb(null, isMatch)

        // 여기에서의 return 값이 server_index.js에서 comparePassword 함수로 간다
    } )
}

// findByToken 함수를 만든다
userSchema.statics.findByToken = function( token , cb){

    var user = this;

    // 토큰을 복호화(decode) 하는 과정 
    jwt.verify( token , 'secretToken', function(err , decoded){
        // 여기서 decoded 가 바로 복호화된 토큰을 의미한다 . user._id 가 된다
        // 유저 아이디를 이용해서 유저를 찾은 다음에, 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인한다 

        // 찾는 방법은 id와 token으로 찾을 것이다
        user.findOne( { "_id" : decoded , "token" : token } , function( err , user){

            if(err) return cb(err)
            cb(null , user)

        } )

    } )
}

// 아래 User 는 위 모델의 이름을 적어준다
const User = mongoose.model('User', userSchema)
module.exports = { User }