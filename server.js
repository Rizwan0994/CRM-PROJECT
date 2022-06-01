if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const MySignup = require("C:/Users/Umair Akram/OneDrive - FAST National University/Desktop/Rizwan_projet/CRM-PROJECT/Model/signupSchema.js");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
app.use("/views", express.static(__dirname + "/views"));
app.listen(8090);

//------------ Importing  ------------//
const authController = require("C:/Users/Umair Akram/OneDrive - FAST National University/Desktop/Rizwan_projet/CRM-PROJECT/controllers/authcontroller.js");

require("./config/passport-config")(passport);

app.use(require("serve-static")(__dirname + "/../../public"));
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

app.get("/contacts", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/contact.ejs");
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

/* //new 
  app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup.ejs')
  })
*/

/*app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const hashedPassword2 = await bcrypt.hash(req.body.password2, 10)
     const mysignup=new MySignup({
      fname: req.body.fname,
      lname:req.body.lname,
      username: req.body.username,
      phone:req.body.phoneNo,
      gender: req.body.gender,
      answer:req.body.answer,
      password: hashedPassword,
      password2: hashedPassword2
     });*/
//------------ Checking required fields ------------//
/*  if (!fname || !lname || !password || !password2||! phone||! username) {
      errors.push({ msg: 'Please enter all fields' });
  }
   //------------ Checking password mismatch ------------//
   if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
    console.log( 'Passwords do not match')
}
 //------------ Checking password length ------------//
if (password.length < 8) {
  errors.push({ msg: 'Password must be at least 8 characters' });
}*/
/*mysignup.save()
     .then((result)=>{res.send(result)})
     .catch((err)=>{
       console.log(err)
     });
     
      res.status(201).redirect('/login')
    } catch {
      res.redirect('/signup')
    }
  })
*/

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
