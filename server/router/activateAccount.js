const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const jwt = require('jsonwebtoken');
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

// Account Activation
router.get('/api/users/activateAccount/:token:token', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/activateAccount.html"))
})

router.post('/api/users/activateAccount', function( req , res){

    var user  = User(req.body);

    var token = user.token;
    setTimeout(function(){

        // token이 존재한다면 
        if( token ){
            console.log("token exist")

            // link를 타고 들어오면 그 token을 verify 하고 이용하게 한다
            jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
                if(err){
                    // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
                    console.log("Incorrect or Expired Link");
                    return res.status(400).json( { error: "Incorrect or Expired Link" });
             }

            const { k_name, e_name , email, password ,  username, role } = decodedToken;
                // 해당 이메일이 DB에 있는 확인하기
                User.findOne({ email}).exec( ( err , user ) => {
                    if(user){
                        console.log("user with this email already exist")
                        return res.status(400).json( { 'result' : "User with this email already exist"});
                    }

                    let newUser = new User( { k_name, e_name , email , password ,  username , role});

                    newUser.save( ( err, success) => {
                            if(err){
                                console.log("Error in signup while account activation", err);
    
                                return res.status(400).json({ 'result' : "Error activating Account"});
                            }

                            var reigster_who = role==='1'?'profileUser':'profileDancer'

                            console.log("Signup Success . Your info is saved")
                            
                            return res.status(200).json({
                                message : "Signup success", "success" : "true",'register_who':reigster_who
                            })
                    }) // newUser.save
                })
            }) // jwt.verify 

        }else{
            // token 이 없다면 
            console.log("No token exist")
            return res.status(200).json({ 'result' : 'Something went wrong'})
            }
        }, 1000)

    }) // app.post('/api/users/activateAccount 끝

    module.exports = router;