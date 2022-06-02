const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pSchema = new Schema({
  fname: String,
  lname: String,
  password: String,
  username: String,
  phone: String,
  gender: String,
  answer: String,
  verified: Boolean
});
const MySignup = mongoose.model("MySignup", pSchema);
module.exports = MySignup;
