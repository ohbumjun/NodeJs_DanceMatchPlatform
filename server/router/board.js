const express = require('express');
const router = express.Router();
const path = require('path');
const { dancer }   = require('../models/Dancer');
const { User }   = require('../models/User');
var Board = require('../models/Board');
var { Comment } = require('../models/Comment');

const config = require( '../config/key' );

let url = config.domainURL

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
console.log("MongoDB Connected...in board.js")}).catch( err => console.log( err ))


let connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

//author가 object형태가아니면 filtering
function FilterDoc(docs)
{
  return docs.filter((e)=>{return e['author']&&typeof(e['author']!=='string')})
}
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
            res.render('board',{login:login,author:author,url:url})
          }
          else
          {
            let author = data[0]['e_name']
            let email = data[0]['email']
            res.render('board',{login:login,author:author,email:email,url:url})
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

    //로그인확인
    let x_auth = req.cookies.x_auth
    let login = Object.keys(req.cookies).includes('x_auth')?true:false
    User.find({token:x_auth},function(err,user){

      Board.find({board_date: {$lt: tomorrow}},function (err, docs) {
          //docs는 array,author object아닌거 필터링
          docs = FilterDoc(docs)
          if(!login)
          {
            res.json({'result':docs})
          }
          else{
            let author = user[0]
            let board_waiting = []
            let board_approved = []
            
            ///승인 대기 중인 보드 찾기
            docs.forEach((e)=>{
              e.tmp_members.forEach((tmp_member)=>{
                  if(tmp_member.email === author.email)
                  {
                    board_waiting.push(e)
                  }
              })
              
              //승인된 보드 찾기
              e.members.forEach((member)=>{
                if(member.email === author.email)
                {
                  board_approved.push(e)
                }
            })

            })
            let myposts = docs.filter((e)=>{return e.author.email===author.email})
            res.json({'result':docs,'user':user[0],'myposts':myposts,'board_waiting':board_waiting,'board_approved':board_approved,'url':url}) 
          }
       })

    })

})


router.post('/api/users/search_board',function(req,res)
{
  Board.find(req.body,function (err, docs) {
    //docs는 array
    docs = FilterDoc(docs)
    res.json({'result':docs,'nums':docs.length})
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
     console.log("Finding in Board")
     console.log(docs)
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
    res.json({'result':'ok'})
})
  })

router.post('/api/users/update_comment',function (req, res) {
  Board.findOneAndUpdate({'_id':req.body.boardid,'comments._id':req.body.commentid},{$set:{"comments.$.contents":req.body.content}},{new:true},(err,doc)=>{

    if(err)
    {
      console.log(err)
    }

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
    let video_url = req.body.video
    //https://www.youtube.com/watch?v=8M4i8pxOLjo
    if(!video_url.includes('embed'))
    {
      let video_url_split = video_url.split('=')
      video_url = "https://www.youtube.com/embed/"+video_url_split[video_url_split.length-1]
    }
    board.video=video_url
    board.people = req.body.number
    board.current_people = 1
    User.find({token:x_auth},function(err,docs)
    {
      board.author = docs[0]
      board.save(function (err) {
        console.log('saved')
        if(err)
        {
          console.log('err',err)
        }
        if(!login){
          res.redirect('/api/users/board')
        }
        {
          res.redirect('/api/users/board')
        }
        //   res.render('board',{login:login})
      });
    })
    })


router.post('/api/users/cancel_apply',function(req,res)
{

  let board_id = req.body.board_id
  let user_id = req.body.user_id
  let approved = req.body.approved

  //tmp member에서 샂게
  if(!approved)
  {

    console.log(1,req.body)
    Board.findOneAndUpdate({_id:board_id},{$pull:{tmp_members:{_id:user_id}}},{new:true},(err,doc)=>{
      if(err)
      {
        console.log(err)
      }
      res.json({'result':true})
  })
  } //cur memeber에서 삭제
  else{
    console.log(2,req.body)
    Board.findOneAndUpdate({_id:board_id},{$pull:{members:{_id:user_id}},$inc:{current_people:-1}},{new:true},(err,doc)=>{
      if(err)
      {
        console.log(err)
      }
      res.json({'result':true})
  })
  }
})

router.post('/api/users/join',function(req,res)
{
  let x_auth = req.cookies.x_auth
  let board_id = req.body.board_id
  User.find({token:x_auth},function(err,docs)
  {
    let user = docs[0]
    Board.findOneAndUpdate({_id:board_id},{$push:{tmp_members:user}},{new:true},(err,doc)=>{
      if(err)
      {
        console.log(err)
      }
      res.json({'result':true})
  })
  })


})

router.post('/api/users/approve',function(req,res){

  let board_data =req.body.board_data
  let user_data =req.body.user_data
  let user = User(user_data)

  let approve = req.body.approve

  Board.findOneAndUpdate({_id:board_data._id},{$pull:{tmp_members:user}},{new:true},(err,doc)=>{
    
    if(approve)
    {
      Board.findOneAndUpdate({_id:board_data._id},{$push:{members:user},$inc:{current_people:1}},{new:true},(err,doc)=>{
        res.json({'result':true})
      })
    } //거절하는경우
    else{
      res.json({'result':true})
    }
  })
})

module.exports = router;