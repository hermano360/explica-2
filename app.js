var cheerio = require('cheerio')
var express = require('express');
var path = require('path')
const bodyParser = require('body-parser');
var request = require('request')
var http = require("http")
var fs = require('fs')


var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 1234;



app.get('/token', function(req, res) {
  var client_id = 'e9f8db119f1a4493bf9376e73176c9fb'; // Your client id
  var client_secret = '169ed9a5bf9642348e0bd00e816ab635'; // Your secret

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body.access_token);
    }
  });
});


app.post('/artist', function(req, res) {
  var authOptions = {
    url: 'https://api.genius.com/search?q=' + req.body.name,
    headers: {
      'Authorization': 'Bearer JyyGkpwuvX_4Jqi_tTy4tgTDNiyEGMPwTnWZfJaeGbtqvE8mSndf_5I9ilJOWHK8'
    }
  };

  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    }
  });
});

app.post('/artist-bio', function(req, res,next) {
  console.log(req.body)
  request.get(`https://open.spotify.com/artist/${req.body.artistId}`, function(error, response, html) {
    let $ = cheerio.load(html)
    let string = html
    let regex = /Biography: (.*?), Monthly Listeners:/;
    res.send(regex.exec(string)[1])
    })
  });


//Look up social media handles
app.post('/twitter', function(req, res,next) {
  request.get(`https://www.google.com/search?q=${req.body.name}+twitter`, function(error, response, html) {
    let $ = cheerio.load(html)
    let string = $('html').text()
    let regex = /\(@(\w*?)\)/;
    res.send(regex.exec(string)[1])
    })
});

app.post('/facebook', function(req, res,next) {
  request.get(`https://www.google.com/search?q=${req.body.name}+facebook`, function(error, response, html) {
    let $ = cheerio.load(html)
    let string = $('html').text()
    const regex = /https:\/\/www.facebook.com\/(\w+)/;
    res.send(regex.exec(string)[0])
    })
});

app.post('/instagram', function(req, res,next) {
  request.get(`https://www.google.com/search?q=${req.body.name}+instagram`, function(error, response, html) {
    let $ = cheerio.load(html)
    let string = $('html').text()
    let regex = /\(@(\w*?)\)/;
    res.send(regex.exec(string)[1])
    })
});



app.get('/*', function(req, res,next) {
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});




app.listen(port);
console.log("Listening to port", port);
