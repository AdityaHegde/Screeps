let brainManager = require("brain.manager");

module.exports.loop = function () {
    let brain = new Brain("brain");

    if (!brain.isInitialized) {
        brain.init();
        brain.isInitialized = true;
        console.log(Game.cpu.getUsed(), "cpu used during init");
    }

    brain.tick();
};
