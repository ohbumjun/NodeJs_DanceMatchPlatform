const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')

// root 주소 Route
router.get('/',function(req,res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/index.html"))
    })

// main
router.get('/main',function(req,res){
    //req.cook
    console.log(req.cookies)
    var login = Object.keys(req.cookies).includes('x_auth')?true:false
    res.render('base',{login:login})
})

// 검색
router.post('/ajax_send_test',function(req,res)
{   //req parsing
    var genre=req.body.genre;
    var place=req.body.place;
    var datas;
    console.log(req.body)
    //mongodb query
    connection.db.collection("dancer", function(err, collection){
        collection.find(req.body).toArray(function(err, data){

                //검색 개수 보여주기
        var result = 'ok'
        var numdata=data.length;
        var respondData={'result':result,'data':data,'numdata':`${numdata} Results`}
        res.json(respondData)
        })   
    });
})

module.exports = router;