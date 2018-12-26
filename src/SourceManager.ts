import BaseClass from "src/BaseClass";
import SourceWrapper from "src/SourceWrapper";
import Decorators from "src/Decorators";
import MemoryMap from "src/MemoryMap";
import ControllerRoom from "src/ControllerRoom";

@Decorators.memory()
export default class SourceManager extends BaseClass {
  @Decorators.instanceMapInMemory(SourceWrapper)
  sources: MemoryMap<string, SourceWrapper>;

  @Decorators.inMemory()
  pointer: number = 0;

  @Decorators.inMemory()
  totalAvailableSpaces: number = 0;

  // TODO: hook this up
  controllerRoom: ControllerRoom;

  constructor(controllerRoom: ControllerRoom) {
    super();
    this.controllerRoom = controllerRoom;
  }

  addSources() {
    let sources = this.controllerRoom.room.find(FIND_SOURCES);
    sources.forEach((source, index) => {
      this.sources.set(index, new SourceWrapper(source));
    });
    this.totalAvailableSpaces = 0;
    this.sources.forEach((sourceWrapper) => {
      this.totalAvailableSpaces += sourceWrapper.availableSpaces;
    });
  }

  initSources() {
    this.sources.forEach((source) => {
      source.init();
    });
  }

  // Return a source with a free space around it and claim it
  // If no souce is found, return the source with least creeps waiting
  findAndClaimSource(creep) {
    let nowaiting;
    let i = this.pointer;

    do {
      let sourceWrapper = this.sources.get(i);
      for (let j = 0; j < sourceWrapper.spaces.length; j++) {
        if (sourceWrapper.spaces[j].count === 0) {
          this.pointer = (this.pointer + 1) % this.sources.size;
          return sourceWrapper.claim(creep, j);
        } else if (!nowaiting && sourceWrapper.spaces[j].count === 1) {
          nowaiting = [sourceWrapper, j];
        }
      }
      i = (i + 1) % this.sources.size;
    } while (i !== this.pointer && i < this.sources.size);

    return nowaiting && nowaiting[0].claim(creep, nowaiting[1]);
  }
}
