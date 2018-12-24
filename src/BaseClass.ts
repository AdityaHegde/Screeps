class BaseClass {
  id: string;
  static className: string;
  static memoryName: string;
  static idProperty: string;

  constructor(id = "") {
    if (id === "") {
      id = "" + ++Memory.ids[BaseClass.memoryName];
    }

    this.id = id;
  }
}

export default BaseClass;
