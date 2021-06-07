// const { User }   = require('./server/models/User');
// var Board = require('./server/models/Board');
// const config = require( './server/config/key' );

// var mongoose = require('mongoose');

// // 1) DB 접속
// mongoose.connect( config.mongoURI , {
//     useNewUrlParser : true ,
//     useUnifiedTopology : true ,
//     useCreateIndex : true,
//     useFindAndModify : false
//     // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
// }).then( () => {
// console.log("MongoDB Connected...in board.js")}).catch( err => console.log( err ))


// let connection = mongoose.connection;
// connection.on('error', console.error.bind(console, 'connection error:'));

// let new_user = 


// User.find({},function(err,data){


//     console.log('data',data)

//     data.forEach((user)=>{Board.findOneAndUpdate({author:data['e_name']},{$set:{author:data}},{new:true},function(err,docs){console.log(docs)})})

// })