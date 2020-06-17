const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')
const upload = require('../services/file_upload.js');
const { resolve } = require('url');

// 'image'는 key의 역할을 한다
// under this key, we will send our image
const singleUpload = upload.single('image');

router.post('/api/users/image-upload', function( req, res){

    singleUpload( req, res, function( err ){   

        console.log("Request for uploading image");
        
        if(err){
            console.log("Error during uploading image");
            console.log(err)
            
            return res.status(422).send({ errors : [ { title : 'File Upload Error', detail : err.message }]});
        }

        
        
        // location에는 url of our image 이 들어있을 것이다 
        console.log("Success")
        return res.json({ 'imageUrl' : req.file.location})

    });   
})

module.exports = router;