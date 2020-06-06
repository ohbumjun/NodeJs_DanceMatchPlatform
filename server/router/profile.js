const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models/User')


// 9. profileDancer
router.get('/api/users/profileDancer', function( req , res){
    res.sendFile(path.join(__dirname + "/../../client/static/templates/profileDancer.html"))
})

// 9. profileUser
router.get('/api/users/profileUser', function( req , res){
res.sendFile(path.join(__dirname + "/../../client/static/templates/profileUser.html"))
});

module.exports = router;