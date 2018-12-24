export default class MemoryMap<K, T> extends Map {
  memory: Object;
  serializer: (value) => any;
  deserializer: (key, value: T) => T;

  constructor(
    memory: Object,
    serializer: (value) => any,
    deserializer: (key, value: T) => T
  ) {
    super();

    this.memory = memory;
    this.serializer = serializer;
    this.deserializer = deserializer;
  }

  set(key: any, value: T) {
    super.set(key, value);
    this.memory[key] = this.serializer(value);
    return this;
  }

  has(key: any): boolean {
    return key in this.memory;
  }

  get(key: any): T {
    if (!super.has(key) && (key in this.memory)) {
      this.set(key, this.deserializer(key, this.memory[key]));
    }
    return this.get(key);
  }

  delete(key: any) {
    if (super.has(key) || (key in this.memory)) {
      super.delete(key);
      delete this.memory[key];
      return true;
    }
    return false;
  }

  keys() {
    return Object.keys(this.memory) as any;
  }
}
