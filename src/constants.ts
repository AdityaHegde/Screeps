const OK = 1;

const CREEP_REACHED_TARGET = "reachedTarget";
const ERR_COULDNT_MOVE = -20;

const PARALLEL_BUILD_COUNT = 5;

const SPAWN_CREATED = "spawnCreated";
const CREEP_CREATED = "creepCreated";
const RCL_UPDATED = "rclUpdated";
const CONSTRUCTION_SITE_ADDED = "constructionSiteAdded";
const ERR_INVALID_TASK = "invalidTask";
const CREEP_AT_TARGET = "creepAtTarget";

const CONSTRUCTION_SCHEDULED = "constructionScheduled";
const CONSTRUCTION_COMPLETED = "constructionCompleted";

const CONTAINER_BUILT = "containerBuilt";
const WALL_BUILT = "wallBuilt";
const TOWER_BUILT = "towerBuilt";
const EXTENSION_BUILT = "extensionBuilt";
const STRUCURE_BUILT = "strucureBuilt";

const ENERGY_WITHDRAWN = "energyWithdrawn";
const ENERGY_STORED = "energyStored";
const TOWER_USED_ENERGY = "towerUsedEnergy";

const HARVESTER_STORAGE = "harvesterStorage";
const UPGRADER_STORAGE = "upgraderStorage";

const ENEMY_AT_THE_GATE = "enemyAtTheGate";

const ROOM_CLAIMED = "roomClaimed";
const ROOM_SCOUTED = "roomScouted";

const PERIODIC_5_TICKS = "periodic5Ticks";
const PERIODIC_10_TICKS = "periodic10Ticks";
const PERIODIC_20_TICKS = "periodic20Ticks";

export {
  OK,

  SPAWN_CREATED,
  CREEP_CREATED,
  RCL_UPDATED,
  CONSTRUCTION_SITE_ADDED,
  ERR_INVALID_TASK,
  ERR_COULDNT_MOVE,
  CREEP_REACHED_TARGET,
  CREEP_AT_TARGET,

  CONSTRUCTION_SCHEDULED,
  CONSTRUCTION_COMPLETED,

  CONTAINER_BUILT,
  WALL_BUILT,
  TOWER_BUILT,
  EXTENSION_BUILT,
  STRUCURE_BUILT,

  ENERGY_WITHDRAWN,
  ENERGY_STORED,
  TOWER_USED_ENERGY,

  HARVESTER_STORAGE,
  UPGRADER_STORAGE,

  ENEMY_AT_THE_GATE,

  ROOM_CLAIMED,
  ROOM_SCOUTED,

  PERIODIC_5_TICKS,
  PERIODIC_10_TICKS,
  PERIODIC_20_TICKS,

  PARALLEL_BUILD_COUNT,
}
