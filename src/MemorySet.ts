export default class MemorySet<T> extends Set {
  memory: Array<any>;
  serializer: (value) => any;
  deserializer: (value: T) => T;

  constructor(
    memory: Array<any>,
    serializer: (value) => any,
    deserializer: (value: T) => T
  ) {
    super();

    this.memory = memory;
    this.serializer = serializer;
    this.deserializer = deserializer;

    this.memory.forEach((memoryEntry) => {
      super.add(this.deserializer(memoryEntry));
    });
  }

  get size(): number {
    return this.memory.length;
  }

  add(value: T) {
    if (!this.has(value)) {
      super.add(value);
      this.memory.push(this.serializer(value));
    }
    return this;
  }

  delete(value: T) {
    if (this.has(value)) {
      super.delete(value);
      this.memory.splice(this.memory.indexOf(this.serializer(value)), 1);
      return true;
    }
    return false;
  }

  replace(arr: Array<T>) {
    this.memory.splice(0, this.memory.length);
    this.clear();
    arr.forEach((ele) => {
      this.add(ele);
    });
  }
}
