// role.tower.js
// #############################################################################
/** This script provides an AI for tower structures.
**/

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
var roleTower = {
	
	// run()
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	/** This function controls the provided structure.
	 * @param structure The structure to control.
	**/
	run: function (structure) {

		// Variables
		// =====================================================================
		var repairLimit = DEFINES.REPAIR_LIMIT * structure.room.controller.level;
		for(var b = true; b; b = false) {
			var target = undefined;
			
			// Heal the closest damaged allied unit
			// =================================================================
			target = structure.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (creep) =>
				   creep.hits < creep.hitsMax
			});
			if(target && target.id) {
				structure.heal(target);
				break;
			}
			
			// Attack the closest enemy unit
			// =================================================================
			target = structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if(target && target.id) {
				structure.attack(target);
				break;
			}
			
			// Repair the closest damaged structure
			// =================================================================
			// Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
			// It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
			target = structure.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structureEach) =>
				   structureEach.hits < (structureEach.hitsMax * 0.75)
				&& structureEach.hits < (repairLimit * 0.75)
				&& !(structureEach.memory && structureEach.memory.dismantle)
			});
			if(target && target.id) {
				structure.repair(target);
				break;
			}
		}
	}
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleTower;
