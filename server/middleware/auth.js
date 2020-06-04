const { User } = require('../models/User');
// auth 관련 router 들은 매우 많이 필요하다. 그러므로, 따로 auth.js 를 빼놓는 것이 중요하다

let auth = (req, res, next) => {

    // 인증 처리를 하는 곳
    // 1. client에서 쿠키에서 토큰을 가져오기
    // 저번에 cookie를 넣을 때, x_auth 라는 이름으로 넣었었다
    // token을 x_auth에서 가져오는 것이다 
    let token = req.cookies.x_auth;

    // 2. 가져온 토큰을 Decode 한다 . 이후 유저를 찾는다. 토큰을 찾는 method는 User.js 에서 만든다
    // 아래 findByToken은 user model에서 만들어야 한다
    User.findByToken( token , ( err , user ) => {
        if(err) throw err;
        // user 가 없다면 클라이언트에 다음과 같은 메시지를 send 한다  
        if(!user) return res.json({ isAuth : false, error : true })
        // user 가 있다면
        req.token = token;
        req.user = user;
        next();
    })

    // 3. 토큰을 복호화 한 후 유저를 찾는다

    // 4.유저가 있으면 인증 Okay

    // 5.유저가 없으면 인증 No
}

// 이 auth를 다른 파일에서도 쓸 수 있게 export해준다 
module.exports = { auth };