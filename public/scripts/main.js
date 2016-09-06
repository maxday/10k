/*
     //initial

      function resize() {
 
  var
  w = c.width = window.innerWidth,
     h = c.height = window.innerHeight -83,
    ctx = c.getContext('2d'), 
    
    //parameters
    total = (w/8)|0,
    accelleration = .05,
    lineAlpha = .02,
    range = 25,
    
    //afterinitial calculations
    size = w/total,
    occupation = w/total,
    repaintColor = 'rgba(0, 0, 0, 0)'
    colors = [],
    dots = [],
    dotsVel = [];

//setting the colors' hue
//and y level for all dots
var portion = 360/total;
for(var i = 0; i < total; ++i){
  colors[i] = portion * i; 
  dots[i] = h;
  dotsVel[i] = 5;
}
 

function anim(){
  window.requestAnimationFrame(anim); 
  ctx.fillStyle = repaintColor;
  ctx.fillRect(10, 10, w, h);
  
  for(var i = 0; i < total; ++i){
    var currentY = dots[i] - 1;
    dots[i] += dotsVel[i] += accelleration;
    
    for(var j = i+1; j < i+range && j < total; ++j){
      if(Math.abs(dots[i] - dots[j]) <= range*size){
        ctx.strokeStyle = 'hsla(hue, 80%, 50%, alp)'.replace('hue', (colors[i] + colors[j] + 360)/2 - 70).replace('alp', lineAlpha);
        ctx.beginPath();
        ctx.moveTo(i * occupation, dots[i]);
        ctx.lineTo(j * occupation, dots[j]);
        ctx.stroke();
      }
    }
    
    if(dots[i] > h && Math.random() < .01){
      dots[i] = dotsVel[i] = 0;
    }
  }
}
anim();
};

window.addEventListener('resize', resize, false);

resize();













*/




$(document).ready(function(){
	
	// Variables
	var clickedTab = $(".tabs > .active");
	var tabWrapper = $(".tab__content");
	var activeTab = tabWrapper.find(".active");
	var activeTabHeight = activeTab.outerHeight();
	
	// Show tab on page load
	activeTab.show();
	
	// Set height of wrapper on page load
	tabWrapper.height(activeTabHeight);
	
	$(".tabs > li").on("click", function() {
		
		// Remove class from active tab
		$(".tabs > li").removeClass("active");
		
		// Add class active to clicked tab
		$(this).addClass("active");
		
		// Update clickedTab variable
		clickedTab = $(".tabs .active");
		
		// fade out active tab
		activeTab.fadeOut(250, function() {
			
			// Remove active class all tabs
			$(".tab__content > li").removeClass("active");
			
			// Get index of clicked tab
			var clickedTabIndex = clickedTab.index();

			// Add class active to corresponding tab
			$(".tab__content > li").eq(clickedTabIndex).addClass("active");
			
			// update new active tab
			activeTab = $(".tab__content > .active");
			
			// Update variable
			activeTabHeight = activeTab.outerHeight();
			
			// Animate height of wrapper to new tab height
			tabWrapper.stop().delay(50).animate({
				height: activeTabHeight
			}, 500, function() {
				
				// Fade in active tab
				activeTab.delay(50).fadeIn(250);
				
			});
		});
	});
	
	// Variables
	var colorButton = $(".colors li");
	
	colorButton.on("click", function(){
		
		// Remove class from currently active button
		$(".colors > li").removeClass("active-color");
		
		// Add class active to clicked button
		$(this).addClass("active-color");
		
		// Get background color of clicked
		var newColor = $(this).attr("data-color");
		
		// Change background of everything with class .bg-color
		$(".bg-color").css("background-color", newColor);
		
		// Change color of everything with class .text-color
		$(".text-color").css("color", newColor);
	});
});