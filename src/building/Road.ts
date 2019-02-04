import Building from "src/building/Building";
import Decorators from "src/Decorators";
import BuildPlanner from "src/building/BuildPlanner";
import { Log } from "src/Logger";
import SourceWrapper from "src/SourceWrapper";
import Utils from "src/Utils";
import BuildingPlan from "src/building/BuildingPlan";
import PathInfo from "src/path/PathInfo";

@Decorators.memory("buildings")
@Log
export default class Road extends Building {
  static type: BuildableStructureConstant = STRUCTURE_ROAD;
  static impassable: boolean = false;
  static visualColor: string = "grey";

  @Decorators.inMemory()
  type: string = "road";

  getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan> {
    let roads: Set<string> = new Set();
    let planned: Array<BuildingPlan> = [];

    let addPathInfoToPlan = (pathInfo: PathInfo) => {
      pathInfo.path.forEach((pathPoint, idx) => {
        let key = `${pathPoint.x}__${pathPoint.y}`;
        if (!roads.has(key)) {
          roads.add(key);
          planned.push(new BuildingPlan(`${buildPlanner.controllerRoom.name}_${pathPoint.x}_${pathPoint.y}`)
          .setPos(Number(pathInfo.id), idx, 0)
          .setXY(pathPoint.x, pathPoint.y));
        }
      });
    }

    if (buildPlanner.extensionsPattern.road) {
      this.addRoadToPathManager(buildPlanner,
        this.addCenterToPlan(buildPlanner,
          this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.road))
      ).forEach(addPathInfoToPlan);
    }
    if (buildPlanner.labsPattern.road) {
      this.addRoadToPathManager(buildPlanner,
        this.addCenterToPlan(buildPlanner,
          this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.labsPattern.road))
      ).forEach(addPathInfoToPlan);
    }

    PathFinder.use(true);

    let centerRoomPos =
      new RoomPosition(
        buildPlanner.center.x,
        buildPlanner.center.y,
        buildPlanner.controllerRoom.name
      );
    [...buildPlanner.controllerRoom.sourceManager.sources.keys().map((energySourceId) => {
      let energySource: SourceWrapper =
        buildPlanner.controllerRoom.sourceManager.sources.get(energySourceId);
      return {
        source: centerRoomPos,
        target: energySource.source,
        range: 1,
      };
    }), {
      source: centerRoomPos,
      target: buildPlanner.controllerRoom.room.controller,
      range: 3,
    // TODO
    // }, {
    //   source: centerRoomPos,
    //   target: buildPlanner.controllerRoom.mineral,
    //   range: 3
    }].forEach((destinations) => {
      let path = buildPlanner.controllerRoom.room.findPath(destinations.source, destinations.target.pos, {
        maxRooms: 1,
        range: destinations.range,
        costCallback: () => {
          return buildPlanner.costMatrix;
        },
      });
      
      // add the source too
      path.unshift({
        x: destinations.source.x,
        y: destinations.source.y,
        dx: 0,
        dy: -1,
        direction: TOP
      });

      let pathInfosToDest: Array<PathInfo> =
        buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(path));
      pathInfosToDest.forEach(addPathInfoToPlan);

      destinations.target._toPath = [
        Number(pathInfosToDest[pathInfosToDest.length - 1].id),
        pathInfosToDest[pathInfosToDest.length - 1].path.length - 1
      ];
    });

    return planned;
  }

  addRoadToPathManager(buildPlanner: BuildPlanner, roadPoints: Array<BuildingPlan>): Array<PathInfo> {
    let road = [roadPoints[0]];
    let pathInfos: Array<PathInfo> = [];
    for (let i = 1; i < roadPoints.length; i++) {
      if (Utils.getDistanceBetweenPos(roadPoints[i - 1], roadPoints[i]) <= 1) {
        road.push(roadPoints[i]);
      } else {
        pathInfos.push(...buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(road)));
        road = [roadPoints[i]];
      }
    }
    pathInfos.push(...buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(road)));

    return pathInfos;
  }
}
