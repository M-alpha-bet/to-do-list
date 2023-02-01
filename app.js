const express = require("express");
const bodyParser = require("body-parser");

// Requires the module from the external data.js file
const data = require(__dirname + "/data.js")

const app = express();

// sets express to go to views folder and run the ejs file
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

let items = [];
let userName = "";

app.get("/", function(req, res) {
  res.render("name");
});

// Loads up the list page using name from the root post request
app.get("/list", function(req, res) {

  // Calls the getDate function from the already required data.js file
  let day = data.getDate();

  // Redirects to home page if userName is empty
  if (userName === "") {
    res.redirect("/");
  } else {
    res.render("list", {
      ejsDay: day,
      listItems: items,
      userName: userName,
    });
  }
});

app.post("/", function(req,res) {
  userName = req.body.name;
  // Checks if user input is empty and renders an h1 html tag
  if (userName === "") {
    res.send("<h1>Name Space cannot be empty</h1>");
  } else {
    // Redirects to list page if name is not empty
    res.redirect("/list");
  }
});

app.post("/list", function(req, res) {
  let newItem = req.body.item;

  if (newItem === "") {
    res.redirect("/list");
  } else {
    items.push(newItem);

    res.redirect("/list");
  }

});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
