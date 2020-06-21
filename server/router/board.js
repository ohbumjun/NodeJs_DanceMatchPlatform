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
router.get('/api/users/board', function( req , res){


    let x_auth = req.cookies.x_auth
    
    let login = Object.keys(req.cookies).includes('x_auth')?true:false
    
    //Register 입력시 이메일,pw 등등 정보 토큰
    connection.db.collection("users", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){

          //login아니라면 login 창으로 redirect
          if(!login)
          {
            let author = 'nobody'
            res.render('board',{login:login,author:author})
          }
          else
          {
            let author = data[0]['e_name']
            //검색 개수 보여주기
            res.render('board',{login:login,author:author})
          }
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
        console.log(docs)
        res.json({'result':docs})
     })

})

//내 post 가져오기
router.post('/my_posts',function(req,res)
{
  let x_auth = req.cookies.x_auth

  User.find({token:x_auth},function(err,docs)
  {
   let email =   docs[0]['email']
   Board.find({email:email},function(err,docs)
   {
    res.json({'result':docs})
   })
  })
  
})

//글 삭제
router.get('/delete_post/:id',function(req,res)
{
  let id = req.params.id

  Board.deleteOne({ _id: id},function(req,response){
    res.redirect('/api/users/mySpace');
  })

})


//글쓰기
router.get('/board/write', function(req, res, next) {
    res.render('write');
});


//게시글 업데이트
router.get('/update_post/:id',function(req,res){
  let id = req.params.id
  Board.find({_id:id},function(req,response)
  {
    res.render('board_update',response[0])
  })


})


router.post('/api/users/update_board',function(req,res)
{

  Board.findOneAndUpdate({_id:req.body._id},{$set:req.body},(err,doc)=>{
    res.redirect('/api/users/myspace')
})
})



router.post('/api/users/comment',function(req,res)
{

  let comment = new Comment()
  comment.contents = req.body.comment

  let x_auth = req.cookies.x_auth

  User.find({token:x_auth},function(err,docs)
  {
    comment.author = docs[0]['e_name']
    Board.findOneAndUpdate({_id:req.body.boardid},{$push:{comments:comment}},{new:true},(err,doc)=>{
      if(err)
      {
        console.log(err)
      }
      res.json({'result':doc})
  })

  })


})


router.post('/api/users/delete_comment', function (req, res) {
  Board.findOneAndUpdate({_id:req.body.boardid},{$pull:{comments:{_id:req.body.commentid}}},{new:true},(err,doc)=>{
    if(err)
    {
      console.log(err)
    }
    res.json({'result':doc})
})
  })

router.post('/api/users/update_comment',function (req, res) {
  Board.findOneAndUpdate({'_id':req.body.boardid,'comments._id':req.body.commentid},{$set:{"comments.$.contents":req.body.content}},{new:true},(err,doc)=>{
    if(err)
    {
      console.log(err)
    }

    console.log("comment here")
    console.log(doc)

    res.json({'result':doc})
})
  })

//글쓰기 post
router.post('/api/users/board', function (req, res) {
    
    let x_auth = req.cookies.x_auth
    let login = Object.keys(req.cookies).includes('x_auth')?true:false

    var board = new Board();
    board.title = req.body.title;
    board.contents = req.body.contents;
    board.time=req.body.time
    board.place=req.body.place
    board.video=req.body.video
    board.people = req.body.number
    board.current_people = 1
    User.find({token:x_auth},function(err,docs)
    {
      
      board.author = docs[0]['e_name']
      board.email = docs[0]['email']
      board.save(function (err) {
        if(err){
          res.redirect('/api/users/board')
        }
          res.redirect('/api/users/board')
        //   res.render('board',{login:login})
      });
    })
    })

module.exports = router;