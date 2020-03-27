import PathPosObject from "src/path/PathPosObject";
import Decorators from "src/Decorators";
import { Log } from "src/Logger";
import BuildingPlan from "src/building/BuildingPlan";

@Decorators.memory("constructionSites")
@Log
export default class ConstructionSiteWrapper extends BuildingPlan {
  @Decorators.instanceInMemory()
  constructionSite: ConstructionSite;

  setConstructionSite(constructionSite: ConstructionSite) {
    this.constructionSite = constructionSite;

    return this;
  }
}
