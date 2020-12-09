////////////////////////////////////////////////////////////////////////////////
module.exports.loop = class Main {

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly miscLib = require(`Libs/MiscLib`),
        private readonly moveLib = require(`Libs/MoveLib`),
    ) {

        // Every 8 ticks (roughly)
        if(this.miscLib.gamble(1 / 8)) {
            this.purgeOldMemories('creeps');
            // this.purgeOldMemories('structures');
            this.purgeOldMemories('rooms');
        }

        // Every tick
        this.controlRooms();
        this.controlStructures();
        this.controlCreeps();

        // Done
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** Delete the memories of dead entities.
     * @param entityType The type of entity the memories of which to purge
    **/
    private purgeOldMemories(entityType: 'creeps'|'rooms'): void {
        for(const name of Object.keys(Memory[entityType])) {
            if(!Game[entityType][name]) {
                delete Memory[entityType][name];
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private controlRooms(): void {
        for(const room of Object.values(Game.rooms)) {
            try {
                if(room.controller?.my) {
                    require(`AIs/RoomAI`).run(room);
                }
            } catch(error) {
                console.log(error.stack);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private controlStructures(): void {
        for(const structure of Object.values(Game.structures)) {
            try {
                switch(structure.structureType) {

                    case STRUCTURE_SPAWN:
                    require(`AIs/Structures/SpawnAI`).run(structure);
                    break;

                    case STRUCTURE_TOWER:
                    require(`AIs/Structures/TowerAI`).run(structure);
                    break;

                    case STRUCTURE_TERMINAL:
                    require(`AIs/Structures/TerminalAI`).run(structure);
                    break;

                    case STRUCTURE_LINK:
                    require(`AIs/Structures/LinkAI`).run(structure);
                    break;
                }
            } catch(error) {
                console.log(error.stack);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private controlCreeps(): void {
        for(const creep of Object.values(Game.creeps)) {
            try {
                if(creep.spawning) continue;

                // Setup
                if(creep.memory === undefined) {
                    creep.memory = {
                        role: CreepRole.manual,
                    };
                }

                // Debug
                // delete creep.memory.target; // Useful when you need to reset everyone's tasks.
                // delete creep.memory.path;   // Useful when you need to reset everyone's paths.

                // Load AIs
                switch(creep.memory.role) {

                    case CreepRole.worker:
                    require(`AIs/Creeps/WorkerAI`).run(creep);
                    break;

                    case CreepRole.fighter:
                    require(`AIs/Creeps/FighterAI`).run(creep);
                    break;

                    case CreepRole.claimer:
                    require(`AIs/Creeps/ClaimerAI`)(this.moveLib).run(creep);
                    break;

                    case CreepRole.manual:
                    require(`AIs/Creeps/ManualAI`)(this.moveLib).run(creep);
                    break;

                    default:
                    throw new TypeError(`\`${creep.memory.role}\` not in \`CreepRole\` enumeration!`);
                }

            } catch(error) {
                console.log(error.stack);
            }
        }
    }
};