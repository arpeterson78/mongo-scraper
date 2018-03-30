var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

// Initialize Express
var app = express();

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Database configuration
var databaseUrl = "news-scraper";
var collections = ["articles"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
  console.log("Database Error:", error);
});

app.get("/", function (req, res) {
  res.render('home');
})

app.get("/all", function (req, res) {

  db.articles.find({}).sort({ time: -1 }).limit(20, function (error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }

  })
});

app.get("/saved", function (req, res) {
  db.articles.find({ "saved": true }, function (error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }
  })
})

app.get("/scrape", function (req, res) {

  request("http://www.rotoworld.com/headlines/nba/0/Basketball-Headlines", function (error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".pb").each(function (i, element) {

      var image = $(element).find("img").attr("src");
      var title = $(element).find(".player").children("a").text();
      var report = $(element).find(".report").children("p").text();
      var summary = $(element).find(".impact").text().trim();
      var date = $(element).find(".date").text().trim();

      //   If this found element had both a title and a link
      if (image && title && report && summary && date) {
        // Insert the data in the scrapedData db
        db.articles.insert([{
          image: image,
          title: title,
          report: report,
          summary: summary,
          date: date,
          time: Date.now(),
          saved: false,
          comments: []
        }],
          function (err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
          });
      }
    });
  });
  res.send("Scrape Complete");
});

app.post("/save", function (req, res) {
  var id = req.body.id;
  db.articles.update({ "_id": mongojs.ObjectId(id) }, { $set: { "saved": true } });
})

app.post("/remove", function (req, res) {
  console.log("/remove", "line 99")
  var id = req.body.id;
  db.articles.update({ "_id": mongojs.ObjectId(id) }, { $set: { "saved": false } });
})

app.listen(3000, function () {
  console.log("App running on port 3000!");
});