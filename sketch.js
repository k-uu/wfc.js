const WIDTH = 600;
const HEIGHT = 600;
const ZIMA = [22, 184, 243];

const N = 3;
let patterns = [];
let pset = [];
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

  for (let y = 0; y < ih / 2; y++) {
    for (let x = 0; x < iw / 2; x++) {

      for (let r = 0; r < 4; r++) {

        // rotation 90
        push();
        imageMode(CENTER);
        translate(iw / 2, ih / 2);
        rotate(HALF_PI * r);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N)); //convert pixels to string

        // flip on horizontal axis
        push();
        imageMode(CENTER);
        translate(iw / 2, ih / 2);
        scale(1, -1);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N));

        // flip on vertical axis
        push();
        imageMode(CENTER);
        translate(iw / 2, ih / 2);
        scale(-1, 1);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N));
      }
    }
  }

  // extract pixels from each pattern and concat them into string with '_' as separator so that Set can compare values.
  pset = [...new Set(patterns.map(p => {
    p.loadPixels();
    return p.pixels.join('_');
  }))];


  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent("canvas");

  let c = 0;
  for (let i = 0; i < pset.length; i++) {
    for (let j = i + 1; j < pset.length; j++) {
      if (compatible(pset[i], pset[j], 3)) {
        let img1 = createImage(3, 3);
        img1.loadPixels();
        let g = pset[i].split('_').map(p => parseInt(p));
        for (let k = 0; k < 36; k++) {
          img1.pixels[k] = g[k];
        }
        img1.updatePixels();
        image(img1, c += 11, 30, 10, 10);

        let img2 = createImage(3, 3);
        img2.loadPixels();
        let r = pset[j].split('_').map(p => parseInt(p));
        for (let k = 0; k < 36; k++) {
          img2.pixels[k] = r[k];
        }
        img2.updatePixels();
        image(img2, c += 11, 30, 10, 10);
      }
    }
  }
  // for (let i = 0; i < patterns.length; i++) {
  //   image(patterns[i], 10, i * 5, 5, 5);
  // }


}

function draw() {
  // background(51);
}

// Returns true if the two patterns are identical
function equalPattern(p1, p2) {
  return p1 === p2;
}

// Takes two 3*3 patterns and returns true if they are compatible along the given direction with p1 as reference point
function compatible(p1, p2, dir) {

  // since each pixel takes up 4 indices (RGBA), the indices for each pixel in a 3*3 image are multiples of 4. The overlapping model then requires the comparison of 2 rows (north, south) or two columns (west, east)
  faces = [
    [0, 12, 24, 4, 16, 28], //west
    [0, 4, 8, 12, 16, 20], //north
    [4, 16, 28, 8, 20, 32], //east
    [12, 16, 20, 24, 28, 32] //south
  ];

  // take string of pixels and turn back into array
  p1 = p1.split('_').map(p => parseInt(p));
  p2 = p2.split('_').map(p => parseInt(p));

  let f0 = faces[dir];

  let f1 = faces[(dir + 2) % 4];

  for (let i = 0; i < 6; i++) {
    for (let r = 0; r < 4; r++) {
      if (p1[f0[i] + r] !== p2[f1[i] + r]) {
        return false;
      }
    }
  }

  return true;
}