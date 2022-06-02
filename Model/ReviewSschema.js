const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pSchema = new Schema({
  name: String,
  username: String,
  message: String
  
});
const Reviews = mongoose.model("Reviews", pSchema);
module.exports = Reviews ;
