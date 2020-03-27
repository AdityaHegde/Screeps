import BaseClass from "src/BaseClass";
import Decorators from "src/Decorators";
import MemoryMap from "src/MemoryMap";
import Role from "src/role/Role";
import RoleSuite from "src/role/RoleSuite";
import EarlyGameRoleSuite from "src/role/EarlyGameRoleSuite";
import MidGameRoleSuite from "src/role/MidGameRoleSuite";
import ControllerRoom from "src/ControllerRoom";
import { Task } from "src/task/Task";
import CreepWrapper from "src/CreepWrapper";
import { Log } from "src/Logger";
import Builder from "src/role/Builder";
import Harvester from "src/role/Harvester";
import Hauler from "src/role/Hauler";
import Upgrader from "src/role/Upgrader";
import WorkerRole from "src/role/WorkerRole";

const ROLES_MAP = {
  [Builder.roleName]: Builder,
  [Harvester.roleName]: Harvester,
  [Hauler.roleName]: Hauler,
  [Upgrader.roleName]: Upgrader,
  [WorkerRole.roleName]: WorkerRole,
};

for (const roleName in ROLES_MAP) {
  if (ROLES_MAP.hasOwnProperty(roleName)) {
    ROLES_MAP[roleName].initClass();
  }
}

@Decorators.memory("roleManager")
@Log
export default class RoleManager extends BaseClass {
  @Decorators.instancePolymorphMapInMemory(ROLES_MAP)
  roles: MemoryMap<string, Role>;

  roleSuites: Array<typeof RoleSuite> = [EarlyGameRoleSuite, MidGameRoleSuite];

  @Decorators.inMemory(() => 0)
  curRoleSuite: number;

  controllerRoom: ControllerRoom;

  constructor(controllerRoom: ControllerRoom) {
    super(controllerRoom.name);

    this.controllerRoom = controllerRoom;
  }

  tick() {
    let roleSuite = this.roleSuites[this.curRoleSuite];

    // if its time to switch to next role
    if (roleSuite.switchRole(this.controllerRoom)) {
      this.logger.log("Switching role suite");
      this.curRoleSuite++;
      roleSuite = this.initCurRoles();

      // distribute creeps from older roles to new ones
      for (let role in roleSuite.creepDistribution) {
        let i = 0, j = 0;
        let oldRoleInst = this.roles.get(role);
        for (let creepName in oldRoleInst.creeps) {
          let targetRoleName = roleSuite.creepDistribution[role][i];
          let newRole = this.roles.get(targetRoleName);
          let creep = CreepWrapper.getCreepByName(creepName);
          j = i;
          this.roles.get[creep.role.name].removeCreep(creep);
          while (newRole && newRole.creepsCount >= newRole.getMaxCount()) {
            if (i === j) {
              // if the loop has come all the way back to the beginig, suicide the creep as there are no free roles
              creep.suicide();
              delete Memory.creeps[creep.name];
              newRole = null;
            } else {
              // else get the next role
              targetRoleName = roleSuite.creepDistribution[role][i];
              newRole = this.roles.get(targetRoleName);
            }
            i = (i + 1) % roleSuite.creepDistribution[role].length;
          }
          if (newRole) {
            newRole.addCreep(creep);
          }
        }
        this.roles.delete(role);
      }
    }

    this.controllerRoom.tasks.forEach((taskName, task: Task) => {
      task.tick();
    });

    // execute in specified order to give some roles priority
    roleSuite.order.forEach((roleName) => {
      this.roles.get(roleName).tick();
      // this.logger.log(roleName, ":", Object.keys(this.roles.get(roleName).creeps).map((creepName) => {
      //   let creep = Game.creeps[creepName];
      //   return creep.name + " (" + (creep.task ? this.rolesInfo.tasks[creep.task.tier][creep.task.current] : "") + ")";
      // }).join("  "));
    });
  }

  initCurRoles() {
    let roleSuite = this.roleSuites[this.curRoleSuite];
    // initialize new roles
    roleSuite.order.forEach((roleName) => {
      this.logger.log("New role", roleName);
      this.roles.set(roleName,
        new ROLES_MAP[roleName](this.controllerRoom.name + "_" + roleName)
          .setControllerRoom(this.controllerRoom));
      this.roles.get(roleName).init();
    });
    return roleSuite;
  }
}
