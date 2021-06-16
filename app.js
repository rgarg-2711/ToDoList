//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

mongoose.connect("mongodb+srv://admin-rash:Test123@cluster0.sx05h.mongodb.net/todolistDB", { useNewUrlParser: true , useUnifiedTopology: true} );

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemschema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemschema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1=new Item({
  name:"Welcome to your todolist!"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultitems=[item1,item2,item3];

const listschema={
  name:String,
  items:[itemschema]
};

const List=mongoose.model("List",listschema);


app.get("/", function(req, res) {
  Item.find({},function(err,items){
    if(items.length===0){
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully saved default items");
        }
      });
      res.redirect("/");
    }else{
    //  console.log(items);
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.get("/:topic",function(req,res){
  const topicname=_.capitalize(req.params.topic);

  List.findOne({name:topicname},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name:topicname,
          items:defaultitems
        });
        list.save();
        res.redirect("/"+topicname);
      }else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname=req.body.list;
  const newitem=new Item({
    name:itemname
  });

  if(listname==="Today"){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(newitem);
      foundlist.save();
    });
      res.redirect("/"+listname);
  }

});

app.post("/delete",function(req,res){
  const checkedid=req.body.checkbox;
  const listname=req.body.list;

  if(listname==="Today"){
    Item.findByIdAndRemove(checkedid,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedid}}},function(err,foundlist){
      if(!err)
      {
        res.redirect("/"+listname);
      }
    });
  }

});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started");
});
