const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const { Dancer } = require('../models/Dancer')
const jwt = require('jsonwebtoken');
const cookieParser = require( 'cookie-parser' );

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳
    // 1. client에서 쿠키에서 토큰을 가져오기
    // 저번에 cookie를 넣을 때, x_auth 라는 이름으로 넣었었다
    // token을 x_auth에서 가져오는 것이다 
    let token = req.cookies.x_auth;

    // token을 decode 시켜서, role이 user인지 dancer 인지를 파악한다
    jwt.verify(token, "accountactivatekey123", function( err, decodedToken){
        
        if(err){
            // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다 
            console.log("Incorrect or Expired Link");

            return res.status(200).json( { "result" : "LinkError" });
     }

        // 2. 가져온 토큰을 Decode 한다 . 이후 유저를 찾는다. 토큰을 찾는 method는 User.js, Dancer.js 에서 만든다
        // 아래 findByToken은 user 혹은 dancer model에서 만들어야 한다
        User.findByToken( token , ( err , user ) => {
            if(err) throw err;
            // user 가 없다면 클라이언트에 다음과 같은 메시지를 send 한다  
            if(!user) return res.json({ isAuth : false, error : true })
            // user 가 있다면
            req.token = token;
            req.user = user;
            console.log('auth user id',req.user._id)
            next();
            })
        })
    }

module.exports = { auth };