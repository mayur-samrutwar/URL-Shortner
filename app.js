//
//
// Required NPM modules
//
//
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
//
//
// encoder and decoder functions
//
//
function toBase62(n) {
  if (n === 0) {
    return '0';
  }
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  while (n > 0) {
    result = digits[n % digits.length] + result;
    n = parseInt(n / digits.length, 10);
  }

  return result;
}


function fromBase62(s) {
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = 0;
  for (var i=0 ; i<s.length ; i++) {
    var p = digits.indexOf(s[i]);
    if (p < 0) {
      return NaN;
    }
    result += p * Math.pow(digits.length, s.length - i - 1);
  }
  return result;
}
//
//
//app.use
//
//
app.use(express.urlencoded({extented: true}));
app.use(express.json())
app.set("view engine", "ejs");
app.use(express.static('public'));
//
//
// Connect MondoDB
//
//
mongoose.connect("mongodb+srv://admin-mayur:TestUrl9@url-shortner.gxbtm.mongodb.net/urlDB", {useNewUrlParser: true, useUnifiedTopology: true});
//
//
// Create Schemas
//
//
const urlSchema ={
    id: Number,
    longURL: String
}
//
//
// Create Model
//
//
const urlModel = mongoose.model("main", urlSchema);
//
//
// GET Methods
//
//
app.get("/", function (req, res){
    urlModel.find({}, function (err, urls){
       if (urls.length === 0){
           const newURL = new urlModel({
            id: 1,
            longURL: "aa"
        })
        newURL.save()
           res.redirect("/")
       }
       else {
           res.render("index", {shortURL: "shortURL"});
       }
    })
});


app.get("/:externalURL", function (req, res){
    urlModel.find({}).sort({_id: -1}).limit(1).then((products) => {
        const codedURL = req.params.externalURL;
        const decodedURLID = fromBase62(codedURL);
        const newID = products[0].id;
        if (decodedURLID <= newID){
            urlModel.find({id: decodedURLID}, function (err, data){
        const url = data[0].longURL;
        res.redirect(url);
        });
        }
        else {
            res.render("404")
        }
    })


})
//
//
// POST Method
//
//
app.post("/", function (req, res){

   urlModel.find({}).sort({_id: -1}).limit(1).then((products) => {
        const newID = products[0].id + 1;
        const long = req.body.longURL;
        const newURL = new urlModel({
        id: newID,
        longURL: long
    })
       const shortURL = "url0shortner.herokuapp.com/" + toBase62(newID)
       newURL.save()
       res.render("index", {shortURL: shortURL})
    })
});
//
//
// PORT Listen
//
//
app.listen(process.env.PORT || 3000, function (){
    console.log("Server running on port 3000");
});