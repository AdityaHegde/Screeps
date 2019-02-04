import { Logger } from "src/Logger";

abstract class BaseClass {
  id: string;
  static className: string;
  static memoryName: string;
  static idProperty: string;

  logger: Logger;

  constructor(id = "") {
    if (id === "") {
      if (!Memory.ids) {
        Memory.ids = {};
      }
      if (!Memory.ids[this.constructor["memoryName"]]) {
        Memory.ids[this.constructor["memoryName"]] = 0;
      }
      id = "" + ++Memory.ids[this.constructor["memoryName"]];
    }

    this.id = id;
  }

  static getInstanceById(id: string): BaseClass {
    return new (this as any)(id);
  }
}

export default BaseClass;
