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

  public fireEvent(eventName, target) {
    this.fireEvents[eventName] = this.fireEvents[eventName] || [];
    if (_.isArray(target)) {
      this.fireEvents[eventName].push(...target);
    } else {
      this.fireEvents[eventName].push(target);
    }
  }

  public fireDelayedEvent(eventName, target) {
    this.delayedEvents[eventName] = this.delayedEvents[eventName] || [];
    if (_.isArray(target)) {
      this.delayedEvents[eventName].push(...target);
    } else {
      this.delayedEvents[eventName].push(target);
    }
  }

  public preTick() {
    for (let eventName in this.delayedEvents) {
      this.fire(eventName, this, this.delayedEvents[eventName]);
      delete this.delayedEvents[eventName];
    }
  }
  
  public tick() {
    // nothing to do
  }
  
  public postTick() {
    if (Game.time % 5 === 0) {
      this.fire(PERIODIC_5_TICKS, 1);
    }
    if (Game.time % 10 === 0) {
      this.fire(PERIODIC_10_TICKS, 1);
    }
    if (Game.time % 20 === 0) {
      this.fire(PERIODIC_20_TICKS, 1);
    }

    for (let eventName in this.fireEvents) {
      this.fire(eventName, this, this.fireEvents[eventName]);
    }
  }

  private fire(eventName: string, target: any, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        let context = deepGet(target, listener.contextPath);
        context[listener.method](...args);
      });
    }
  }
}

let eventBus = new EventBus("memory");

export default eventBus;
