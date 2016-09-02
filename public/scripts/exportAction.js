document.addEventListener('DOMContentLoaded', loadExport, false);

var requestObj;
var exportResult;

document.getElementById("exportLess").addEventListener('click', exportLess);
document.getElementById("exportSass").addEventListener('click', exportSass);

function loadExport() {
	requestObj = new XMLHttpRequest();
	requestObj.addEventListener("load", loadComplete, null);
  var params = window.location.pathname.split("/");
  var params = params[params.length-1];
	requestObj.open("GET", "/export/" + params, true);
	requestObj.send(null);
}

function loadComplete() {
  console.log("load completed");
  console.log(requestObj);
  exportResult = JSON.parse(requestObj.response);
}

function exportLess(e) {
  document.getElementById("exportResult").innerHTML = exportColor("less");
  e.preventDefault();
}

function exportSass(e) {
  document.getElementById("exportResult").innerHTML = exportColor("sass");
  e.preventDefault();
}

function exportColor(kind) {
  var length = exportResult[kind].length;
  var result = "";
  for(var i=0; i<length; ++i) {
    result += exportResult[kind][i] + "<br />";
  }
  return result;
}
