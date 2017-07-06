let brainManager = require("brain.manager");

module.exports.loop = function () {
    let brain = Game.flags.brain;

    if (brain) {
        if (!brain.memory.isInitialized) {
            brain.init();
            brain.memory.isInitialized = true;
            console.log(Game.cpu.getUsed(), "cpu used during init");
        }

        brain.tick();
    }
};
