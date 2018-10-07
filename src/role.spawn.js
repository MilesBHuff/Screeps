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
    // *************************************************************************
    /** This function controls the provided spawn.
     * @param spawn The spawn to control.
    **/
    run: function(spawn) {

        // Variables
        let creepLimitsGlobal = {
            fighters: 999,
            healers:  999,
            workers:  999,
        };
        let creepsGlobal = {
            fighters: Array(),
            healers:  Array(),
            workers:  Array(),
        };
        let creepsLocal = {
            fighters: Array(),
            healers:  Array(),
            workers:  Array(),
        };
        countCreeps();

        // Unless already spawning or not at full energy.
        // Exception:  If there are no workers left, spawn even if not at full energy.
        if(!spawn.spawning && (spawn.energy >= spawn.energyCapacity || creepsLocal.workers.length <= 0)) {
            trySpawnCreep();
        } //fi

        //dieOff();

        // Count creeps, buildings, etc
        // =====================================================================
        function countCreeps() {

			// Only count creeps that aren't close to death
            // -----------------------------------------------------------------
			let livelyCreeps = findLivelyCreeps();

            // Creeps in all rooms
            // -----------------------------------------------------------------
            creepsGlobal.fighters = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_COMMON.ROLES.FIGHTER);
            creepsGlobal.healers  = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_COMMON.ROLES.HEALER );
            creepsGlobal.workers  = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_COMMON.ROLES.WORKER );

            // Creeps in the current room
            // -----------------------------------------------------------------
            creepsLocal.fighters  = _.filter(creepsGlobal.fighters, (creep) => creep.room === spawn.room);
            creepsLocal.healers   = _.filter(creepsGlobal.healers,  (creep) => creep.room === spawn.room);
            creepsLocal.workers   = _.filter(creepsGlobal.workers,  (creep) => creep.room === spawn.room);

            // The total creep limits across all owned rooms (this is needed to prevent rooms from respawning all their creeps during an expedition to another room)
            // -----------------------------------------------------------------
            for(let roleLimit in creepLimitsGlobal) {
                roleLimit = 0;
            } //done
            for(let roomName in Game.rooms) {
                let room = Game.rooms[roomName];
                creepLimitsGlobal.fighters += room.memory.fighterLimit;
                creepLimitsGlobal.healers  += room.memory.healerLimit;
                creepLimitsGlobal.workers  += room.memory.workerLimit;
            } //done

			// Find lively creeps
			// =================================================================
			function findLivelyCreeps(algorithm) {
				switch(algorithm) {
					case 1:
						// Calculates how long it would take to spawn an identical creep, and considers the creep to be near-death if it has less time to live than it would take to create a new copy of it.
						return _.filter(Game.creeps, (creep) => function() {
							if(creep.spawning) {
								return true;
							} //fi
							let timeToRegrow;
							for(timeToRegrow = 0; timeToRegrow < creep.body.length; timeToRegrow++) {
								timeToRegrow+= CREEP_SPAWN_TIME;
							} //done
							if(creep.ticksToLive <= timeToRegrow) {
								return false;
							} //fi
							return true;
						});
					//break;

					case 0:
					default:
						// Considers any creeps with less than a certain amount of time to live, to be near-death.
						return _.filter(Game.creeps, (creep) => creep.spawning || creep.ticksToLive >= LIB_COMMON.NEAR_DEATH);
					//break;
				} //esac
			} //findLivelyCreeps
        } //countCreeps

        // Create creep
        // =====================================================================
        function trySpawnCreep() {
            for(let i = 0; i < 2; i++) {
                let creepRole = 0;

                // Figure out what kind of creep to spawn
                // -------------------------------------------------------------
                switch(i) {
                    case 0:
                    /*//*/ if(creepsLocal.workers.length  < Math.ceil(spawn.room.memory.workerLimit  / 2)) {
                        creepRole = LIB_COMMON.ROLES.WORKER;
                    } else if(creepsLocal.healers.length  < Math.ceil(spawn.room.memory.healerLimit  / 2) && creepsLocal.healers.length < Math.ceil(creepsLocal.fighters.length / 4)) {
                        creepRole = LIB_COMMON.ROLES.HEALER;
                    } else if(creepsLocal.fighters.length < Math.ceil(spawn.room.memory.fighterLimit / 2)) {
                        creepRole = LIB_COMMON.ROLES.FIGHTER;
                    } else {
                        creepRole = Math.floor(Math.random() * LIB_COMMON.ROLES.length);
                    }
                    break;

                    case 1:
                    creepRole = LIB_COMMON.ROLES.WORKER;
                    break;
                } //esac

                // Spawn the creep
                // -------------------------------------------------------------
                switch(creepRole) {
                    case LIB_COMMON.ROLES.WORKER:
                    if(creepsLocal.workers.length  < spawn.room.memory.workerLimit
                    && creepsGlobal.workers.length < creepLimitsGlobal.workers
                    ){
                        roleSpawn.spawnCreep(spawn, [CARRY, MOVE, WORK], "Worker", LIB_COMMON.ROLES.WORKER);
                        break;
                    }
                    if(i === 0) break;

                    case LIB_COMMON.ROLES.FIGHTER:
                    if(creepsLocal.fighters.length  < spawn.room.memory.fighterLimit
                    && creepsGlobal.fighters.length < creepLimitsGlobal.fighters
                    ){
                        roleSpawn.spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", LIB_COMMON.ROLES.FIGHTER);
                        break;
                    }
                    if(i === 0) break;

                    case LIB_COMMON.ROLES.HEALER:
                    if(creepsLocal.healers.length  < spawn.room.memory.healerLimit
                    && creepsGlobal.healers.length < creepLimitsGlobal.healers
                    ){
                        roleSpawn.spawnCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", LIB_COMMON.ROLES.HEALER);
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
        } //trySpawnCreep

        // Kill off unneeded creeps
        // =====================================================================
        function dieOff() {
            LIB_COMMON.killOff(creepsLocal.fighters, spawn.room.memory.fighterLimit);
            LIB_COMMON.killOff(creepsLocal.healers,  spawn.room.memory.healerLimit );
            LIB_COMMON.killOff(creepsLocal.workers,  spawn.room.memory.workerLimit );
        } //dieOff
    }, //run

    // Spawn creep
    // =========================================================================
    // Depends: LIB_COMMON.say()
    /** The idea behind this function, is to create each creep with as many parts as
    *  possible, given the room's current energy total.  It cycles through the
    *  given parts array, and continues until there is no more energy to spend.  It
    *  then sorts the parts in such a way that maximises each creep's
    *  survivability.
    * @param spawn    The spawner to use
    * @param rawParts This is an array of body parts;  this function reduplicates
    *                 it infinitely.
    * @param name     The name of the new creep.
    * @param role     The role the new creep should have.
    **/
    spawnCreep: function (spawn, rawParts, name, role) {
        // Variables
        // ---------------------------------------------------------------------
        let bodyParts   = Array();
        let energyCost  = 0;
        let energyTotal = spawn.room.energyAvailable;
        let partCount   = {
            attack: 0,
            carry:  0,
            claim:  0,
            heal:   0,
            move:   0,
            rangedAttack: 0,
            tough:  0,
            work:   0
        }; //struct
        for(let currentPart = 0, failCount = 0; true; currentPart++) {
            // Stop once we've used up as much energy as possible
            if(failCount >= rawParts.length) {
                break;
            } //fi
            // Start over once we finish the parts array
            if(currentPart >= rawParts.length) {
                currentPart = 0;
            } //fi

            // Find out how expensive the current part is
            // -----------------------------------------------------------------
            let partCost = 0;
            switch(rawParts[currentPart]) {
                case ATTACK:
                partCost = BODYPART_COST[ATTACK];
                break;

                case CARRY:
                partCost = BODYPART_COST[CARRY];
                break;

                case CLAIM:
                partCost = BODYPART_COST[CLAIM];
                break;

                case HEAL:
                partCost = BODYPART_COST[HEAL];
                break;

                case MOVE:
                partCost = BODYPART_COST[MOVE];
                break;

                case RANGED_ATTACK:
                partCost = BODYPART_COST[RANGED_ATTACK];
                break;

                case TOUGH:
                partCost = BODYPART_COST[TOUGH];
                break;

                case WORK:
                partCost = BODYPART_COST[WORK];
                break;

                default:
                console.log("ERROR:  Spawn:  Part doesn't exist!");
                return;
            } //esac

            // See whether we can afford the part.  If so, count it.
            // -----------------------------------------------------------------
            if(energyCost + partCost <= energyTotal) {
                failCount = 0;
                energyCost += partCost;
                switch(rawParts[currentPart]) {
                    case ATTACK:
                    partCount.attack++;
                    break;

                    case CARRY:
                    partCount.carry++;
                    break;

                    case CLAIM:
                    partCount.claim++;
                    break;

                    case HEAL:
                    partCount.heal++;
                    break;

                    case MOVE:
                    partCount.move++;
                    break;

                    case RANGED_ATTACK:
                    partCount.rangedAttack++;
                    break;

                    case TOUGH:
                    partCount.tough++;
                    break;

                    case WORK:
                    partCount.work++;
                    break;

                    default:
                    console.log("ERROR:  Spawn:  Part doesn't exist!");
                    return;
                } //esac
            } else {
                failCount++;
                // If this is the absolute first part and we are unable to construct it, there is no point in building this creep.
                if(currentPart === 0 && energyCost === 0) {
                    return;
                } else continue;
            } //if
        } //done

        // Remove excess body parts
        // ---------------------------------------------------------------------
        //TODO:  If energy remains, replace TOUGH parts with non-TOUGH parts.
        while((partCount.attack
             + partCount.carry
             + partCount.claim
             + partCount.heal
             + partCount.move
             + partCount.rangedAttack
             + partCount.tough
             + partCount.work
           ) > MAX_CREEP_SIZE
        ) {
            // TOUGH parts are useless when we can affort non-TOUGH parts to replace them.
            if(partCount.tough > 0) {
                partCount.tough--;
                continue;
            }

            // Henceforth, decrement each part-type evenly, according to the order used in the sorting section (below).
            // '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
            // WORK
            if(partCount.work >= partCount.attack
            && partCount.work >= partCount.carry
            && partCount.work >= partCount.claim
            && partCount.work >= partCount.heal
            && partCount.work >= partCount.move
            && partCount.work >= partCount.rangedAttack
            ) {
                partCount.work--;
                continue;
            } //fi
            // CLAIM
            if(partCount.claim >= partCount.attack
            && partCount.claim >= partCount.carry
            && partCount.claim >= partCount.heal
            && partCount.claim >= partCount.move
            && partCount.claim >= partCount.rangedAttack
            ) {
                partCount.claim--;
                continue;
            } //fi
            // ATTACK
            if(partCount.attack >= partCount.carry
            && partCount.attack >= partCount.heal
            && partCount.attack >= partCount.move
            && partCount.attack >= partCount.rangedAttack
            ) {
                partCount.attack--;
                continue;
            } //fi
            // RANGED_ATTACK
            if(partCount.rangedAttack >= partCount.carry
            && partCount.rangedAttack >= partCount.heal
            && partCount.rangedAttack >= partCount.move
            ) {
                partCount.rangedAttack--;
                continue;
            } //fi
            // HEAL
            if(partCount.heal >= partCount.carry
            && partCount.heal >= partCount.move
            ) {
                partCount.heal--;
                continue;
            } //fi
            // CARRY
            if(partCount.carry >= partCount.move) {
                partCount.carry--;
                continue;
            } //fi
            // MOVE
            partCount.move--;
        } //done

        // Sort the parts in order to make the creep more resilient in combat
        // ---------------------------------------------------------------------
        for(let i = 0; i < partCount.tough; i++) {
            bodyParts.push(TOUGH);
        } //done
        for(let i = 0; i < partCount.work; i++) {
            bodyParts.push(WORK);
        } //done
        for(let i = 0; i < partCount.claim; i++) {
            bodyParts.push(CLAIM);
        } //done
        for(let i = 0; i < partCount.attack; i++) {
            bodyParts.push(ATTACK);
        } //done
        for(let i = 0; i < partCount.rangedAttack; i++) {
            bodyParts.push(RANGED_ATTACK);
        } //done
        for(let i = 0; i < partCount.heal; i++) {
            bodyParts.push(HEAL);
        } //done
        for(let i = 0; i < partCount.carry; i++) {
            bodyParts.push(CARRY);
        } //done
        for(let i = 0; i < partCount.move; i++) {
            bodyParts.push(MOVE);
        } //done

        // If the creep is only partially formed, there's no point in spawning it.
        // ---------------------------------------------------------------------
        if(
        !( partCount.move   > 0
        //    &&
        //    (  partCount.attack > 0
        //    || partCount.carry  > 0
        //    || partCount.claim  > 0
        //    || partCount.heal   > 0
        //    || partCount.rangedAttack > 0
        //    || partCount.work   > 0
        //    )
        )) {
            return;
        } //fi

        // If any neighbouring owned room lacks spawners, 50% chance of sending this creep to it.
        // ---------------------------------------------------------------------
        let target;
        if(Math.round(Math.random())) {
            let exits = Game.map.describeExits(spawn.room.name);
            for(let index in exits) {
                let room = Game.rooms[exits[index]];
                if( room && room.controller && room.controller.my
                && !room.find(FIND_MY_STRUCTURES, {filter: (structure) => {
                    return(structure.structureType === STRUCTURE_SPAWN);
                    }}).length
                ){
                    target = room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
                    break;
                } //fi
            } //done
        } //fi

        // If we have parts, create the creep.
        // ---------------------------------------------------------------------
        if(bodyParts[0]) {
            for(let i = 0; spawn.createCreep(bodyParts, name + i, {role: role, target: target}) === ERR_NAME_EXISTS; i++) {continue;}
        } //fi

        // Display which type of creep is being spawned
        // ---------------------------------------------------------------------
        LIB_COMMON.say(name[0].toUpperCase() + name.slice(1), spawn);
    }, //spawnCreep
}; //roleSpawn

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleSpawn;
