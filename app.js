const express=require('express');
const bodyParser=require('body-parser');
const {promisify}=require('util');
var ejs=require('ejs');
const mongoose=require('mongoose');
const e = require('express');
const app=express();
app.use(express.json());
const _=require('lodash');

let items=['buy food','buy drinks'];
 let workItems=[];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology:true});
const itemsSchema={
  name:String
};
const Item=mongoose.model(
 'Item',
  itemsSchema
);
const item1=new Item({
  name:"Welcome to ToDo List"
});
const item2=new Item({
  name:"Hit the + button to add new Item"
});
const item3=new Item({
  name:"---Hit this to delete an item---"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model('List',listSchema);

// 

app.get("/", (req, res)=> {





  Item.find({}).then( function( foundItems,err){
    if(foundItems.length==0){
      Item.insertMany(defaultItems).then(function(err){
          if(err){
           console.log(err);
          }
           else{
             console.log("Successfully Saved Default Items to DB");
          }
        });
        res.redirect("/"); 
    }
   
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
      foundItems.forEach(function(item){
        return item.name;
      });
});
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList,err){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect('/+customListName');
      }else{
       res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  });
  

})
app.post('/',(req,res)=>{
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName=="Today"){
  item.save();
  res.redirect('/');
  }else{
    List.findOne({name:listName}).then(function(foundList,err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    })
  }
});
app.listen(3000);
app.get('/work',(req,res)=>{
  res.render("list",{listTitle:"Work List",newListItems:workItems});

});

app.post('/work',(req,res)=>{
  let item=req.body.newItem;
  workItems.push(item);
  res.redirect('/work');

})
app.post('/delete',function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(err){
      if(!err){
        console.log("Sucessfully Deleted the Item");
        res.redirect('/');
      }
  
  
    
  })
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(err){
    if(!err){
      console.log("Sucessfully Updated the Item");
        res.redirect('/'+listName);
    }
  })
}
});
