(function (_) {
'use strict';

_ = _ && _.hasOwnProperty('default') ? _['default'] : _;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */







function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}



function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

/**
 * @class Heap
 */
class Heap {
    /**
     * @constructor
     * @param {Array} initArray
     * @param {Function} compareFunction Return value > 0 to have a above b in the heap.
     */
    constructor(initArray = [], compareFunction = function (a, b) { return a - b; }) {
        this.valueToIdxMap = new Map();
        this.array = initArray;
        this.compareFunction = compareFunction;
        this.array.forEach((e, i) => {
            this.valueToIdxMap.set(e, i);
        });
    }
    add(value) {
        this.valueToIdxMap.set(value, this.array.length);
        this.array.push(value);
        this.moveUp(this.array.length - 1);
    }
    remove() {
        if (this.array.length > 0) {
            let value = this.array[0];
            this.valueToIdxMap.delete(value);
            if (this.array.length > 1) {
                this.array[0] = this.array.pop();
                this.valueToIdxMap.set(this.array[0], 0);
                this.moveDown(0);
            }
            else {
                this.array.pop();
            }
            return value;
        }
    }
    delete(value) {
        let idx = this.valueToIdxMap.get(value);
        if (idx >= 0) {
            this.valueToIdxMap.delete(value);
            if (idx < this.array.length - 1) {
                this.array[idx] = this.array.pop();
                this.valueToIdxMap.set(this.array[idx], idx);
                this.moveDown(idx);
            }
            else {
                this.array.pop();
            }
        }
    }
    // doesnt work on literals
    update(value) {
        let idx = this.valueToIdxMap.get(value);
        if (!this.moveUp(idx)) {
            this.moveDown(idx);
        }
    }
    moveUp(idx) {
        let movedUp = false;
        while (idx > 0) {
            let parentIdx = (idx - 1) >> 1;
            if (this.compareFunction(this.array[idx], this.array[parentIdx]) > 0) {
                this.swap(idx, parentIdx);
                idx = parentIdx;
                movedUp = true;
            }
            else {
                break;
            }
        }
        return movedUp;
    }
    moveDown(idx) {
        let movedDown = false;
        while (idx < this.array.length) {
            let childIdx = 2 * idx + 1;
            if (childIdx >= this.array.length) {
                break;
            }
            if (childIdx + 1 < this.array.length &&
                this.compareFunction(this.array[childIdx + 1], this.array[childIdx]) > 0) {
                childIdx++;
            }
            if (this.compareFunction(this.array[childIdx], this.array[idx]) > 0) {
                this.swap(idx, childIdx);
                idx = childIdx;
                movedDown = true;
            }
            else {
                break;
            }
        }
        return movedDown;
    }
    swap(idx0, idx1) {
        let val0 = this.array[idx0];
        this.array[idx0] = this.array[idx1];
        this.array[idx1] = val0;
        this.valueToIdxMap.set(this.array[idx0], idx0);
        this.valueToIdxMap.set(this.array[idx1], idx1);
    }
}

class MemoryMap extends Map {
    constructor(memory, serializer, deserializer) {
        super();
        this.memory = memory;
        this.serializer = serializer;
        this.deserializer = deserializer;
    }
    get size() {
        return Object.keys(this.memory).length;
    }
    set(key, value) {
        super.set(key, value);
        this.memory[key] = this.serializer(value);
        return this;
    }
    has(key) {
        return key in this.memory;
    }
    get(key) {
        if (!super.has(key) && (key in this.memory)) {
            this.set(key, this.deserializer(key, this.memory[key]));
        }
        return super.get(key);
    }
    delete(key) {
        if (super.has(key) || (key in this.memory)) {
            super.delete(key);
            delete this.memory[key];
            return true;
        }
        return false;
    }
    keys() {
        return Object.keys(this.memory);
    }
    forEach(method) {
        for (let key of this.keys()) {
            method(key, this.get(key));
        }
    }
}

class MemorySet extends Set {
    constructor(memory, serializer, deserializer) {
        super();
        this.memory = memory;
        this.serializer = serializer;
        this.deserializer = deserializer;
        this.memory.forEach((memoryEntry) => {
            super.add(this.deserializer(memoryEntry));
        });
    }
    get size() {
        return this.memory.length;
    }
    add(value) {
        if (!this.has(value)) {
            super.add(value);
            this.memory.push(this.serializer(value));
        }
        return this;
    }
    delete(value) {
        if (this.has(value)) {
            super.delete(value);
            this.memory.splice(this.memory.indexOf(this.serializer(value)), 1);
            return true;
        }
        return false;
    }
    replace(arr) {
        this.memory.splice(0, this.memory.length);
        this.clear();
        arr.forEach((ele) => {
            this.add(ele);
        });
    }
}

function getInstanceFromClassObject(ClassObject, value) {
    if (ClassObject.getInstanceById) {
        return ClassObject.getInstanceById(value);
    }
    else {
        return new ClassObject(value);
    }
}
class Decorators {
    /**
     * Adds memory support to the class.
     *
     * @method memory
     * @param idProperty {String}
     */
    static memory(memoryName, idProperty = "id") {
        return function (classObject) {
            let classMatch = classObject.toString().match(/class (\w*)/);
            let functionMatch = classObject.toString().match(/\[Function: (.*)\]/);
            let className = (classMatch && classMatch[1]) || (functionMatch && functionMatch[1]);
            classObject.className = className.toLowerCase();
            classObject.memoryName = memoryName;
            classObject.idProperty = idProperty;
            Object.defineProperty(classObject.prototype, "memory", {
                get: function () {
                    if (!Memory[memoryName]) {
                        Memory[memoryName] = {};
                    }
                    Memory[memoryName][this[idProperty]] = Memory[memoryName][this[idProperty]] || {};
                    return Memory[memoryName][this[idProperty]];
                },
                set: function (value) {
                    if (!Memory[memoryName]) {
                        Memory[memoryName] = {};
                    }
                    Memory[memoryName][this[idProperty]] = value;
                },
                enumerable: true,
                configurable: true
            });
        };
    }
    /**
     * Defines an alias to another property.
     *
     * @method alias
     * @param targetProperty {String}
     */
    static alias(targetProperty) {
        return function (classPrototype, fieldName, descriptor) {
            descriptor = descriptor || {};
            descriptor.get = function () {
                return _.get(this, targetProperty);
            };
            descriptor.set = function (value) {
                _.set(this, targetProperty, value);
            };
            return descriptor;
        };
    }
    /**
     * Defines a property which gets cached and returns from cache.
     *
     * @method inCache
     * @param getter {Function} Function that returns the initial value for 'property'.
     */
    static inCache(getter) {
        return function (classPrototype, fieldName, descriptor) {
            descriptor = descriptor || {};
            let _fieldName = "_" + fieldName;
            descriptor.get = function () {
                // if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _fieldName)) {
                    this[_fieldName] = getter.call(this, ...arguments);
                }
                // return from cache
                return this[_fieldName];
            };
            descriptor.set = function (value) {
                // save the value to the cache
                this[_fieldName] = value;
            };
            return descriptor;
        };
    }
    /**
     * Defines a property which gets mirrored in memory. Prototype should have a property 'memory'
     *
     * @method inMemory
     * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to null.
     * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
     * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
     */
    static inMemory(getter = function () { return null; }, serializer = function (value) { return value; }, deserializer = function (value) { return value; }) {
        return function (classPrototype, fieldName, descriptor) {
            descriptor = descriptor || {};
            let _fieldName = "_" + fieldName;
            descriptor.get = function () {
                // if the property is not defined in cache yet, get it from memory
                if (!_.has(this, _fieldName)) {
                    // if the property is not present in the memory either, use the getter function passed to get the value and store in memory
                    if (!_.has(this.memory, fieldName)) {
                        this[_fieldName] = getter.call ? getter.call(this, ...arguments) : getter;
                        this.memory[fieldName] = this[_fieldName] && serializer.call(this, this[_fieldName]);
                    }
                    else {
                        this[_fieldName] = deserializer.call(this, this.memory[fieldName]);
                    }
                }
                // return from cache
                return this[_fieldName];
            };
            descriptor.set = function (value) {
                // save the serialized value to memory and value to cache
                if (value !== null && value !== undefined) {
                    this.memory[fieldName] = serializer.call(this, value);
                }
                this[_fieldName] = value;
            };
            return descriptor;
        };
    }
    /**
     * Defines a property which references an instance. Instance is stored by 'id' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method instanceInMemory
     * @param [ClassObject] {Class} Class for the instance. If not specified, Game.getObjectById is used.
     * @param [getter] {Function} Function that returns the initial value for 'property'. Defaults value to empty instance of ClassObject.
     */
    static instanceInMemory(ClassObject = null, getter = null) {
        return this.inMemory(() => {
            return getter ? getter.call(this) : (ClassObject && new ClassObject());
        }, (instance) => {
            return instance && instance.id;
        }, (instanceId) => {
            if (instanceId) {
                let instance;
                if (ClassObject) {
                    instance = new ClassObject(instanceId);
                }
                else {
                    instance = Game.getObjectById(instanceId);
                }
                // instance[this.constructor.className] = this;
                return instance;
            }
        });
    }
    /**
     * Defines a property which references an instance. Instance is stored by 'name' in memory.
     * Prototype should have a property 'memory'.
     *
     * @method instanceInMemoryByName
     * @param memoryName {String} memoryName for the class of instance on Game.
     */
    static instanceInMemoryByName(memoryName) {
        return this.inMemory(null, (instance) => {
            return instance.name;
        }, (instanceName) => {
            let instance = Game[memoryName][instanceName];
            // instance[this.constructor.className] = this;
            return instance;
        });
    }
    /**
     * Defines position property which is stored in memory as "x:y".
     *
     * @method posInMemory
     */
    static posInMemory() {
        return this.inMemory(null, function (pos) {
            return pos.x + ":" + pos.y;
        }, function (pos) {
            if (pos && this.room) {
                let xy = pos.split(":");
                return new RoomPosition(Number(xy[0]), Number(xy[1]), this.room.name);
            }
            return null;
        });
    }
    /**
     * Defines path property which is stored in memory using Room.serializePath.
     * And retrieved from memory using Room.deserializePath.
     *
     * @method pathInMemory
     */
    static pathInMemory() {
        return this.inMemory(null, (value) => {
            return Room.serializePath(value);
        }, (value) => {
            return Room.deserializePath(value);
        });
    }
    /**
     * Defines CostMatrix property which is stored in memory using costMatrix.serialize.
     * And retrieved from memory using PathFinder.CostMatrix.deserialize.
     *
     * @method costMatrixInMemory
     */
    static costMatrixInMemory() {
        return this.inMemory(null, (costMatrix) => {
            return costMatrix.serialize();
        }, (costMatrix) => {
            return PathFinder.CostMatrix.deserialize(costMatrix);
        });
    }
    /**
     * Defines Heap property which is stored in memory as array.
     * And retrieved from memory by creating a new Heap instance.
     *
     * @method heapInMemory
     */
    static heapInMemory() {
        return this.inMemory(function () {
            return new Heap();
        }, (heap) => {
            return heap.array;
        }, (array) => {
            return new Heap(array);
        });
    }
    /**
     * Defines a property which acts as a set. Stored serialized but used deserialized.
     *
     * @method setInMemory
     * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
     * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
     */
    static setInMemory(serializer = function (value) { return value; }, deserializer = function (value) { return value; }) {
        return function (classPrototype, fieldName, descriptor) {
            let _fieldName = "_" + fieldName;
            descriptor = descriptor || {};
            descriptor.get = function () {
                // if set is not cached, assign _mapValue and get the instance for any stored ids in memory
                if (!_.has(this, _fieldName)) {
                    // if set is not in memory, assign mapValue to memory
                    if (!_.has(this.memory, fieldName)) {
                        this.memory[fieldName] = [];
                    }
                    this[_fieldName] = new MemorySet(this.memory[fieldName], serializer, deserializer);
                }
                return this[_fieldName];
            };
            return descriptor;
        };
    }
    /**
     * Defines a property which references a set of instances in memory by id.
     *
     * @method instanceSetInMemory
     * @param ClassObject {Class} Class for instance.
     */
    static instanceSetInMemory(ClassObject) {
        return this.setInMemory(function (value) {
            return value && value[ClassObject.idProperty];
        }, function (value) {
            return getInstanceFromClassObject(ClassObject, value);
        });
    }
    /**
     * Defines a property which references has a set of instances in memory.
     *
     * @method instancePolymorphSetInMemory
     * @param polymorphMap {Object} Map of class to use.
     */
    static instancePolymorphSetInMemory(polymorphMap, typeKey) {
        return this.setInMemory(function (value) {
            return value && [value[typeKey], value.id];
        }, function (value) {
            return getInstanceFromClassObject(polymorphMap[value[0]], value[1]);
        });
    }
    /**
     * Defines a property which acts as a map. Stored serialized but used deserialized.
     *
     * @method mapInMemory
     * @param [serializer] {Function} Function to serialize value to be stored in memory. Defaults to storing value as is.
     * @param [deserializer] {Function} Function to deserialize value retrieved from memory. Defaults to returning value as is.
     */
    static mapInMemory(serializer = function (value) { return value; }, deserializer = function (key, value) { return value; }) {
        return function (classPrototype, fieldName, descriptor) {
            let _fieldName = "_" + fieldName;
            descriptor = descriptor || {};
            descriptor.get = function () {
                // if map is not cached, assign _mapValue and get the instance for any stored ids in memory
                if (!_.has(this, _fieldName)) {
                    // if map is not in memory, assign mapValue to memory
                    if (!_.has(this.memory, fieldName)) {
                        this.memory[fieldName] = {};
                    }
                    this[_fieldName] = new MemoryMap(this.memory[fieldName], serializer, deserializer);
                }
                return this[_fieldName];
            };
            return descriptor;
        };
    }
    /**
     * Defines a property which references a map of instances in memory by id.
     *
     * @method instanceMapInMemory
     * @param ClassObject {Class} Class for instance.
     */
    static instanceMapInMemory(ClassObject) {
        return this.mapInMemory(function (value) {
            return value && value[ClassObject.idProperty];
        }, function (key, value) {
            return getInstanceFromClassObject(ClassObject, value);
        });
    }
    /**
     * Defines a property which references a map of instances in memory by name.
     *
     * @method instanceMapInMemoryByName
     * @param memoryName {String}
     */
    static instanceMapInMemoryByName(memoryName) {
        return this.mapInMemory(function (value) {
            return value && value.name;
        }, function (key, value) {
            let instance = Game[memoryName][value];
            return instance;
        });
    }
    /**
     * Defines a property which references has a map of instances in memory.
     *
     * @method instancePolymorphMapInMemory
     * @param polymorphMap {Object} Map of class to use.
     */
    static instancePolymorphMapInMemory(polymorphMap) {
        return this.mapInMemory(function (value) {
            return value && value.id;
        }, function (key, value) {
            return getInstanceFromClassObject(polymorphMap[key], value);
        });
    }
    /**
     * Defines map of path.
     *
     * @method pathMapInMemory
     */
    static pathMapInMemory() {
        return this.mapInMemory((value) => {
            return Room.serializePath(value);
        }, (key, value) => {
            return Room.deserializePath(value);
        });
    }
    static getInstanceById(constructor) {
        let instanceByIdMap = new Map();
        return class extends constructor {
            static getInstanceById(id) {
                let instance;
                if (instanceByIdMap.has(id)) {
                    instance = instanceByIdMap.get(id);
                }
                else {
                    instance = (new constructor(id));
                    instanceByIdMap.set(id, instance);
                }
                return instance;
            }
        };
    }
}

class BaseClass {
    constructor(id = "") {
        if (id === "") {
            const ids = Memory.ids || {};
            if (!Memory.ids) {
                Memory.ids = ids;
            }
            if (!ids[this.constructor["memoryName"]]) {
                ids[this.constructor["memoryName"]] = 0;
            }
            id = "" + ++ids[this.constructor["memoryName"]];
        }
        this.id = id;
    }
    static getInstanceById(id) {
        return new this(id);
    }
}

class Logger {
    constructor(label) {
        this.label = label;
    }
    log(...messages) {
        console.log(`[${this.label}]`, ...messages);
    }
    logJSON(json) {
        console.log(JSON.stringify(json));
    }
}
function Log(constructor) {
    let classMatch = constructor.toString().match(/class (\w*)/);
    let functionMatch = constructor.toString().match(/\[Function: (.*)\]/);
    let label = (classMatch && classMatch[1]) || (functionMatch && functionMatch[1]);
    return class extends constructor {
        constructor() {
            super(...arguments);
            this.logger = new Logger(label);
        }
    };
}

let PathPosObject = class PathPosObject extends BaseClass {
    setPos(pathIdx, pathPos, direction) {
        this.pathIdx = pathIdx;
        this.pathPos = pathPos;
        this.direction = direction;
        return this;
    }
};
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathPosObject.prototype, "pathIdx", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathPosObject.prototype, "pathPos", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathPosObject.prototype, "direction", void 0);
PathPosObject = __decorate([
    Log
], PathPosObject);
var PathPosObject$1 = PathPosObject;

var SourceWrapper_1;
let sourceWrapperObjects = new Map();
let SourceWrapper = SourceWrapper_1 = class SourceWrapper extends PathPosObject$1 {
    constructor(id, controllerRoom) {
        super(id);
        this.controllerRoom = controllerRoom;
    }
    setSource(source) {
        this.source = source;
        return this;
    }
    init() {
        // this.pathData is set during planning of roads
        // let path = this.controllerRoom.pathManager.pathsInfo[this.pathIdx].path;
        this.logger.log(`${this.source} - ${this.source && this.source.pos}`);
        let spaces = [];
        let roomTerrain = Game.map.getRoomTerrain(this.source.room.name);
        for (let x = this.source.pos.x - 1; x <= this.source.pos.x + 1; x++) {
            for (let y = this.source.pos.y - 1; y <= this.source.pos.y + 1; y++) {
                if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    spaces.push({
                        x,
                        y,
                        // direction: Utils.getDirectionBetweenPos(this.source.pos, {x, y}),
                        count: 0,
                    });
                }
            }
        }
        // spaces = Utils.sortPositionsByDirection(spaces);
        this.spaces = spaces;
        this.occupiedSpaces = [];
    }
    claim(creep, idx) {
        this.spaces[idx].count++;
        creep.task.source = this.source.id;
        creep.task.space = idx;
        return this.source;
    }
    release(creep) {
        this.spaces[creep.task.space].count--;
        delete creep.task.source;
        delete creep.task.space;
        return this.source;
    }
    static getSourceWrapperById(id, controllerRoom) {
        let sourceWrapper;
        if (sourceWrapperObjects.has(id)) {
            sourceWrapper = sourceWrapperObjects.get(id);
        }
        else {
            sourceWrapper = new SourceWrapper_1(id, controllerRoom);
            sourceWrapperObjects.set(id, sourceWrapper);
        }
        return sourceWrapper;
    }
};
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], SourceWrapper.prototype, "spaces", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], SourceWrapper.prototype, "occupiedSpaces", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], SourceWrapper.prototype, "creepCount", void 0);
__decorate([
    Decorators.instanceInMemory(),
    __metadata("design:type", Source)
], SourceWrapper.prototype, "source", void 0);
SourceWrapper = SourceWrapper_1 = __decorate([
    Decorators.memory("sources"),
    Log,
    __metadata("design:paramtypes", [String, ControllerRoom$1])
], SourceWrapper);
var SourceWrapper$1 = SourceWrapper;

let SourceManager = class SourceManager extends BaseClass {
    constructor(controllerRoom) {
        super(controllerRoom.name);
        this.controllerRoom = controllerRoom;
    }
    addSources() {
        let sources = this.controllerRoom.room.find(FIND_SOURCES);
        sources.forEach((source, index) => {
            this.sources.set(index, SourceWrapper$1.getSourceWrapperById(source.id, this.controllerRoom)
                .setSource(source));
        });
        this.logger.log("Sources:", this.sources.size);
        this.totalAvailableSpaces = 0;
        this.sources.forEach((sourceId, sourceWrapper) => {
            this.logger.log("[addsources] Source:", sourceWrapper.source);
            sourceWrapper.init();
            this.totalAvailableSpaces += sourceWrapper.spaces.length;
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
                }
                else if (!nowaiting && sourceWrapper.spaces[j].count === 1) {
                    nowaiting = [sourceWrapper, j];
                }
            }
            i = (i + 1) % this.sources.size;
        } while (i !== this.pointer && i < this.sources.size);
        return nowaiting && nowaiting[0].claim(creep, nowaiting[1]);
    }
};
__decorate([
    Decorators.instanceMapInMemory(SourceWrapper$1),
    __metadata("design:type", MemoryMap)
], SourceManager.prototype, "sources", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], SourceManager.prototype, "pointer", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], SourceManager.prototype, "totalAvailableSpaces", void 0);
SourceManager = __decorate([
    Decorators.memory("sourceManager"),
    Log,
    __metadata("design:paramtypes", [ControllerRoom$1])
], SourceManager);
var SourceManager$1 = SourceManager;

let PathConnection = class PathConnection extends BaseClass {
    setPos(idx, pos, targetPos) {
        this.idx = idx;
        this.pos = pos;
        this.targetPos = targetPos;
        return this;
    }
};
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathConnection.prototype, "idx", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathConnection.prototype, "pos", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathConnection.prototype, "targetPos", void 0);
PathConnection = __decorate([
    Decorators.memory("pathConnections"),
    Log
], PathConnection);
var PathConnection$1 = PathConnection;

const DIRECTION_TO_OFFSET = {
    [TOP]: [0, -1],
    [TOP_RIGHT]: [1, -1],
    [RIGHT]: [1, 0],
    [BOTTOM_RIGHT]: [1, 1],
    [BOTTOM]: [0, 1],
    [BOTTOM_LEFT]: [-1, 1],
    [LEFT]: [-1, 0],
    [TOP_LEFT]: [-1, -1]
};
const OFFSET_TO_DIRECTION = {
    "0__-1": TOP,
    "1__-1": TOP_RIGHT,
    "1__0": RIGHT,
    "1__1": BOTTOM_RIGHT,
    "0__1": BOTTOM,
    "-1__1": BOTTOM_LEFT,
    "-1__0": LEFT,
    "-1__-1": TOP_LEFT
};
const DIRECTION_TO_PARALLEL_OFFSET = {
    [TOP]: [-1, 0, 1, 0],
    [TOP_RIGHT]: [0, -1, 1, 0],
    [RIGHT]: [0, -1, 0, 1],
    [BOTTOM_RIGHT]: [1, 0, 0, 1],
    [BOTTOM]: [1, 0, -1, 0],
    [BOTTOM_LEFT]: [0, 1, -1, 0],
    [LEFT]: [0, 1, 0, -1],
    [TOP_LEFT]: [-1, 0, 0, -1]
};
class Utils {
    static getParallelOffsetByDirection(direction) {
        return DIRECTION_TO_PARALLEL_OFFSET[direction];
    }
    static getParallelPaths(path) {
        let path0 = [], path1 = [];
        let matrix = {};
        for (let i = 1; i < path.length; i++) {
            let [dx0, dy0, dx1, dy1] = this.getParallelOffsetByDirection(path[i].direction);
            this.addPosToPath(path0, matrix, path[i - 1], path[i + 1], dx0, dy0);
            this.addPosToPath(path1, matrix, path[i - 1], path[i + 1], dx1, dy1);
            if (i < path.length - 1 && path[i].direction !== path[i + 1].direction) {
                if (this.rotateDirection(path[i].direction, 1) === path[i + 1].direction ||
                    this.rotateDirection(path[i].direction, 2) === path[i + 1].direction) {
                    this.addPosToPath(path0, matrix, path[i], path[i + 1], dx0, dy0);
                }
                else if (this.rotateDirection(path[i].direction, -1) === path[i + 1].direction ||
                    this.rotateDirection(path[i].direction, -2) === path[i + 1].direction) {
                    this.addPosToPath(path1, matrix, path[i], path[i + 1], dx1, dy1);
                }
            }
            matrix[path[i].x + "__" + path[i].y] = 1;
        }
        return [path0, path1];
    }
    static addPosToPath(path, matrix, pos0, pos1, dx, dy) {
        let pos = {
            x: pos0.x + dx,
            y: pos0.y + dy
        };
        if (!matrix[pos.x + "__" + pos.y] &&
            (!pos1 || !this.posEquals(pos1, pos))) {
            path.push(pos);
            matrix[pos.x + "__" + pos.y] = 1;
        }
    }
    static posEquals(pos0, pos1) {
        return pos0.x === pos1.x && pos0.y === pos1.y;
    }
    static getCentroid(points) {
        let x = 0, y = 0;
        points.forEach((point) => {
            x += point.x;
            y += point.y;
        });
        return {
            x: Math.round(x / points.length),
            y: Math.round(y / points.length)
        };
    }
    static getOffsetByDirection(direction) {
        return DIRECTION_TO_OFFSET[direction];
    }
    static rotateDirection(direction, times) {
        let newDirection = ((direction + times - 1) % 8) + 1;
        return newDirection < 0 ? 8 + newDirection : newDirection;
    }
    static sortPositionsByDirection(positions) {
        positions = positions.sort(function (a, b) {
            return a.direction - b.direction;
        });
        for (let i = 1; i < positions.length; i++) {
            if (this.rotateDirection(positions[i - 1].direction, 1) !== positions[i].direction) {
                positions = [...positions.slice(i), ...positions.slice(0, i)];
                break;
            }
        }
        return positions;
    }
    static getReversedPath(path) {
        let lastPos = path[path.length - 1];
        let reversedPath = [{
                x: lastPos.x,
                y: lastPos.y,
                dx: -lastPos.dx,
                dy: -lastPos.dy,
                direction: this.rotateDirection(lastPos.direction, 4)
            }];
        for (let i = path.length - 2; i >= 0; i--) {
            reversedPath.push(this.getNextPathPos(path[i + 1], path[i]));
        }
        return reversedPath;
    }
    static getPosByDirection(pos, direction, distance = 1) {
        let offset = this.getOffsetByDirection(direction);
        return new RoomPosition(pos.x + distance * offset[0], pos.y + distance * offset[1], pos.roomName);
    }
    static getPathFromPoints(points) {
        let path = [{
                x: points[0].x,
                y: points[0].y,
                dx: points[0].dx || 0,
                dy: points[0].dy || -1,
                direction: points[0].direction || TOP
            }];
        for (let i = 1; i < points.length; i++) {
            path.push(this.getNextPathPos(points[i - 1], points[i]));
        }
        return path;
    }
    static getNextPathPos(pos0, pos1) {
        let dx = pos1.x - pos0.x;
        let dy = pos1.y - pos0.y;
        return {
            x: pos1.x,
            y: pos1.y,
            dx: dx,
            dy: dy,
            direction: OFFSET_TO_DIRECTION[dx + "__" + dy]
        };
    }
    static getDirectionBetweenPos(pos0, pos1) {
        let dx = pos1.x - pos0.x;
        dx = dx > 1 ? 1 : (dx < -1 ? -1 : dx);
        let dy = pos1.y - pos0.y;
        dy = dy > 1 ? 1 : (dy < -1 ? -1 : dy);
        return OFFSET_TO_DIRECTION[dx + "__" + dy];
    }
    static getDistanceBetweenPos(pos0, pos1) {
        //return Math.sqrt((pos0.x - pos1.x) * (pos0.x - pos1.x) + (pos0.y - pos1.y) * (pos0.y - pos1.y));
        return Math.max(Math.abs(pos0.x - pos1.x), Math.abs(pos0.y - pos1.y));
    }
    static getExitByPos(pos) {
        if (pos.x === 0) {
            return LEFT;
        }
        else if (pos.x === 49) {
            return RIGHT;
        }
        else if (pos.y === 0) {
            return TOP;
        }
        else if (pos.y === 49) {
            return BOTTOM;
        }
    }
    static getClosestObject(creep, targets, filterFunction = (target) => { return true; }) {
        let _targets = targets.map((targetId) => {
            return Game.getObjectById(targetId);
        }).filter(filterFunction);
        let min = 9999;
        let minTarget;
        _targets.forEach((target) => {
            let dist = this.getDistanceBetweenPos(creep.pos, target.pos);
            if (dist < min) {
                min = dist;
                minTarget = target;
            }
        });
        return minTarget;
    }
    static getClosestEdge(edges, filterFunction = (target) => { return true; }) {
        return _.minBy(edges.filter(filterFunction), (edge) => {
            return this.getDistanceBetweenPos(edge.pos0, edge.pos1);
        });
    }
}

let PathInfo = class PathInfo extends BaseClass {
    constructor(id) {
        super(id);
    }
    setPath(path) {
        this.path = path;
        this.reverse = Utils.getReversedPath(path);
        return this;
    }
    populatePathsMatrix(pathsMatrix) {
        this.path.forEach((pos, i) => {
            let key = pos.x + "__" + pos.y;
            pathsMatrix[key] = pathsMatrix[key] || {};
            pathsMatrix[key][this.id] = i;
        });
    }
    addCreepToPos(creep, pos = creep.pathPos) {
        this.creeps[pos] = this.creeps[pos] || [];
        this.creeps[pos].push(creep.name);
    }
    removeCreepFromPos(creep, pos = creep.pathPos) {
        if (this.creeps[pos]) {
            _.pull(this.creeps[pos], creep.name);
            if (this.creeps[pos].length === 0) {
                delete this.creeps[pos];
            }
        }
    }
    isAtConnection(targetPathIdx, curPos) {
        return this.connections.has(targetPathIdx) &&
            this.connections.get(targetPathIdx).pos === curPos;
    }
};
__decorate([
    Decorators.pathInMemory(),
    __metadata("design:type", Object)
], PathInfo.prototype, "path", void 0);
__decorate([
    Decorators.pathInMemory(),
    __metadata("design:type", Object)
], PathInfo.prototype, "reverse", void 0);
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], PathInfo.prototype, "creeps", void 0);
__decorate([
    Decorators.instanceMapInMemory(PathConnection$1),
    __metadata("design:type", MemoryMap)
], PathInfo.prototype, "connections", void 0);
__decorate([
    Decorators.inMemory(() => []),
    __metadata("design:type", Object)
], PathInfo.prototype, "directConnections", void 0);
PathInfo = __decorate([
    Decorators.memory("pathsInfo"),
    Log,
    __metadata("design:paramtypes", [Object])
], PathInfo);
var PathInfo$1 = PathInfo;

let creepObjects = new Map();
let CreepWrapper = class CreepWrapper extends PathPosObject$1 {
    constructor(name) {
        super();
        this.processed = false;
        this.name = name;
        this.creep = Game.creeps[name];
    }
    //Wrappers
    move(direction) {
        return this.creep.move(direction);
    }
    moveTo(target, opts) {
        return this.creep.moveTo(target, opts);
    }
    build(target) {
        return this.creep.build(target);
    }
    harvest(target) {
        return this.creep.harvest(target);
    }
    transfer(target, resourceType, amount) {
        return this.creep.transfer(target, resourceType, amount);
    }
    withdraw(target, resourceType, amount) {
        return this.creep.withdraw(target, resourceType, amount);
    }
    repair(target) {
        return this.creep.repair(target);
    }
    upgradeController(target) {
        return this.creep.upgradeController(target);
    }
    suicide() {
        return this.creep.suicide();
    }
    static getCreepByName(creepName) {
        let creep;
        if (creepObjects.has(creepName)) {
            creep = creepObjects.get(creepName);
        }
        else {
            creep = new this(creepName);
            creepObjects.set(creepName, creep);
        }
        return creep;
    }
    static clearObjects() {
        creepObjects = new Map();
    }
};
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], CreepWrapper.prototype, "role", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], CreepWrapper.prototype, "task", void 0);
__decorate([
    Decorators.alias("creep.pos"),
    __metadata("design:type", RoomPosition)
], CreepWrapper.prototype, "pos", void 0);
__decorate([
    Decorators.alias("creep.carry"),
    __metadata("design:type", Object)
], CreepWrapper.prototype, "carry", void 0);
__decorate([
    Decorators.alias("creep.carryCapacity"),
    __metadata("design:type", Number)
], CreepWrapper.prototype, "carryCapacity", void 0);
__decorate([
    Decorators.alias("creep.spawning"),
    __metadata("design:type", Number)
], CreepWrapper.prototype, "spawning", void 0);
CreepWrapper = __decorate([
    Decorators.memory("creeps", "name"),
    Log,
    __metadata("design:paramtypes", [String])
], CreepWrapper);
var CreepWrapper$1 = CreepWrapper;

let WorkerCreep = class WorkerCreep extends CreepWrapper$1 {
    constructor() {
        super(...arguments);
        this.hasMoved = false;
        this.processed = false;
        this.processing = false;
        this.swapPos = 0;
    }
    static getCreepByName(creepName) {
        return super.getCreepByName(creepName);
    }
};
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], WorkerCreep.prototype, "task", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], WorkerCreep.prototype, "movedAway", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], WorkerCreep.prototype, "movingAway", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], WorkerCreep.prototype, "targetPathPos", void 0);
__decorate([
    Decorators.alias("creep.pos"),
    __metadata("design:type", Object)
], WorkerCreep.prototype, "pos", void 0);
WorkerCreep = __decorate([
    Decorators.memory("creeps", "name"),
    Log
], WorkerCreep);
var WorkerCreep$1 = WorkerCreep;

const OK$1 = 1;
const CREEP_REACHED_TARGET = "reachedTarget";
const ERR_COULDNT_MOVE = -20;
const PARALLEL_BUILD_COUNT = 5;
const CREEP_CREATED = "creepCreated";
const CONSTRUCTION_SITE_ADDED = "constructionSiteAdded";
const ERR_INVALID_TASK = "invalidTask";
const CONTAINER_BUILT = "containerBuilt";
const TOWER_BUILT = "towerBuilt";
const EXTENSION_BUILT = "extensionBuilt";
const STRUCURE_BUILT = "strucureBuilt";
const ENERGY_WITHDRAWN = "energyWithdrawn";
const ENERGY_STORED = "energyStored";
const TOWER_USED_ENERGY = "towerUsedEnergy";
const HARVESTER_STORAGE = "harvesterStorage";
const UPGRADER_STORAGE = "upgraderStorage";
const PERIODIC_5_TICKS = "periodic5Ticks";
const PERIODIC_10_TICKS = "periodic10Ticks";
const PERIODIC_20_TICKS = "periodic20Ticks";
const ROOM_STATE_UNOCCUPIED = "unoccupied";
const ROOM_STATE_UNDEVELOPED = "undeveloped";
const ROOM_STATE_UNINITIALIZED = "uninitialized";
const ROOM_STATE_INITIALIZED = "initialized";

let PathNavigation = class PathNavigation extends BaseClass {
    constructor(id, pathManager) {
        super(id);
        this.pathManager = pathManager;
    }
    moveCreep(creep, target) {
        creep.currentTarget = target;
        if (creep.hasMoved) {
            return OK$1;
        }
        creep.hasMoved = false;
        if (this.hasReachedTarget(creep, target)) {
            creep.processed = true;
            return CREEP_REACHED_TARGET;
        }
        // if creep has reached its current target pos, find the next path
        if (creep.pathPos === creep.targetPathPos && creep.swapPos === 0 &&
            target && target.pathIdx !== undefined) {
            // if creep was already on the target path,
            if (creep.pathIdx === target.pathIdx) {
                // if the creep has reached target pos, return CREEP_REACHED_TARGET
                if (this.hasReachedTarget(creep, target)) {
                    return CREEP_REACHED_TARGET;
                }
            }
            else if (this.pathManager.pathsInfo.get(creep.pathIdx).isAtConnection(target.pathIdx, creep.pathPos)) {
                // else if creep has reached the pos for its connection to next path, go through next path
                let targetPath = this.pathManager.pathsInfo.get(creep.pathIdx).connections.get(target.pathIdx);
                this.pathManager.pathsInfo.get(creep.pathIdx).removeCreepFromPos(creep);
                creep.pathPos = targetPath.targetPos;
                creep.pathIdx = targetPath.idx;
                this.pathManager.pathsInfo.get(creep.pathIdx).addCreepToPos(creep);
                // if switching path reached the target, return CREEP_REACHED_TARGET
                // can happen when target on the intersection
                if (this.hasReachedTarget(creep, target)) {
                    return CREEP_REACHED_TARGET;
                }
            }
            // if the new pathIdx is the same as target pathIdx, assigne target's pathPos to targetPathPos,
            // else assign the pos for the connection to next path from the new path
            creep.targetPathPos = creep.pathIdx === target.pathIdx ? target.pathPos
                : this.pathManager.pathsInfo.get(creep.pathIdx).connections.get(target.pathIdx).pos;
        }
        let returnValue = this.moveCreepInDir(creep);
        // if the creep will reach the target at the end of this tick, return CREEP_REACHED_TARGET so that it can do its task
        if (this.hasReachedTarget(creep, target)) {
            return CREEP_REACHED_TARGET;
        }
        return returnValue;
    }
    moveCreepInDir(creep, dir = creep.targetPathPos - creep.pathPos, skipMoveCheck = false) {
        let pathInfo = this.pathManager.pathsInfo.get(creep.pathIdx);
        let path;
        let oldPos = creep.pathPos;
        let moveDir;
        let canMove = false;
        if (dir === 0 && creep.swapPos !== 0) {
            dir = creep.swapPos;
        }
        if (creep.movedAway) {
            if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, false, true)) {
                path = pathInfo.path;
                canMove = true;
                moveDir = Utils.rotateDirection(creep.movedAway, 4);
            }
        }
        else if (dir > 0) {
            if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos + 1)) {
                creep.pathPos++;
                path = pathInfo.path;
                canMove = true;
                moveDir = path[oldPos].direction;
            }
        }
        else if (dir < 0) {
            if (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos - 1)) {
                creep.pathPos--;
                path = pathInfo.reverse;
                canMove = true;
                moveDir = path[oldPos].direction;
            }
        }
        creep.processed = true;
        if (canMove) {
            // if creep is not moving into the path, remove from old pos and add to new pos
            // else it would be in the same pathPos so no need to remove and add
            if (!creep.movedAway) {
                // remove creep from old pos
                pathInfo.removeCreepFromPos(creep, oldPos);
                // add creep to new pos
                pathInfo.addCreepToPos(creep);
            }
            creep.hasMoved = true;
            creep.movedAway = 0;
            creep.movingAway = 0;
            creep.swapPos = 0;
            return creep.move(moveDir);
        }
        return ERR_COULDNT_MOVE;
    }
    // move creeps towards the target away from the path or away from the target towards the path
    // towards = moving towards path
    moveCreepTowards(creep, towards = true, skipMoveCheck = false) {
        // if the creep hasnt already moved, check if it can move away from path at its current pos
        if (!creep.hasMoved && (skipMoveCheck || this.canMoveCreep(creep, creep.pathPos, true))) {
            creep.hasMoved = true;
            creep.movedAway = towards ? 0 : creep.currentTarget.direction;
            creep.movingAway = 0;
            creep.swapPos = 0;
            return creep.move(creep.movedAway);
        }
        else {
            creep.movingAway = towards ? 0 : creep.currentTarget.direction;
            return ERR_COULDNT_MOVE;
        }
    }
    canMoveCreep(creep, pathPos, movingAway = false, movingTowards = false) {
        let pathInfo = this.pathManager.pathsInfo.get(creep.pathIdx);
        let creeps = [];
        if (pathInfo.creeps[pathPos]) {
            creeps.push(...pathInfo.creeps[pathPos]);
        }
        pathInfo.directConnections.forEach((connection) => {
            let connectionPathInfo = this.pathManager.pathsInfo.get(connection);
            if (connectionPathInfo.creeps[pathInfo.connections.get(connection).targetPos]) {
                creeps.push(...connectionPathInfo.creeps[pathInfo.connections.get(connection).targetPos]);
            }
        });
        for (let i = 0; i < creeps.length; i++) {
            if (creeps[i] === creep.name) {
                continue;
            }
            let _creep = WorkerCreep$1.getCreepByName(creeps[i]);
            // creep is moving out of this pos
            if (_creep.processing) {
                continue;
            }
            // if _creep has already moved in this tick and took the target pos then another creep cannot be there
            if (_creep.hasMoved) {
                // if, _creep has not moved away and creep is not moving away,
                //   or _creep has moved to the same direction as creep is trying to move to,
                //   creep cannot move.
                if ((!_creep.movedAway && !movingAway) ||
                    (_creep.movedAway === creep.currentTarget.direction)) {
                    return false;
                }
                else {
                    // else ignore the _creep
                    continue;
                }
            }
            // if _creep is a stationary creep. swapPos denotes _creep is sawpping position with another creep.
            if (_creep.pathPos === _creep.targetPathPos && _creep.swapPos === 0) {
                // if there is a stationary creep moved away from path in the same direction, dont move this creep
                if (movingAway && _creep.movedAway === creep.currentTarget.direction) {
                    return false;
                }
                else if ((movingTowards && _creep.movingAway === creep.movedAway) || !movingTowards) {
                    // else if moving towards and another creep is moving away in the same direction, swap positions
                    // or if not movingTowards, ie just moving along the path, swap positions
                    _creep.swapPos = creep.pathPos - creep.targetPathPos;
                    // if the creep is in another path, ie at the intersection
                    if (_creep.pathIdx !== creep.pathIdx) {
                        _creep.pathIdx = creep.pathIdx;
                        _creep.pathPos = _creep.targetPathPos = pathPos;
                    }
                    _creep.processing = true;
                    // if the creep was already processed, move it right now
                    if (_creep.processed) {
                        if (movingTowards) {
                            // if creep is moving towards path, _creep will move away from path
                            this.moveCreepTowards(_creep, false, true);
                        }
                        else {
                            // else creep is moving along the path, _creep will move in opposite direction along the path
                            this.moveCreepInDir(_creep, _creep.swapPos, true);
                        }
                    }
                    return true;
                }
            }
            else if (_creep.pathIdx !== creep.pathIdx) {
                // if the creep is not stationary and yet to move on another path dont move,
                // this is a temp fix for cross path blocks
                return false;
            }
        }
        return true;
    }
    hasReachedTarget(creep, target) {
        if (creep.swapPos === 0 && this.hasReachedTargetPathPos(creep, target)) {
            if (target.direction && !creep.pos.isEqualTo(target.pathPos) && !creep.hasMoved) {
                return this.moveCreepTowards(creep, false) === OK$1;
            }
            return true;
        }
        return false;
    }
    hasReachedTargetPathPos(creep, target) {
        return creep.pathIdx === target.pathIdx && creep.pathPos === target.pathPos;
    }
    creepHasDied(creep) {
        this.pathManager.pathsInfo.get(creep.pathIdx).removeCreepFromPos(creep);
    }
};
PathNavigation = __decorate([
    Decorators.memory("pathNavigation"),
    Log,
    __metadata("design:paramtypes", [String, PathManager$1])
], PathNavigation);
var PathNavigation$1 = PathNavigation;

function getPathIdxs(pathsMatrix, key) {
    return _.map(_.keys(pathsMatrix[key]), (idx) => {
        return {
            idx: idx,
            pos: pathsMatrix[key][idx]
        };
    });
}
let PathManager = class PathManager extends BaseClass {
    constructor(id) {
        super(id);
        this.pathNavigation = new PathNavigation$1(id, this);
    }
    addPath(path) {
        this.logger.logJSON(path);
        let dedupedPathParts = this.dedupePathParts(path);
        return dedupedPathParts.map((pathPart) => {
            return this.addPathPart(pathPart);
        });
    }
    addPathPart(pathPart) {
        this.logger.logJSON(pathPart);
        let pathInfo = new PathInfo$1(this.size++).setPath(pathPart.path);
        let connections = {};
        pathInfo.populatePathsMatrix(this.pathsMatrix);
        pathPart.startPathIdxs.forEach((pathIdx) => {
            connections[pathIdx.idx] = {
                idx: pathIdx.idx,
                fromPos: pathIdx.pos,
                toPos: 0
            };
        });
        pathPart.endPathIdxs.forEach((pathIdx) => {
            connections[pathIdx.idx] = {
                idx: pathIdx.idx,
                fromPos: pathIdx.pos,
                toPos: pathPart.path.length - 1
            };
        });
        pathPart.intersections.forEach((intersection) => {
            connections[intersection.idx] = {
                idx: intersection.idx,
                fromPos: intersection.pos,
                toPos: intersection.from
            };
        });
        let noConnections = {};
        let onePathConnection = {};
        let islands = {};
        for (let i = 0; i < this.size; i++) {
            if (i !== pathInfo.id) {
                let pathInfoEntry = this.pathsInfo.get(i);
                if (connections[i]) {
                    // TODO find the shorter connection for multiple paths
                    pathInfoEntry.connections.forEach((j) => {
                        if (pathInfoEntry.connections.get(j).idx === Number(j)) {
                            onePathConnection[j] = i;
                        }
                        else if (!(j in onePathConnection)) {
                            onePathConnection[j] = i;
                        }
                    });
                    pathInfo.connections.set(i, new PathConnection$1().setPos(i, connections[i].toPos, connections[i].fromPos));
                    pathInfo.directConnections.push(i);
                    pathInfoEntry.connections.set(pathInfo.id, new PathConnection$1().setPos(Number(pathInfo.id), connections[i].fromPos, connections[i].toPos));
                    pathInfoEntry.directConnections.push(pathInfo.id);
                }
                else {
                    noConnections[i] = 1;
                }
                // if count of registered connections is less than paths - path i - new path,
                // there is an island
                if (pathInfoEntry.connections.size < this.size - 2) {
                    islands[i] = pathInfoEntry.connections.size;
                }
            }
        }
        // console.log(pathInfo.id, noConnections, onePathConnection, islands);
        for (let i in noConnections) {
            if (i in onePathConnection) {
                let pathInfoEntry = this.pathsInfo.get(i);
                pathInfo.connections.set(i, pathInfo.connections.get(onePathConnection[i]));
                pathInfoEntry.connections.set(pathInfo.id, pathInfoEntry.connections.get(onePathConnection[i]));
            }
        }
        for (let i in islands) {
            // if count of registered connections on this path greater than islands,
            // this is connections between islands
            if (pathInfo.connections.size > islands[i]) {
                let pathInfoIEntry = this.pathsInfo.get(i);
                for (let j in pathInfo.connections.keys()) {
                    let pathInfoJEntry = this.pathsInfo.get(j);
                    if (!pathInfoIEntry.connections.has(j) && i !== j) {
                        pathInfoIEntry.connections.set(j, pathInfoIEntry.connections.get(pathInfo.id));
                        pathInfoJEntry.connections.set(i, pathInfoJEntry.connections.get(pathInfo.id));
                    }
                }
            }
        }
        this.pathsInfo.set(pathInfo.id, pathInfo);
        return pathInfo;
    }
    // if there is parts of the path common to other paths already registered,
    // split them up and add them as seperate paths deduping those parts
    dedupePathParts(path) {
        let startPathIdxs = [];
        let curPathIdx = -1;
        let startPartPos = 0;
        let intersections = [];
        let pathParts = [];
        for (let i = 1; i < path.length; i++) {
            let lastKey = path[i - 1].x + "__" + path[i - 1].y;
            let key = path[i].x + "__" + path[i].y;
            if (this.pathsMatrix[lastKey] && this.pathsMatrix[key] && !this.pathsMatrix[key][curPathIdx]) {
                let commonIdxs = _.intersection(_.keys(this.pathsMatrix[lastKey]), _.keys(this.pathsMatrix[key]));
                if (commonIdxs.length > 0) {
                    if (curPathIdx === -1 && i !== 1) {
                        pathParts.push({
                            path: path.slice(startPartPos, i),
                            startPathIdxs: startPathIdxs,
                            endPathIdxs: getPathIdxs(this.pathsMatrix, lastKey),
                            intersections: intersections
                        });
                    }
                    curPathIdx = commonIdxs[0];
                }
                else {
                    startPathIdxs = getPathIdxs(this.pathsMatrix, lastKey);
                    startPartPos = i - 1;
                    intersections = [];
                    curPathIdx = -1;
                }
            }
            else if (this.pathsMatrix[lastKey] && !this.pathsMatrix[key]) {
                if (curPathIdx === -1) {
                    intersections.push(..._.map(_.keys(this.pathsMatrix[lastKey]), (idx) => {
                        return {
                            idx: idx,
                            from: i - startPartPos,
                            pos: this.pathsMatrix[lastKey][idx]
                        };
                    }));
                }
                else {
                    startPathIdxs = getPathIdxs(this.pathsMatrix, lastKey);
                    startPartPos = i - 1;
                    intersections = [];
                }
                curPathIdx = -1;
            }
        }
        if (curPathIdx === -1) {
            pathParts.push({
                path: path.slice(startPartPos),
                startPathIdxs: startPathIdxs,
                endPathIdxs: [],
                intersections: intersections
            });
        }
        // console.log("---");
        // pathParts.forEach((pathPart) => {
        //   console.log(pathPart);
        // });
        return pathParts;
    }
};
__decorate([
    Decorators.instanceMapInMemory(PathInfo$1),
    __metadata("design:type", MemoryMap)
], PathManager.prototype, "pathsInfo", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Number)
], PathManager.prototype, "size", void 0);
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], PathManager.prototype, "pathsMatrix", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], PathManager.prototype, "pathIdxsByExit", void 0);
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], PathManager.prototype, "wallPathIdxsByExit", void 0);
PathManager = __decorate([
    Decorators.memory("pathManager"),
    Log,
    __metadata("design:paramtypes", [String])
], PathManager);
var PathManager$1 = PathManager;

let BuildingPlan = class BuildingPlan extends PathPosObject$1 {
    setXY(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
};
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildingPlan.prototype, "x", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildingPlan.prototype, "y", void 0);
BuildingPlan = __decorate([
    Decorators.memory("buildingPlans")
], BuildingPlan);
var BuildingPlan$1 = BuildingPlan;

let BuildingWrapper = class BuildingWrapper extends BuildingPlan$1 {
    setBuilding(building) {
        this.building = building;
        return this;
    }
};
__decorate([
    Decorators.instanceInMemory(),
    __metadata("design:type", Structure)
], BuildingWrapper.prototype, "building", void 0);
BuildingWrapper = __decorate([
    Decorators.memory("structures"),
    Decorators.getInstanceById,
    Log
], BuildingWrapper);
var BuildingWrapper$1 = BuildingWrapper;

let ConstructionSiteWrapper = class ConstructionSiteWrapper extends BuildingPlan$1 {
    setConstructionSite(constructionSite) {
        this.constructionSite = constructionSite;
        return this;
    }
};
__decorate([
    Decorators.instanceInMemory(),
    __metadata("design:type", ConstructionSite)
], ConstructionSiteWrapper.prototype, "constructionSite", void 0);
ConstructionSiteWrapper = __decorate([
    Decorators.memory("constructionSites"),
    Log
], ConstructionSiteWrapper);
var ConstructionSiteWrapper$1 = ConstructionSiteWrapper;

let Building = class Building extends BaseClass {
    constructor() {
        super(...arguments);
        this.paths = [];
    }
    plan(buildPlanner) {
        this.logger.log(`Planning: ${this.type}`);
        this.planned.replace(this.getPlannedPositions(buildPlanner));
        if (this.constructor["impassable"]) {
            this.planned.forEach((plan) => {
                buildPlanner.costMatrix.set(plan.x, plan.y, 255);
            });
        }
        this.logger.log(`Planned: ${this.type}. ${this.planned.size} Plans`);
    }
    addPathPosInfoToPlans(buildPlanner, plans) {
        return plans;
    }
    addCenterToPlan(buildPlanner, plans) {
        plans.forEach((plan) => {
            plan.x += buildPlanner.center.x;
            plan.y += buildPlanner.center.y;
        });
        return plans;
    }
    formBuildingPlansRawPlans(buildPlanner, rawPlans) {
        return rawPlans.map((rawPlan) => {
            return new BuildingPlan$1(`${buildPlanner.controllerRoom.name}_${rawPlan[0]}_${rawPlan[1]}`)
                // TODO
                // .setPos()
                .setXY(rawPlan[0], rawPlan[1]);
        });
    }
    build(buildPlanner) {
        if (Game.time % 5 === 0) {
            this.checkBuildingsScheduled(buildPlanner);
        }
        if (Game.time % 25 === 0) {
            this.checkConstructionSites(buildPlanner);
        }
        let c = 0;
        if (this.planned.size === 0) {
            // return true if this type of structure was finished before
            return true;
        }
        let planFulfilled = [];
        let plansFulfilled = () => {
            planFulfilled.forEach((plan) => {
                this.buildingScheduled.add(plan);
                this.planned.delete(plan);
            });
        };
        for (let plan of this.planned) {
            let returnValue = this.buildAt(buildPlanner, plan.x, plan.y);
            // if max sites has been reached or if RCL is not high enough, return
            if (returnValue === ERR_FULL || returnValue === ERR_RCL_NOT_ENOUGH) {
                plansFulfilled();
                // return true if RCL is not high enough, used to skip building a type for the current RCL
                return returnValue === ERR_RCL_NOT_ENOUGH;
            }
            if (returnValue === OK) {
                planFulfilled.push(plan);
            }
            c++;
            if (c >= PARALLEL_BUILD_COUNT) {
                break;
            }
        }
        plansFulfilled();
        // build only one type at a time
        return false;
    }
    checkBuildingsScheduled(buildPlanner) {
        this.logger.log(`Checking ${this.buildingScheduled.size} buildings scheduled`);
        let planPlaced = [];
        this.buildingScheduled.forEach((plan) => {
            let entitiesAtPlan = buildPlanner.controllerRoom.room.lookForAt(LOOK_CONSTRUCTION_SITES, plan.x, plan.y);
            if (entitiesAtPlan.length > 0 && entitiesAtPlan[0].structureType === this.constructor["type"]) {
                let constructionSiteWrapper = new ConstructionSiteWrapper$1(entitiesAtPlan[0].id)
                    .setConstructionSite(entitiesAtPlan[0])
                    .setXY(plan.x, plan.y)
                    .setPos(plan.pathIdx, plan.pathPos, plan.direction);
                this.building.add(constructionSiteWrapper);
                planPlaced.push(plan);
            }
        });
        planPlaced.forEach((plan) => {
            this.buildingScheduled.delete(plan);
        });
    }
    checkConstructionSites(buildPlanner) {
        this.logger.log(`Checking ${this.buildingScheduled.size} construction sites`);
        let sitesBuilt = [];
        this.building.forEach((buildingSite) => {
            let entitiesAtPlan = buildPlanner.controllerRoom.room.lookForAt(LOOK_STRUCTURES, buildingSite.x, buildingSite.y);
            if (entitiesAtPlan.length > 0 && entitiesAtPlan[0].structureType === this.constructor["type"]) {
                let buildingWrapper = new BuildingWrapper$1(entitiesAtPlan[0].id)
                    .setBuilding(entitiesAtPlan[0])
                    .setXY(buildingSite.x, buildingSite.y)
                    .setPos(buildingSite.pathIdx, buildingSite.pathPos, buildingSite.direction);
                this.built.add(buildingWrapper);
                sitesBuilt.push(buildingSite);
            }
        });
        sitesBuilt.forEach((buildingSite) => {
            this.building.delete(buildingSite);
        });
    }
    buildAt(buildPlanner, x, y) {
        return buildPlanner.controllerRoom.room.createConstructionSite(x, y, this.constructor["type"]);
    }
};
Building.visualColor = "white";
Building.impassable = true;
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Building.prototype, "type", void 0);
__decorate([
    Decorators.instanceSetInMemory(BuildingPlan$1),
    __metadata("design:type", MemorySet)
], Building.prototype, "planned", void 0);
__decorate([
    Decorators.instanceSetInMemory(BuildingPlan$1),
    __metadata("design:type", MemorySet)
], Building.prototype, "buildingScheduled", void 0);
__decorate([
    Decorators.instanceSetInMemory(ConstructionSiteWrapper$1),
    __metadata("design:type", MemorySet)
], Building.prototype, "building", void 0);
__decorate([
    Decorators.instanceSetInMemory(BuildingWrapper$1),
    __metadata("design:type", MemorySet)
], Building.prototype, "built", void 0);
__decorate([
    Decorators.instanceSetInMemory(BuildingWrapper$1),
    __metadata("design:type", MemorySet)
], Building.prototype, "repair", void 0);
Building = __decorate([
    Decorators.memory("buildings")
], Building);
var Building$1 = Building;

let Container = class Container extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "container";
    }
    getPlannedPositions(buildPlanner) {
        let plans = [...buildPlanner.controllerRoom.sourceManager.sources.keys().map((energySourceId) => {
                let energySource = buildPlanner.controllerRoom.sourceManager.sources.get(energySourceId);
                return energySource.source;
            }), buildPlanner.controllerRoom.room.controller].map((target) => {
            let containerPathInfo = buildPlanner.controllerRoom.pathManager.pathsInfo.get(target._toPath[0]);
            let containerPos = containerPathInfo.path[target._toPath[1]];
            return new BuildingPlan$1(`${buildPlanner.controllerRoom.name}_${containerPos.x}_${containerPos.y}`)
                .setPos(target._toPath[0], target._toPath[1], 0)
                .setXY(containerPos.x, containerPos.y);
        });
        return plans;
    }
};
Container.type = STRUCTURE_CONTAINER;
Container.impassable = false;
Container.visualColor = "orange";
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Container.prototype, "type", void 0);
Container = __decorate([
    Decorators.memory("buildings"),
    Log
], Container);
var Container$1 = Container;

let Extension = class Extension extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "extension";
    }
    getPlannedPositions(buildPlanner) {
        return this.addCenterToPlan(buildPlanner, this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.extension));
    }
};
Extension.type = STRUCTURE_EXTENSION;
Extension.impassable = true;
Extension.visualColor = "orange";
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Extension.prototype, "type", void 0);
Extension = __decorate([
    Decorators.memory("buildings"),
    Log
], Extension);
var Extension$1 = Extension;

let Road = class Road extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "road";
    }
    getPlannedPositions(buildPlanner) {
        let roads = new Set();
        let planned = [];
        let addPathInfoToPlan = (pathInfo) => {
            pathInfo.path.forEach((pathPoint, idx) => {
                let key = `${pathPoint.x}__${pathPoint.y}`;
                if (!roads.has(key)) {
                    roads.add(key);
                    planned.push(new BuildingPlan$1(`${buildPlanner.controllerRoom.name}_${pathPoint.x}_${pathPoint.y}`)
                        .setPos(Number(pathInfo.id), idx, 0)
                        .setXY(pathPoint.x, pathPoint.y));
                }
            });
        };
        if (buildPlanner.extensionsPattern.road) {
            this.addRoadToPathManager(buildPlanner, this.addCenterToPlan(buildPlanner, this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.road))).forEach(addPathInfoToPlan);
        }
        if (buildPlanner.labsPattern.road) {
            this.addRoadToPathManager(buildPlanner, this.addCenterToPlan(buildPlanner, this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.labsPattern.road))).forEach(addPathInfoToPlan);
        }
        PathFinder.use(true);
        let centerRoomPos = new RoomPosition(buildPlanner.center.x, buildPlanner.center.y, buildPlanner.controllerRoom.name);
        [...buildPlanner.controllerRoom.sourceManager.sources.keys().map((energySourceId) => {
                let energySource = buildPlanner.controllerRoom.sourceManager.sources.get(energySourceId);
                return {
                    source: centerRoomPos,
                    target: energySource.source,
                    range: 1,
                };
            }), {
                source: centerRoomPos,
                target: buildPlanner.controllerRoom.room.controller,
                range: 3,
            }].forEach((destinations) => {
            let path = buildPlanner.controllerRoom.room.findPath(destinations.source, destinations.target.pos, {
                maxRooms: 1,
                range: destinations.range,
                costCallback: () => {
                    return buildPlanner.costMatrix;
                },
            });
            // add the source too
            path.unshift({
                x: destinations.source.x,
                y: destinations.source.y,
                dx: 0,
                dy: -1,
                direction: TOP
            });
            let pathInfosToDest = buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(path));
            pathInfosToDest.forEach(addPathInfoToPlan);
            destinations.target._toPath = [
                Number(pathInfosToDest[pathInfosToDest.length - 1].id),
                pathInfosToDest[pathInfosToDest.length - 1].path.length - 1
            ];
        });
        return planned;
    }
    addRoadToPathManager(buildPlanner, roadPoints) {
        let road = [roadPoints[0]];
        let pathInfos = [];
        for (let i = 1; i < roadPoints.length; i++) {
            if (Utils.getDistanceBetweenPos(roadPoints[i - 1], roadPoints[i]) <= 1) {
                road.push(roadPoints[i]);
            }
            else {
                pathInfos.push(...buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(road)));
                road = [roadPoints[i]];
            }
        }
        pathInfos.push(...buildPlanner.controllerRoom.pathManager.addPath(Utils.getPathFromPoints(road)));
        return pathInfos;
    }
};
Road.type = STRUCTURE_ROAD;
Road.impassable = false;
Road.visualColor = "grey";
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Road.prototype, "type", void 0);
Road = __decorate([
    Decorators.memory("buildings"),
    Log
], Road);
var Road$1 = Road;

let Tower = class Tower extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "tower";
    }
    getPlannedPositions(buildPlanner) {
        let plans = [];
        plans.push(...(buildPlanner.extensionsPattern.tower || []));
        plans.push(...(buildPlanner.labsPattern.tower || []));
        return this.addCenterToPlan(buildPlanner, this.formBuildingPlansRawPlans(buildPlanner, plans));
    }
};
Tower.type = STRUCTURE_TOWER;
Tower.impassable = true;
Tower.visualColor = "red";
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Tower.prototype, "type", void 0);
Tower = __decorate([
    Decorators.memory("buildings"),
    Log
], Tower);
var Tower$1 = Tower;

let Wall = class Wall extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "wall";
    }
    getPlannedPositions(buildPlanner) {
        // TODO
        return this.addCenterToPlan(buildPlanner, []);
    }
};
Wall.type = STRUCTURE_RAMPART;
Wall.impassable = false;
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], Wall.prototype, "type", void 0);
Wall = __decorate([
    Decorators.memory("buildings"),
    Log
], Wall);
var Wall$1 = Wall;

var plusPattern = {
    "extension": [{
            "x": -5,
            "y": -5,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -4,
            "y": -5,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -3,
            "y": -5,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": 3,
            "y": -5,
            "roadX": 4,
            "roadY": -4
        }, {
            "x": 4,
            "y": -5,
            "roadX": 4,
            "roadY": -4
        }, {
            "x": 5,
            "y": -5,
            "roadX": 4,
            "roadY": -4
        }, {
            "x": -5,
            "y": -4,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -3,
            "y": -4,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -2,
            "y": -4,
            "roadX": -3,
            "roadY": -3
        }, {
            "x": 2,
            "y": -4,
            "roadX": 3,
            "roadY": -3
        }, {
            "x": 3,
            "y": -4,
            "roadX": 3,
            "roadY": -3
        }, {
            "x": 5,
            "y": -4,
            "roadX": 4,
            "roadY": -4
        }, {
            "x": -5,
            "y": -3,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -4,
            "y": -3,
            "roadX": -4,
            "roadY": -4
        }, {
            "x": -2,
            "y": -3,
            "roadX": -3,
            "roadY": -3
        }, {
            "x": -1,
            "y": -3,
            "roadX": -2,
            "roadY": -2
        }, {
            "x": 1,
            "y": -3,
            "roadX": 0,
            "roadY": -3
        }, {
            "x": 2,
            "y": -3,
            "roadX": 2,
            "roadY": -2
        }, {
            "x": 4,
            "y": -3,
            "roadX": 3,
            "roadY": -3
        }, {
            "x": 5,
            "y": -3,
            "roadX": 4,
            "roadY": -4
        }, {
            "x": -4,
            "y": -2,
            "roadX": -3,
            "roadY": -3
        }, {
            "x": -3,
            "y": -2,
            "roadX": -3,
            "roadY": -3
        }, {
            "x": -1,
            "y": -2,
            "roadX": -2,
            "roadY": -2
        }, {
            "x": 1,
            "y": -2,
            "roadX": 0,
            "roadY": -3
        }, {
            "x": 3,
            "y": -2,
            "roadX": 2,
            "roadY": -2
        }, {
            "x": 4,
            "y": -2,
            "roadX": 3,
            "roadY": -3
        }, {
            "x": -3,
            "y": -1,
            "roadX": -3,
            "roadY": 0
        }, {
            "x": -2,
            "y": -1,
            "roadX": -3,
            "roadY": 0
        }, {
            "x": 2,
            "y": -1,
            "roadX": 1,
            "roadY": -1
        }, {
            "x": 3,
            "y": -1,
            "roadX": 2,
            "roadY": -2
        }, {
            "x": -3,
            "y": 1,
            "roadX": -3,
            "roadY": 0
        }, {
            "x": -2,
            "y": 1,
            "roadX": -3,
            "roadY": 0
        }, {
            "x": 2,
            "y": 1,
            "roadX": 1,
            "roadY": 1
        }, {
            "x": 3,
            "y": 1,
            "roadX": 2,
            "roadY": 0
        }, {
            "x": -4,
            "y": 2,
            "roadX": -3,
            "roadY": 3
        }, {
            "x": -3,
            "y": 2,
            "roadX": -3,
            "roadY": 3
        }, {
            "x": -1,
            "y": 2,
            "roadX": -2,
            "roadY": 2
        }, {
            "x": 1,
            "y": 2,
            "roadX": 0,
            "roadY": 2
        }, {
            "x": 3,
            "y": 2,
            "roadX": 2,
            "roadY": 2
        }, {
            "x": 4,
            "y": 2,
            "roadX": 3,
            "roadY": 3
        }, {
            "x": -5,
            "y": 3,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -4,
            "y": 3,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -2,
            "y": 3,
            "roadX": -3,
            "roadY": 3
        }, {
            "x": -1,
            "y": 3,
            "roadX": -2,
            "roadY": 2
        }, {
            "x": 1,
            "y": 3,
            "roadX": 0,
            "roadY": 2
        }, {
            "x": 2,
            "y": 3,
            "roadX": 2,
            "roadY": 2
        }, {
            "x": 4,
            "y": 3,
            "roadX": 3,
            "roadY": 3
        }, {
            "x": 5,
            "y": 3,
            "roadX": 4,
            "roadY": 4
        }, {
            "x": -5,
            "y": 4,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -3,
            "y": 4,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -2,
            "y": 4,
            "roadX": -3,
            "roadY": 3
        }, {
            "x": 2,
            "y": 4,
            "roadX": 3,
            "roadY": 3
        }, {
            "x": 3,
            "y": 4,
            "roadX": 3,
            "roadY": 3
        }, {
            "x": 5,
            "y": 4,
            "roadX": 4,
            "roadY": 4
        }, {
            "x": -5,
            "y": 5,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -4,
            "y": 5,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": -3,
            "y": 5,
            "roadX": -4,
            "roadY": 4
        }, {
            "x": 3,
            "y": 5,
            "roadX": 4,
            "roadY": 4
        }, {
            "x": 4,
            "y": 5,
            "roadX": 4,
            "roadY": 4
        }, {
            "x": 5,
            "y": 5,
            "roadX": 4,
            "roadY": 4
        }],
    "road": [{
            "x": 0,
            "y": 0
        }, {
            "x": -1,
            "y": -1
        }, {
            "x": -2,
            "y": -2
        }, {
            "x": -3,
            "y": -3
        }, {
            "x": -4,
            "y": -4
        }, {
            "x": 0,
            "y": 0
        }, {
            "x": 1,
            "y": -1
        }, {
            "x": 2,
            "y": -2
        }, {
            "x": 3,
            "y": -3
        }, {
            "x": 4,
            "y": -4
        }, {
            "x": 0,
            "y": 0
        }, {
            "x": -1,
            "y": 1
        }, {
            "x": -2,
            "y": 2
        }, {
            "x": -3,
            "y": 3
        }, {
            "x": -4,
            "y": 4
        }, {
            "x": 0,
            "y": 0
        }, {
            "x": 1,
            "y": 1
        }, {
            "x": 2,
            "y": 2
        }, {
            "x": 3,
            "y": 3
        }, {
            "x": 4,
            "y": 4
        }, {
            "x": 1,
            "y": 1
        }, {
            "x": 2,
            "y": 0
        }, {
            "x": 3,
            "y": 0
        }, {
            "x": -1,
            "y": 1
        }, {
            "x": 0,
            "y": 3
        }, {
            "x": 0,
            "y": 2
        }, {
            "x": -1,
            "y": -1
        }, {
            "x": -2,
            "y": 0
        }, {
            "x": -3,
            "y": 0
        }, {
            "x": 1,
            "y": -1
        }, {
            "x": 0,
            "y": -2
        }, {
            "x": 0,
            "y": -3
        }],
    "tower": [{
            "x": 0,
            "y": -4,
            "roadX": 0,
            "roadY": -3
        }, {
            "x": -4,
            "y": 0,
            "roadX": -3,
            "roadY": 0
        }, {
            "x": 4,
            "y": 0,
            "roadX": 3,
            "roadY": 0
        }, {
            "x": 0,
            "y": 4,
            "roadX": 0,
            "roadY": 3
        }],
    "spawn": [{
            "x": 0,
            "y": -1,
            "roadX": -1,
            "roadY": -1
        }, {
            "x": -1,
            "y": 0,
            "roadX": -2,
            "roadY": 0
        }, {
            "x": 0,
            "y": 1,
            "roadX": -1,
            "roadY": 1
        }],
    "link": [{
            "x": 1,
            "y": 0,
            "roadX": 0,
            "roadY": 0
        }]
};

let BuildPlanner = class BuildPlanner extends BaseClass {
    constructor(controllerRoom) {
        super(controllerRoom.name);
        this.extensionsPattern = plusPattern;
        this.labsPattern = {};
        this.wallPattern = {};
        // @Decorators.costMatrixInMemory()
        this.costMatrix = new PathFinder.CostMatrix();
        this.controllerRoom = controllerRoom;
    }
    plan() {
        let spawns = this.controllerRoom.room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) {
            return false;
        }
        this.center.x = spawns[0].pos.x + 1;
        this.center.y = spawns[0].pos.y;
        // TODO: select dynamically patterns dynamically
        return true;
    }
};
__decorate([
    Decorators.inMemory(() => { return { x: 0, y: 0 }; }),
    __metadata("design:type", Object)
], BuildPlanner.prototype, "center", void 0);
BuildPlanner = __decorate([
    Decorators.memory("buildPlanner"),
    Log,
    __metadata("design:paramtypes", [ControllerRoom$1])
], BuildPlanner);
var BuildPlanner$1 = BuildPlanner;

let SpawnBuilding = class SpawnBuilding extends Building$1 {
    constructor() {
        super(...arguments);
        this.type = "spawn";
    }
    getPlannedPositions(buildPlanner) {
        return this.addCenterToPlan(buildPlanner, this.formBuildingPlansRawPlans(buildPlanner, buildPlanner.extensionsPattern.spawn));
    }
};
SpawnBuilding.type = STRUCTURE_SPAWN;
SpawnBuilding.impassable = false;
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", String)
], SpawnBuilding.prototype, "type", void 0);
SpawnBuilding = __decorate([
    Decorators.memory("buildings"),
    Log
], SpawnBuilding);
var SpawnBuilding$1 = SpawnBuilding;

const BUILDINGS_MAP = {
    "container": Container$1,
    "extension": Extension$1,
    "road": Road$1,
    "spawn": SpawnBuilding$1,
    "tower": Tower$1,
    "wall": Wall$1,
};
const BUILDING_PLAN_ORDER = [
    "extension",
    "spawn",
    "tower",
    "wall",
    "road",
    "container",
];
const BUILD_ORDER = [
    "container",
    "extension",
    "road",
    "spawn",
    "tower",
    "wall",
];
let BuildManager = class BuildManager extends BaseClass {
    constructor(controllerRoom) {
        super(controllerRoom.name);
        this.controllerRoom = controllerRoom;
        this.buildPlanner = new BuildPlanner$1(controllerRoom);
        for (const buildingName in BUILDINGS_MAP) {
            if (BUILDINGS_MAP.hasOwnProperty(buildingName)) {
                const BuildingClass = BUILDINGS_MAP[buildingName];
                this.buildings.set(buildingName, new BuildingClass(controllerRoom.name + "_" + buildingName));
            }
        }
    }
    plan() {
        if (!this.buildPlanner.plan()) {
            return false;
        }
        this.controllerRoom.sourceManager.addSources();
        BUILDING_PLAN_ORDER.forEach((buildingName) => {
            let building = this.buildings.get(buildingName);
            building.plan(this.buildPlanner);
        });
        return true;
    }
    build() {
        this.logger.log("Building", this.cursor);
        // check if RCL changed or some structures are yet to be built for current RCL
        // or there are some structures are being built
        if (!this.controllerRoom.tasks.get("build").hasTarget &&
            (this.controllerRoom.controller.level > this.lastLevel || this.cursor < BUILD_ORDER.length)) {
            // reset the cursor when executed for the 1st time RCL changed
            if (this.cursor === BUILD_ORDER.length) {
                this.cursor = 0;
            }
            for (; this.cursor < BUILD_ORDER.length; this.cursor++) {
                this.logger.log("Building", BUILD_ORDER[this.cursor]);
                if (!this.buildings.get(BUILD_ORDER[this.cursor]).build(this.buildPlanner)) {
                    break;
                }
                // else if the current building has no pending entries to be built, check next
            }
            if (this.cursor === this.buildData.length) {
                // proceed only if all structures for this level are built
                this.lastLevel = this.controllerRoom.controller.level;
            }
        }
    }
};
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], BuildManager.prototype, "structureData", void 0);
__decorate([
    Decorators.inMemory(() => []),
    __metadata("design:type", Array)
], BuildManager.prototype, "buildData", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildManager.prototype, "cursor", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildManager.prototype, "pathCursor", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildManager.prototype, "posCursor", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], BuildManager.prototype, "lastLevel", void 0);
__decorate([
    Decorators.instancePolymorphMapInMemory(BUILDINGS_MAP),
    __metadata("design:type", MemoryMap)
], BuildManager.prototype, "buildings", void 0);
BuildManager = __decorate([
    Decorators.memory("buildManager"),
    Log,
    __metadata("design:paramtypes", [ControllerRoom$1])
], BuildManager);
var BuildManager$1 = BuildManager;

class RoleSuite extends BaseClass {
    static switchRole(controllerRoom) {
        return false;
    }
}
RoleSuite.order = null;
RoleSuite.creepDistribution = null;

class EarlyGameRoleSuite extends RoleSuite {
    static switchRole(controllerRoom) {
        return false;
    }
}
EarlyGameRoleSuite.order = ["worker"];
EarlyGameRoleSuite.creepDistribution = null;

class MidGameRoleSuite extends RoleSuite {
    static switchRole(controllerRoom) {
        return false;
    }
}
MidGameRoleSuite.order = ["harvester", "hauler", "builder", "upgrader"];
MidGameRoleSuite.creepDistribution = {
    worker: ["harvester", "hauler", "builder", "upgrader"]
};

function deepGet(base, path) {
    let paths = path.split(/\./);
    let ret = base;
    paths.forEach((path) => {
        if (ret) {
            if (ret.get) {
                ret = ret.get(path);
            }
            else {
                ret = ret[path];
            }
        }
    });
    return ret;
}
let EventBus = class EventBus extends BaseClass {
    constructor() {
        super(...arguments);
        // @Decorators.inMemory(() => {return {}})
        this.listeners = {};
        // @Decorators.inMemory(() => {return {}})
        this.fireEvents = {};
        this.delayedEvents = {};
    }
    subscribe(eventName, method, contextPath) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push({
            method: method,
            contextPath: contextPath
        });
    }
    fireEvent(eventName, target, ...args) {
        this.fireEvents[eventName] = this.fireEvents[eventName] || [];
        this.fireEvents[eventName].push(target.name, ...args);
    }
    fireDelayedEvent(eventName, target, ...args) {
        this.delayedEvents[eventName] = this.delayedEvents[eventName] || [];
        this.delayedEvents[eventName].push(target.name, ...args);
    }
    preTick() {
        for (let eventName in this.delayedEvents) {
            this.fire(eventName, this.delayedEvents[eventName]);
            delete this.delayedEvents[eventName];
        }
    }
    tick() {
        // nothing to do
    }
    postTick() {
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
    fire(eventName, eventDetails) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach((listener) => {
                let controllerRoom = ControllerRoom$1.getRoomByRoomName(eventDetails[0]);
                if (controllerRoom) {
                    let context = deepGet(controllerRoom, listener.contextPath);
                    if (context) {
                        context[listener.method](...eventDetails.splice(1));
                    }
                }
            });
        }
    }
};
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], EventBus.prototype, "delayedEvents", void 0);
EventBus = __decorate([
    Decorators.memory("events"),
    Log
], EventBus);
let eventBus = new EventBus("memory");

let Role = class Role extends BaseClass {
    constructor() {
        super(...arguments);
        this.freeTasks = {};
        this.hasFreeTasks = {};
        this.validTasksCount = {};
    }
    static initClass() {
        this.eventListeners.forEach((eventListener) => {
            eventBus.subscribe(eventListener.eventName, eventListener.method, "roleManager.roles." + this.roleName);
        });
    }
    setControllerRoom(controllerRoom) {
        this.controllerRoom = controllerRoom;
        return this;
    }
    tick() {
        this.upgradeParts();
        this.spawnCreeps();
        this.executeCreepsTasks();
    }
    upgradeParts() {
        let newPart = this.constructor["mainParts"][this.i];
        // this.logger.log("[Upgrade Parts]", `Capacity: ${this.controllerRoom.room.energyCapacityAvailable}. ` +
        //   `Parts Cost: ${this.partsCost}. New Cost: ${this.partsCost + BODYPART_COST[newPart] +
        //     (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0)}`);
        let upgraded = false;
        // if the available energy capacity can accommodate the new part or if the parts has reached max parts count (50)
        while (this.controllerRoom.room.energyCapacityAvailable >= this.partsCost + BODYPART_COST[newPart] +
            (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0) &&
            this.parts.length <= this.constructor["maxParts"] - 2) {
            upgraded = true;
            // have the new part at the beginig and move at the end,
            // so that when the creep is damaged movement is the last thing to be damaged
            this.parts.unshift(newPart);
            if (this.constructor["addMove"]) {
                this.parts.push(MOVE);
            }
            this.partsCost += BODYPART_COST[newPart] + (this.constructor["addMove"] ? BODYPART_COST[MOVE] : 0);
            this.i = (this.i + 1) % this.constructor["mainParts"].length;
            // console.log("Upgraded the creeps parts to", this.parts.join(","));
            newPart = this.constructor["mainParts"][this.i];
        }
        this.logger.log(`Upgrade Parts? upgrade=${upgraded}`);
    }
    spawnCreeps() {
        // spawn creeps
        if (this.creepsCount < this.getMaxCount() && this.partsCost <= this.controllerRoom.room.energyAvailable) {
            let parts = this.parts.slice();
            let spawn = _.find(Game.spawns, (spawn) => {
                return !spawn.spawning;
            });
            if (spawn) {
                this.logger.log("Spawning creeps");
                Memory["creepsName"] = Memory["creepsName"] || 0;
                let creepName = "Worker" + Memory["creepsName"];
                let retName = spawn.spawnCreep(parts, creepName, {
                    // TODO: select this based on spawn
                    directions: [TOP, RIGHT, BOTTOM],
                    memory: { role: { name: this.constructor["className"] } },
                });
                if (retName === OK) {
                    this.creeps[creepName] = 1;
                    this.creepsCount++;
                    Memory["creepsName"]++;
                    eventBus.fireDelayedEvent(CREEP_CREATED, this.controllerRoom);
                    this.logger.log(`Creep ${creepName} Created`);
                }
            }
        }
        else {
            this.logger.log("Not spawning creeps");
        }
    }
    executeCreepsTasks() {
        // execute creeps' tasks
        for (let creepName in this.creeps) {
            let creep = CreepWrapper$1.getCreepByName(creepName);
            if (creep) {
                if (!creep.spawning) {
                    this.executeTask(creep);
                }
            }
            else if (Memory.creeps[creepName]) {
                // console.log("Creep", creepName, "died");
                Memory.creeps[creepName].name = creepName;
                // this.controllerRoom.creepHasDied(Memory.creeps[creepName]);
                delete Memory.creeps[creepName];
            }
        }
    }
    addCreep(creep) {
        if (creep.task) {
            creep.task.tasks = {};
            creep.task.tier = 0;
            creep.task.targets = {};
            delete creep.task.current;
            delete creep.task.targetType;
        }
        creep.role = {
            name: this.constructor["className"]
        };
        this.creeps[creep.name] = 1;
        this.creepsCount++;
    }
    removeCreep(creep) {
        if (creep.task) {
            for (let tier in creep.task.tasks) {
                creep.task.tier = tier;
                this.clearTask(creep);
            }
        }
    }
    executeTask(creep) {
        // this.logger.log(creep.name, creep.role.name, creep.task);
        if (creep.task) {
            creep.task.targets = creep.task.targets || {};
            let currentTask = this.constructor["creepTasks"][creep.task.tier][creep.task.current];
            this.logger.log(`creepName=${creep.name} role=${creep.role.name} task=${currentTask}`);
            if (currentTask) {
                let returnValue = this.controllerRoom.tasks.get(currentTask).execute(creep);
                switch (returnValue) {
                    case ERR_INVALID_TARGET:
                    case ERR_NO_BODYPART:
                    case ERR_RCL_NOT_ENOUGH:
                        // this.logger.log("reassignTask");
                        this.reassignTask(creep);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                    case ERR_INVALID_TASK:
                        // this.logger.log("switchTask");
                        this.switchTask(creep);
                        break;
                    case OK:
                    case ERR_BUSY:
                        // this.logger.log("OK");
                        break;
                    default:
                        // this.logger.log(returnValue);
                        break;
                }
            }
            else {
                this.assignNewTask(creep);
            }
        }
        else {
            this.assignNewTask(creep, true);
        }
    }
    getMaxParts() {
        return this.constructor["maxParts"];
    }
    isTaskFree(task, tier, offset) {
        return task.hasTarget;
    }
    assignTask(creep, task, taskIdx) {
        creep.task = creep.task || {
            tier: 0,
            tasks: {},
            targets: {}
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;
        if (!task.creeps.has(creep.name)) {
            task.creeps.set(creep.name, creep);
        }
        task.taskStarted(creep);
        task.execute(creep);
    }
    assignNewTask(creep, isNew = false) {
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = this.constructor["creepTasks"][tier];
        let minCreepCount = 99999, minTaskIdx, minTask;
        for (let i = 0; i < tasks.length; i++) {
            let task = this.controllerRoom.tasks.get(tasks[i]);
            if (minCreepCount > task.creeps.size) {
                minCreepCount = task.creeps.size;
                minTaskIdx = i;
                minTask = task;
            }
        }
        if (minTaskIdx >= 0) {
            this.assignTask(creep, minTask, minTaskIdx);
        }
    }
    clearTask(creep) {
        if (creep.task) {
            let task = this.controllerRoom.tasks.get(this.constructor["creepTasks"][creep.task.tier][creep.task.current]);
            if (task && task.creeps.has(creep.name)) {
                // console.log("Clearing", creep.name, "from", this.constructor["creepTasks"][creep.task.tier][creep.task.current]);
                task.taskEnded(creep);
                task.creeps.delete(creep.name);
                delete creep.task.targets[creep.task.tier];
            }
            else {
                // console.log("Trying to clear", creep.name, "of unassigned task");
            }
        }
    }
    switchTask(creep) {
        if (this.tasks[creep.task.tier] && this.tasks[creep.task.tier][creep.task.current]) {
            this.controllerRoom.tasks.get(this.tasks[creep.task.tier][creep.task.current]).taskEnded(creep);
        }
        creep.task.tier = (creep.task.tier + 1) % this.constructor["creepTasks"].length;
        creep.task.current = creep.task.tasks[creep.task.tier];
        // console.log("Switching to tier", creep.task.tier, "for", creep.name);
        if (creep.task.current === undefined) {
            this.assignNewTask(creep);
        }
        else {
            this.controllerRoom.tasks.get(this.tasks[creep.task.tier][creep.task.current]).taskStarted(creep);
        }
    }
    reassignTask(creep) {
        // TODO
    }
    creepHasDied(creep) {
        this.clearTask(creep);
        if (this.creeps[creep.name]) {
            delete this.creeps[creep.name];
            this.creepsCount--;
        }
    }
};
Role.creepParts = [WORK, CARRY, MOVE, MOVE];
Role.mainParts = [WORK, CARRY];
Role.addMove = true;
Role.maxParts = MAX_CREEP_SIZE;
Role.creepTasks = [];
Role.eventListeners = [];
Role.roleName = "base";
__decorate([
    Decorators.inMemory(() => false),
    __metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
__decorate([
    Decorators.inMemory(function () {
        return _.cloneDeep(this.creepTasks);
    }),
    __metadata("design:type", Array)
], Role.prototype, "tasks", void 0);
__decorate([
    Decorators.inMemory(function () {
        if (this.parts) {
            return this.parts.reduce(function (partsCost, part) {
                return partsCost + BODYPART_COST[part];
            }, 0);
        }
        return 0;
    }),
    __metadata("design:type", Number)
], Role.prototype, "partsCost", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], Role.prototype, "i", void 0);
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], Role.prototype, "creeps", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], Role.prototype, "creepsCount", void 0);
__decorate([
    Decorators.inMemory(function () {
        return _.cloneDeep(this.constructor["creepParts"]);
    }),
    __metadata("design:type", Array)
], Role.prototype, "parts", void 0);
__decorate([
    Decorators.instanceInMemoryByName(ControllerRoom$1),
    __metadata("design:type", ControllerRoom$1)
], Role.prototype, "controllerRoom", void 0);
Role = __decorate([
    Decorators.memory("roles")
], Role);
var Role$1 = Role;

/**
 * Worker role with dynamic allocation. Used untill the containers are setup.
 * @module role
 * @class Worker
 * @extends Role
 */
let WorkerRole = class WorkerRole extends Role$1 {
    init() { }
    tick() {
        this.upgradeParts();
        this.freeTasks = {};
        this.hasFreeTasks = {};
        this.validTasksCount = {};
        this.constructor["creepTasks"].forEach((taskTier, i) => {
            this.freeTasks[i] = {};
            this.hasFreeTasks[i] = false;
            this.validTasksCount[i] = 0;
            taskTier.forEach((taskName) => {
                let task = this.controllerRoom.tasks.get(taskName);
                if (task) {
                    this.validTasksCount[i] += task.hasTarget ? 1 : 0;
                    if (this.isTaskFree(task, this, i)) {
                        this.hasFreeTasks[i] = true;
                        this.freeTasks[i][taskName] = 1;
                    }
                }
            });
        });
        this.spawnCreeps();
        this.executeCreepsTasks();
    }
    getMaxCount() {
        return this.controllerRoom.sourceManager.totalAvailableSpaces * 3 / 2;
    }
    isTaskFree(task, tier, offset = 0) {
        return task.hasTarget &&
            task.creepsCount < Math.round(this.creepsCount / this.validTasksCount[tier]) - offset;
    }
    assignTask(creep, task, taskIdx) {
        creep.task = creep.task || {
            tier: 0,
            tasks: {}
        };
        creep.task.current = taskIdx;
        creep.task.tasks[creep.task.tier] = taskIdx;
        task.creeps[creep.name] = 1;
        task.creepsCount++;
        let taskName = this.constructor["creepTasks"][creep.task.tier][taskIdx];
        // clear the task as free if it is not free anymore
        if (this.freeTasks[creep.task.tier][taskName] && !this.isTaskFree(task, this, creep.task.tier)) {
            delete this.freeTasks[creep.task.tier][taskName];
            this.hasFreeTasks[creep.task.tier] = Object.keys(this.freeTasks[creep.task.tier]).length > 0;
        }
        task.taskStarted(creep);
        task.execute(creep);
    }
    assignNewTask(creep, isNew = false) {
        let tier = (isNew ? 0 : creep.task.tier);
        let tasks = this.constructor["creepTasks"][tier];
        let lastCurrent = isNew || creep.task.current === undefined ? 0 : ((creep.task.current + 1) % tasks.length);
        let i = lastCurrent;
        let assigned = false, backup = null;
        if (this.validTasksCount[tier] > 0) {
            do {
                let task = this.controllerRoom.tasks.get(tasks[i]);
                if (this.isTaskFree(task, tier)) {
                    this.assignTask(creep, task, i);
                    assigned = true;
                    break;
                }
                if (backup === null && task.hasTarget) {
                    backup = i;
                }
                i = (i + 1) % tasks.length;
            } while (i !== lastCurrent);
        }
        if (!assigned && backup !== null) {
            this.assignTask(creep, this.controllerRoom.tasks.get(tasks[i]), backup);
        }
    }
    switchTask(creep) {
        if (this.constructor["creepTasks"][creep.task.tier] && this.constructor["creepTasks"][creep.task.tier][creep.task.current]) {
            this.controllerRoom.tasks.get(this.constructor["creepTasks"][creep.task.tier][creep.task.current]).taskEnded(creep);
        }
        creep.task.tier = (creep.task.tier + 1) % this.constructor["creepTasks"].length;
        creep.task.current = creep.task.tasks[creep.task.tier];
        let newTask = this.controllerRoom.tasks.get(this.constructor["creepTasks"][creep.task.tier][creep.task.current]);
        if (creep.task.current === undefined) {
            this.assignNewTask(creep);
        }
        else if (this.hasFreeTasks[creep.task.tier] &&
            !this.freeTasks[creep.task.tier][this.constructor["creepTasks"][creep.task.tier][creep.task.current]] &&
            !this.isTaskFree(newTask, creep.task.tier, 1)) {
            // if there are free tasks and current task is not one of them and reassiging away from crrent task doesnt make it a free task
            this.reassignTask(creep);
        }
        else {
            this.controllerRoom.tasks.get(newTask).taskStarted(creep);
        }
    }
    reassignTask(creep) {
        this.clearTask(creep);
        this.assignNewTask(creep);
    }
};
WorkerRole.creepParts = [WORK, CARRY, MOVE, MOVE];
WorkerRole.mainParts = [WORK, CARRY];
WorkerRole.creepTasks = [
    ["harvest"],
    ["dropoff", "build", "upgrade", "repair"],
];
WorkerRole.roleName = "worker";
WorkerRole = __decorate([
    Decorators.memory("roles"),
    Log
], WorkerRole);
var WorkerRole$1 = WorkerRole;

/**
 * Builder role.
 * @module role
 * @class BuilderRole
 * @extends WorkerRole
 */
let Builder = class Builder extends WorkerRole$1 {
    getMaxCount() {
        return 2 + (this.controllerRoom.tasks.get("build").hasTarget ? 2 : 0);
    }
};
Builder.creepParts = [WORK, CARRY, MOVE, MOVE];
Builder.mainParts = [WORK, CARRY];
Builder.creepTasks = [
    ["withdraw"],
    // let build and repair be managed by the same role,
    // with auto balancing
    ["build", "repair"],
];
Builder.roleName = "builder";
Builder = __decorate([
    Decorators.memory("roles"),
    Log
], Builder);
var Builder$1 = Builder;

/**
 * Builder role.
 * @module role
 * @class HarvesterRole
 * @extends BaseRole
 */
let Harvester = class Harvester extends Role$1 {
    init() { }
    getMaxCount() {
        // have a container for each source and one more for controller
        // hauler will haul from each container to other sources
        return this.controllerRoom.sourceManager.sources.size;
    }
    getMaxParts() {
        // WORK parts = energy available / energy harvested per tick per body / ticks available to work until regen
        return 2 * Math.ceil(SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME);
    }
};
Harvester.creepParts = [WORK, MOVE];
Harvester.mainParts = [WORK];
Harvester.addMove = false;
Harvester.creepTasks = [
    ["harvestForever"],
];
Harvester.roleName = "harvester";
Harvester = __decorate([
    Decorators.memory("roles"),
    Log
], Harvester);
var Harvester$1 = Harvester;

/**
 * Builder role.
 * @module role
 * @class HaulerRole
 * @extends WorkerRole
 */
let Hauler = class Hauler extends WorkerRole$1 {
    getMaxCount() {
        // have a container for each source and one more for controller and another one for towers
        // hauler will haul from each container to other sources
        return this.controllerRoom.sourceManager.sources.size + 2;
    }
    getMaxParts() {
        // CARRY parts = trips needed with 1 CARRY part per energy regen cycle / total possible trips per cycle
        // trips needed with 1 CARRY part per energy regen cycle = energy available / CARRY capacity / ticks in a regen cycle
        // total possible trips per cycle = ticks in a regen cycle / average time per trip
        // average time per trip = 2 * average one way trip distance + ticks to withdraw (1) + ticks to deposit (1)
        // we need to have a corresponding MOVE part per CARRY part
        return 2 * Math.ceil((SOURCE_ENERGY_CAPACITY / CARRY_CAPACITY / ENERGY_REGEN_TIME) /
            (ENERGY_REGEN_TIME / (2 * this.averageHaulDistance + 2)));
    }
};
Hauler.creepParts = [CARRY, MOVE];
Hauler.mainParts = [CARRY];
Hauler.creepTasks = [
    ["withdraw"],
    ["dropoff", "supply"],
];
Hauler.roleName = "hauler";
__decorate([
    Decorators.inMemory(() => 1),
    __metadata("design:type", Number)
], Hauler.prototype, "averageHaulDistance", void 0);
Hauler = __decorate([
    Decorators.memory("roles"),
    Log
], Hauler);
var Hauler$1 = Hauler;

let Upgrader = class Upgrader extends Role$1 {
    init() { }
    getMaxCount() {
        return 1;
    }
};
Upgrader.creepParts = [WORK, CARRY, CARRY, MOVE];
Upgrader.mainParts = [WORK];
Upgrader.creepTasks = [
    ["withdrawUpgrader"],
    ["upgrade"],
];
Upgrader.roleName = "upgrader";
Upgrader = __decorate([
    Decorators.memory("roles"),
    Log
], Upgrader);
var Upgrader$1 = Upgrader;

const ROLES_MAP = {
    [Builder$1.roleName]: Builder$1,
    [Harvester$1.roleName]: Harvester$1,
    [Hauler$1.roleName]: Hauler$1,
    [Upgrader$1.roleName]: Upgrader$1,
    [WorkerRole$1.roleName]: WorkerRole$1,
};
for (const roleName in ROLES_MAP) {
    if (ROLES_MAP.hasOwnProperty(roleName)) {
        ROLES_MAP[roleName].initClass();
    }
}
let RoleManager = class RoleManager extends BaseClass {
    constructor(controllerRoom) {
        super(controllerRoom.name);
        this.roleSuites = [EarlyGameRoleSuite, MidGameRoleSuite];
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
                    let creep = CreepWrapper$1.getCreepByName(creepName);
                    j = i;
                    this.roles.get[creep.role.name].removeCreep(creep);
                    while (newRole && newRole.creepsCount >= newRole.getMaxCount()) {
                        if (i === j) {
                            // if the loop has come all the way back to the beginig, suicide the creep as there are no free roles
                            creep.suicide();
                            delete Memory.creeps[creep.name];
                            newRole = null;
                        }
                        else {
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
        this.controllerRoom.tasks.forEach((taskName, task) => {
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
            this.roles.set(roleName, new ROLES_MAP[roleName](this.controllerRoom.name + "_" + roleName)
                .setControllerRoom(this.controllerRoom));
            this.roles.get(roleName).init();
        });
        return roleSuite;
    }
};
__decorate([
    Decorators.instancePolymorphMapInMemory(ROLES_MAP),
    __metadata("design:type", MemoryMap)
], RoleManager.prototype, "roles", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], RoleManager.prototype, "curRoleSuite", void 0);
RoleManager = __decorate([
    Decorators.memory("roleManager"),
    Log,
    __metadata("design:paramtypes", [ControllerRoom$1])
], RoleManager);
var RoleManager$1 = RoleManager;

let Task = class Task extends BaseClass {
    static initClass() {
        this.eventListeners.forEach((eventListener) => {
            eventBus.subscribe(eventListener.eventName, eventListener.method, "tasks." + this.taskName);
        });
        this.updateTargetEvents.forEach((eventListener) => {
            eventBus.subscribe(eventListener, "updateTargetsMap", "tasks." + this.taskName);
        });
    }
    init() {
        this.updateTargetsMap();
        this.hasTarget = Object.keys(this.targetsMap).length > 0;
    }
    ;
    setControllerRoom(controllerRoom) {
        this.controllerRoom = controllerRoom;
        return this;
    }
    getTarget(creep) {
        let target;
        if (!creep.task.targets[creep.task.tier]) {
            target = this.assignNewTarget(creep);
        }
        else {
            target = Game.getObjectById(creep.task.targets[creep.task.tier]);
        }
        if (!target || !this.isTargetValid(target)) {
            this.targetIsInvalid(creep, target);
            // if target is invalid, remove it from targets of the task and get a new target
            delete this.targetsMap[creep.task.targets[creep.task.tier]];
            target = this.assignNewTarget(creep);
        }
        this.hasTarget = Object.keys(this.targetsMap).length > 0;
        return target;
    }
    assignNewTarget(creep) {
        // get the closest target
        let target = Utils.getClosestObject(creep, Object.keys(this.targetsMap), (target) => {
            // filter out targets that are assgined to other creeps and are not valid for more
            // eg : creepA is picking up 50 energy from a container with 50 energy.
            //   creepB cannot pickup from the same container as there wont be energy left after creepA is done picking up
            return this.isAssignedTargetValid(target);
        });
        if (target) {
            creep.task.targets[creep.task.tier] = target.id;
            this.targetIsClaimed(creep, target);
        }
        return target;
    }
    updateTargetsMap(newTargets = null) {
        if (!newTargets || newTargets === 1) {
            // force updating targets
            this.targetsMap = this.getTargetsMap();
        }
        else {
            // add new targets from event
            newTargets.forEach((target) => {
                if (this.targetsFilter(target)) {
                    this.targetsMap[target.id] = 0;
                }
            });
        }
        this.hasTarget = Object.keys(this.targetsMap).length > 0;
    }
    getTargetsMap() {
        let targetsMap = {};
        this.getTargets().forEach((target) => {
            targetsMap[target] = 0;
        });
        return targetsMap;
    }
    execute(creep) {
        creep.processed = true;
        let target = this.getTarget(creep);
        this.logger.log(`Creep: ${creep.name} has target: ${target && target.id}`);
        // if there was no target found for this task
        if (!target) {
            return ERR_INVALID_TARGET;
        }
        // if the current task became invalid, return ERR_INVALID_TASK
        if (!this.isTaskValid(creep, target)) {
            return ERR_INVALID_TASK;
        }
        // if the creep has already reached target or it will in this tick, do the task
        // if (this.pathNavigation.moveCreep(creep,
        //   this.getTargetForMovement(creep, target)) === CREEP_REACHED_TARGET) {
        if (this.isNearTarget(creep, target)) {
            this.logger.log(`Creep ${creep.name} is at target: ${target && target.id}`);
            let returnValue = this.doTask(creep, target);
            if (returnValue === OK) {
                this.taskExecuted(creep, target);
            }
            return returnValue;
        }
        else {
            this.logger.log(`Creep ${creep.name} is moving to target: ${target && target.id}`);
            creep.moveTo(target, {
                reusePath: 0,
                // serializeMemory: true,
                visualizePathStyle: {
                    fill: 'transparent',
                    stroke: '#fff',
                    lineStyle: 'dashed',
                    strokeWidth: .15,
                    opacity: .1,
                },
            });
        }
        return OK;
    }
    taskStarted(creep) {
        if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
            let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
            if (target) {
                if (this.isAssignedTargetValid(target)) {
                    this.targetIsClaimed(creep, target);
                }
                else {
                    creep.task.targets[creep.task.tier] = null;
                }
            }
        }
    }
    taskEnded(creep) {
        if (creep.task && creep.task.targets && creep.task.targets[creep.task.tier]) {
            let target = Game.getObjectById(creep.task.targets[creep.task.tier]);
            // if (target.direction) {
            //   this.pathNavigation.moveCreepTowards(creep, target, false);
            // }
            if (target) {
                this.targetIsReleased(creep, target);
            }
        }
    }
    isTaskValid(creep, target) {
        return this.isTargetValid(target);
    }
    isNearTarget(creep, target) {
        this.logger.log(`isNearTarget? ${creep.pos.x},${creep.pos.y} : ${target.pos.x},${target.pos.y}`);
        return creep.pos.isNearTo(target);
    }
    getTargetForMovement(creep, target) {
        return target;
    }
    creepHasDied(creep) {
        this.taskEnded(creep);
    }
};
Task.eventListeners = [];
Task.updateTargetEvents = [];
Task.taskName = "base";
__decorate([
    Decorators.inMemory(() => { return {}; }),
    __metadata("design:type", Object)
], Task.prototype, "targetsMap", void 0);
__decorate([
    Decorators.inMemory(() => false),
    __metadata("design:type", Boolean)
], Task.prototype, "hasTarget", void 0);
__decorate([
    Decorators.instanceMapInMemoryByName(CreepWrapper$1),
    __metadata("design:type", MemoryMap)
], Task.prototype, "creeps", void 0);
__decorate([
    Decorators.inMemory(() => 0),
    __metadata("design:type", Number)
], Task.prototype, "creepsCount", void 0);
__decorate([
    Decorators.instanceInMemoryByName(ControllerRoom$1),
    __metadata("design:type", ControllerRoom$1)
], Task.prototype, "controllerRoom", void 0);
Task = __decorate([
    Decorators.memory("tasks")
], Task);

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class BuildTask
 * @extends BaseTask
 */
let Build = class Build extends Task {
    tick() { }
    doTask(creep, target) {
        creep.task.targetType = target.structureType;
        creep.task.targetPos = {
            x: target.pos.x,
            y: target.pos.y
        };
        return creep.build(target);
    }
    targetIsInvalid(creep, target) {
        let newTarget = target ||
            this.controllerRoom.room.lookForAt(LOOK_STRUCTURES, creep.task.targetPos.x, creep.task.targetPos.y)[0];
        if (newTarget && creep.task.targetType) {
            eventBus.fireEvent(STRUCURE_BUILT, newTarget);
        }
    }
    taskStarted(creep) {
        super.taskStarted(creep);
        let source = Game.getObjectById(creep.task.source);
        if (source) {
            var dir = Utils.rotateDirection(Utils.getDirectionBetweenPos(creep.pos, source.pos), 4);
            creep.move(dir);
        }
    }
    isTaskValid(creep, target) {
        return creep.carry.energy > 0;
    }
    targetIsClaimed(creep, target) {
        // TODO consider boosted parts
        this.targetsMap[target.id] += creep.carry.energy;
    }
    targetIsReleased(creep, target) {
        // TODO consider boosted parts
        this.targetsMap[target.id] -= creep.carry.energy;
    }
    taskExecuted(creep, target) { }
    isAssignedTargetValid(target) {
        return target && (target.progressTotal - this.targetsMap[target.id]) > 0;
    }
    getTargets() {
        return this.controllerRoom.room.find(FIND_CONSTRUCTION_SITES).map((target) => target.id);
    }
    targetsFilter(target) {
        return true;
    }
    isTargetValid(target) {
        return true;
    }
};
Build.updateTargetEvents = [CONSTRUCTION_SITE_ADDED];
Build.taskName = "build";
Build = __decorate([
    Decorators.memory("tasks"),
    Log
], Build);
var Build$1 = Build;

/**
 * Task to drop off energy to spawn, extension or other structures that take energy (TODO)
 *
 * @module task
 * @class DropOffTask
 * @extends BaseTask
 */
let Dropoff = class Dropoff extends Task {
    static initClass() {
        Task.initClass.call(this);
        this.updatePotentialTargetEvents.forEach((eventListener) => {
            eventBus.subscribe(eventListener, "updatePotentialTargets", "tasks." + this.taskName);
        });
    }
    init() {
        this.potentialTargets = this.getPotentialTargets();
        this.updateTargetsMap(1);
    }
    updatePotentialTargets(newPotentialTargets) {
        this.potentialTargets.push(...newPotentialTargets.filter((structure) => {
            return this.potentialTargetsFilter(structure);
        }).map(newPotentialTarget => newPotentialTarget.id));
        this.potentialTargets = _.uniq(this.potentialTargets);
        this.updateTargetsMap(1);
    }
    getPotentialTargets() {
        return this.controllerRoom.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return this.potentialTargetsFilter(structure);
            }
        }).map((structure) => structure.id);
    }
    potentialTargetsFilter(structure) {
        return structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN;
    }
    getTargets() {
        return this.potentialTargets.filter((potentialTarget) => {
            return this.isTargetValid(Game.getObjectById(potentialTarget));
        });
    }
    targetsFilter(structure) {
        return this.potentialTargetsFilter(structure);
    }
    doTask(creep, target) {
        return creep.transfer(target, RESOURCE_ENERGY);
    }
    isTaskValid(creep, target) {
        return creep.carry.energy > 0;
    }
    isTargetValid(target) {
        return target.energy < target.energyCapacity;
    }
    targetIsClaimed(creep, target) {
        this.targetsMap[target.id] += creep.carry.energy;
    }
    targetIsReleased(creep, target) {
        this.targetsMap[target.id] -= creep.carry.energy;
    }
    isAssignedTargetValid(target) {
        return ((target.energyCapacity - target.energy) - this.targetsMap[target.id]) > 0;
    }
    tick() { }
    taskExecuted(creep, target) { }
    targetIsInvalid(creep, target) { }
};
Dropoff.updateTargetEvents = [CREEP_CREATED];
Dropoff.updatePotentialTargetEvents = [EXTENSION_BUILT];
Dropoff.taskName = "dropoff";
__decorate([
    Decorators.inMemory(),
    __metadata("design:type", Object)
], Dropoff.prototype, "potentialTargets", void 0);
Dropoff = __decorate([
    Decorators.memory("tasks"),
    Log
], Dropoff);
var Dropoff$1 = Dropoff;

/**
 * Task to harvest source
 *
 * @module task
 * @class HarvestTask
 * @extends BaseTask
 */
let Harvest = class Harvest extends Task {
    tick() {
        this.hasTarget = true;
    }
    getTarget(creep) {
        if (!creep.task.source) {
            this.controllerRoom.sourceManager.findAndClaimSource(creep);
        }
        return Game.getObjectById(creep.task.source);
    }
    updateTargetsMap() {
        // dummy
    }
    getTargets() {
        return [];
    }
    doTask(creep, target) {
        return creep.harvest(target);
    }
    isTaskValid(creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    }
    targetIsReleased(creep, target) {
        SourceWrapper$1.getSourceWrapperById(target.id, this.controllerRoom).release(creep);
    }
    getTargetForMovement(creep, target) {
        return target.spaces[creep.task.space];
    }
    creepHasDied(creep) {
        super.creepHasDied(creep);
        if (creep.task) {
            let source = Game.getObjectById(creep.task.source);
            if (source) {
                SourceWrapper$1.getSourceWrapperById(source.id, this.controllerRoom).release(creep);
            }
        }
    }
    targetsFilter(target) {
        return true;
    }
    taskExecuted(creep, target) { }
    isTargetValid(target) {
        return true;
    }
    targetIsClaimed(creep, target) { }
    targetIsInvalid(creep, target) { }
    isAssignedTargetValid(target) {
        return true;
    }
};
Harvest.taskName = "harvest";
Harvest = __decorate([
    Decorators.memory("tasks"),
    Log
], Harvest);
var Harvest$1 = Harvest;

let Repair = class Repair extends Build$1 {
    updateTargetsMap() {
        this.getTargets().forEach((target) => {
            this.targetsMap[target] = this.targetsMap[target] || 0;
        });
        this.hasTarget = Object.keys(this.targetsMap).length > 0;
    }
    getTargets() {
        return this.controllerRoom.room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax / 2
        }).map((target) => target.id);
    }
    doTask(creep, target) {
        return creep.repair(target);
    }
    isTargetValid(target) {
        return target && target.hits >= target.hitsMax;
    }
    isAssignedTargetValid(target) {
        return (target.hitsMax - target.hits - this.targetsMap[target.id]) > 0;
    }
};
Repair.taskName = "repair";
Repair.updateTargetEvents = [PERIODIC_10_TICKS];
Repair = __decorate([
    Decorators.memory("tasks"),
    Log
], Repair);
var Repair$1 = Repair;

/**
 * Store in containers
 *
 * @module task
 * @class StoreTask
 * @extends DropOffTask
 */
let Store = class Store extends Dropoff$1 {
    doTask(creep, target) {
        let returnValue = creep.transfer(target, RESOURCE_ENERGY);
        if (returnValue === OK && target.store && target.store.energy === 0) {
            eventBus.fireEvent(ENERGY_STORED, target);
        }
        return returnValue;
    }
    potentialTargetsFilter(structure) {
        return structure.structureType === STRUCTURE_CONTAINER &&
            structure.label === HARVESTER_STORAGE;
    }
};
Store.taskName = "store";
Store.updateTargetEvents = [ENERGY_WITHDRAWN];
Store.updatePotentialTargetEvents = [CONTAINER_BUILT];
Store = __decorate([
    Decorators.memory("tasks"),
    Log
], Store);
var Store$1 = Store;

let Supply = class Supply extends Dropoff$1 {
    potentialTargetsFilter(structure) {
        return (structure.structureType === STRUCTURE_CONTAINER && structure.label === UPGRADER_STORAGE) ||
            structure.structureType === STRUCTURE_TOWER;
    }
};
Supply.taskName = "supply";
Supply.updateTargetEvents = [ENERGY_WITHDRAWN, TOWER_USED_ENERGY];
Supply.updatePotentialTargetEvents = [CONTAINER_BUILT, TOWER_BUILT];
Supply = __decorate([
    Decorators.memory("tasks"),
    Log
], Supply);
var Supply$1 = Supply;

let Upgrade = class Upgrade extends Task {
    tick() { }
    getTarget() {
        return this.controllerRoom.room.controller;
    }
    getTargets() {
        return [this.controllerRoom.controller.id];
    }
    doTask(creep, target) {
        return creep.upgradeController(target);
    }
    isTargetValid(target) {
        // TODO
        return true;
    }
    targetsFilter(target) {
        return true;
    }
    taskExecuted(creep, target) { }
    targetIsClaimed(creep, target) { }
    targetIsReleased(creep, target) { }
    targetIsInvalid(creep, target) { }
    isAssignedTargetValid(target) {
        return true;
    }
    isNearTarget(creep, target) {
        return creep.pos.inRangeTo(target, 2);
    }
};
Upgrade.taskName = "upgrade";
Upgrade = __decorate([
    Decorators.memory("tasks"),
    Log
], Upgrade);
var Upgrade$1 = Upgrade;

/**
 * Task to withdraw energy from containers
 *
 * @module task
 * @class Withdraw
 * @extends StoreTask
 */
let Withdraw = class Withdraw extends Store$1 {
    doTask(creep, target) {
        let returnValue = creep.withdraw(target, RESOURCE_ENERGY);
        if (returnValue === OK && target.store && target.store.energy === target.storeCapacity) {
            eventBus.fireEvent(ENERGY_WITHDRAWN, target);
        }
        return returnValue;
    }
    isTaskValid(creep, target) {
        return creep.carry.energy < creep.carryCapacity;
    }
    isTargetValid(target) {
        return target.store && target.store.energy > 0;
    }
    isAssignedTargetValid(target) {
        return (target.store.energy - this.targetsMap[target.id]) > 0;
    }
};
Withdraw.taskName = "withdraw";
Withdraw.updateTargetEvents = [ENERGY_STORED, PERIODIC_10_TICKS];
Withdraw.updatePotentialTargetEvents = [CONTAINER_BUILT];
Withdraw = __decorate([
    Decorators.memory("tasks"),
    Log
], Withdraw);
var Withdraw$1 = Withdraw;

let HarvestForever = class HarvestForever extends Harvest$1 {
    isTaskValid(creep, target) {
        return true;
    }
    getTargetForMovement(creep, target) {
        return target;
    }
};
HarvestForever.taskName = "harvestForever";
HarvestForever.eventListeners = [];
HarvestForever.updateTargetEvents = [];
HarvestForever = __decorate([
    Decorators.memory("tasks"),
    Log
], HarvestForever);
var HarvestForever$1 = HarvestForever;

let WithdrawUpgrader = class WithdrawUpgrader extends Withdraw$1 {
    potentialTargetsFilter(structure) {
        return structure.structureType === STRUCTURE_CONTAINER &&
            structure.label === UPGRADER_STORAGE;
    }
};
WithdrawUpgrader.taskName = "withdrawUpgrader";
WithdrawUpgrader.updateTargetEvents = [ENERGY_STORED];
WithdrawUpgrader.updatePotentialTargetEvents = [CONTAINER_BUILT];
WithdrawUpgrader = __decorate([
    Decorators.memory("tasks"),
    Log
], WithdrawUpgrader);
var WithdrawUpgrader$1 = WithdrawUpgrader;

var ControllerRoom_1;
let roomObjects = new Map();
const TASKS_MAP = {
    [Build$1.taskName]: Build$1,
    [Dropoff$1.taskName]: Dropoff$1,
    [Harvest$1.taskName]: Harvest$1,
    [HarvestForever$1.taskName]: HarvestForever$1,
    [Repair$1.taskName]: Repair$1,
    [Store$1.taskName]: Store$1,
    [Supply$1.taskName]: Supply$1,
    [Upgrade$1.taskName]: Upgrade$1,
    [Withdraw$1.taskName]: Withdraw$1,
    [WithdrawUpgrader$1.taskName]: WithdrawUpgrader$1,
};
for (const taskName in TASKS_MAP) {
    if (TASKS_MAP.hasOwnProperty(taskName)) {
        TASKS_MAP[taskName].initClass();
    }
}
let ControllerRoom = ControllerRoom_1 = class ControllerRoom {
    constructor(room) {
        this.name = room.name;
        this.room = room;
        for (const taskName in TASKS_MAP) {
            if (TASKS_MAP.hasOwnProperty(taskName)) {
                const TaskClass = TASKS_MAP[taskName];
                this.tasks.set(taskName, new TaskClass(this.name + "_" + taskName)
                    .setControllerRoom(this));
            }
        }
        this.sourceManager = new SourceManager$1(this);
        this.pathManager = new PathManager$1(this.name);
        this.buildManager = new BuildManager$1(this);
        this.roleManager = new RoleManager$1(this);
        this.roleManager.initCurRoles();
    }
    tick() {
        this.logger.log("State:", this.state);
        switch (this.state) {
            case ROOM_STATE_UNOCCUPIED:
            case ROOM_STATE_UNDEVELOPED:
                this.state = ROOM_STATE_UNINITIALIZED;
            case ROOM_STATE_UNINITIALIZED:
                if (this.buildManager.plan()) {
                    this.state = ROOM_STATE_INITIALIZED;
                    for (const taskName in TASKS_MAP) {
                        if (TASKS_MAP.hasOwnProperty(taskName)) {
                            this.tasks.get(taskName).init();
                        }
                    }
                }
                break;
            case ROOM_STATE_INITIALIZED:
                this.buildManager.build();
                this.roleManager.tick();
                break;
        }
    }
    static getRoomByRoomName(roomName) {
        return this.getRoomByRoomInstance(Game.rooms[roomName]);
    }
    static getRoomByRoomInstance(room) {
        let controllerRoom;
        if (roomObjects.has(room.name)) {
            controllerRoom = roomObjects.get(room.name);
        }
        else {
            controllerRoom = new ControllerRoom_1(room);
            roomObjects.set(room.name, controllerRoom);
        }
        return controllerRoom;
    }
};
__decorate([
    Decorators.alias("room.controller"),
    __metadata("design:type", StructureController)
], ControllerRoom.prototype, "controller", void 0);
__decorate([
    Decorators.inMemory(() => ROOM_STATE_UNOCCUPIED),
    __metadata("design:type", String)
], ControllerRoom.prototype, "state", void 0);
__decorate([
    Decorators.instancePolymorphMapInMemory(TASKS_MAP),
    __metadata("design:type", MemoryMap)
], ControllerRoom.prototype, "tasks", void 0);
ControllerRoom = ControllerRoom_1 = __decorate([
    Decorators.memory("rooms", "name"),
    Log,
    __metadata("design:paramtypes", [Room])
], ControllerRoom);
var ControllerRoom$1 = ControllerRoom;

let Brain = class Brain extends BaseClass {
    tick() {
        eventBus.preTick();
        try {
            this.rooms.forEach((roomName) => {
                let room = Game.rooms[roomName];
                this.logger.log("Room:", room && room.name);
                if (room && room.controller && room.controller.my) {
                    let controllerRoom = new ControllerRoom$1(room);
                    controllerRoom.tick();
                    // if (controllerRoom.buildManager) {
                    //   let visual = new RoomVisual(room.name);
                    //   controllerRoom.buildManager.buildings.forEach((buildingName, building) => {
                    //     building.planned.forEach((plan) => {
                    //       visual.circle(plan[0], plan[1], {fill : (building.constructor["visualColor"])});
                    //     });
                    //   });
                    // }
                }
            });
        }
        catch (err) {
            this.logger.log(err.stack);
        }
        eventBus.postTick();
    }
};
__decorate([
    Decorators.inMemory(function () {
        return Object.keys(Game.rooms);
    }),
    __metadata("design:type", Array)
], Brain.prototype, "rooms", void 0);
Brain = __decorate([
    Decorators.memory("brain"),
    Log
], Brain);
var Brain$1 = Brain;

let logger = new Logger("Main");
module.exports.loop = function () {
    logger.log(`----------------------New Loop${Game.time}----------------------`);
    (new Brain$1("brain")).tick();
    logger.log(`----------------------End Loop${Game.time}----------------------`);
};

}(_));
