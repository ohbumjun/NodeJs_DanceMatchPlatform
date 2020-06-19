var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//왜 commentschema를 두 번 정의?
var commentSchema = new Schema({
    contents: String,
    author: String,
    comment_date: {type: Date, default: Date.now()}
});

var boardSchema = new Schema({
    title: String,
    contents: String,
    place:String,
    author: String,
    video: String,
    time:String,
    people : Number,
    current_people :Number,
    board_date: {type: Date, default: Date.now()},
    comments: [commentSchema]
});


boardSchema.plugin(require('mongoose-beautiful-unique-validation'));

module.exports = mongoose.model('board', boardSchema);
