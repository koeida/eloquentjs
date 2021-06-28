class PGroup {
  constructor(old) {
    if (old === undefined) {
      this._values = []
    } else {
      this._values = old._values.slice(0);
    }
  }

  add(v) {
    if (!this._values.includes(v)) {
      let newPGroup = new PGroup(this);
      newPGroup._values.push(v);
      return newPGroup;
    } else {
      return this;
    }
  }

  delete(v) {
    let newPGroup = new PGroup(this);
    newPGroup._values = newPGroup._values.filter(x => x != v);
    return newPGroup;
  }

  has(v) {
    return this._values.includes(v);
  }
}
PGroup.empty = new PGroup();

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.assert(a.has('a'));
console.assert(ab.has('a'));
console.assert(ab.has('b'));
console.assert(!b.has('a'));
console.assert(b.has('b'));
console.assert(!a.has("b"));
console.assert(!b.has("a"));