const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const { Dancer } = require('../models/Dancer')
const cookieParser = require( 'cookie-parser' );
const jwt = require('jsonwebtoken');
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );
const config = require( '../config/key' );

// 로그아웃
router.get('/api/users/logout' , auth , ( req,res ) => {
    let token = req.cookies.x_auth;
    console.log("token brought")

    // token에서 role을 빼내서, user인지, dancer 인지를 파악한다
    jwt.verify(token, "accountactivatekey123", function( err, decodedToken){

        if(err){
            // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
            console.log("Incorrect or Expired Link");
            return res.status(200).json( { "result" : "LinkError" });
        }
        const { role } = decodedToken;

        console.log( ` role is ${role} `)
    
        if( role === 1){
    
            User.findOneAndUpdate( { token },
                // 여기서는 token을 지워준다
                {$set:{token:''}}
                , ( err, user) => {
                    if(err){
                        console.log("token related error")
                        return res.json({ success : false , err});
                    } 
                    //쿠키지우기
                    res.clearCookie("x_auth")

                    console.log("cookie deleted")

                    res.redirect('/main')
                    // res.status(200).json({
                    //     success: true
                    // })
                })
            }else{
                // : req.token
                Dancer.findOneAndUpdate( { _id : req.dancer._id },
                    // 여기서는 token을 지워준다
                    {$set:{token:''}}
                    , ( err, dancer) => {
                        if(err){
                            console.log("token related error")
                            return res.json({ success : false , err});
                        }
                        //쿠키지우기
                        res.clearCookie("x_auth")
                        console.log("cookie deleted")
                        res.redirect('/main')
                        // res.status(200).json({
                        //     success: true
                        // })
                        })
                    }
             })
        })


module.exports = router;