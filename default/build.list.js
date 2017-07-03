module.exports = {
    types : [{
        name : "extension",
        api : require("build.extension"),
    }, {
        name : "road",
        api : require("build.road"),
    }, {
        name : "wall",
        api : require("build.wall"),
    }, {
        name : "container",
        api : require("build.container"),
    }, {
        name : "tower",
        api : require("build.tower"),
    }],
    initOrder : [1, 0, 2, 3, 4],
};
