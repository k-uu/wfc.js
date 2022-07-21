const ZIMA = [22, 184, 243];

const ROWS = 50;
const COLMS = 50;
const N = 3;
const AREA = N * N;
const WIDTH = COLMS * AREA;
const HEIGHT = ROWS * AREA;

let pset = [];
let W = new Map();
let A = new Map();
let H = new Map();
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
  img = loadImage('assets/flower.png');
}


function setup() {
  noStroke();
  pixelDensity(1);

  iw = img.width;
  ih = img.height;

  let patterns = [];

  for (let y = 0; y < ih / 2; y++) {
    for (let x = 0; x < iw / 2; x++) {

      for (let r = 0; r < 4; r++) {

        // rotation 90 degrees
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

  let npat = pset.length;


  for (let i = 0; i < ROWS * COLMS; i++) {
    W.set(i, new Set([...Array(npat).keys()]));
    H.set(i, npat);
  }

  // set starting point by reducing its entropy
  let startIdx = random([...Array(ROWS * COLMS).keys()]);
  H.set(startIdx, npat - 1);


  for (let i = 0; i < npat; i++) {
    let pdir = []
    for (let d = 0; d < 4; d++) {
      pdir.push(new Set());
    }
    A.set(i, pdir);
  }


  // compare patterns to populate adjacency rules
  for (let i = 0; i < npat; i++) {
    for (let j = i + 1; j < npat; j++) {
      for (let dir = 0; dir < 4; dir++) {
        if (compatible(pset[i], pset[j], dir)) {
          A.get(i)[dir].add(j);
          A.get(j)[(dir + 2) % 4].add(i);
        }
      }
    }
  }

  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent("canvas");


  //test adjacency rules
  let target = 8;
  let arr = A.get(target);

  let imgc = createImage(3, 3);
  imgc.loadPixels();
  let g = pset[target].split('_').map(p => parseInt(p));
  for (let k = 0; k < 36; k++) {
    imgc.pixels[k] = g[k];
  }
  imgc.updatePixels();
  image(imgc, WIDTH / 2, HEIGHT / 2, 10, 10);

  for (let d = 0; d < 4; d++) {
    let c = 0;
    for (let adj of Array.from(arr[d])) {
      c++;
      let img = createImage(3, 3);
      img.loadPixels();
      let g = pset[adj].split('_').map(p => parseInt(p));
      for (let k = 0; k < 36; k++) {
        img.pixels[k] = g[k];
      }
      img.updatePixels();
      push()
      translate(WIDTH / 2, HEIGHT / 2);
      switch (d) {
        case 0:
          image(img, c * -11, 0, 10, 10);
          break;
        case 1:
          image(img, 0, c * -11, 10, 10);
          break;
        case 2:
          image(img, c * 11, 0, 10, 10);
          break;
        case 3:
          image(img, 0, c * 11, 10, 10);
          break;
      }
      pop();
    }
  }

  // test patterns
  console.log(npat);
  for (let i = 0; i < npat; i++) {
    let img = createImage(3, 3);
    img.loadPixels();
    let g = pset[i].split('_').map(p => parseInt(p));
    for (let k = 0; k < 36; k++) {
      img.pixels[k] = g[k];
    }
    img.updatePixels();
    image(img, i * 11, 30, 10, 10);
  }

}

function draw() {
  // noLoop();
  if (!H.size) {
    noLoop();
    return;
  }
  //  Select index that corresponds to cell with least entropy (TRY MAKING INTO HEAP)
  let minima = [...H.entries()].reduce((prev, curr) => curr[1] < prev[1] ? curr : prev);

  let hMinIdx = minima[0];

  // Pick a random tile to collapse to
  let patCollapsed = random(Array.from(W.get(hMinIdx)));
  W.set(hMinIdx, new Set([patCollapsed]));
  H.delete(hMinIdx);

  let stack = [hMinIdx];
  // propagation
  while (stack.length) {

    let curr = stack.pop();
    for (const [d, [dx, dy]] of dir.entries()) {
      let x = (curr % ROWS + dx) % ROWS;
      let y = (Math.floor(curr / ROWS) + dy) % COLMS;
      let neighbor = x + y * ROWS;
      // if the neighbor has not collapsed
      if (H.has(neighbor)) {

        // get possible neighboring tiles in the direction adjacent to curr cell
        let possible = new Set();

        for (const pat of Array.from(W.get(curr))) {
          A.get(pat)[d].forEach(p => possible.add(p));
        }


        let available = W.get(neighbor);

        // update cell if there are more available tiles than possible
        if (isSuperset(available, possible)) {
          let intersect = intersection(possible, available);


          if (!intersect.size) {
            console.log("Contradiction")
            noLoop();
            return;
          }
          W.set(neighbor, intersect);
          H.set(neighbor, intersect.size + random(0.1));
          stack.push(neighbor);
        }
      }
    }
  }
  let color = pset[patCollapsed].split('_').map(p => parseInt(p));
  fill(color[0], color[1], color[2]);
  rect((hMinIdx % ROWS) * AREA, (Math.floor(hMinIdx / ROWS)) * AREA, AREA, AREA);

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