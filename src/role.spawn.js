// role.spawn.js
// #############################################################################
/** This script provides an AI for spawns.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_COMMON = require("lib.common");
let roleSpawn = {

    // Main
    // *****************************************************************************
    /** This function controls the provided spawn.
     * @param spawn The spawn to control.
    **/
    run: function(spawn) {

		// Variables
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
        let creeps = _.filter(Game.creeps, (creep) => creep.room === spawn.room); // All creeps in the room

		// If already spawning or not at full energy, return.
		// Exception:  If there are no creeps left, spawn even if not at full energy.
        if(spawn.spawning || (spawn.energy < spawn.energyCapacity && creeps.length > 0)) {
            return;
        } //fi

		// Every tick
        countEntities();
        createCreeps();
        //dieOff();

        // Count creeps, buildings, etc
        // =============================================================================
        function countEntities() {

            // Creeps in all rooms
            // -----------------------------------------------------------------------------
            creepsGlobal.fighters = _.filter(Game.creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.FIGHTER);
            creepsGlobal.healers  = _.filter(Game.creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.HEALER );
            creepsGlobal.workers  = _.filter(Game.creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.WORKER );

            // Creeps in the current room
            // -----------------------------------------------------------------------------
            creepsLocal.fighters  = _.filter(     creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.FIGHTER);
            creepsLocal.healers   = _.filter(     creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.HEALER );
            creepsLocal.workers   = _.filter(     creeps,     (creep)     => creep.memory.role       === LIB_COMMON.ROLES.WORKER );

            // Structures in the current room
            // -----------------------------------------------------------------------------
            creepsLocal.towers    = _.filter(Game.structures, (structure) => structure.structureType === STRUCTURE_TOWER       && structure.room === spawn.room);

            // The total creep limits across all owned rooms (this is needed to prevent rooms from respawning all their creeps during an expedition to another room)
            // -----------------------------------------------------------------------------
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
        // =============================================================================
        function createCreeps() {
            for(let i = 0; i < 2; i++) {
                let creepRole = 0;

                // Figure out what kind of creep to spawn
                // -----------------------------------------------------------------------------
                switch(i) {
                    case 0:
                    /*//*/ if(creepsLocal.workers.length  < spawn.room.memory.workerLimit  / 2) {
                        creepRole = LIB_COMMON.ROLES.WORKER;
                    } else if(creepsLocal.healers.length  < spawn.room.memory.healerLimit  / 2 && creepsLocal.healers.length < creepsLocal.fighters.length / 4) {
                        creepRole = LIB_COMMON.ROLES.HEALER;
                    } else if(creepsLocal.fighters.length < spawn.room.memory.fighterLimit / 2) {
                        creepRole = LIB_COMMON.ROLES.FIGHTER;
                    } else {
                        creepRole = Math.floor(Math.random() * LIB_COMMON.ROLES.length);
                    }
                    break;

                    case 1:
                    creepRole = 0;
                    break;
                } //esac

                // Spawn the creep
                // -----------------------------------------------------------------------------
                switch(creepRole) {
                    case LIB_COMMON.ROLES.WORKER:
                    if(creepsLocal.workers.length  < spawn.room.memory.workerLimit
                    && creepsGlobal.workers.length < creepLimitsGlobal.workers
                    ){
                        LIB_COMMON.createCreep(spawn, [CARRY, MOVE, WORK], "Worker", LIB_COMMON.ROLES.WORKER);
                        break;
                    }
                    if(i === 0) break;

                    case LIB_COMMON.ROLES.FIGHTER:
                    if(creepsLocal.fighters.length  < spawn.room.memory.fighterLimit
                    && creepsGlobal.fighters.length < creepLimitsGlobal.fighters
                    ){
                        LIB_COMMON.createCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", LIB_COMMON.ROLES.FIGHTER);
                        break;
                    }
                    if(i === 0) break;

                    case LIB_COMMON.ROLES.HEALER:
                    if(creepsLocal.healers.length  < spawn.room.memory.healerLimit
                    && creepsGlobal.healers.length < creepLimitsGlobal.healers
                    ){
                        LIB_COMMON.createCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", LIB_COMMON.ROLES.HEALER);
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
            // -----------------------------------------------------------------------------
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
            LIB_COMMON.killOff(creepsLocal.fighters, spawn.room.memory.fighterLimit);
            LIB_COMMON.killOff(creepsLocal.healers,  spawn.room.memory.healerLimit );
            LIB_COMMON.killOff(creepsLocal.workers,  spawn.room.memory.workerLimit );
        } //dieOff
    }, //run
}; //roleSpawn

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleSpawn;
