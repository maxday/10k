var doc = document.getElementById("dropHere");
var img = new Image();

doc.ondragover = function() {
    console.log("dragover");
    this.className = 'onDragOver';
    return false;
}

doc.ondragleave = function() {
    console.log("dragleave");
    this.className = '';
    return false;
}

doc.ondrop = function (e) {
    console.log("dropped");
    this.className = '';
    e.preventDefault();
    if(e.dataTransfer.files.length > 0) {
      console.log(e.dataTransfer.files[0]);
      read(e.dataTransfer.files[0]);
    }
 }


function read(file) {
   console.log("read");
   var reader = new FileReader();
   reader.onload = function (event) {
     img.src = event.target.result;
   };
   reader.readAsDataURL(file);
}


img.onload = function() {
  var c = document.getElementById("c");
  console.log(c);
  c.width = img.width;
  c.height = img.height;
  var ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);

  var colorData = ctx.getImageData(0, 0, img.height, img.width).data;

  var start = new Date().getTime();
  doIt(colorData);
  var end = new Date().getTime();
  var time = end - start;
  console.log('Execution time: ' + time);
}


function computeId(arr) {
    return arr[0] + 1000 * arr[1] + 1000000 * arr[2];
}



function extract(str) {
    var i;
    for(i = str.length; i < 9; ++i) {
        str = "0" + str;
    }
    return [str.toString().substr(6,3), str.toString().substr(3,3), str.toString().substr(0,3), ];
}

function doIt(colorData) {
  var length = colorData.length;
  //var length = 512;
  var currentColor;
  var currentIndex;
  var colors = [];
  for(var i = length; i > 0; i -= 4)  {
    //i-1 -> alpha
    //i-2 -> blue
    //i-3 -> green
    //i-4 -> red
    if(colorData[i-1] > 0.5) {
      currentColor=[colorData[i-4], colorData[i-3], colorData[i-2]];

      //get an unique index
      currentIndex = computeId(currentColor);
      if(typeof colors[currentIndex] == "undefined") {
        colors[currentIndex] = 1
      }
      else {
        colors[currentIndex]++;
      }
    }
  }

  console.log(colors);

  var sortedKeys = Object.keys(colors).sort(function(a,b){return colors[b]-colors[a]})

  length = sortedKeys.length;

  var all = [];
  var index;
  all.push({ "id" : sortedKeys[0], "nb" : colors[sortedKeys[0]]});
  for(var i=1; i<length; ++i) {
    index = checkForDistance(sortedKeys[i], all, 200);
    if(index == -1) {
      all.push({ "id" : sortedKeys[i], "nb" : colors[sortedKeys[i]]});
    }
    else {
      all[index].nb = all[index].nb + colors[sortedKeys[i]];
    }
  }

  //var tab = extract(colors.keys);
  console.log(all);

  var colors = "";
  for(var i=0; i<all.length; ++i) {
    colors += computeHex(extract(all[i].id), all[i].nb) + ",";
  }
  colors = colors.substring(0, colors.length - 1);
  var lang = window.location.pathname.replace("/","");
  window.location.replace("/" + lang + "/load/" + colors);
}


function checkForDistance(color, colorTab, delta) {
  var diff, length = colorTab.length;
  var splitColor = extract(color);
  for(var i=0;i<length; ++i) {
    var splitColorRef = extract(colorTab[i].id);
    diff = Math.abs(splitColorRef[0] - splitColor[0]) + Math.abs(splitColorRef[1] - splitColor[1]) + Math.abs(splitColorRef[2] - splitColor[2]);
    if(diff < delta) {
      return i;
    }
  }
  return -1;
}

function readfiles(files) {
  var formData = new FormData();
  for (var i=0; i<files.length; i++) {
    previewfile(files[i]);
  }
}

function previewfile(file) {
  var reader = new FileReader();
  reader.onload = function (event) {
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function random(max) {
  var r;
  do {
    r = Math.floor(Math.random()*10e10) % max;
  }
  while(r%4 != 0);
  return r;
}


function randomn(max) {
  var r = Math.floor(Math.random()*10) % 3;
  return t[r];
}

function checkForSim(real, delta, tab) {
  var i = 0;
  var diff1, diff2, diff3;
  for(i=0;i<real.length; ++i) {
    diff = Math.abs(real[i][0][0] - tab[0]) + Math.abs(real[i][0][1] - tab[1]) + Math.abs(real[i][0][2] - tab[2]);
    if(diff < delta) {
      return i;
    }
  }
  return -1;
}


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

function colorAnalysis() {
  var fileInput = document.getElementById("imgsel");
  console.log(fileInput);
  var f = fileInput.files[0];
  read(f);
}
