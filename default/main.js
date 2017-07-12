let Brain = require("brain.manager");

module.exports.loop = function () {
    (new Brain("brain")).tick();
};
