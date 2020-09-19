module.exports.loop = class Main {

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly miscLib = require(`libs/misc.lib`),
        private readonly moveLib = require(`libs/move.lib`),
    ) {

        // Every 8 ticks
        if(this.miscLib.gamble(1 / 8)) {
            this.cleanMemories();
        }

        // Every tick
        this.setAis();

        // Done
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** Delete the memories of dead entities */
    private cleanMemories(): void {

        // Creeps
        for(const name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }

        // // Structures
        // for(const name in Memory.structures) {
        //     if(!Game.structures[name]) {
        //         delete Memory.structures[name];
        //     }
        // }

        // Rooms
        for(const name in Memory.rooms) {
            if(!Game.rooms[name]) {
                delete Memory.rooms[name];
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private setAis(): void {
        this.upliftRooms();
        this.upliftStructures();
        this.upliftCreeps();
    }

    ////////////////////////////////////////////////////////////////////////////////
    private upliftRooms(): void {
        for(const name in Game.rooms) {
            try {
                const room = Game.rooms[name];
                if(room.controller?.my) {
                    require(`role.room`).run(room);
                }
            } catch(error) {
                console.log(error.stack);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private upliftStructures(): void {
        for(const name in Game.structures) {
            try {
                const structure = Game.structures[name];
                switch(structure.structureType) {

                    case STRUCTURE_SPAWN:
                    require(`roles/spawn.role`).run(structure);
                    break;

                    case STRUCTURE_TOWER:
                    require(`roles/tower.role`).run(structure);
                    break;

                    case STRUCTURE_TERMINAL:
                    require(`roles/terminal.role`).run(structure);
                    break;

                    case STRUCTURE_LINK:
                    require(`roles/link.role`).run(structure);
                    break;
                }
            } catch(error) {
                console.log(error.stack);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    private upliftCreeps(): void {
        for(const name in Game.creeps) {
            try {

                // Setup
                const creep = Game.creeps[name];
                if(!creep.memory) {
                    creep.memory = {
                        role: CreepRole.manual,
                    };
                }

                // Debug
                // creep.memory.target = undefined; // Useful when you need to reset everyone's tasks.
                // creep.memory.path   = undefined; // Useful when you need to reset everyone's paths.

                // Load AIs
                if(creep.spawning) continue;
                switch(creep.memory.role) {

                    case CreepRole.worker:
                    require(`roles/worker.role`).run(creep);
                    break;

                    case CreepRole.fighter:
                    require(`roles/fighter.role`).run(creep);
                    break;

                    case CreepRole.claimer:
                    require(`roles/claimer.role`)(this.moveLib).run(creep);
                    break;

                    case CreepRole.manual:
                    require(`roles/manual.role`)(this.moveLib).run(creep);
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
