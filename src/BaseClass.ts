import { Logger } from "src/Logger";

abstract class BaseClass {
  id: string;
  static className: string;
  static memoryName: string;
  static idProperty: string;

  logger: Logger;

  constructor(id = "") {
    if (id === "") {
      const ids = (Memory as any).ids || {};
      if (!(Memory as any).ids) {
        (Memory as any).ids = ids;
      }
      if (!ids[this.constructor["memoryName"]]) {
        ids[this.constructor["memoryName"]] = 0;
      }
      id = "" + ++ids[this.constructor["memoryName"]];
    }

    this.id = id;
  }

  static getInstanceById(id: string): BaseClass {
    return new (this as any)(id);
  }
}

export default BaseClass;
