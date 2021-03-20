const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require('mongoose');
// const request=require("request");
const https=require("https");
// const ejs=require("ejs");

const date=require(__dirname+"/date.js");

const app=express();
const _=require("lodash");


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true });

const itemsSchema = {
    name:String
};
// { useNewUrlParser: true }
const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to Your To Do List"
});
const item2=new Item({
    name:"Hit the + button to add a new item."
});
const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);



app.get("/",function(req,res){

    

    Item.find({},function(err,foundItems){
        // console.log(foundItems);
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                try{
                
                    console.log("Successfully added default items to Database");
                }
                catch(err){
                    console.log(err);
                }
            });
            res.redirect("/");
        }else{
        res.render("list",{listTitle:"Today",newListItems: foundItems});
        }
    });
});
// mongoose.connection.close();

app.post("/",function(req,res){

    const itemName=req.body.newItem;
    const listName=req.body.list;

    const item=new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today")
    {
        Item.findByIdAndRemove(checkedItemId,function(err){

            if(!err){
                console.log("Deleted Item Successfully");
                
            }
            res.redirect("/");
        });
    }else{
     List.findOneAndUpdate({name:listName} , {$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName);
        }
     });
         
    
    }

   


    // const itemName=req.body.newItem;

    // const item=new Item({
    //     name:itemName
    // });

    // item.save();
    // res.redirect("/");


});

app.get("/:customListName",function(req,res){

    const customLisatName=_.capitalize(req.params.customListName);

    List.findOne({name:customLisatName}, function(err,foundList){
            if(!err){
                if(!foundList){
                    // console.log("DOesn't exists!");
                    const list=new List({
                        name:customLisatName,
                        items:defaultItems
                    });
                
                    list.save();
                    res.redirect("/"+customLisatName);
                }else{
                    res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
                }
            }
    });

   

   
});

app.listen(3000,function(){
    console.log("app is listening on port 3000");
});

