const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

// 비밀번호 reset
router.get('/api/users/resetPassword/:token', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/resetPassword.html"))
})

router.post('/api/users/resetPassword/:token', function( req , res){
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

module.exports = router;