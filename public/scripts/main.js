

function resize() {

  //initial
  w = c.width = window.innerWidth -18,
    h = c.height = window.innerHeight  -99,
    ctx = c.getContext('2d'),

    //parameters
    total = (w / 8) | 0,
    accelleration = .03,
    lineAlpha = .05,
    range = 30,

    //afterinitial calculations
    size = w / total,
    occupation = w / total,
    repaintColor = 'rgba(255, 255, 255, .02 )'
  colors = [],
    dots = [],
    dotsVel = [];

  //setting the colors' hue
  //and y level for all dots
  var portion = 360 / total;
  for (var i = 0; i < total; ++i) {
    colors[i] = portion * i;

    dots[i] = h;
    dotsVel[i] = 10;
  }

  function anim() {
    window.requestAnimationFrame(anim);

    ctx.fillStyle = repaintColor;
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < total; ++i) {
      var currentY = dots[i] - 1;
      dots[i] += dotsVel[i] += accelleration;

      for (var j = i + 1; j < i + range && j < total; ++j) {
        if (Math.abs(dots[i] - dots[j]) <= range * size) {
          ctx.strokeStyle = 'hsla(hue, 80%, 50%, alp)'.replace('hue', (colors[i] + colors[j] + 360) / 2 - 180).replace('alp', lineAlpha);
          ctx.beginPath();
          ctx.moveTo(i * occupation, dots[i]);
          ctx.lineTo(j * occupation, dots[j]);
          ctx.stroke();
        }
      }
      if (dots[i] > h && Math.random() < .01) {
        dots[i] = dotsVel[i] = 0;
      }
    }
  }
  anim();
};
window.addEventListener('resize', resize, false);
resize(); 