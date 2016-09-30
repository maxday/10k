var requestObj;
var exportResult;

//document.getElementById("takeScreenshot").addEventListener('click', takeScreenshot);

function takeScreenshot(e) {
  e.preventDefault();
  var url = encodeURIComponent(document.getElementById("takeScreenshotURL").value);
	requestObj = new XMLHttpRequest();
	requestObj.addEventListener("load", screenshotCompleted, null);
	requestObj.open("GET", "/screenshot/" + url, true);
	requestObj.send(null);
}

function screenshotCompleted() {
  console.log("load completed");
  console.log(JSON.parse(requestObj.response));
  exportResult = JSON.parse(requestObj.response);
  var screenShotResult = document.getElementById("screenshotResult");
  screenShotResult.innerHTML = "";
  var img = document.createElement("img");
  img.src = "/screenshots/" + JSON.parse(requestObj.response).filename;
  img.width = 800;
  screenShotResult.appendChild(img);
  console.log(img);
  console.log(screenShotResult);
}
