// role.fighter.js
// #############################################################################
/** This script provides an AI for fighter creeps.
**/
//TODO:  Fighter creeps without attack parts should run to the nearest healer.  If no healer is available, they should run to the nearest tower.
//TODO:  Fighter creeps should always keep their distance from an enemy.
//TODO:  Choose which types of creep and structure the fighter should prioritize when selecting a target.

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
		
		// Validate the current target
		// ====================================================================
		if(creep.memory && creep.memory.target && !Game.getObjectById(creep.memory.target)) {
			creep.memory.target = undefined;
		}
		
		// Find targets
		// ====================================================================
		if(!creep.memory || !creep.memory.target) {
			var targets = Array();
			for(var b = true; b; b = false) {
				// Attack enemy healers
				targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {return(
					hostile.getActiveBodyparts(HEAL) > 0
				)}});
				if(targets.length) break;
				// Attack enemy rangers
				targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {return(
					hostile.getActiveBodyparts(RANGED_ATTACK) > 0
				)}});
				if(targets.length) break;
				// Attack enemy meleers
				targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {return(
					hostile.getActiveBodyparts(ATTACK) > 0
				)}});
				if(targets.length) break;
				// Attack enemy claimers
				targets = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (hostile) => {return(
					hostile.getActiveBodyparts(CLAIM) > 0
				)}});
				if(targets.length) break;
				// Attack other enemy units
				targets = creep.room.find(FIND_HOSTILE_CREEPS);
				if(targets.length) break;
				// Attack enemy structures
				targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
				if(targets.length) break;
				// Attack condemned structures
				if(creep.room.memory && creep.room.memory.dismantle) {
					targets = Array();
					for(var a = 0; room.memory.dismantle[a]; a++) {
						targets.push(Game.getObjectById(creep.room.memory.dismantle[a]));
					};
					if(targets && targets.length) break;
				}
				if(targets.length) break;
			}
			if(targets.length) {
				creep.say("Attack");
				creep.memory.target = creep.pos.findClosestByPath(targets).id;
			}
		}
		
		// Attack targets
		// ====================================================================
		if(creep.memory && creep.memory.target) {
			if(creep.rangedAttack(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
			|| creep.attack(      Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
			){
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#f00", opacity: .25}}) == ERR_NO_PATH) {
					creep.memory.target = undefined;
				}
			}
			
		// If there is no target, wander around, so as not to interfere with the workers.
		// ====================================================================
		} else {
			DEFINES.WANDER(creep);
		}
	}
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleFighter;
