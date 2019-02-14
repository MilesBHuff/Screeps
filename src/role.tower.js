// role.tower.js
// #############################################################################
/** This script provides an AI for tower structures.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC = require("lib.misc");
let roleTower  = {

    // run()
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function controls the provided structure.
     * @param structure The structure to control
    **/
    run: function(structure) {

        // Variables
        // =====================================================================
        let repairLimit = LIB_MISC.REPAIR_LIMIT;
        if(structure.room.controller) repairLimit*= structure.room.controller.level;
        for(let b = true; b; b = false) {
            let targets = Array(); // lgtm [js/useless-assignment-to-local] // It's cleaner to declare it here, and I don't like leaving variables uninitialized.

            // Heal the closest damaged allied unit
            // =================================================================
            targets = structure.room.find(FIND_MY_CREEPS, {filter: (creep) =>
                   creep.hits < creep.hitsMax
            });
            if(targets.length) {
                structure.heal(structure.pos.findClosestByRange(targets));
                break;
            }

            // Attack the closest enemy unit
            // =================================================================
            targets = structure.room.find(FIND_HOSTILE_CREEPS);
            if(targets.length) {
                structure.attack(structure.pos.findClosestByRange(targets));
                break;
            }

            // Repair the closest damaged structure
            // =================================================================
            // Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
            // It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
            targets = structure.room.find(FIND_STRUCTURES, {filter: (structureEach) =>
                   structureEach.hits < (structureEach.hitsMax * 0.75)
                && structureEach.hits < (repairLimit * 0.75)
                && structure.room.memory.dismantle.indexOf(structureEach.id) === -1
            });
            if(targets.length) {
                structure.repair(structure.pos.findClosestByRange(targets));
                break;
            }

            // Attack the closest enemy structure
            // =================================================================
            targets = structure.room.find(FIND_HOSTILE_STRUCTURES);
            if(targets.length) {
                structure.attack(structure.pos.findClosestByRange(targets));
                break;
            }
        }
    }
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleTower;
