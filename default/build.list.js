module.exports = {
    types : [{
        name : "extension",
        api : require("build.extension"),
    }, {
        name : "road",
        api : require("build.road"),
    }],
    initOrder : [1, 0],
};
