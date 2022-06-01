const express = require("express");
const router = express.Router();

//------------ Login Route ------------>
router.get("/login", (req, res) => res.render("login"));

//------------ Register Route ------------>
router.get("/signup", (req, res) => res.render("signup"));

//------------ Client Route ------------>
app.get("/client", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/client.ejs");
});

//------------ Contacs Route ------------>
app.get("/contacts", checkAuthenticated, (req, res) => {
  // res.sendFile(__dirname + '/views/Dashboard2/dashboard.ejs');
  res.render(__dirname + "/views/Dashboard2/contact.ejs");
});
