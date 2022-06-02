if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
var path='C:/Users/xshow/Desktop/New folder (2)/19F-0994_BS SE-6A_WEB_Assingment1.0/Project/Model/signupSchema.js';

const express = require("express");
const app = express();
const ejs = require('ejs')
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
app.use("/views", express.static(__dirname + "/views"));
const MySignup = require(path);
app.listen(8090);

//------------ Importing  ------------//
const authController = require("C:/Users/xshow/Desktop/New folder (2)/19F-0994_BS SE-6A_WEB_Assingment1.0/Project/controllers/authcontroller.js");
const pdfController = require("C:/Users/xshow/Desktop/New folder (2)/19F-0994_BS SE-6A_WEB_Assingment1.0/Project/controllers/pdfcontroller.js");
require("./config/passport-config")(passport);

//app.use(require("serve-static")(__dirname + "/../../public"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method"));

//------------ Global variables ------------//
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//db conection
const mongoose = require("mongoose");
const url =
  "mongodb+srv://rizwan:rizwan123@cluster0.em5bh.mongodb.net/CRM?retryWrites=true&w=majority";
mongoose
  .connect(url)
  .then((result) => console.log("connected to db"))
  .catch((err) => console.log(err));

//end db

app.get("/", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/dashboard.ejs");
});

app.get("/client", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/client.ejs");
});

 app.get("/report", checkAuthenticated, (req, res) => {
  
  pdfController.generatePdf();
  res.redirect("/leads")
 });


app.get("/contacts", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/contact.ejs");
});
app.post("/contacts", authController.reviewpost);

app.get("/home", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render("home.ejs");
});

//------------ Reset Password Route ------------//
app.get("/reset/:id", (req, res) => {
  // console.log(id)
  res.render("reset.ejs", { id: req.params.id });
});

//------------ Reset Password Handle ------------//
app.post("/reset/:id", authController.resetPassword);

//------------ Reset Password Handle ------------//
app.get("/forgot/:token", authController.gotoReset);

//------------ Forgot Password Handle ------------//
app.post("/forgot", authController.forgotPassword);
//------------ Forgot Password Route ------------//
app.get("/forgot", (req, res) => res.render("forgot.ejs"));

//------------ Register Route ------------//
app.get("/signup", (req, res) => res.render("signup.ejs"));

//------------ Register POST Handle ------------//
app.post("/signup", authController.registerHandle);

//------------ Email ACTIVATE Handle ------------//
app.get("/activate/:token", authController.activateHandle);



app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post("/login", authController.loginHandle);

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.post("/editProfile", authController.editProfilepost);

app.get("/editProfile", authController.editprofileget);


//leads 
  
app.get('/leads', function(req, res, next) {
  MySignup.find((err, lead) => {
    if (!err) {
        res.render("leads.ejs", {
            data: lead
        });
    } else {
        console.log('Failed to retrieve the Course List: ' + err);
    }
});
});

//search.....

app.get('/display', async function(req, res, next) {
const s=  req.query.search
  console.log(s)
MySignup.find({fname:s},(err,user)=>{
  console.log(""+user)
if(!err){
res.render("leads.ejs", {
  data:user
 
});

}
else{
console.log("searching error!")
}
});
  
  
});