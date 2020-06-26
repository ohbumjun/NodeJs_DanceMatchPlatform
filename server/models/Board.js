var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//왜 commentschema를 두 번 정의?
var commentSchema = new Schema({
    contents: String,
    author: String,
    comment_date: {type: Date, default: Date.now()}
});

commentSchema.add({ comments: [commentSchema] });


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
    comments: [commentSchema]
});


//recursive한거 때문에 콜스택 에러 발생??
// boardSchema.plugin(require('mongoose-beautiful-unique-validation')); 

module.exports = mongoose.model('board', boardSchema);
