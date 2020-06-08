const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require( '../middleware/auth' );

// 로그아웃
router.get('/api/users/logout' , auth , ( req,res ) => {
    console.log('req.token',req.token)
    // User 모델을 가져와서, user를 찾아서 그 data를 update 시켜준다
    User.findOneAndUpdate( { token : req.token},
        // 여기서는 token을 지워준다
        {$set:{token:''}}
        , ( err, user) => {
            if(err) return res.json({ success : false , err});
            //쿠키지우기
            res.clearCookie("x_auth")
            res.redirect('/main')
            // res.status(200).json({
            //     success: true
            // })
        })
    })

module.exports = router;