import Runnable from "./Runnable";
import { PERIODIC_5_TICKS, PERIODIC_10_TICKS, PERIODIC_20_TICKS } from "./constants";
import Decorators from "./Decorators";
import BaseClass from "./BaseClass";
import * as _ from "lodash";

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

@Decorators.memory()
class EventBus extends BaseClass implements Runnable {
  @Decorators.inMemory()
  private listeners: any = {};
  @Decorators.inMemory()
  private fireEvents: any = {};
  @Decorators.inMemory()
  private delayedEvents: any = {};

  public subscribe(eventName: string, method: string, contextPath: string) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push({
      method: method,
      contextPath: contextPath
    });
  }

  public fireEvent(eventName, target, ...args) {
    this.fireEvents[eventName] = this.fireEvents[eventName] || [];
    this.fireEvents[eventName].push(target, ...args);
  }

  public fireDelayedEvent(eventName, target, ...args) {
    this.delayedEvents[eventName] = this.delayedEvents[eventName] || [];
    this.delayedEvents[eventName].push(target, ...args);
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
        let context = deepGet(eventDetails[0], listener.contextPath);
        context[listener.method](...eventDetails.splice(1));
      });
    }
  }
}

let eventBus = new EventBus("memory");

export default eventBus;
