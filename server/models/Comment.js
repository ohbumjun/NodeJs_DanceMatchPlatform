var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

const config = require( '../config/key' );
mongoose.connect( config.mongoURI , {
    useNewUrlParser : true ,
    useUnifiedTopology : true ,
    useCreateIndex : true,
    useFindAndModify : false
    // 아래 코드는 연결ㄹ이 잘 됐는지 안됐는지 확인하기 
}).then( () => console.log("MongoDB Connected... ")).catch( err => console.log( err ))


var commentSchema = mongoose.Schema({
    contents: String,
    author: String,
    comment_date: {type: Date, default: Date.now()}
});


commentSchema.add({ comments: [commentSchema]});


var Comment  = mongoose.model('Comment', commentSchema);
module.exports = { Comment }