var exports = module.exports = {};
const config = require( '../config/key' );

var mongoose = require('mongoose');

mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
})

// .then( () => {
// console.log("MongoDB Connected...in board.js")}).catch( err => console.log( err ))

var connection = mongoose.connection;


// let connection = mongoose.connection;
// connection.on('error', console.error.bind(console, 'connection error:'));

exports.connect = function(){

  connection.on('error', function dbError(){
      console.log('Connection Error');
  });
  connection.once('connected', function dbConnected(){
    console.log('Connected to the database');
  });

  connection.on('disconnected', function dbDisconnected(){
    console.log('Database disconnected');
  });

  process.on('SIGINT', function closeConnection(){
    mongoose.connection.close(function(){
        console.log('Server is down, closing the connection');
        process.exit(0);
    });
  });
}