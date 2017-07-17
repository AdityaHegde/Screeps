let utils = require("utils");
let BaseClass = require("base.class");
let PathInfo = require("path.info");

let GridPostition = BaseClass("gridPosition", "gridPositions");

//utils.definePosPropertyInMemory(GridPostition, "center");
utils.definePosPropertyInMemory(GridPostition, "pathRoot");
utils.definePropertyInMemory(GridPostition, "grid", function() {
    return {};
});

GridPostition.prototype.init = function(room, center, directions, path, size = 1) {
    this.center = center;
    this.directions = utils.getSortedDirections(directions);
    this.pathRoot = path[path.length - size];

    let workingPath = [], waitingPath = [], lastPos2;

    this.directions.forEach((direction) => {
        let pos1 = utils.getPosByDirection(this.center, direction);
        let pos2 = utils.getPosByDirection(pos1, direction);
        workingPath.push(pos1);
        if (lastPos2) {
            waitingPath.push(utils.getPosByDirection(pos2, utils.rotateDirection(direction, -1)));
        }
        waitingPath.push(pos2);
    });

    let foundPath = false;
    for (let i = 0, j = 0; i < workingPath.length; i++) {
        foundPath = waitingPath[j].isEqualTo(this.pathRoot.x, this.pathRoot.y);
        if (!foundPath && j < waitingPath.length - 1) {
            while (workingPath[i].getRangeTo(waitingPath[j+1]) == 1 &&
                   !waitingPath[j].isEqualTo(this.pathRoot.x, this.pathRoot.y)) {
                j++;
            }
        }
        this.grid["0"+i] = {
            creep : null,
            waitingPathIdx : j,
            direction : workingPath[i].getDirectionTo(waitingPath[j]),
            waiting : 0,
        };
        this.grid["1"+i] = {
            creep : null,
            workingPathIdx : i,
            direction : waitingPath[j].getDirectionTo(workingPath[i]),
        };
    }
    // [ ][ ][ ][ ][ ][ ]
    // [2][2][2][2][2][P]
    // [ ][1][1][1][P][ ]
    // [ ][ ][S][P][2][ ]
    // [ ][ ][1][1][2][ ]
    // [ ][2][2][2][2][ ]
    // [ ][ ][ ][ ][ ][ ]

    //room.addPath(utils.getPathFromPoints(workingPath));
    room.addPath(utils.getPathFromPoints(waitingPath));

    return this;
};

GridPostition.prototype.assignSlot = function(creep) {
    let distance = -1;
    if (this.workingCount < this.directions.length - 1) {
        distance = 1;
    }
    else if (this.waitingCount < this.directions.length - 1) {
        distance = 2;
    }

    if (distance > 0) {
        let slot, pos;
        let direction = _.find(this.directions, (_direction) => {
            pos = utils.getPosByDirection(this.center, _direction);
            if (this.grid[pos.x + "__" + pos.y].creep == null) {
                slot = this.grid[pos.x + "__" + pos.y];
                return true;
            }
            return false;
        });
        slot.creep = creep.name;
        creep.gridPosition = this;
        creep.gridMove = pos;

        return true;
    }

    return false;
};

GridPostition.prototype.releaseSlot = function(creep) {
    let pos1;
    this.directions.every((direction) => {
        let pos = utils.getPosByDirection(this.center, direction);
        if (this.grid[pos.x + "__" + pos.y].creep == creep.name) {
            pos1 = pos;
            return false;
        }
        return true;
    });

    if (pos1) {
        let pos2 = utils.getPosByDirection(pos1, direction);

        if (this.grid[pos2.x + "__" + pos2.y].creep != null) {
            this.grid[pos1.x + "__" + pos1.y].creep = this.grid[pos2.x + "__" + pos2.y].creep;
            this.grid[pos2.x + "__" + pos2.y].creep = null;
            let creep2 = Game.creeps[this.grid[pos2.x + "__" + pos2.y].creep];
            creep2.gridMove = pos1;
        }
        else {
            this.grid[pos1.x + "__" + pos1.y].creep = null;
        }

        creep1.gridMove = this.pathRoot;
    }
};

GridPostition.prototype.moveCreep = function(creep) {

};
