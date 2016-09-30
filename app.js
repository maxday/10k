var express = require("express");
var ejs = require('ejs');
var path = require('path');

const getColors = require("get-image-colors");

var port = 8080;
/*var LANGUAGE to manage & ADD */
var lang = "en";
var app = express();


app.get('/', function (request, response) {
  response.redirect('/en');
});

app.get('/fr', function (request, response) {
  response.render('home.ejs', getTranslateObject(request));
});

app.get('/en', function (request, response) {
  response.render('home.ejs', getTranslateObject(request));
});

app.get('/it', function (request, response) {
  response.render('home.ejs', getTranslateObject(request));
});


app.get('/:lang/load/:colors', function (request, response) {
  console.log(getTranslateObject(request, { colors: request.params.colors }));
  response.render('loadColors.ejs', getTranslateObject(request, "colors", request.params.colors));
});

app.get('/:lang/disclaimer', function (request, response) {
  response.render('disclaimer.ejs', getTranslateObject(request));
});

app.get('/:lang/about', function (request, response) {
  response.render('about.ejs', getTranslateObject(request));
});



app.get('/screenshot', function (req, resp) {
  console.log("here is screenshot");
  var request = require('request');
  console.log("https://tenkolorsscrenshot.herokuapp.com/screenshot?scrSht=" + req.query.scrSht);
  request('https://tenkolorsscrenshot.herokuapp.com/screenshot?scrSht=' + req.query.scrSht, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var url = "https://tenkolorsscrenshot.herokuapp.com/" + JSON.parse(body).success.replace("./", "");
      console.log("file url = " + url);
      getColors(url, function (err, colors) {
        console.log(err);
        console.log(colors);
        var friendlyColor = transformColors(colors);
        resp.redirect('/' + getLang(req) + '/load/' + friendlyColor);
      })

    }
  });

})

app.get('/screenshot/:url', function (request, response) {
  var filename = "screen_" + (new Date().getTime()) + Math.random();
  screenshot.fromURL(request.params.url, "public/screenshots/" + filename, function () {
    response.status(200).send({ "success": true, "filename": filename });
  });
})

app.get('/export/:colors', function (request, response) {

  var colors = {
    sass: sass(request.params.colors),
    less: less(request.params.colors)
  }

  response.status(200).send(colors);
});

app.get('/export/:kind/:colors', function (request, response) {
  if (request.params.kind === "less") {
    response.render('loadColors.ejs',
      getTranslateObject(
        request,
        "colors", request.params.colors,
        "exportColor", less(request.params.colors))
    )
  }
  else if (request.params.kind === "sass") {
    response.render('loadColors.ejs',
      getTranslateObject(
        request,
        "colors", request.params.colors,
        "exportColor", sass(request.params.colors))
    )
  }
  else {
    response.status(404).send({ errorMsg: 'kind : ' + request.params.kind + ' is incorrect' });
  }
});

app.locals.createDivColor = function (colorName) {
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
  for (var i = 0; i < length; ++i) {
    res.push("@color" + i + ": #" + colorArray[i] + ";");
  }
  return res;
}

function sass(colors) {
  var res = [];
  var colorArray = colors.split(",");
  var length = colorArray.length;
  for (var i = 0; i < length; ++i) {
    res.push("$color" + i + ": #" + colorArray[i] + ";");
  }
  return res;
}

app.listen(port);

function computeHex(col, nb) {
  var r = (parseInt(col[0], 10)).toString(16);
  var g = (parseInt(col[1], 10)).toString(16);
  var b = (parseInt(col[2], 10)).toString(16);
  if (r.length == 1) {
    r = "0" + r;
  }
  if (g.length == 1) {
    g = "0" + g;
  }
  if (b.length == 1) {
    b = "0" + b;
  }
  return r + "" + g + "" + b;
}

function transformColors(colors) {

  var colorsToReturn = "";
  for (var i = 0; i < colors.length; ++i) {
    colorsToReturn += computeHex(colors[i]._rgb) + ",";
  }
  colorsToReturn = colorsToReturn.substring(0, colorsToReturn.length - 1);
  console.log(colorsToReturn);
  return colorsToReturn;
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

function getTranslateObject(request, extraKey0, extraValue0, extraKey1, extraValue1) {
  var toReturn;
  if (getLang(request) === "fr") {
    toReturn = {
      lang: 'fr',
      HomeDescription: '',
      title: '10Kolors - plus de secrets pour vos images',
      baseline: 'Plus de Kolors secrètes dans vos images!',
      noJs: 'JavaScript ne semble pas activé. Merci de l\'activer pour une meilleure expérience :D',
      dropHere: 'Glissez-déposez une image ici.',
      colorFromWebsite: 'Retrouver les couleurs d\'un site',
      placeholdInput: "an http://website or an http://image_link",
      btnKolorize: 'Kolorise!',
      noSupportForCanvas: 'Votre navigateur ne supporte pas le tag HTML5 canvas.',
      footerText: 'Fait avec ❤ par ',
      forText: 'pour',
      exportPalette: 'Exporter palette',
      disclaimer: 'fr Disclamer',
      about: 'fr About',
      aboutTitle: "About 10 Kolors Project for 10KApart competition",

      disclaimFooter: 'Disclaimer',
      github: 'View this project on',
      menuAbout: 'About',
      menuSettings: 'Settings',
      menuExports: 'Export',
      menuKolorize: 'Kolorize',
      menuRezult: 'Rezult'
    }
  }
  if (getLang(request) === "en") {
    toReturn = {
      lang: 'en',
      HomeDescription: 'With 10 Kolors you know what colors make up an image online, a web page or your local picture.',
      title: '10Kolors - no more secrets in your images',
      baseline: 'No more secret Kolors in your images!',
      noJs: 'You don\'t have javascript enabled. Please activate it for a full experience :D',
      dropHere: 'Browse an image or drag it here.',
      colorFromWebsite: 'Get color from a website or an online image',
      placeholdInput: "an http://website or an http://image_link",
      btnKolorize: 'Kolorise!',
      noSupportForCanvas: 'Your browser does not support the HTML5 canvas tag.',
      footerText: 'Built with ❤ by ',
      forText: 'for',
      exportPalette: 'Export palette',
      disclaimer: 'en Disclamer',
      about: "<h2>10 Kolors a 10KApart project<\/h2> This is a web application to be able to detect the colors from any iamges.",
      aboutTitle: "About 10 Kolors Project for 10KApart competition",

      disclaimFooter: 'Disclaimer',
      github: 'View this project on',
      menuAbout: 'About',
      menuSettings: 'Settings',
      menuExports: 'Export',
      menuKolorize: 'Kolorize',
      menuRezult: 'Rezult'
    }
  }
  if (getLang(request) === "it") {
    toReturn = {
      lang: 'it',
      HomeDescription: 'Grazie a 10 Kolors puoi sapere quali colori compongono un\'immagine online, una pagina web o una tua immagine locale.',
      title: '10Kolors - no more secrets in your images',
      baseline: 'Nessun  più colore segreto nelle immagini!',
      noJs: 'You don\'t have javascript enabled. Please activate it for a full experience :D',
      dropHere: 'Sfoglia un\'immagine o trascinarla qui.',
      colorFromWebsite: 'Ottenere colori di un sito web o un\'immagine online',
      placeholdInput: "un http://sitoweb o un http://immagine_online",
      btnKolorize: 'Kolorizza!',
      noSupportForCanvas: 'Your browser does not support the HTML5 canvas tag.',
      footerText: 'Creato con ❤ da ',
      forText: 'for',
      exportPalette: 'Esporta palette colori',
      disclaimer: 'Disclamer',
      about: "<h2>10 Kolors a 10KApart project<\/h2> This is a web application to be able to detect the colors from any iamges.",
      aboutTitle: "About 10 Kolors Project for 10KApart competition",

      disclaimFooter: 'Disclaimer',
      github: 'Guarda questo progetto su',
      menuAbout: 'Riguardo 10K',
      menuSettings: 'Impostazioni',
      menuExports: 'Esporta',
      menuKolorize: 'Kolorizza',
      menuRezult: 'Rizultato'
    }
  }
  toReturn[extraKey0] = extraValue0;
  toReturn[extraKey1] = extraValue1;
  return toReturn;
}


function getLang(request) {
  var paths = request.url.split("/");
  if (paths.length > 1 && paths[1].length === 2) {
    console.log("RETURN = " + paths[1]);
    return paths[1];
  }
  return "en";
}

module.exports = app;
