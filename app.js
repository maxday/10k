var express            = require("express");
var ejs                = require('ejs');
var path               = require('path');

const getColors = require("get-image-colors");

var port = 8080;
/*var LANGUAGE to manage & ADD */
var lang = "en";
var app = express();



app.get('/', function (request, response) {
  response.render('en/home.ejs' );
});

app.get('/en/load/:colors', function (request, response) {
  response.render('en/loadColors.ejs', { colors : request.params.colors } );
});

app.get('/en/disclaimer', function (request, response) {
  response.render('en/disclaimer.ejs');
});

app.get('/en/about', function (request, response) {
  response.render('en/about.ejs');
});

app.get('/screenshot/', function (req, resp) {

  var request = require('request');
  console.log("https://tenkolorsscrenshot.herokuapp.com/screenshot?scrSht=" + req.query.scrSht);
  request('https://tenkolorsscrenshot.herokuapp.com/screenshot?scrSht=' + req.query.scrSht, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var url = "https://tenkolorsscrenshot.herokuapp.com/" + JSON.parse(body).success.replace("./", "");
      console.log("file url = " + url);
      getColors(url, function(err, colors){
        console.log(err);
        console.log(colors);
        var friendlyColor = transformColors(colors);
        resp.redirect('/en/load/' + friendlyColor);
      })

    }
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
    response.render('en/loadColors.ejs', {
      colors : request.params.colors,
      exportColor : less(request.params.colors)
    });
  }
  else if(request.params.kind === "sass") {
    response.render('en/loadColors.ejs', {
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

function computeHex(col, nb) {
  var r = (parseInt(col[0], 10)).toString(16);
  var g = (parseInt(col[1], 10)).toString(16);
  var b = (parseInt(col[2], 10)).toString(16);
  if(r.length == 1) {
    r = "0"+r;
  }
  if(g.length == 1) {
    g = "0"+g;
  }
  if(b.length == 1) {
    b = "0"+b;
  }
  return r+""+g+""+b;
}

function transformColors(colors) {

  var colorsToReturn = "";
  for(var i=0; i<colors.length; ++i) {
    colorsToReturn += computeHex(colors[i]._rgb) + ",";
  }
  colorsToReturn = colorsToReturn.substring(0, colorsToReturn.length - 1);
  console.log(colorsToReturn);
  return colorsToReturn;
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;
