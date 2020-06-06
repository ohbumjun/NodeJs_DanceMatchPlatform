const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

// 비밀번호 찾기
router.get('/api/users/forgetPassword', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/forgetPassword.html"))
})

router.post('/api/users/forgetPassword', ( req , res ) => {
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

module.exports = router;