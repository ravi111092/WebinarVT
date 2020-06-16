var video;
var slider;

function setup() {
  // canvas = createCanvas(640, 480, WEBGL);
  // canvas.id('p5canvas');
  // vid = createVideo('/video/greenscreen.mp4', vidLoad);
  // vid.size(640, 480);

  // video = createCapture(VIDEO);
  // video.size(640, 480);
  // video.id('p5video');


  var seriously = new Seriously();

  var src = seriously.source('#remoteVideo');
  var target = seriously.target('#p5canvas');

  var chroma = seriously.effect('chroma');
  chroma.source = src;
  target.source = chroma;
  var r = 98 / 255;
  var g = 175 / 255;
  var b = 116 / 255;
  chroma.screen = [r, g, b, 1];
  seriously.go();
  
}
