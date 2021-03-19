//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser"); //body parser to grab the body from our req
const date = require(__dirname + "/date.js"); //importing our custom module from date.js
const mongoose = require('mongoose'); // setting up our mongoose package
const _ = require('lodash') // using lodash to always capitalize the list titles

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); //connecting to our mongodb server and creating a new db: todolistDB


//creating a schema
const itemsSchema = new mongoose.Schema({ 
  name: String
})

//creating a new mongoose model based off the schema

const Item = mongoose.model("Item", itemsSchema);
//creating 3 new documents from the Item model
const item_1 = new Item ({
  name: "Hi! Welcome to your To-Do List"
})
const item_2 = new Item ({
  name: "Press the + button to add a new task"
})
const item_3 = new Item ({
  name: "Good luck!"
})

//creating a new array to store the new items
const defaultItems = [item_1, item_2, item_3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Successfully inserted items into the db");
//   }
// })

app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {
    //checking to see if the array is empty
      if (foundItems.length === 0) {
          Item.insertMany(defaultItems, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully inserted items into the db");
      }
    }) //if it is empty, insert the default items into the homepage and redirect to homepage
      res.redirect('/');
  } else {
    //if there are already items inside the array, render the list on the homepage
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
  })
  
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();

    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

  
 
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;

  const listTitle = req.body.listName;


  if (listTitle === "Today") {
          // Item.deleteOne({_id: checkedItemId}, function(err){
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log("Successfully completed a task");
      //   }
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully completed a task");
        }
      res.redirect('/')
    })
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listTitle)
      }
    })
  }

 


})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err) {
      if (!foundList){
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems 
        });
        list.save();
        res.redirect('/' + customListName)
      } else {
        // show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });
  
  

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
