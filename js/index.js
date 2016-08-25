var express     = require("express");
var ejs         = require('ejs');

var port = 8080;

var app = express();

app.use('/static', express.static('public'));

app.get('/', function (request, response) {
  response.render('home.ejs');
});

app.get('/load/:colors', function (request, response) {
  response.render('loadColors.ejs', { colors : request.params.colors } );
});

app.locals.createDivColor  = function(colorName) {
  var iDiv = window.document.createElement('div');
  iDiv.className = 'block';
  iDiv.style.width = "300px";
  iDiv.style.height = "30px";
  iDiv.style.border = "1px solid";
  iDiv.style.backgroundColor = "#" + colorName;
  iDiv.innerHTML = "#" + colorName;
  document.getElementById("result").appendChild(iDiv);
}

app.listen(port);
