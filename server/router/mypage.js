const express = require('express');
const router = express.Router();
const path = require('path');
const { dancer }   = require('../models/Dancer');
const { User }   = require('../models/User');
const config = require( '../config/key' );
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const upload = require('../services/file_upload.js');
// aws file upload
const ImagesingleUpload = upload.single("image");
const VideosingleUpload = upload.single("video");

// 1) DB 접속
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected...in mypage.js ")).catch( err => console.log( err ))
var connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));

// < mypage update router >
router.post('/profile/update_user',function(req,res)
{
    var x_auth = req.cookies.x_auth
    //업데이트할 변수명
    var name = req.body.name
    //업데이트할 값
    var value = req.body.value
    console.log('name')
    //x-auth token으로 찾아서 update
    connection.db.collection("users", function(err, collection){
        collection.updateOne({'token':x_auth},{$set:{[name]:value}}, //변수명을 mongoose column 명으로 사용하고 싶을 때 [name]->e_name
        {upsert:true });
        if(err)
        {
            console.log(err)
            res.status(404)
        }
        var result='ok'
        var respondData={'result':result}
        res.json(respondData)
})
})

// < mypage route >

router.get('/api/users/mypage', function( req , res){

    var x_auth = req.cookies.x_auth
    console.log('x_auth',x_auth)
    connection.db.collection("users", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){
            //검색 개수 보여주기
            // data는 collection에서 user , 혹은 dancer 정보를 받아오는 것이고, 그것을 mypageDancer 라는 router 에다가 넘겨주는 것이다 
            // 아래 코드를 통해, mypage.ejs 에서, mongodb에 있는 내용의 data 들을 value 값으로 넣어줄 수가 있는 것이다 
        res.render('mypage',data[0])
        })   
    });
});

// post : aws-sdk
router.post('/api/users/mypage',function( req, res){

    var x_auth = req.cookies.x_auth;
    const { email } = x_auth;


    // singleUpload라는 function을 제공한다 
    ImagesingleUpload( req, res, function( err ){   

        console.log("Request for uploading image");
        
        if(err){
            console.log("Error during uploading image");
            console.log(err)
            
            return res.status(422).send({ errors : [ { title : 'File Upload Error', detail : err.message }]});
        }

        console.log(req.file.location)
        
        // location에는 url of our image 이 들어있을 것이다 
        console.log("Updating image url in MongoDb")

            //x-auth token으로 찾아서 update
            connection.db.collection("users", function(err, collection){
                collection.updateOne({'token':x_auth},{$set : {'profile_img':req.file.location} },{new:true});
                if(err)
                {
                    console.log("Error happened")
                    console.log(err)
                    res.status(404)
                }
                console.log("Image update success")
            
                res.redirect(req.originalUrl)
        })
    });   
})

// < mySpace Route >
router.get('/api/users/mySpace', function( req , res){
    var x_auth = req.cookies.x_auth
    connection.db.collection("users", function(err, collection){
        collection.find({token:x_auth}).toArray(function(err, data){
            //data는 내가 찾은 token에 해당하는 데이터이다
            // 즉, 내가 찾는 댄서에 대한 정보가 data로 들어오는데
            // array 형식으로 들어오기 때문에, data[0]이라고 작성하는 것이다 
        res.render('mySpace',data[0])
        })   
    });
});

// post : aws-sdk > Videos
router.post('/api/users/mySpace',function( req, res){
    var x_auth = req.cookies.x_auth;
    const { email } = x_auth;

    // VideosingleUpload 라는  function을 제공한다 
    VideosingleUpload( req, res, function( err ){   

        console.log("Request for uploading image");
        
        if(err){
            console.log("Error during uploading image");
            console.log(err)
            
            return res.status(422).send({ errors : [ { title : 'File Upload Error', detail : err.message }]});
        }

        console.log(req.file.location)
        
        // location에는 url of our image 이 들어있을 것이다 
        console.log("Updating Video url in MongoDb")

        //x-auth token으로 찾아서 update( 해당 user 의 db video list에 넣는다 )
        connection.db.collection("users", function(err, collection){
            collection.updateOne({'token':x_auth},{$push : {'profile_videos':req.file.location} },{new:true});
            if(err)
            {
                console.log("Error happened")
                console.log(err)
                res.status(404)
            }
            console.log("Video Push success")
        
            res.redirect(req.originalUrl)
    })
    });   
})

module.exports = router;


/* 

< GridFs 안쓰는 route >
//gfs에 저장된 파일들 다 불러오기
//안쓰는 router 지워도됨
router.get('/files',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files||files.length===0)
        {
            return res.status(404).json({err:'nofile'})
        }
        return res.json(files);
    })
})


//image info json
//안쓰는 router 지워도됨
router.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file||file.length===0)
        {
            return res.status(404).json({err:'nofile'})
        }
        return res.json(file);
    })
})

//image get request
router.get('/image/:filename',(req,res)=>{
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file||file.length===0)
        {
            return res.status(404).json({err:'nofile'})
        }
    if(file.contentType==='image/jpeg' || file.contentType==='image/png' ||  file.contentType==='image/jpg' )
    { 
       const readstream = gfs.createReadStream(file.filename);
       readstream.pipe(res)

    }
    else{
        res.status(404).json({err:'Not an image'})
    }
    })
})

router.post('/api/users/mypage',upload.single('image'),function( req , res){
    var x_auth = req.cookies.x_auth
    var role = req.cookies.role;
    
    //role이 user라면
    if(role==='1')
    {
        //img get request 주소
        img_path = '/image/'+req.file.filename
        User.findOneAndUpdate({token:x_auth},{profile_img:img_path},{new:true},function(err,updateprofile)
        { //new:true=>updated document return
            if(err){return res.status(404).json({err:'Something went wrong'})}
            res.render('mypage',updateprofile)
        })
    
    }
})

*/