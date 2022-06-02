const passport = require("passport");
const bcryptjs = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require("jsonwebtoken");
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const express = require("express");
const app = express();
const session = require("express-session");
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
//------------ User Model ------------//
const User = require("C:/Users/xshow/Desktop/New folder (2)/19F-0994_BS SE-6A_WEB_Assingment1.0/Project/Model/signupSchema.js");
var sess;

//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
  const { fname, lname, password, password2, username, gender, phone, answer } =
    req.body;
  let errors = [];
  console.log(req.body);
  //------------ Checking required fields ------------//
  if (!fname || !lname || !password || !password2 || !username || !gender) {
    errors.push({ msg: "Please enter all fields" });
  }

  //------------ Checking password mismatch ------------//
  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //------------ Checking password length ------------//
  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }

  if (errors.length > 0) {
    res.render("signup.ejs", {
      errors,
      fname,
      lname,
      username,
      password,
      password2,
      gender,
      phone,
      answer,
    });
  } else {
    //------------ Validation passed ------------//
    User.findOne({ username: username }).then((user) => {
      if (user) {
        //------------ User already exists ------------//
        errors.push({ msg: "Email ID already registered" });
        res.render("signup.ejs", {
          errors,
          fname,
          lname,
          username,
          password,
          password2,
          gender,
          phone,
          answer,
        });
      } else {
        const oauth2Client = new OAuth2(
          "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
          "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
          "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
          refresh_token:
            "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
        });
        const accessToken = oauth2Client.getAccessToken();

        const token = jwt.sign({ fname, username, password }, JWT_KEY, {
          expiresIn: "30m",
        });
        const CLIENT_URL = "http://" + req.headers.host;

        const output = `
                <h2>Please click on below link to activate your account</h2>
                <p>${CLIENT_URL}/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
                `;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "nodejsa@gmail.com",
            clientId:
              "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
            clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
            refreshToken:
              "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
            accessToken: accessToken,
          },
        });

        // send mail with defined transport object
        const mailOptions = {
          from: '"CRM Admin" <nodejsa@gmail.com>', // sender address
          to: username, // list of receivers
          subject: "Account Verification: NewUser,Auth ✔", // Subject line
          generateTextFromHTML: true,
          html: output, // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            req.flash(
              "error_msg",
              "Something went wrong on our end. Please register again."
            );
            res.redirect("/login");
          } else {
            console.log("Mail sent : %s", info.response);
            req.flash(
              "success_msg",
              "Activation link sent to email ID. Please activate to log in."
            );
            res.redirect("/login");
          }
        });
      }
    });
  }
};

//------------ Activate Account Handle ------------//
exports.activateHandle = (req, res) => {
  const token = req.params.token;
  let errors = [];
  if (token) {
    jwt.verify(token, JWT_KEY, (err, decodedToken) => {
      if (err) {
        req.flash(
          "error_msg",
          "Incorrect or expired link! Please register again."
        );
        res.redirect("/signup");
      } else {
        const { fname, username, password } = decodedToken;
        const { lname, gender, phone, answer } = req.body;
        console.log("Last name : ", lname);
        User.findOne({ username: username }).then((user) => {
          if (user) {
            //------------ User already exists ------------//
            req.flash(
              "error_msg",
              "Email ID already registered! Please log in."
            );
            res.redirect("/login");
          } else {
            console.log("Last name : ", lname);
            const newUser = new User({
              fname,
              lname,
              username,
              password,
              password,
              //   gender,
              // phone,
              //answer
            });

            bcryptjs.genSalt(10, (err, salt) => {
              bcryptjs.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "Account activated. You can now log in."
                    );
                    res.redirect("/login");
                  })
                  .catch((err) => console.log(err));
              });
            });
          }
        });
      }
    });
  } else {
    console.log("Account activation error!");
  }
};

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
  const { username } = req.body;

  let errors = [];

  //------------ Checking required fields ------------//
  if (!username) {
    errors.push({ msg: "Please enter an email ID" });
  }

  if (errors.length > 0) {
    res.render("forgot.ejs", {
      errors,
      username,
    });
  } else {
    User.findOne({ username: username }).then((user) => {
      if (!user) {
        //------------ User already exists ------------//
        errors.push({ msg: "User with Email ID does not exist!" });
        res.render("forgot.ejs", {
          errors,
          username,
        });
      } else {
        const oauth2Client = new OAuth2(
          "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com", // ClientID
          "OKXIYR14wBB_zumf30EC__iJ", // Client Secret
          "https://developers.google.com/oauthplayground" // Redirect URL
        );

        oauth2Client.setCredentials({
          refresh_token:
            "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
        });
        const accessToken = oauth2Client.getAccessToken();

        const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, {
          expiresIn: "30m",
        });
        const CLIENT_URL = "http://" + req.headers.host;
        const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                `;

        User.updateOne({ resetLink: token }, (err, success) => {
          if (err) {
            errors.push({ msg: "Error resetting password!" });
            res.render("forgot.ejs", {
              errors,
              username,
            });
          } else {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                type: "OAuth2",
                user: "nodejsa@gmail.com",
                clientId:
                  "173872994719-pvsnau5mbj47h0c6ea6ojrl7gjqq1908.apps.googleusercontent.com",
                clientSecret: "OKXIYR14wBB_zumf30EC__iJ",
                refreshToken:
                  "1//04T_nqlj9UVrVCgYIARAAGAQSNwF-L9IrGm-NOdEKBOakzMn1cbbCHgg2ivkad3Q_hMyBkSQen0b5ABfR8kPR18aOoqhRrSlPm9w",
                accessToken: accessToken,
              },
            });

            // send mail with defined transport object
            const mailOptions = {
              from: '"Auth Admin" <nodejsa@gmail.com>', // sender address
              to: username, // list of receivers
              subject: "Account Password Reset: NodeJS Auth ✔", // Subject line
              html: output, // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                req.flash(
                  "error_msg",
                  "Something went wrong on our end. Please try again later."
                );
                res.redirect("/forgot");
              } else {
                console.log("Mail sent : %s", info.response);
                req.flash(
                  "success_msg",
                  "Password reset link sent to email ID. Please follow the instructions."
                );
                res.redirect("/login");
              }
            });
          }
        });
      }
    });
  }
};

//------------ Redirect to Reset Handle ------------//
exports.gotoReset = (req, res) => {
  const { token } = req.params;

  if (token) {
    jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
      if (err) {
        req.flash("error_msg", "Incorrect or expired link! Please try again.");
        res.redirect("/login");
      } else {
        const { _id } = decodedToken;
        User.findById(_id, (err, user) => {
          if (err) {
            req.flash(
              "error_msg",
              "User with email ID does not exist! Please try again."
            );
            res.redirect("/login");
          } else {
            res.redirect(`/reset/${_id}`);
          }
        });
      }
    });
  } else {
    console.log("Password reset error!");
  }
};

exports.resetPassword = (req, res) => {
  var { password, password2 } = req.body;
  const id = req.params.id;
  let errors = [];

  //------------ Checking required fields ------------//
  if (!password || !password2) {
    req.flash("error_msg", "Please enter all fields.");
    res.redirect(`/reset/${id}`);
  }

  //------------ Checking password length ------------//
  else if (password.length < 8) {
    req.flash("error_msg", "Password must be at least 8 characters.");
    res.redirect(`/reset/${id}`);
  }

  //------------ Checking password mismatch ------------//
  else if (password != password2) {
    req.flash("error_msg", "Passwords do not match.");
    res.redirect(`/reset/${id}`);
  } else {
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err) throw err;
        password = hash;

        User.findByIdAndUpdate(
          { _id: id },
          { password },
          function (err, result) {
            if (err) {
              req.flash("error_msg", "Error resetting password!");
              res.redirect(`reset/${id}`);
            } else {
              req.flash("success_msg", "Password reset successfully!");
              res.redirect("/login");
            }
          }
        );
      });
    });
  }
};

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
  sess = req.session;
  sess.username = req.body.username;
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
};

//edit profilr post fun....................
exports.editProfilepost = (req, res) => {
  sess = req.session;
  if (sess.username) {
    User.findOne({ username: sess.username }, (err, user) => {
      if (err) return console.error(err);
      if (user != null) {
        req.body.username = req.body.username.toLowerCase();
        user.username = req.body.username;
        sess.username = req.body.username;
        user.save(function (err, user) {
          if (err) return console.error(err);
        });
      } else {
        console.log("something is happened");
      }
    });
  } else {
    console.log("else");
  }
  console.log("redirecting back");
  res.redirect("/");
};

exports.editprofileget = (req, res) => {
  //   //res.render("profile.ejs", { title: "profile", user: req.user });
  //  var un;
  //   sess = req.session;
  //   /* if (sess.username) {
  //     MySignup.findOne({ username: sess.username }, (err, user) => {
  //       if (err) return console.error(err);
  //       un = user.username;
  //       if (user != null) {
  //         res.render("profile.ejs", {
  //           // fname: user.fname,
  //           //lname: user.lname,
  //           //FullName: user.fname.concat(" ", user.lname),
  //           // password: user.password,
  //           username: un,
  //           //username: req.body.username,
  //           // username: req.body.username,
  //         });
  //       }
  //     });
  //   }*/

  User.findOne({ username: sess.username }, (err, user) => {
    if (!err) {
      res.render("profile.ejs", {
        username: user.username,
      });
    } else {
      console.log("Failed to retrieve the  List: " + err);
    }
  });

  //   //res.render("profile.ejs", { username: user.username });
};

//review model...................................................
const Reviews=require("C:/Users/xshow/Desktop/New folder (2)/19F-0994_BS SE-6A_WEB_Assingment1.0/Project/Model/ReviewSschema.js")

exports.reviewpost=(req,res)=>{
  let errors = [];
  const { rname,rusername,rtext } =
    req.body;
     //------------ Checking required fields ------------//
  if (!rname || !rusername|| !rtext) {
   // err_msg = "Fields are empty!";
   // return res.render("contact.ejs", { err_msg: err_msg } );
   errors.push({ err_msg: "Field is empty" });
   res.render(__dirname + "/views/Dashboard2/contact.ejs", {
     errors
   });
  }
  const review= new Reviews({
    name:rname,
    username:rusername,
    message:rtext

  });
  review.save()
  .then((result)=>{
    res.send(result);
  })
  .catch((err)=>{
console.log(err)
  })
  res.redirect("/home")
};