import BaseClass from "../BaseClass";
import Decorators from "../Decorators";
import { PARALLEL_BUILD_COUNT } from "src/constants";
import BuildingWrapper from "src/building/BuildingWrapper";
import BuildPlanner from "src/building/BuildPlanner";
import ConstructionSiteWrapper from "src/building/ConstructionSiteWrapper";
import MemorySet from "src/MemorySet";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("buildings")
export default abstract class Building extends BaseClass {
  static type: BuildableStructureConstant;
  static visualColor: string = "white";
  static impassable: boolean = true;

  @Decorators.inMemory()
  type: string;

  paths: Array<any> = [];

  // TODO: handle rebuild
  @Decorators.instanceSetInMemory(BuildingPlan)
  planned: MemorySet<BuildingPlan>;

  @Decorators.instanceSetInMemory(BuildingPlan)
  buildingScheduled: MemorySet<BuildingPlan>;

  @Decorators.instanceSetInMemory(ConstructionSiteWrapper)
  building: MemorySet<ConstructionSiteWrapper>;

  @Decorators.instanceSetInMemory(BuildingWrapper)
  built: MemorySet<BuildingWrapper>;

  @Decorators.instanceSetInMemory(BuildingWrapper)
  repair: MemorySet<BuildingWrapper>;

  abstract getPlannedPositions(buildPlanner: BuildPlanner): Array<BuildingPlan>;

  plan(buildPlanner: BuildPlanner) {
    this.logger.log(`Planning: ${this.type}`);
    this.planned.replace(this.getPlannedPositions(buildPlanner));
    if (this.constructor["impassable"]) {
      this.planned.forEach((plan: BuildingPlan) => {
        buildPlanner.costMatrix.set(plan.x, plan.y, 255);
      });
    }
    this.logger.log(`Planned: ${this.type}. ${this.planned.size} Plans`);
  }

  addPathPosInfoToPlans(buildPlanner: BuildPlanner, plans: Array<BuildingPlan>): Array<BuildingPlan> {
    let planMap: Map<string, BuildingPlan>;
    return plans;
  }

  addCenterToPlan(buildPlanner: BuildPlanner, plans: Array<BuildingPlan>): Array<BuildingPlan> {
    plans.forEach((plan: BuildingPlan) => {
      plan.x += buildPlanner.center.x;
      plan.y += buildPlanner.center.y;
    });
    return plans;
  }

  formBuildingPlansRawPlans(buildPlanner: BuildPlanner, rawPlans: Array<Array<number>>): Array<BuildingPlan> {
    return rawPlans.map((rawPlan) => {
      return new BuildingPlan(`${buildPlanner.controllerRoom.name}_${rawPlan[0]}_${rawPlan[1]}`)
        // TODO
        // .setPos()
        .setXY(rawPlan[0], rawPlan[1]);
    });
  }

  build(buildPlanner: BuildPlanner): boolean {
    if (Game.time % 5 === 0) {
      this.checkBuildingsScheduled(buildPlanner);
    }
    if (Game.time % 25 === 0) {
      this.checkConstructionSites(buildPlanner);
    }

    let c = 0;
    if (this.planned.size === 0) {
      // return true if this type of structure was finished before
      return true;
    }

    let planFulfilled: Array<BuildingPlan> = [];
    let plansFulfilled = () => {
      planFulfilled.forEach((plan) => {
        this.buildingScheduled.add(plan);
        this.planned.delete(plan);
      });
    }

    for (let plan of this.planned) {
      let returnValue = this.buildAt(buildPlanner, plan.x, plan.y);

      // if max sites has been reached or if RCL is not high enough, return
      if (returnValue === ERR_FULL || returnValue === ERR_RCL_NOT_ENOUGH) {
        plansFulfilled();
        // return true if RCL is not high enough, used to skip building a type for the current RCL
        return returnValue === ERR_RCL_NOT_ENOUGH;
      }

      if (returnValue === OK) {
        planFulfilled.push(plan);
      }

      c++;

      if (c >= PARALLEL_BUILD_COUNT) {
        break;
      }
    }

    plansFulfilled();

    // build only one type at a time
    return false;
  }

  checkBuildingsScheduled(buildPlanner: BuildPlanner) {
    this.logger.log(`Checking ${this.buildingScheduled.size} buildings scheduled`);

    let planPlaced: Array<BuildingPlan> = [];
    this.buildingScheduled.forEach((plan: BuildingPlan) => {
      let entitiesAtPlan: Array<any> =
        buildPlanner.controllerRoom.room.lookForAt(LOOK_CONSTRUCTION_SITES, plan.x, plan.y);
      if (entitiesAtPlan.length > 0 && entitiesAtPlan[0].structureType === this.constructor["type"]) {
        let constructionSiteWrapper: ConstructionSiteWrapper =
          new ConstructionSiteWrapper(entitiesAtPlan[0].id)
          .setConstructionSite(entitiesAtPlan[0])
          .setXY(plan.x, plan.y)
          .setPos(plan.pathIdx, plan.pathPos, plan.direction);

        this.building.add(constructionSiteWrapper);
        planPlaced.push(plan);
      }
    });

    planPlaced.forEach((plan: BuildingPlan) => {
      this.buildingScheduled.delete(plan);
    });
  }

  checkConstructionSites(buildPlanner: BuildPlanner) {
    this.logger.log(`Checking ${this.buildingScheduled.size} construction sites`);

    let sitesBuilt: Array<ConstructionSiteWrapper> = [];
    this.building.forEach((buildingSite: ConstructionSiteWrapper) => {
      let entitiesAtPlan: Array<any> =
        buildPlanner.controllerRoom.room.lookForAt(LOOK_STRUCTURES, buildingSite.x, buildingSite.y);
      if (entitiesAtPlan.length > 0 && entitiesAtPlan[0].structureType === this.constructor["type"]) {
        let buildingWrapper: BuildingWrapper =
          new BuildingWrapper(entitiesAtPlan[0].id)
          .setBuilding(entitiesAtPlan[0])
          .setXY(buildingSite.x, buildingSite.y)
          .setPos(buildingSite.pathIdx, buildingSite.pathPos, buildingSite.direction);

        this.built.add(buildingWrapper);
        sitesBuilt.push(buildingSite);
      }
    });

    sitesBuilt.forEach((buildingSite: ConstructionSiteWrapper) => {
      this.building.delete(buildingSite);
    });
  }

  buildAt(buildPlanner: BuildPlanner, x, y) {
    return buildPlanner.controllerRoom.room.createConstructionSite(x, y, this.constructor["type"]);
  }
}
