// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

function intersection(setA, setB) {
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

// returns true if setA is a subset of setB: are all elements of setA in setB?
function isSubset(setA, setB) {
  for (const elem of setA) {
    if (!setB.has(elem)) {
      return false;
    }
  }
  return true;
}