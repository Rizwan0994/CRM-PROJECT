const mongoose =require('mongoose')
const Schema=mongoose.Schema

const pSchema=new Schema({
    fname:String,
    lname:String,
    password:String,
    password2:String,
    username:String,
    phone:String,
    gender: String,
    answer:String,
    verified:Boolean,  
    resetLink: {
        type: String,
        default: ''
      } 
    
    
});
const  MySignup=mongoose.model('MySignup',pSchema)
module.exports= MySignup;