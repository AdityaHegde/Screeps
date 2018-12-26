import Building from "src/building/Building";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";

@Decorators.memory()
export default class Road extends Building {
  static type: BuildableStructureConstant = STRUCTURE_ROAD;

  @Decorators.inMemory()
  type: string = "road";

  getPlannedPositions(buildPlanner: BuildPlanner) {
    let roads: Set<string> = new Set();

    let addRoadPoint = (roadPoint) => {
      let key = `${roadPoint[0]}__${roadPoint[1]}`;
      if (!roads.has(key)) {
        roads.add(key);
        this.planned.push(roadPoint);
      }
    };

    if (buildPlanner.extensionsPattern.road) {
      buildPlanner.extensionsPattern.road.forEach(addRoadPoint);
    }
    if (buildPlanner.labsPattern.road) {
      buildPlanner.labsPattern.road.forEach(addRoadPoint);
    }

    [...buildPlanner.controllerRoom.sourceManager.sources.keys().map((energySourceId) => {
      let energySource = buildPlanner.controllerRoom.sourceManager.sources.get(energySourceId);
      return {
        source: buildPlanner.center,
        target: energySource,
        range: 1
      };
    }), {
      source: buildPlanner.center,
      target: buildPlanner.controllerRoom.room.controller,
      range: 3
    }, {
      source: buildPlanner.center,
      target: buildPlanner.controllerRoom.mineral,
      range: 3
    }].forEach((destinations) => {
      let path = buildPlanner.controllerRoom.room.findPath(destinations.source, destinations.target.pos, {
        maxRooms: 1,
        costCallback: () => {
          return buildPlanner.costMatrix;
        }
      });
      // add the source too
      addRoadPoint([destinations.source.x, destinations.source.y]);

      path.forEach((pathPoint) => {
        addRoadPoint(pathPoint);
      });
    });
  }
}
