// role.healer.js
// #############################################################################
/** This script provides an AI for healer creeps.
**/

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
var roleHealer = {
	
	// run()
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	/** This function controls the provided creep.
	 * @param creep The creep to control.
	**/
	run: function (creep) {
		
		// Validate the current target
		// ====================================================================
		if( creep.memory
		&&  creep.memory.target
		&&(!Game.getObjectById(creep.memory.target)
		||  Game.getObjectById(creep.memory.target).hits >= Game.getObjectById(creep.memory.target).hitsMax
		)){
			creep.memory.target = undefined;
		}
		
		// Find targets
		// ====================================================================
		if(!creep.memory || !creep.memory.target) {
			var targets = Array();
			for(var b = true; b; b = false) {
				targets = creep.room.find(FIND_MY_CREEPS, {filter: (creepEach) =>
					creepEach.hits < creepEach.hitsMax
				});
				if(targets.length) break;
			}
			if(targets.length) {
				creep.say("Heal");
				creep.memory.target = creep.pos.findClosestByPath(targets).id;
			}
		}
		
		// Heal targets
		// ====================================================================
		var target = Game.getObjectById(creep.memory.target);
		if(creep.memory && creep.memory.target) {
			if(creep.heal(target)       == ERR_NOT_IN_RANGE
			|| creep.rangedHeal(target) == ERR_NOT_IN_RANGE
			){
				if(DEFINES.move(creep, COLOR_GREEN, false) == ERR_NO_PATH) {
					creep.memory.target = undefined;
					creep.memory.path   = undefined;
				}
			}
			
		// If there is no target, wander around, so as not to interfere with the workers.
		// ====================================================================
		} else {
			DEFINES.wander(creep);
		}
	}
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleHealer;
