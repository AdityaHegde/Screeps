module.exports = {
    types : [{
        name : "container",
        api : require("build.container"),
    }, {
        name : "extension",
        api : require("build.extension"),
    }, {
        name : "road",
        api : require("build.road"),
    }, {
        name : "wall",
        api : require("build.wall"),
    }, {
        name : "tower",
        api : require("build.tower"),
    }],
    initOrder : [2, 0, 1, 3, 4],
};
