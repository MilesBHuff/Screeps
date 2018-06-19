// main.js
// #############################################################################

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {
    "use strict";

    updateRooms();
    manageEntities();
    cleanup();
    setAis();

    // Update rooms
    // *****************************************************************************
    function updateRooms() {
		let name, room;
        for(name in Game.rooms) {
            room = Game.rooms[name];
            if(!room && !room.controller && !room.controller.my) break;

            // Every tick
            condemnedStructures();

            // Every 8 ticks
            if(!Math.floor(Math.random() * 8)) {
                savedStructures();
                setCreepLimits();
            } //fi

        } //done

        // Condemned structures
        // =============================================================================
        function condemnedStructures() {

            // If there is no array of condemned structures for this room, create one.
            if(!room.memory || !room.memory.dismantle) {
                room.memory.dismantle = Array();
            } //fi

            // Update the array.
            for(let i = 0; room.memory.dismantle[i]; i++) {
                if(!Game.getObjectById(room.memory.dismantle[i])) {
                    room.memory.dismantle.splice(i, 1);
                    i--;
                } //fi
            } //done

        } //condemnedStructures

        // TODO:  Saved structures
        // =============================================================================
        function savedStructures() {
            if(!room.memory || !room.memory.layout) {
                room.memory.layout = Array();
            } //fi
        } //savedStructures

        // Set limits for creeps in each room
        // =============================================================================
        function setCreepLimits() {
            room.memory.fighterLimit = 1.5;
            room.memory.healerLimit  = 0.0;
            room.memory.workerLimit  = 1.0;

            setWorkerLimit();
            setFighterLimit();
            setIfHostiles();
            roundLimits();

            // Workers
            // -----------------------------------------------------------------------------
            function setWorkerLimit() {
                // Modify the number of workers per the level of the controller.
                room.memory.workerLimit += (Math.round((CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][DEFINES.CONTROLLER_LEVEL_MAX] - room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(structure.structureType === STRUCTURE_EXTENSION);}}).length) / 10)) / 2;
                // Multiply the number of workers by the number of sources and mineral extractors in the room.
                room.memory.workerLimit *= room.find(FIND_SOURCES).length; // + room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(structure.structureType === STRUCTURE_EXTRACTOR);}}).length;
            } //setWorkerLimit

            // Fighters
            // -----------------------------------------------------------------------------
            function setFighterLimit() {

                // Count the number of exits to uncontrolled rooms
                let exits      = Game.map.describeExits(room.name);
                let exitsCount = 0;
                for(let i = 0; i < 4; i++) {
                    let index = ((2 * i) + 1).toString();
                    if(exits[index]
                    &&  !( Game.rooms[exits[index]]
                        && Game.rooms[exits[index]].controller
                        && Game.rooms[exits[index]].controller.my
                        )
                    ) {
                        exitsCount++;
                    } //fi
                } //done
                exits = undefined;

                // Multiply fighterLimit by the number of exits
                room.memory.fighterLimit *= exitsCount;

            } //fighterLimit

            // When hostiles are present
            // -----------------------------------------------------------------------------
            function setIfHostiles() {
                // Increment fighterLimit by the number of hostiles, and set healerLimit to fighterLimit / 4.
                let hostileCount = room.find(FIND_HOSTILE_CREEPS).length;
                if(hostileCount) {
                    room.memory.fighterLimit += hostileCount;
                    room.memory.healerLimit   = Math.ceil(room.memory.fighterLimit / 4);
                } //fi
                hostileCount = undefined;
            } //setIfHostiles

            // Round off the creep limits
            // -----------------------------------------------------------------------------
            function roundLimits() {
                room.memory.fighterLimit = Math.round(room.memory.fighterLimit);
                room.memory.healerLimit  = Math.round(room.memory.healerLimit );
                room.memory.workerLimit  = Math.round(room.memory.workerLimit );
            } //roundLimits
        } //creepLimits
    } //updateRooms

    // Manage entities
    // *****************************************************************************
    function manageEntities() {

		let creepLimitsGlobal = {
			fighters: 0,
			healers:  0,
			workers:  0,
		};
		let creepsGlobal = {
			fighters: 0,
			healers:  0,
			workers:  0,
		};
		let creepsLocal = {
			fighters: 0,
			healers:  0,
			workers:  0,
			towers:   0,
		};

		let name, spawn, creeps;
        for(name in Game.spawns) {
            spawn  = Game.spawns[name];
            creeps = _.filter(Game.creeps, (creep) => creep.room === spawn.room);
            if(spawn.spawning || (spawn.energy < spawn.energyCapacity && creeps.length > 0)) {
                continue;
            } //fi

            countEntities();
			createCreeps();
        } //done
        //dieOff();

        // Count creeps, buildings, etc
        // ---------------------------------------------------------------------
        function countEntities() {

			// Creeps in all rooms
			creepsGlobal.fighters = _.filter(Game.creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.FIGHTER);
			creepsGlobal.healers  = _.filter(Game.creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.HEALER );
			creepsGlobal.workers  = _.filter(Game.creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.WORKER );

            // Creeps in the current room
            creepsLocal.fighters  = _.filter(     creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.FIGHTER);
            creepsLocal.healers   = _.filter(     creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.HEALER );
            creepsLocal.workers   = _.filter(     creeps,     (creep)     => creep.memory.role       === DEFINES.ROLES.WORKER );

            // Structures in the current room
            creepsLocal.towers    = _.filter(Game.structures, (structure) => structure.structureType === STRUCTURE_TOWER       && structure.room === spawn.room);

            // The total creep limits across all owned rooms (this is needed to prevent rooms from respawning all their creeps during an expedition to another room)
			for(let roleCount in creepLimitsGlobal) {
				roleCount = 0;
			} //done
            for(let roomName in Game.rooms) {
                let room = Game.rooms[roomName];
                creepLimitsGlobal.fighters += room.memory.fighterLimit;
                creepLimitsGlobal.healers  += room.memory.healerLimit;
                creepLimitsGlobal.workers  += room.memory.workerLimit;
            } //done
        } //countEntities

        // Create creeps
        // ---------------------------------------------------------------------
		function createCreeps() {
            for(let i = 0; i < 2; i++) {
                let creepRole = 0;

				// Figure out what kind of creep to spawn
                switch(i) {
                    case 0:
                    /*//*/ if(creepsLocal.workers.length  < spawn.room.memory.workerLimit  / 2) {
                        creepRole = DEFINES.ROLES.WORKER;
                    } else if(creepsLocal.healers.length  < spawn.room.memory.healerLimit  / 2 && creepsLocal.healers.length < creepsLocal.fighters.length / 4) {
                        creepRole = DEFINES.ROLES.HEALER;
                    } else if(creepsLocal.fighters.length < spawn.room.memory.fighterLimit / 2) {
                        creepRole = DEFINES.ROLES.FIGHTER;
                    } else {
                        creepRole = Math.floor(Math.random() * DEFINES.ROLES.length);
                    }
                    break;

                    case 1:
                    creepRole = 0;
                    break;
                } //esac

				// Spawn the creep
                switch(creepRole) {
                    case DEFINES.ROLES.WORKER:
                    if(creepsLocal.workers.length    < spawn.room.memory.workerLimit
                    && creepsGlobal.workers.length < creepLimitsGlobal.workers
                    ){
                        DEFINES.createCreep(spawn, [CARRY, MOVE, WORK], "Worker", DEFINES.ROLES.WORKER);
                        break;
                    }
                    if(i === 0) break;

                    case DEFINES.ROLES.FIGHTER:
                    if(creepsLocal.fighters.length    < spawn.room.memory.fighterLimit
                    && creepsGlobal.fighters.length < creepLimitsGlobal.fighters
                    ){
                        DEFINES.createCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", DEFINES.ROLES.FIGHTER);
                        break;
                    }
                    if(i === 0) break;

                    case DEFINES.ROLES.HEALER:
                    if(creepsLocal.healers.length    < spawn.room.memory.healerLimit
                    && creepsGlobal.healers.length < creepLimitsGlobal.healers
                    ){
                        DEFINES.createCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", DEFINES.ROLES.HEALER);
                        break;
                    } //fi
                    if(i === 0) break;
                    break;
                } //esac
                if(spawn.spawning) break;
            } //done
            if(!spawn.spawning) {
                return;
            } //fi
            let newCreep = Game.creeps[spawn.spawning.name];

			// Display text
            spawn.room.visual.text(
                newCreep.memory.role.charAt(0).toUpperCase() + newCreep.memory.role.slice(1),
                spawn.pos.x,
                spawn.pos.y,
                {align: "left", opacity: 0.7}
            );
		} //determineRole

        // Kill off unneeded creeps
        // =============================================================================
        function dieOff() {
            DEFINES.killOff(creepsLocal.fighters, spawn.room.memory.fighterLimit);
            DEFINES.killOff(creepsLocal.healers,  spawn.room.memory.healerLimit );
            DEFINES.killOff(creepsLocal.workers,  spawn.room.memory.workerLimit );
        } //dieOff
    } //manageCreeps

    // Cleanup
    // *****************************************************************************
    function cleanup() {
        // Every 8 ticks
        if(!Math.floor(Math.random() * 8)) {
            cleanMemories();
        } //fi

        // Delete the memories of dead entities
        // -------------------------------------------------------------------------
        function cleanMemories() {
            // Creeps
            for(let name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                } //fi
            } //done
            // Structures
            for(let name in Memory.structures) {
                if(!Game.structures[name]) {
                    delete Memory.structures[name];
                } //fi
            } //done
            // Rooms
            for(let name in Memory.rooms) {
                if(!Game.rooms[name]) {
                    delete Memory.rooms[name];
                } //fi
            } //done
        } //cleanMemories
    } //cleanup

    // AIs
    // *****************************************************************************
    function setAis() {
        upliftCreeps();
        upliftStructures();

        // Creeps
        // =============================================================================
        function upliftCreeps() {
            for(let name in Game.creeps) {
                let creep = Game.creeps[name];
                switch(creep.memory.role) {

                    case DEFINES.ROLES.WORKER:
                    require("role.worker" ).run(creep);
                    break;

                    case DEFINES.ROLES.FIGHTER:
                    require("role.fighter").run(creep);
                    break;

                    case DEFINES.ROLES.HEALER:
                    require("role.healer" ).run(creep);
                    break;

                    default:
                    require("role.manual" ).run(creep);
                    break;
                } //esac
            } //done
        } //upliftCreeps

        // Structures
        // =============================================================================
        function upliftStructures() {
            for(let name in Game.structures) {
                let structure = Game.structures[name];
                switch(structure.structureType) {
                    case STRUCTURE_TOWER:
                    require("role.tower").run(structure);
                    break;
                } //esac
            } //done
        } //upliftStructures
    } //setAis
}; //function
