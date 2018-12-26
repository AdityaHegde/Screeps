// converting export json from http://screeps.dissi.me to something usable

import { readFileSync, writeFileSync } from "fs";

let input = JSON.parse(readFileSync(process.argv[2]).toString());

let output = {};

let center = {
  x: Number(process.argv[3]),
  y: Number(process.argv[4]),
};

for (let building in input.buildings) {
  output[building] = [];
  for (let i = 0; i < input.buildings[building].pos.length; i++) {
    output[building].push([
      input.buildings[building].pos[i].x - center.x,
      input.buildings[building].pos[i].y - center.y,
    ]);
  }
}

writeFileSync(process.argv[5], `export default ${JSON.stringify(output)}`);
