module.exports = {
    types : {
        "spawn" : require("build.spawn"),
        "container" : require("build.container"),
        "extension" : require("build.extension"),
        "road" : require("build.road"),
        "wall" : require("build.wall"),
        "tower" : require("build.tower"),
    },
    initObjects : [{
        getter : function(buildPlanner) {
            return [buildPlanner.center];
        },
        type : "spawn",
    }, {
        getter : function(buildPlanner) {
            let cursorObjects = [];
            cursorObjects.push(...buildPlanner.room.sources.map((energySource) => {
                return {
                    source : buildPlanner.center,
                    target : energySource.pos,
                    range : 1,
                };
            }), {
                source : buildPlanner.center,
                target : buildPlanner.room.controller.pos,
                range : 3,
            });
            return cursorObjects;
        },
        type : "road",
    }, {
        getter : function(buildPlanner) {
            return buildPlanner.room.paths;
        },
        type : "container",
    // }, {
    //     getter : function(buildPlanner) {
    //         return buildPlanner.room.sources.map((energySource) => {
    //             return {
    //                 source : energySource.container,
    //                 target : buildPlanner.room.controller.container,
    //                 range : 0,
    //             };
    //         });
    //     },
    //     type : "road",
    }, {
        getter : function(buildPlanner) {
            //return buildPlanner.room.paths.slice(0, buildPlanner.room.sourceManager.source.length + 1);
            return buildPlanner.room.paths;
        },
        type : "tower",
    }, {
        getter : function(buildPlanner) {
            //return buildPlanner.room.paths.slice(0, buildPlanner.room.sourceManager.source.length + 1);
            return buildPlanner.room.paths;
        },
        type : "extension",
    }, {
        getter : function(buildPlanner) {
            return Object.keys(Game.map.describeExits(buildPlanner.room.name));
        },
        type : "wall",
    }],
};
