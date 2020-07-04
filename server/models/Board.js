var mongoose = require('mongoose');
const {User}   = require('./User')
const {Comment}= require('./Comment')
var Schema = mongoose.Schema;


// //왜 Comment를 두 번 정의?
// var Comment = new Schema({
//     contents: String,
//     author: String,
//     comment_date: {type: Date, default: Date.now()}
// });

// Comment.add({ comments: [Comment] });

var boardSchema = new Schema({
    title: String,
    contents: String,
    place:String,
    author:String,
    video: String,
    time:String,
    people : Number,
    email : String,
    current_people :Number,
    email:String,
    board_date: {type: Date, default: Date.now()},
    comments: [Comment.schema],
    members:[User.schema],
    tmp_members:[User.schema]
});


//recursive한거 때문에 콜스택 에러 발생??
// boardSchema.plugin(require('mongoose-beautiful-unique-validation')); 

module.exports = mongoose.model('board', boardSchema);
