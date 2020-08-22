const mongoose = require("mongoose");
const { User } = require("./User");
const { Comment } = require("./Comment");

const { Schema } = mongoose;

const boardSchema = new Schema({
  title: String,
  contents: String,
  place: String,
  author: User.schema,
  video: String,
  time: String,
  people: Number,
  current_people: Number,
  board_date: { type: Date, default: Date.now() },
  comments: [Comment.schema],
  members: [User.schema],
  tmp_members: [User.schema],
});

// recursive한거 때문에 콜스택 에러 발생??
// boardSchema.plugin(require('mongoose-beautiful-unique-validation'));

module.exports = mongoose.model("board", boardSchema);
