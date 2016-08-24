var express     = require("express");
var ejs         = require('ejs');

var port = 8080;

var app = express();

app.use('/static', express.static('public'));

app.get('/', function (request, response) {
  response.render('home.ejs');
});

app.listen(port);
