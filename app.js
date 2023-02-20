const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// Requires the module from the external data.js file
const data = require(__dirname + "/data.js")

//make mongoose and express connection
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://martinelli:0GpBqEXRrBhmSJFB@clusterm.glfywxd.mongodb.net/listDB", {useNewUrlParser: true});

const app = express();

// sets express to go to views folder and run the ejs file
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// Creating a schema for the tasks and customLists
const taskSchema = {
  name: {
    type: String,
    required: [true, "Task field must not be empty"],
  }
}

const listSchema = {
  name: {type: String, required: [true, "Name field must not be empty"]},
  task: [taskSchema]
}


// Creating the task and customList database model
const Task = mongoose.model("Task", taskSchema);

const List = mongoose.model("List", listSchema);


//Making three default loadup tasks
const pray = new Task ({
  name: "A short morning Prayer to start the day.",
});

const cleanUp = new Task ({
  name: "Brush my teeth and wash my face",
});

const workout = new Task ({
  name: "Go for a 40 minute morning jog",
});

const dafaultTasks = [pray, cleanUp, workout];


let userName = "";
let day = "";



app.get("/", function(req, res) {
  res.render("name");
});



app.get("/list", function(req, res) {

  // Calls the getDate function from the already required data.js file
  day = data.getDate();

  // Redirects to home page if userName is empty
  if (userName === "") {
    res.redirect("/");
  } else {
    // retrieve data from DB and render the page
    Task.find({}, function(err, result) {
      if (err) {
        console.log("There was an error in retrieving data from Database");
      } else {
        if (result.length === 0) {
          // Inserting the tasks above to the database

          Task.insertMany(dafaultTasks, function(err) {
            if (err) {
              console.log("There has been an error in the function");
            } else {
              console.log("Successfully uploaded dafult tasks");
            }
          });
          res.redirect("/list");
        } else {
          res.render("list", {ejsDay: day, listItems: result, userName: userName });
        }
      }
    });
  }
});

app.get("/list/:customListName", function(req, res) {
  const title = _.capitalize(req.params.customListName);

  List.findOne({name: title}, function(err, result) {
    if (!err) {
      if (!result) {

        // Create a new list
        const list = new List ({
          name: title,
          task: dafaultTasks[0],
        });
        list.save();
        res.redirect("/list/" + title);
      } else {

        res.render("list", {
          ejsDay: title,
          userName: userName,
          listItems: result.task,
        });
      }
    }
  });
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
  const taskBody = req.body.item;
  const listName = req.body.list;

  if (taskBody === "") {
    res.send("<h1>Task field cannot be empty</h1>");
  } else {
    const newTask = new Task ({
      name: taskBody,
    });

    if (listName === day) {
      newTask.save();

      res.redirect("/list");
    } else {
      List.findOne({name: listName}, function(err, result) {
        result.task.push(newTask);
        result.save();
        res.redirect("/list/" + listName);
      });
    }

  }
});


app.post("/delete", function(req, res) {
  const checkedTask = req.body.check;
  const listName = req.body.listName;

  if (listName === day) {
    Task.findByIdAndRemove(checkedTask, function(err) {
      if (err) {
        console.log("There was an error in deleting the item");
      } else {
        res.redirect("/list");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {task: {_id: checkedTask}}}, function(err, result) {
      if (!err) {
        res.redirect("/list/" + listName);
      }
    });
  }


});




app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});


// MongoDb details
// Username: martinelli
// Pass: 0GpBqEXRrBhmSJFB
