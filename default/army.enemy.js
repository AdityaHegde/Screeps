var constants = require("constants");
var utils = require("utils");
var TARGET_TYPE_ORDER = ["healers", "melee", "ranged"];

/**
 * Assembles enemy army and returns possbible targets in priority order
 * @module army
 * @submodule enemy
 */

module.exports = {
    init : function(room, creeps) {
        var armyInfo = {
            melee : [],
            ranged : [],
            healers : [],
            maxX : -1,
            maxY : -1,
            minX : 99999,
            minY : 99999,
        };

        creeps = creeps || room.find(FIND_HOSTILE_CREEPS);

        creeps.forEach(function(creep) {
            if (creep.getActiveBodyparts(ATTACK)) {
                armyInfo.melee.push(creep);
            }
            if (creep.getActiveBodyparts(RANGED_ATTACK)) {
                armyInfo.ranged.push(creep);
            }
            if (creep.getActiveBodyparts(HEAL)) {
                armyInfo.healers.push(creep);
            }
            if (creep.pos.x > armyInfo.maxX) {
                armyInfo.maxX = creep.pos.x;
            }
            if (creep.pos.y > armyInfo.maxY) {
                armyInfo.maxY = creep.pos.y;
            }
            if (creep.pos.x < armyInfo.minX) {
                armyInfo.minX = creep.pos.x;
            }
            if (creep.pos.y < armyInfo.minY) {
                armyInfo.minY = creep.pos.y;
            }
        });

        return {
            targets : _.flatten(
                TARGET_TYPE_ORDER.map((targetType) => {
                    return armyInfo[targetType].sort((creep1, creep2) => {
                        return creep1.maxHits - creep2.maxHits;
                    }).map(creep => creep.id);
                })
            ),
            area : {
                left : armyInfo.minX,
                top : armyInfo.minY,
                right : armyInfo.maxX,
                bottom : armyInfo.maxY,
            },
        };
    },
};
