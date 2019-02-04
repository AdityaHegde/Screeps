import Runnable from "./Runnable";
import { PERIODIC_5_TICKS, PERIODIC_10_TICKS, PERIODIC_20_TICKS } from "./constants";
import Decorators from "./Decorators";
import BaseClass from "./BaseClass";
import * as _ from "lodash";
import { Log } from "src/Logger";
import ControllerRoom from "src/ControllerRoom";

function deepGet(base, path) {
  let paths = path.split(/\./);
  let ret = base;
  paths.forEach((path) => {
    if (ret) {
      if (ret.get) {
        ret = ret.get(path);
      } else {
        ret = ret[path];
      }
    }
  });
  return ret;
}

@Decorators.memory("events")
@Log
class EventBus extends BaseClass implements Runnable {
  // @Decorators.inMemory(() => {return {}})
  private listeners: any = {};

  // @Decorators.inMemory(() => {return {}})
  private fireEvents: any = {};

  @Decorators.inMemory(() => {return {}})
  private delayedEvents: any = {};

  public subscribe(eventName: string, method: string, contextPath: string) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push({
      method: method,
      contextPath: contextPath
    });
  }

  public fireEvent(eventName, target: ControllerRoom, ...args) {
    this.fireEvents[eventName] = this.fireEvents[eventName] || [];
    this.fireEvents[eventName].push(target.name, ...args);
  }

  public fireDelayedEvent(eventName, target: ControllerRoom, ...args) {
    this.delayedEvents[eventName] = this.delayedEvents[eventName] || [];
    this.delayedEvents[eventName].push(target.name, ...args);
  }

  public preTick() {
    for (let eventName in this.delayedEvents) {
      this.fire(eventName, this.delayedEvents[eventName]);
      delete this.delayedEvents[eventName];
    }
  }

  public tick() {
    // nothing to do
  }

  public postTick() {
    if (Game.time % 5 === 0) {
      this.fire(PERIODIC_5_TICKS, [this]);
    }
    if (Game.time % 10 === 0) {
      this.fire(PERIODIC_10_TICKS, [this]);
    }
    if (Game.time % 20 === 0) {
      this.fire(PERIODIC_20_TICKS, [this]);
    }

    for (let eventName in this.fireEvents) {
      this.fire(eventName, this.fireEvents[eventName]);
    }
  }

  private fire(eventName: string, eventDetails: Array<any>) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        let controllerRoom = ControllerRoom.getRoomByRoomName(eventDetails[0]);
        if (controllerRoom) {
          let context = deepGet(controllerRoom, listener.contextPath);
          if (context) {
            context[listener.method](...eventDetails.splice(1));
          }
        }
      });
    }
  }
}

let eventBus = new EventBus("memory");

export default eventBus;
