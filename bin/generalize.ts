// converting export json from http://screeps.dissi.me to something usable

import { readFileSync, writeFileSync } from "fs";
import * as _ from "lodash";

let input = JSON.parse(readFileSync(process.argv[2]).toString());

let output = {};

let center = {
  x: Number(process.argv[3]),
  y: Number(process.argv[4]),
};

let roadPointsMap = {};

let connectedPoints = {};

const FORM_CONNECTIONS = {
  // "road": 1,
  "extension": 1,
};

class Point {
  x: number;
  y: number;
  roadX: number;
  roadY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equalTo(point: Point) {
    return this.x === point.x && this.y === point.y;
  }
}

class ConnectedPoints {
  path: Array<Point> = [];
  left: Point;
  right: Point;
}

input.buildings.road.pos.forEach((roadPoint) => {
  roadPointsMap[roadPoint.x - center.x] = roadPointsMap[roadPoint.x - center.x] || {};
  roadPointsMap[roadPoint.x - center.x][roadPoint.y - center.y] = {
    added: false,
    listOfConnectedPoints: [],
  };
});

for (let building in input.buildings) {
  output[building] = [];
  connectedPoints[building] = [];
  for (let i = 0; i < input.buildings[building].pos.length; i++) {
    let point: Point = new Point(
      input.buildings[building].pos[i].x - center.x,
      input.buildings[building].pos[i].y - center.y,
    );

    // if (building in FORM_CONNECTIONS) {
      let found = false;
      for (
        let x = point.x - 1;
        x <= point.x + 1 && !found;
        x++
      ) {
        if (roadPointsMap[x]) {
          for (
            let y = point.y - 1;
            y <= point.y + 1 && !found;
            y++
          ) {
            if ((x !== point.x || y !== point.y) && roadPointsMap[x][y]) {
              let xyPoint = new Point(x, y);
              let removals = [];

              // if (building === "road") {
              //   roadPointsMap[x][y].listOfConnectedPoints
              //   .forEach((connectedPoints: ConnectedPoints) => {
              //     if (connectedPoints.left.equalTo(xyPoint)) {
              //       connectedPoints.path.unshift(point);
              //       connectedPoints.left = point;
              //       removals.push(connectedPoints);
              //     } else if (connectedPoints.right.equalTo(xyPoint)) {
              //       connectedPoints.path.push(point);
              //       connectedPoints.right = point;
              //       removals.push(connectedPoints);
              //     }
              //   });
  
              //   removals.forEach((connectedPoints: ConnectedPoints) => {
              //     roadPointsMap[x][y].listOfConnectedPoints.splice(
              //       roadPointsMap[x][y].listOfConnectedPoints.indexOf(connectedPoints), 1);
              //     roadPointsMap[point.x][point.y].listOfConnectedPoints.push(connectedPoints);
              //   });
  
              //   if (removals.length === 0) {
              //     if (roadPointsMap[point.x] && roadPointsMap[point.x][point.y]) {
              //       if (roadPointsMap[point.x][point.y].added) {
              //         let newConnectedPoints = new ConnectedPoints();
              //         newConnectedPoints.path = [xyPoint, point];
              //         newConnectedPoints.left = xyPoint;
              //         newConnectedPoints.right = point;
              //         connectedPoints[building].push(newConnectedPoints);
              //         roadPointsMap[x][y].listOfConnectedPoints.push(newConnectedPoints);
              //         roadPointsMap[point.x][point.y].listOfConnectedPoints.push(newConnectedPoints);
              //       } else {
              //         roadPointsMap[point.x][point.y].added = true;
              //       }
              //     }
              //   }
              // }

              if (building !== "road") {
                point.roadX = x;
                point.roadY = y;
                found = true;
              }
            }
          }
        }
      }
    // } else {
    // }
    output[building].push(point);
  }

  // if (building in FORM_CONNECTIONS) {
  //   output[building] = _.concat(connectedPoints[building].map((connectedPoints: ConnectedPoints) => {
  //     return connectedPoints.path;
  //   }));
  // }
}

writeFileSync(process.argv[5], `export default ${JSON.stringify(output)}`);
