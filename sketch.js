const ROWS = 50;
const COLMS = 50;
const N = 3;
const AREA = N * N;
const WIDTH = COLMS * AREA;
const HEIGHT = ROWS * AREA;
const MAX_ITERATIONS = 50;

let pset;
let counts;
let W;
let WInit
let A;
let weightSumInit;
let weightSum
let logWeightSumInit;

let output;
let step = 0;
let iteration_count;




let img;
let iw;
let ih;
let dir = [
  [-1, 0], //west
  [1, 0], //east
  [0, -1], //north
  [0, 1] //south
];

function start() {
  W = new Map(WInit);
  weightSum = new Map(weightSumInit);
  logWeightSum = [...logWeightSumInit];
  output = [];

  // set starting point by reducing its entropy
  let startIdx = random([...Array(ROWS * COLMS).keys()]);
  weightSum.set(startIdx, 1);
}

function preload() {
  img = loadImage('assets/rooms.png');
}

function setup() {
  frameRate(120);
  noStroke();
  pixelDensity(1);
  pset = [];
  counts = new Map();
  WInit = new Map();
  A = new Map();
  weightSumInit = new Map();
  logWeightSumInit = [];

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
        rotate(HALF_PI * r);
        scale(1, -1);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N));

        // flip on vertical axis
        push();
        imageMode(CENTER);
        translate(iw / 2, ih / 2);
        rotate(HALF_PI * r);
        scale(-1, 1);
        image(img, 0, 0);
        pop();
        patterns.push(get(x, y, N, N));
      }
    }
  }
  patterns[0].loadPixels();
  console.log(Array.from(patterns[0].pixels), rotateCW90(Array.from(patterns[0].pixels)));

  // determine frequencies of unique patterns
  patterns.map(p => {
    p.loadPixels();
    return p.pixels.join('_');
  }).forEach(p => {
    if (counts.has(p)) {
      let newVal = counts.get(p) + 1;
      counts.set(p, newVal);
    } else {
      counts.set(p, 1);
    }
  })

  // unique patterns
  pset = Array.from(counts.keys());
  // associated pattern counts
  counts = Array.from(counts.values());

  // number of unique patterns
  let npat = pset.length;

  for (let i = 0; i < ROWS * COLMS; i++) {
    WInit.set(i, new Set([...Array(npat).keys()]));
    weightSumInit.set(i, counts.reduce((sum, weight) => sum += weight, 0));
    logWeightSumInit.push(counts.reduce((sum, weight) => sum += weight * Math.log(weight), 0));
  }



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
          let opposite = (dir + 1) % 2;
          if (dir > 1) {
            opposite += 2;
          }
          A.get(j)[opposite].add(i);
        }
      }
    }
  }

  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent("canvas");

  start();


  function testAdjacencyRules(target) {
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
        push();
        stroke(0);
        textSize(10);
        translate(WIDTH / 2, HEIGHT / 2);
        switch (d) {
          case 0:
            image(img, c * -11, 0, 10, 10);
            c++
            text(adj, c * -11, 0);
            break;
          case 2:
            image(img, 0, c * -11, 10, 10);
            c++
            text(adj, 10, c * -11);
            break;
          case 1:
            image(img, c * 11, 0, 10, 10);
            c++
            text(adj, c * 11, 0);
            break;
          case 3:
            image(img, 0, c * 11, 10, 10);
            c++
            text(adj, 10, c * 11);
            break;
        }
        pop();
      }
    }
  }

  // test patterns
  function testPatterns() {
    let r = 0;
    let c = 0
    for (let i = 0; i < npat; i++) {
      let img = createImage(3, 3);
      img.loadPixels();
      let g = pset[i].split('_').map(p => parseInt(p));
      for (let k = 0; k < 36; k++) {
        img.pixels[k] = g[k];
      }
      img.updatePixels();
      push();
      stroke(0);
      textSize(10);
      image(img, c += 30, 30 + r, 10, 10);
      text(i + "," + counts[i], c, r + 30);
      pop();
      if (c > WIDTH - 40) {
        c = 0;
        r += 20;
      }
    }
  }

  // testPatterns();
  // testAdjacencyRules(0);

  function testIterations() {
    let iter = 0

    iteration:
      while (iter < MAX_ITERATIONS) {
        start();

        while (weightSum.size) {

          let hMinIdx = -1;
          let hMin = Number.MAX_VALUE;

          weightSum.forEach((wSum, idx) => {
            hCurr = Math.log(wSum) - logWeightSum[idx] / wSum;
            if (hCurr < hMin) {
              hMin = hCurr;
              hMinIdx = idx;
            }
          });

          // Pick a random tile to collapse to
          let patCollapsed = randomTile(hMinIdx);
          let alreadyCollapsed = W.get(hMinIdx).size == 1;
          W.set(hMinIdx, new Set([patCollapsed]));
          weightSum.delete(hMinIdx);

          if (!alreadyCollapsed) {

            let stack = [hMinIdx];
            // propagation
            while (stack.length) {

              let curr = stack.pop();
              for (const [d, [dx, dy]] of dir.entries()) {
                let x = (curr % ROWS + dx) % ROWS;
                let y = (Math.floor(curr / ROWS) + dy) % COLMS;
                if (y < 0) {
                  y += COLMS;
                }
                if (x < 0) {
                  x += ROWS;
                }
                let neighbor = x + y * ROWS;

                // if the neighbor has not collapsed
                if (weightSum.has(neighbor)) {

                  // get possible neighboring tiles in the direction adjacent to curr cell
                  let possible = new Set();

                  for (const pat of Array.from(W.get(curr))) {
                    A.get(pat)[d].forEach(p => possible.add(p));
                  }


                  let available = W.get(neighbor);


                  // update cell if available tiles are not all in the possible tiles
                  if (!isSubset(available, possible)) {
                    let intersect = intersection(possible, available);
                    let diff = difference(available, intersect);

                    if (!intersect.size) {
                      iter++
                      console.log("+")
                      document.getElementById("count").innerHTML = iter;
                      continue iteration;
                    }

                    diff.forEach(i => {
                      let weight = counts[i];
                      let prevWeight = weightSum.get(neighbor);
                      weightSum.set(neighbor, prevWeight - weight);
                      logWeightSum[neighbor] -= weight * Math.log(weight);
                    });

                    W.set(neighbor, intersect);
                    stack.push(neighbor);
                  }
                }
              }
            }
          }
          let color = pset[patCollapsed].split('_').map(p => parseInt(p));
          output.push({
            i: hMinIdx,
            c: color.splice(0, 3)
          });
        }
        return iter;
      }
    output = [];
    return -1;
  }

  iteration_count = testIterations()

}

function draw() {

  if (step == output.length) {
    noLoop();
    return;
  }

  let color = output[step].c;
  let idx = output[step].i;
  fill(color[0], color[1], color[2]);
  rect((idx % ROWS) * AREA, (Math.floor(idx / ROWS)) * AREA, AREA, AREA);
  step++;

}

// this could use caching instead of computing the sum every time
function randomTile(idx) {
  sumOfFreq = weightSum.get(idx);
  let pos = Math.floor(Math.random() * (sumOfFreq + 1));
  for (const tileIdx of Array.from(W.get(idx))) {
    let weight = counts[tileIdx];
    if (pos > weight) {
      pos -= weight;
    } else {
      return tileIdx;
    }
  }
  console.log("inconsistent")
}

// Takes two 3*3 patterns and returns true if they are compatible along the given direction with p1 as reference point
function compatible(p1, p2, dir) {

  // since each pixel takes up 4 indices (RGBA), the indices for each pixel in a 3*3 image are multiples of 4. The overlapping model then requires the comparison of 2 rows (north, south) or two columns (west, east)
  faces = [
    [0, 12, 24, 4, 16, 28], //west
    [4, 16, 28, 8, 20, 32], //east
    [0, 4, 8, 12, 16, 20], //north
    [12, 16, 20, 24, 28, 32] //south
  ];

  // take string of pixels and turn back into array
  p1 = p1.split('_').map(p => parseInt(p));
  p2 = p2.split('_').map(p => parseInt(p));

  let f0 = faces[dir];

  let opposite = (dir + 1) % 2;
  if (dir > 1) {
    opposite += 2;
  }
  let f1 = faces[opposite];

  for (let i = 0; i < 6; i++) {
    for (let r = 0; r < 4; r++) {
      if (p1[f0[i] + r] !== p2[f1[i] + r]) {
        return false;
      }
    }
  }

  return true;
}