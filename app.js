//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });


const itemSchema={
  name: String
};

const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name: "welcome to your to do list"
});
const item2=new Item({
  name: "hit the + button to add the new item"
});
const item3=new Item({
  name: "<--Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];

const listschema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("List",listschema);







const workItems = [];

app.get("/", function(req, res) {

  Item.find({},function(err,founditems){

    if(founditems.length==0){
      
      Item.insertMany(defaultItems,function(err){
     
     if(err){
       
      console.log(err);
     
      }else{
       console.log("succesfully added");
     }

    });

       res.redirect("/")
    
      }else{

      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
   
  });

});


app.post("/", function(req, res){
  

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name: itemName
  });

  
  if(listName=== "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundList){
    foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }); 
  }
 
});

app.post("/delete",(req,res)=>{
  const checkeditemsid= req.body.checkbox;
  const listName=req.body.listName;
  if(listName=="Today"){
    Item.findByIdAndDelete(checkeditemsid,function(err){
      if(!err){
        console.log("succesfully deleted checke it item");
        res.redirect("/");
      }
  });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkeditemsid}}},{useFindAndModify: false},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/:opt",function(req,res){
   const opt= _.capitalize(req.params.opt);

   List.findOne({name: opt},function(err,foundList){
     if(!err){
       if(!foundList){
        const list= new List({
          name:opt,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+opt);
       }else{
         res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
       }
     }
   });
   
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
