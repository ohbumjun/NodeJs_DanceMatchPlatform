const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const port = 4000;
// 비밀번호 설정을 위한 코드. key.js 에서 가져온다
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));
// css, js 파일들 적용
app.use(express.static(`${__dirname}/../client/static`));

// bodyParser: client가 보낸 정보를 Server가 받게 한다
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const server = require("http").createServer(app);
const io = require("socket.io")(server);
const config = require("./config/key");

const clients = {};

app.set("socketio", io);
io.on("connection", function (socket) {
  socket.on("StoreInfo", function (data) {
    clients[data.email] = data.socket_id;
    console.log("clients", clients);
  });
  socket.on("NewJoin", function (data) {
    console.log("send message to", data.email);
    console.log("send message to", clients[data.email]);
    socket.to(clients[data.email]).emit("NewMember", data);
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

// app 실행하기. 4000 port를 listen 하게 되면, 뒤의 내용을 출력하기
server.listen(port, () =>
  console.log(`Example app Listening on port ${port}!`)
);

// ERR_EMPTY_RESPONSE 방지
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-token"
  );
  if (req.method === "OPTIONS") {
    res.end();
  } else {
    next();
  }
});

// 2) Router 들
// root, main, 검색
const root = require("./router/base.js");

app.use(root);

// register route
const register = require("./router/register.js");

app.use(register);

// activeAccount
const activeAccount = require("./router/activateAccount.js");

app.use(activeAccount);

// Login, Aut, Logout route
const login = require("./router/login.js");

app.use(login);

// // Password Find, Reset route
// const forget = require('./router/Password.js');
// app.use( forget )

// Profile Dancer, User Route
const profile = require("./router/profile.js");

app.use(profile);

// Profile Dancer, User Route
const mypage = require("./router/mypage.js");

app.use(mypage);

const board = require("./router/board.js");

app.use(board);

exports.domainURL = config.domainURL;
