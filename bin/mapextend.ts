class MapE extends Map {
  keys() {
    console.log("keys");
    return super.keys();
  }

  values() {
    console.log("values");
    return super.values();
  }

  entries() {
    console.log("entries");
    return super.entries();
  }

  forEach(method) {
    for (let [key, value] of this.entries()) {
      method(key, value);
    }
  }
}

let a = new MapE();
a.set(1, 1);
a.set(2, 2);

a.forEach((v, k) => {console.log(`${k}: ${v}`)});