const express = require('express');
const router = express.Router();
const path = require('path');
const { dancer }   = require('../models/Dancer');
const { User }   = require('../models/User');
var Board = require('../models/Board');
var Comment = require('../models/Comment');

const config = require( '../config/key' );
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');



// 1) DB 접속
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => {
console.log("MongoDB Connected... ")}).catch( err => console.log( err ))


let connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

//게시판
router.get('/board', function( req , res){


    let x_auth = req.cookies.x_auth
    let login = Object.keys(req.cookies).includes('x_auth')?true:false
    
    //Register 입력시 이메일,pw 등등 정보 토큰
    connection.db.collection("users", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){
            //검색 개수 보여주기
        res.render('board',{login:login})
        })   
    });

})

//최근 post 가져오기
router.post('/recent_posts',function(req,res)
{
    //예시 : 내일 이전 게시물들 불러오기
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    Board.find({board_date: {$lt: tomorrow}},function (err, docs) {
        //docs는 array
        res.json({'result':docs})
     })

})

//내 post 가져오기
router.post('/my_posts',function(req,res)
{
  let x_auth = req.cookies.x_auth

  User.find({token:x_auth},function(err,docs)
  {
   let author =   docs[0]['e_name']
   Board.find({author:author},function(err,docs)
   {
    res.json({'result':docs})
   })
  })
  
})


//글쓰기
router.get('/board/write', function(req, res, next) {
    res.render('write');
});

//글쓰기 post
router.post('/board', function (req, res) {
    
    let x_auth = req.cookies.x_auth
    let login = Object.keys(req.cookies).includes('x_auth')?true:false

    var board = new Board();
    board.title = req.body.title;
    board.contents = req.body.contents;
    board.time=req.body.time
    board.place=req.body.place
    board.video=req.body.video
    User.find({token:x_auth},function(err,docs)
    {
      
      board.author = docs[0]['e_name']
      board.save(function (err) {
        if(err){
          res.redirect('/board')
        }
          res.redirect('/board')
        //   res.render('board',{login:login})
      });
    })
    })

module.exports = router;