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
			var targets = Array();
			
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
			});
			targets = targets.filter(function(item) {
				if(structure.room.memory && structure.room.memory.dismantle) {
					return structure.room.memory.dismantle.indexOf(item) === -1;
				}
			});
			if(targets.length) {
				structure.repair(structure.pos.findClosestByRange(targets));
				break;
			}
		}
	}
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleTower;
