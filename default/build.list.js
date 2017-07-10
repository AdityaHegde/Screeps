module.exports = {
    types : {
        "container" : require("build.container"),
        "extension" : require("build.extension"),
        "road" : require("build.road"),
        "wall" : require("build.wall"),
        "tower" : require("build.tower"),
    },
    buildOrder : ["container", "extension", "road", "wall", "tower"],
    initOrder : ["road", "container", "extension", "wall", "tower"],
};
