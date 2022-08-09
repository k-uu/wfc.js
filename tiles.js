function rotateCW90(tile) {
  let width = Math.sqrt(tile.length * 4);
  let height = Math.sqrt(tile.length / 4);
  let newTile = [];

  for (let col = 0; col < width; col += 4) {
    for (let row = height - 1; row >= 0; row--) {
      newTile.push(...tile.slice(width * row + col, width * row + col + 4));
    }
  }
  return newTile;
}

function flipHorizontal(tile) {
  let newTile = [];
  let width = Math.sqrt(tile.length * 4); // there are 4 values per pixel
  for (let row = width - 1; row >= 0; row--) {
    newTile.push(...tile.slice(width * row, width * row + width));
  }
  return newTile;
}

function flipVertical(tile) {
  let newTile = [];
  let width = Math.sqrt(tile.length * 4);
  for (let row = 0; row < width; row++) {
    for (let col = width - 4; col >= 0; col -= 4) {
      newTile.push(...tile.slice(width * row + col, width * row + col + 4));
    }
  }
  return newTile;
}