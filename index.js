var express            = require("express");
var ejs                = require('ejs');
var screenshot         = require("node-server-screenshot");

var port = 8080;

var app = express();

app.use('/static', express.static('public'));

app.get('/', function (request, response) {
  response.render('home.ejs' );
});

app.get('/load/:colors', function (request, response) {
  response.render('loadColors.ejs', { colors : request.params.colors } );
});

app.get('/screenshot/', function (request, response) {
  var filename = "screen_" + (new Date().getTime()) + Math.random();
  screenshot.fromURL(request.param('takeScreenshotURL'), "public/screenshots/" + filename, function(){
    response.render('loadColors.ejs', { colors : "1abc9c,3498db,9b59b6,34495e,7f8c8d,e67e22", screenshotImg : filename } );
  });

})

app.get('/screenshot/:url', function (request, response) {
  var filename = "screen_" + (new Date().getTime()) + Math.random();
  screenshot.fromURL(request.params.url, "public/screenshots/" + filename, function(){
    response.status(200).send({ "success" : true, "filename" : filename });
  });
})

app.get('/export/:colors', function (request, response) {

  var colors = {
    sass : sass(request.params.colors),
    less : less(request.params.colors)
  }

  response.status(200).send(colors);
});

app.get('/export/:kind/:colors', function (request, response) {
  if(request.params.kind === "less") {
    response.render('loadColors.ejs', {
      colors : request.params.colors,
      exportColor : less(request.params.colors)
    });
  }
  else if(request.params.kind === "sass") {
    response.render('loadColors.ejs', {
      colors : request.params.colors,
      exportColor : sass(request.params.colors)
    });
  }
  else {
    response.status(404).send({ errorMsg: 'kind : ' + request.params.kind + ' is incorrect' });
  }
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


function less(colors) {
  var res = [];
  var colorArray = colors.split(",");
  var length = colorArray.length;
  for(var i=0;i<length;++i) {
    res.push("@color" + i + ": #" + colorArray[i] + ";");
  }
  return res;
}

function sass(colors) {
  var res = [];
  var colorArray = colors.split(",");
  var length = colorArray.length;
  for(var i=0;i<length;++i) {
    res.push("$color" + i + ": #" + colorArray[i] + ";");
  }
  return res;
}

app.listen(port);
