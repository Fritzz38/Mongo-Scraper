// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
//var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
//app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsweek_db", {
  useMongoClient: true
});
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the wsj website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.newsweek.com/", function(error, response, html) {
    if (error) {
      console.log(error);
    }
    else {
    
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      var promiseArray = [];
      
      // scrape the articles
      // loop thru scrape articles
      $(".info").each(function(i, element) {        

        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(element).children("h3").text();
        result.summary = $(element).children(".summary").text();
        result.link = $(element).children("h3").children("a").attr("href");
        
        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and link)
        // save each article as new entry in mongoose
        
        var entry = new Article(result);

        promiseArray.push(entry.save());

        return i < 19;
      
      });
      
      Promise.all(promiseArray).then(function(docs) {
        console.log(docs);
        res.json(docs);
      }).catch(function(err) {
        console.log(err);
        res.send("Error savings article");
      });

    } 

  });

});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    // Log any errors     
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// html route for viewing saved articles
app.get("/saved", function(req, res) {
  res.sendFile(path.join(__dirname, "public", "saved.html"));
});


app.get("/saved/articles", function(req, res) {
  Article.find( {saved:true}, function(error, doc) {
    if(error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});



app.post("/saved/", function(req, res) {

  Article.findOneAndUpdate({ "_id": req.body.id }, {$set: {saved: true}})
    .exec(function(err,doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
  });

});


// these two routes below for adding note to an article 

app.get("/articles/:id", function(req, res) {

  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });

});



app.post("/articles/:id", function(req, res) {

    var newNote = new Note(req.body)

      newNote.save(function(error, doc) {
        if (error) {
          console.log(error);
        }
        else {
          Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
          .exec(function(error, doc) {
            if (error) {
              console.log(error);
            }
            else {
              res.send(doc);
            }
          });
        }  
    });

});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!!");
});

