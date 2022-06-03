const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LeadsData = new Schema({
  fullname: String,
  username: String,
  phone: String,
  gender: String,
  Address: String,
});

const Leads = mongoose.model("Leads", LeadsData);
module.exports = Leads;
