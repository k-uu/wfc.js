const WIDTH = 600;
const HEIGHT = 600;
const ZIMA = [22, 184, 243];

const N = 3;
let patterns = [];
let A = {};
let W = {};
let H = {};
let img;
let iw;
let ih;
let dir = [
  [-1, 0], //west
  [0, -1], //north
  [1, 0], //east
  [0, 1] //south
];

function preload() {
  img = loadImage('assets/tree.png');
}


function setup() {
  noStroke();
  pixelDensity(1);

  iw = img.width;
  ih = img.height;

  console.log(pixels);

  console.log(img);

  for (let y = 0; y < ih / 2; y++) {
    for (let x = 0; x < iw / 2; x++) {

      for (let r = 0; r < 4; r++) {
        push();
        imageMode(CENTER);
        translate(iw / 2, ih / 2);
        rotate(HALF_PI * r);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N));
      }
    }
  }









  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent("canvas");
  for (let i = 0; i < patterns.length; i++) {
    // patterns[i].loadPixels();
    // fill(patterns[i].pixels[0], patterns[i].pixels[1], patterns[i].pixels[2],
    //   patterns[i].pixels[3])
    // rect(i * 10, 0, 10, 10);
    image(patterns[i], 10, i * 5, 5, 5);
  }

  //
  // let i = 63;
  // let j = 62;
  // console.log(compatible(patterns[i], patterns[j], 2));
  // console.log(equalPattern(patterns[i], patterns[j]))
  // image(patterns[j], 0, 30, 10, 10);
  // image(patterns[i], 20, 30, 10, 10);

}

function draw() {
  // background(51);
}

// Returns true if the two image patterns are identical
function equalPattern(p1, p2) {
  p1.loadPixels();
  pix1 = p1.pixels;
  p2.loadPixels();
  pix2 = p2.pixels;

  for (let i = 0; i < pix1.length; i += 4) {
    for (let r = 0; r < 4; r++) {
      if (pix1[i + r] != pix2[i + r]) {
        return false;
      }
    }
  }
  return true;
}

// Takes two 3*3 image patterns and returns true if they are compatible along the given direction with p1 as reference point
function compatible(p1, p2, dir) {

  // since each pixel takes up 4 indices (RGBA), the indices for each pixel in a 3*3 image are multiples of 4. The overlapping model then requires the comparison of 2 rows (north, south) or two columns (west, east)
  faces = [
    [0, 12, 24, 4, 16, 28], //west
    [0, 4, 8, 12, 16, 20], //north
    [8, 20, 32, 4, 16, 28], //east
    [24, 28, 32, 12, 16, 20] //south
  ];

  p1.loadPixels();
  pix1 = p1.pixels;
  p2.loadPixels();
  pix2 = p2.pixels;

  for (let i = 0; i < 6; i++) {
    for (let r = 0; r < 4; r++) {
      if (pix1[faces[dir][i] + r] !=
        pix2[faces[(dir + 2) % 4][i] + r]) {
        return false;
      }
    }
  }

  return true;
}