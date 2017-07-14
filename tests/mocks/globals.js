module.exports = function(sandbox) {
    global.Game = {
        time : 0,
        cpu : {
            tickLimit : 0,
            getUsed : sandbox.stub(),
        },
        rooms : {},
        spawns : {},
        creeps : {},
        map : {
            getTerrainAt : sandbox.stub(),
            describeExits : sandbox.stub(),
        },
        getObjectById : sandbox.stub(),
    };

    global.Room = sandbox.stub();
    global.Room.serializePath = sandbox.stub();
    global.Room.deserializePath = sandbox.stub();

    global.RoomPosition = sandbox.stub();

    global.Creep = sandbox.stub();

    global.Memory = {};

    global.Source = sandbox.stub();

    global.Mineral = sandbox.stub();

    global.StructureContainer = sandbox.stub();
    global.StructureExtension = sandbox.stub();
    global.StructureSpawn = sandbox.stub();
    global.StructureTower = sandbox.stub();
};
