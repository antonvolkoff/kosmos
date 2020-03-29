let points = [];
let rPoints = [];
let shapeName = "";

let bg = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bg = drawBackground(createGraphics(windowWidth, windowHeight));
}

function draw() {
  image(bg, 0, 0, windowWidth, windowHeight);
  drawLines();

  if (mouseIsPressed) {
    shapeName = "";
    points.push({ x: mouseX, y: mouseY });
    rPoints.push(new Point(mouseX, mouseY, 1));
  }

  if (shapeName != "") {
    textSize(48);
    fill(50, 55, 100);
    textAlign(LEFT);
    text(shapeName, 100, 100);
  }

  drawFPS();
}

function windowResized() {
  bg = drawBackground(createGraphics(windowWidth, windowHeight));
  resizeCanvas(windowWidth, windowHeight);
}

function mouseReleased() {
  points.push(null);

  const recognizer = new QDollarRecognizer();
  const result = recognizer.Recognize(rPoints);

  shapeName = result.Name;
  rPoints = [];
}

function drawBackground(bg) {
  bg.background(244, 248, 252);

  bg.stroke(190);
  bg.strokeWeight(3);

  const spaceBetweenDots = 20;
  const maxColumns = windowWidth / 10;
  const maxRows = windowHeight / 10;

  for(let c = 0; c < maxColumns; c++) {
    for(let r = 0; r < maxRows; r++) {
      bg.point(spaceBetweenDots * c, spaceBetweenDots * r);
    }
  }

  return bg;
}

function drawFPS() {
  let fps = frameRate();
  textSize(16);
  fill(0);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 10, height - 10);
}

function drawLines() {
  strokeCap(ROUND);
  stroke(100, 100, 100);
  strokeWeight(2);
  for(let i = 1; i < points.length; i++) {
    const startPoint = points[i - 1];
    const endPoint = points[i];
    if (startPoint === null || endPoint === null) {
      continue;
    }

    line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  }
}
