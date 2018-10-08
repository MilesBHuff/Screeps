// role.claimer.js
// #############################################################################
/** This script is designed to streamline claiming new controllers.  Target
 *  acquisition must still be done manually.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MOVE = require("lib.move");
let roleClaimer = {

    // Main
    // *****************************************************************************
    /** This function controls the provided creep.
     * @param creep The creep to control.
    **/
    run: function (creep) {
		let target;

        // Check the creep's target
        // =============================================================================
        if(creep.memory && creep.memory.target) {
                target = Game.getObjectById(creep.memory.target);
        } //fi

        // If the target is not a controller or if it belongs to us, remove it.
        // =============================================================================
		if(target && (target.structureType !== STRUCTURE_CONTROLLER || target.my)) {
			target = null;
			creep.memory.target = null;
		} else {

	        // Move to its target
	        // =============================================================================
	        LIB_MOVE.move(creep, COLOR_BLUE, false);

	        // Attempt to claim the target
	        // =============================================================================
	        creep.claimController(target);

	        // Attempt to sign the target
	        // =============================================================================
	        creep.signController(target, "GitHub.com/MilesBHuff/Screeps");
		} //fi

		// If no target, wander
		// =============================================================================
		if(!target) {
        	LIB_MOVE.wander(creep);
		}
    }, //run
}; //roleManual

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleClaimer;
