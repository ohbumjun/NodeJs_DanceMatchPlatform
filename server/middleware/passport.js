const { User } = require('../models/User');
app.use(session({ secret: 'session secret key' }))
app.use(passport.initialize());
app.use(passport.session());

// 이 passport를 다른 파일에서도 쓸 수 있게 export해준다 
module.exports = { passport };