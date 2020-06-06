const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')

//  회원가입 Route
router.get('/api/users/register', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/register.html"))
})

router.post('/api/users/register', function( req , res ){
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면, 그것들을 DB에 넣어준다
    const { k_name, e_name , email, password ,  username, role } = req.body;
    // email account activaiton
    setTimeout( function(){
        User.findOne( { email, username }).exec( ( err, user ) => {
            // 만약 DB에 우리가 찾는 email 혹은 username 이 있다면, user가 True가 될 것이다 
        if(user){
            console.log("User with this email or username already exists")
            return res.status(200).json( {
                error : "User with this email already exists", "success" : "emailexists"
            });
        }
        let newUser = new User( { k_name, e_name , email, password ,  username, role});

        newUser.save( ( err, success) => {
            newUser.save( ( err, success ) => {
                if(err){
                    console.log("Error in signup while saving user info", err);
                    return res.status(400).json({ 'result' : "Error in signup while saving user info", "success" : "Error in signup while saving user info"});
                }
                return res.status(200).json({message : 'Your Regsitration is Complete' , "success" : "true"})
                    })
                })
            })
        },300); // setTimeout
    });

    module.exports = router;