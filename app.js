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
  var client_id = '56cf8f99087b42a782fdbe27579f9f1e'; // Your client id
  var client_secret = 'c0d3ffe9755940409ac45b0cd5b1245c'; // Your secret

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
  console.log(req.params)
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

app.post('/vividPerformerID', function(req, res,next) {
  var options = {
    method: 'GET',
    url: 'https://webservices.vividseats.com/rest/v2/getPerformer?accessId=1803&performerName='+req.body.name,
    headers:
     { "Content-type": 'application/json',
       Authorization: 'f96c847d-9805-11e7-8349-22000ae8246e' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send((response.body))
  });
});

app.post('/vividEvents', function(req, res,next) {
  var options = {
    method: 'GET',
    url: 'https://webservices.vividseats.com/rest/v2/getEvents?accessId=1803&performerId='+req.body.id,
    headers:
     { "Content-type": 'application/json',
       Authorization: 'f96c847d-9805-11e7-8349-22000ae8246e' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body)
  });
});





app.get('/*', function(req, res,next) {
  console.log(req.params)
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});




app.listen(port);
console.log("Listening to port", port);
