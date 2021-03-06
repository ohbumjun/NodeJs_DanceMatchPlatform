const express = require("express");

const router = express.Router();
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { User } = require("../models/User");
const { Dancer } = require("../models/Dancer");
// auth 라는 middleware 을 가져온다 ( 인증처리 )
const { auth } = require("../middleware/auth");

// Account Activation
router.get("/api/users/activateAccount/:token", function (req, res) {
  res.sendFile(
    path.join(`${__dirname}/../../client/static/templates/activateAccount.html`)
  );
});

router.post("/api/users/activateAccount/:token", function (req, res) {
  const { token } = req.body;

  setTimeout(function () {
    // token이 존재한다면
    if (token) {
      console.log("token exist");
      // link를 타고 들어오면 그 token을 verify 하고 이용하게 한다
      jwt.verify(token, "accountactivatekey123", function (err, decodedToken) {
        if (err) {
          // 20분후에 다시 token이 사라지기 때문에, 이 경우 아래의 메시지가 뜰 것이다
          console.log("Incorrect or Expired Link");

          return res.status(200).json({ result: "LinkError" });
        }
        const {
          k_name,
          e_name,
          email,
          password,
          username,
          role,
        } = decodedToken;
        // 해당 이메일이 DB에 있는 확인하기
        console.log("Registration process of 'User' is going on");
        User.findOne({ email }).exec((err, user) => {
          const reigster_who = "profileUser";
          if (user) {
            console.log("User with this email already exist");
            return res.status(200).json({
              reigster_who,
              result: "User with this email already exist",
            });
          }
          // user 혹은 dancer profile창으로 redirect하기 위한 get parameter

          console.log("Signup Success . Your info is saved into cookie");
          // user profile 정보 저장을 위해 token 저장
          return res.cookie("x_auth", token).status(200).json({
            message: "Signup success",
            success: "true",
            register_who: reigster_who,
          });
        }); // User.findOne
      }); // jwt.verify
    } else {
      // token 이 없다면
      console.log("No token exist");
      return res.status(200).json({ result: "no token" });
    }
  }, 200);
}); // app.post('/api/users/activateAccount 끝

module.exports = router;
