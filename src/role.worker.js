// role.worker.js
// #############################################################################
/** What this script does, is it causes workers to vary between harvesting and
 *  using energy, the latter meaning to transfer, build, repair, or upgrade.
 *  Which of these tasks is chosen depends on a mixture of strategy and
 *  randomness.
 *  These worker creeps also always look for the closest target first.  If that
 *  target is inaccessible, they then pick the next closest.  If the creep
 *  cannot find anything to do in its current room, it will look for things to
 *  do in a neighbouring room.
**/

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES   = require("defines");
var badTargets  = Array();
var canWander   = true;
var repairLimit = undefined;
var rooms       = Array();
var roleWorker  = {

    // Find target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function finds a target in range of the current creep.
     * @return a valid target.
    **/
    findTarget: function (creep) {
        for(var l = 0; l < DEFINES.LOOP_LIMIT; l++) {

            // Cleanup
            // =================================================================
            creep.memory.target = undefined;
            creep.memory.path   = undefined;
            creep.memory.say    = undefined;

            // If we've already tried all the nearby rooms, return.
            // =================================================================
            if(!rooms.length) {
                    return;
            } //fi

            // Variables
            // =================================================================
            var targets = Array();
            var task    = DEFINES.TASKS.WAIT;
            switch(true) {
                default:

                // If harvesting, harvest.
                // =============================================================
                task = DEFINES.TASKS.HARVEST;
                if(creep.memory.harvesting) {

                    // Pick up dropped resources
                    // ---------------------------------------------------------
                    targets = rooms[0].find(FIND_DROPPED_RESOURCES);
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;

//                    // Withdraw resources from enemy structures
//                    // ---------------------------------------------------------
//                    targets = rooms[0].find(FIND_HOSTILE_STRUCTURES);
//                    targets = DEFINES.filterTargets(targets, badTargets);
//                    if(targets && targets.length) break;

//                    // Get energy from a full retrieval link
//                    // ---------------------------------------------------------
//                    targets = rooms[0].find(FIND_STRUCTURES, {
//                        filter: (structure) => {return(
//                               structure.structureType == STRUCTURE_LINK
//                            && structure.energy        >= structure.energyCapacity
//                        );}
//                    });
//                    targets = DEFINES.filterTargets(targets, badTargets);
//                    if(targets && targets.length) break;

                    // Harvest new energy
                    // ---------------------------------------------------------
                    targets = rooms[0].find(FIND_SOURCES, {filter: (source) => source.energy > 0});
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;

                    // Withdraw resources from condemned structures
                    // ---------------------------------------------------------
                    if(rooms[0].memory && rooms[0].memory.dismantle && Math.round(Math.random())) {
                        for(var a = 0; rooms[0].memory.dismantle[a]; a++) {
                            targets.push(Game.getObjectById(rooms[0].memory.dismantle[a]));
                        } //done
                        targets = DEFINES.filterTargets(targets, badTargets);
                        if(targets && targets.length) break;
                    } //fi

//                  // 50% chance to harvest minerals
//                  // ---------------------------------------------------------
//                  if(Math.floor(Math.random())) {
//                      targets = rooms[0].find(FIND_STRUCTURES, {filter: (structure) => {return(structure.structureType == STRUCTURE_EXTRACTOR);}});
//                      targets = DEFINES.filterTargets(targets, badTargets);
//                      if((targets && targets.length) || rooms[0].find(FIND_MINERALS, {filter: (mineral) => mineral.mineralAmount > 0}).length) break;
//                  } //fi

                    // Get resources from storage
                    // ---------------------------------------------------------
                    targets = rooms[0].find(FIND_STRUCTURES, {
                        filter: (structure) => {return(
                            (  structure.structureType == STRUCTURE_CONTAINER
                            || structure.structureType == STRUCTURE_STORAGE
                            )
                            && _.sum(structure.store) >  0
                        );}
                    });
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;

                    // If there's no new energy available, use what you're already carrying, if anything.
                    // ---------------------------------------------------------
                    if(creep.carry.energy > 0) {
                        creep.memory.harvesting = false;
                    } else {
                        task = DEFINES.TASKS.WAIT;
                        break;
                    }
                } //fi

                // If the controller is about to degrade, contribute to it
                // =============================================================
                task = DEFINES.TASKS.UPGRADE;
                if(rooms[0].controller.ticksToDowngrade < DEFINES.CONTROLLER_NEAR_DEGRADE) {
                    targets = [rooms[0].controller];
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // Always keep spawns and extensions filled up to max.
                // =============================================================
                task = DEFINES.TASKS.TRANSFER;
                // Fill extensions
                targets = rooms[0].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {return(
                           structure.structureType == STRUCTURE_EXTENSION
                        && structure.energy        <  structure.energyCapacity
                        && structure.room.memory.dismantle.indexOf(structure.id) === -1
                    );}
                });
                targets = DEFINES.filterTargets(targets, badTargets);
                if(targets && targets.length) break;
                // Fill spawns
                targets = rooms[0].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {return(
                           structure.structureType == STRUCTURE_SPAWN
                        && structure.energy        <  structure.energyCapacity
                        && structure.room.memory.dismantle.indexOf(structure.id) === -1
                    );}
                });
                targets = DEFINES.filterTargets(targets, badTargets);
                if(targets && targets.length) break;

                // 75% chance of maintaining towers
                // =============================================================
                task = DEFINES.TASKS.TRANSFER;
                if(Math.round(Math.random() * 3)) {
                    targets = rooms[0].find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {return(
                               structure.structureType == STRUCTURE_TOWER
                            && structure.energy        <  structure.energyCapacity * 0.75
                            && structure.room.memory.dismantle.indexOf(structure.id) === -1
                        );}
                    });
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // 25% chance to build things that complete instantaneously
                // =============================================================
                task = DEFINES.TASKS.BUILD;
                if(Math.round(Math.random() * 2)) {
                    targets = rooms[0].find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) =>
                           site.structureType == STRUCTURE_WALL
                        || site.structureType == STRUCTURE_RAMPART
                    });
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // 75% chance of repairing most constructions
                // =============================================================
                task = DEFINES.TASKS.REPAIR;
                if(Math.round(Math.random() * 3)) {
                    // Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
                    // It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
                    targets = rooms[0].find(FIND_STRUCTURES, {filter: (structure) =>
                           structure.hits < (structure.hitsMax * 0.75)
                        && structure.hits < (repairLimit * 0.75)
                        && structure.room.memory.dismantle.indexOf(structure.id) === -1
                        &&!(
                           (structure.structureType == STRUCTURE_WALL    && structure.hits > repairLimit * 0.125)
                        || (structure.structureType == STRUCTURE_RAMPART && structure.hits > repairLimit * 0.125)
                    )});
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // 50% chance of building cheap / important structures.
                // =============================================================
                task = DEFINES.TASKS.BUILD;
                if(Math.round(Math.random())) {
                    targets = rooms[0].find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) =>
                           site.structureType == STRUCTURE_SPAWN
                        || site.structureType == STRUCTURE_ROAD
                    });
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // 50% chance of refilling miscellaneous resource-using structures
                // =============================================================
                task = DEFINES.TASKS.TRANSFER;
                if(Math.round(Math.random())) {
                    targets = rooms[0].find(FIND_MY_STRUCTURES, {filter: (structure) =>
                           structure.structureType == STRUCTURE_LAB
                        || structure.structureType == STRUCTURE_NUKER
                        || structure.structureType == STRUCTURE_POWER_SPAWN
                    });
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi
                    
                // 50% chance of repairing constructions that start at 1 health
                // =============================================================
                task = DEFINES.TASKS.REPAIR;
                if(Math.round(Math.random())) {
                    // Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
                    // It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
                    targets = rooms[0].find(FIND_STRUCTURES, {filter: (structure) =>
                           structure.hits < (structure.hitsMax * 0.75)
                        && structure.hits < (repairLimit * 0.75)
                        && structure.room.memory.dismantle.indexOf(structure.id) === -1
                        && (
                           structure.structureType == STRUCTURE_WALL
                        || structure.structureType == STRUCTURE_RAMPART
                    )});
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // 50% chance of upgrading the controller, if it's not already at max
                // If the controller *is* already at max, upgrade it if it's less than 3/4 degraded.
                // =============================================================
                task = DEFINES.TASKS.UPGRADE;
                if(Math.round(Math.random())
                && rooms[0].controller.level < 8
                || rooms[0].controller.ticksToDowngrade < (3 / 4) * CONTROLLER_DOWNGRADE[rooms[0].controller.level]
                ) {
                    targets = [rooms[0].controller];
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // Build new things
                // =============================================================
                task = DEFINES.TASKS.BUILD;
                targets = rooms[0].find(FIND_MY_CONSTRUCTION_SITES);
                targets = DEFINES.filterTargets(targets, badTargets);
                if(targets && targets.length) break;

                // Upgrade the controller if it's not already at max.
                // =============================================================
                task = DEFINES.TASKS.UPGRADE;
                if(rooms[0].controller.level < 8) {
                    targets = [rooms[0].controller];
                    targets = DEFINES.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi

                // Store excess resources
                // =============================================================
                task = DEFINES.TASKS.TRANSFER;
                targets = rooms[0].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {return(
                        (  structure.structureType == STRUCTURE_CONTAINER
                        || structure.structureType == STRUCTURE_LINK
                        || structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TERMINAL
                        )
                        &&
                        (( structure.energy && structure.energyCapacity
                        && structure.energy <  structure.energyCapacity
                        )
                        ||
                        (        structure.store && structure.storeCapacity
                        && _.sum(structure.store) < structure.storeCapacity
                        ))
                        && structure.room.memory.dismantle.indexOf(structure.id) === -1
                    );}
                });
                targets = DEFINES.filterTargets(targets, badTargets);
                if(targets && targets.length) break;

                task = DEFINES.TASKS.WAIT;
                break;
            } //esac

            // Pick a target from the array of targets
            // =================================================================
            if(targets.length) {
                var target = creep.pos.findClosestByRange(targets);
                if(target && target.id) {
                    switch(task) {
                        case DEFINES.TASKS.HARVEST:
                        creep.memory.say = "Harvest";
                        break;

                        case DEFINES.TASKS.TRANSFER:
                        creep.memory.say = "Transfer";
                        break;

                        case DEFINES.TASKS.UPGRADE:
                        creep.memory.say = "Upgrade";
                        break;

                        case DEFINES.TASKS.BUILD:
                        creep.memory.say = "Build";
                        break;

                        case DEFINES.TASKS.REPAIR:
                        creep.memory.say = "Repair";
                        break;
                    } //esac
                    return target.id;
                } //fi
            } //fi

            // If we reach this line, the current room had no valid targets.  Try another one.
            // =================================================================
            // If the array of rooms has not yet been sorted, sort it.
            if(rooms[0] != creep.room) {
                rooms = DEFINES.sortRooms(creep.pos, rooms);
            } //fi
            // Remove the current room from the array.
            rooms.shift();
        } //done
    }, //function

    // Affect target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function makes the given creep interact with its target.
     * @param  creep The creep to use.
     * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET
    **/
    affectTarget: function (creep) {
        code = OK;

        // Move towards the target
        // =================================================================
        if(creep.memory
        && creep.memory.target
        ) {
            var target = Game.getObjectById(creep.memory.target);
            if(!target) return ERR_INVALID_TARGET;

            // Harvest
            // -------------------------------------------------------------
            if(creep.memory.harvesting) {
                if(!target
                ||
                (( !(target.store  && _.sum(target.store) > 0)
                && !(target.energy &&       target.energy > 0)
                )
                &&
                !(   target.room.memory
                &&   target.room.memory.dismantle
                &&   target.room.memory.dismantle.indexOf(creep.memory.target) != -1
                ))
                ) {    return ERR_INVALID_TARGET;
                } else
                if( creep.harvest( target)
                &&  creep.pickup(  target)
                &&  creep.withdraw(target, RESOURCE_ENERGY)
                &&
                ((( target.room.controller.owner
                &&  target.room.controller.owner != DEFINES.USERNAME
                )
                ||
                (   target.room.memory
                &&  target.room.memory.dismantle
                &&  target.room.memory.dismantle.indexOf(creep.memory.target) != -1
                ))
                &&  creep.dismantle(target)
                )) {
                    code = DEFINES.move(creep, COLOR_YELLOW, true);
                } //fi
            } else {

                // Upgrade
                // ---------------------------------------------------------
                if(target.structureType == STRUCTURE_CONTROLLER) {
                    if(creep.upgradeController(target)) {
                        code = DEFINES.move(creep, COLOR_CYAN, true);
                    } //fi
                } else

                // Build
                // ---------------------------------------------------------
                if(target.progressTotal) {
                    if(creep.build(target)) {
                        code = DEFINES.move(creep, COLOR_WHITE, true);
                    } //fi
                } else

                // Repair
                // ---------------------------------------------------------
                if(target.hits < target.hitsMax
                && target.hits < repairLimit
                ){
                    if(creep.repair(target)) {
                        code = DEFINES.move(creep, COLOR_PURPLE, true);
                    } //fi
                } else

                // Transfer
                // ---------------------------------------------------------
                if(target.energy < target.energyCapacity) {
                    if(creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY)) {
                        code = DEFINES.move(creep, DEFINES.COLOR_BLACK, true);
                    } //fi
                } //else

                // Invalid target
                // ---------------------------------------------------------
                else {
                    return ERR_INVALID_TARGET;
                } //fi
            } //fi
        // This only happens when there are no valid targets in the room
        } else {
            if(canWander) DEFINES.wander(creep);
            return OK;
        } //fi

        // If the creep found a target, say what it is.
        // =====================================================================
        if(creep.memory.say
        &&(code == OK
        || code == ERR_TIRED
        || code == ERR_NOT_FOUND
        )) {
            creep.say(creep.memory.say);
            creep.memory.say = undefined;
        } //fi
        return code;
    }, //function

    // Run
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function controls the provided creep.
     * @param creep The creep to control.
    **/
    run: function (creep) {

        // Debug
        // =====================================================================
        if(false) {
            creep.memory.target = undefined; // Useful when you need to reset everyone's tasks.
            creep.memory.path   = undefined; // Useful when you need to reset everyone's paths.
        } //fi

        // Variables
        // =====================================================================
        repairLimit = DEFINES.REPAIR_LIMIT * creep.room.controller.level;
        if(creep.memory && creep.memory.target) canWander = false;

        // Decide whether to harvest
        // =====================================================================
        if(creep.memory.harvesting) {
            if(_.sum(creep.carry) >= creep.carryCapacity) {
                creep.memory.harvesting = false;
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } //fi
        } else {
            if(_.sum(creep.carry) <= 0) {
                creep.memory.harvesting = true;
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } //fi
        } //fi

        // Find and affect a target
        // =====================================================================
        var loopLimit = Math.ceil(Math.random() * DEFINES.LOOP_LIMIT);
        for(var l = 0; l < loopLimit; l++) {

            // Find a target
            // -----------------------------------------------------------------
            if(!creep.memory || !creep.memory.target) {
                //If the array of rooms has not already been populated, populate it.
                if(!rooms.length) {
                    rooms = DEFINES.findRooms(creep.room.name);
                } //fi
                // Find a target
                creep.memory.target = roleWorker.findTarget(creep, rooms, badTargets);
            } //fi

            // Affect the target
            // -----------------------------------------------------------------
            var code = roleWorker.affectTarget(creep);
            // If an error ocurred during pathfinding, reset the current target.
            if(code
            && code != OK
            && code != ERR_TIRED
            && code != ERR_NOT_FOUND
            ) {
                badTargets.push(creep.memory.target);
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } else break;

            // If we're out of rooms, give up.
            // -----------------------------------------------------------------
            if(!rooms.length) break;
        } //done
        if(canWander) DEFINES.wander(creep);
    } //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleWorker;
