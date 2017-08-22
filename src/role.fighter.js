// role.fighter.js
// #############################################################################
/** This script provides an AI for fighter creeps.
**/

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
var roleFighter = {
	
	// run()
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	/** This function controls the provided creep.
	 * @param creep The creep to control.
	**/
    run: function (creep) {

		// Attack any enemy units present in the room
		// ====================================================================
		var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
	    	if(target && target.id) {
			creep.memory.target = target.id;
			if(creep.rangedAttack(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
			|| creep.attack(      Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
			){
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#f00"}}) == ERR_NO_PATH) {
					creep.memory.target = undefined;
				}
			}
		}

		// If there is no imminent threat, wander around, so as not to interfere with the workers.
		// ====================================================================
		else {
			DEFINES.WANDER(creep);
		}
	}
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleFighter;
