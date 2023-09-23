const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoListDB");
app.set("view engine" , "ejs");

const itemsSchema = new mongoose.Schema({
    name:String
});

const listSchemea = new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});
const List = mongoose.model("List",listSchemea);
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({ name:"do jogging"});
const item2 = new Item({ name:"do 200 pushups"});
const item3 = new Item({ name:"do bathing"});

const defaultItems =[item1,item2,item3];
    
app.get("/",function(req,res){
    const day = date.getDate();
    Item.find({})
    .then(foundItems=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }else{
            res.render("list",{listItem : day , newListItems : foundItems});
        }
    })
    .catch(error =>{
        console.log(error);
    })
});

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);

    
    List.findOne({name:customListName})
    .then(data=>{
        if(!data){
            const list= new List({
                name: customListName,
                items: defaultItems
            })
            list.save();
            // res.render("list",{listItem : data.name , newListItems : data.items});
            console.log("added");
        }else{
            res.render("list",{listItem : data.name , newListItems : data.items});
            console.log("not added");
        }
        res.redirect("/"+customListName);
    })
    .catch(err=>{
        console.log(err);
    })
})
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });
    item.save()
    .catch(error=>{
        if(!error){
            res.redirect("/");
        }else{
            console.log(error);
        }
    }); 
});

app.post("/delete",(req,res)=>{
    let itemId = req.body.checkbox;
    let listsName = req.body.listName;
    // console.log(listsName);
    if( listsName === date.getDate()){
        Item.findByIdAndRemove({_id : itemId})
        .then(data =>{
            console.log(data);
            res.redirect("/");
        })
        .catch(err=>{
            console.log(err);
        })
    }else{
        console.log(listsName);
        List.findOneAndUpdate({name : listsName},{ $pull :{items : {_id : itemId}}})
        .then(foundData =>{
            console.log(foundData);
            res.redirect("/"+listsName);
        })
        .catch(err =>{
            console.log(err);
        });
    }

    
    
});

app.get("/about",function(req,res){
    res.render("about");
});
const port =  process.env.PORT || 8080;

app.listen(port,()=>{
    console.log('App is running at port:',port);
});