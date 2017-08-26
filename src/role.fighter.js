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
		var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
		
		// Validate the current target (with a small chance of having to find a new target no matter what)
		// ====================================================================
		if(creep.memory
		&& creep.memory.target
		&&
		( !Game.getObjectById(creep.memory.target
		||
		(  creep.ticksToLivenumber > DEFINES.NEAR_DEATH
		&& Game.getObjectById(creep.memory.target).structureType
		&& Game.getObjectById(creep.memory.target).structureType == STRUCTURE_SPAWN
		&& Game.getObjectById(creep.memory.target).my
		)
		||
		(  !hostiles.length
		&& Game.getObjectById(creep.memory.target).structureType
		&& Game.getObjectById(creep.memory.target).structureType == STRUCTURE_RAMPART
		&& Game.getObjectById(creep.memory.target).my
		)
		||!Math.round(Math.random() * 8))
		)){
			creep.memory.target = undefined;
		}
		
		// If currently next to a hostile, retreat
		// ====================================================================
		for(var hostile in creep.room.find(FIND_HOSTILE_CREEPS)) {
			if(creep.pos.isNearTo(hostile)) {
				creep.moveTo(creep.pos.x + (creep.pos.x - hostile.pos.x),
					     creep.pos.y + (creep.pos.y - hostile.pos.y));
			}
		}
		
		// Find targets
		// ====================================================================
		if(!creep.memory || !creep.memory.target) {
			var targets = Array();
			var task    = DEFINES.TASKS.WAIT;
			for(var b = true; b; b = false) {
				task = DEFINES.TASKS.ATTACK;
				// If there are hostiles
				if(hostiles.length) {
					// Man the ramparts
					targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(
						  structure.structureType == STRUCTURE_RAMPART);}});
					var b = true;
					for(var i = 0; targets[i]; i++) {
						if(!creep.pos.findPathTo(targets[i]).length) {
							b = false;
						}
					}
					if(targets.length && b) break;
					// Attack enemy healers
					targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(HEAL) > 0);});
					if(targets.length) break;
					// Attack enemy rangers
					targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(RANGED_ATTACK) > 0);});
					if(targets.length) break;
					// Attack enemy brawlers
					targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(ATTACK) > 0);});
					if(targets.length) break;
					// Attack enemy claimers
					targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(CLAIM) > 0);});
					if(targets.length) break;
					// Attack other enemy units
					targets = hostiles;
					if(targets.length) break;
				}
//				// Renew if near to a natural death
//				task = DEFINES.TASKS.RENEW;
//				if(creep.ticksToLivenumber < DEFINES.NEAR_DEATH) {
//					targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(
//						structure.structureType == STRUCTURE_SPAWN
//					);}}););
//					if(targets.length) break;
//				}
				// Attack enemy structures
				task = DEFINES.TASKS.ATTACK;
				targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
				if(targets.length) break;
				// Attack condemned structures
				if(creep.room.memory && creep.room.memory.dismantle) {
					targets = Array();
					for(var a = 0; creep.room.memory.dismantle[a]; a++) {
						targets.push(Game.getObjectById(creep.room.memory.dismantle[a]));
					};
					if(targets && targets.length) break;
				}
				if(targets.length) break;
			}
			if(targets.length) {
				switch(task) {
					case DEFINES.TASKS.ATTACK:
					creep.say("Attack");
					break;
						
					case DEFINES.TASKS.RENEW:
					creep.say("Renew");
					break;
				}
				creep.memory.target = creep.pos.findClosestByPath(targets).id;
			}
		}
		
		// Attack targets
		// ====================================================================
		if(creep.memory && creep.memory.target) {
			if(
			(  creep.timeToLive < DEFINES.NEAR_DEATH
			&& Game.getObjectById(creep.memory.target).structureType
			&& Game.getObjectById(creep.memory.target).structureType == STRUCTURE_SPAWN
			&& Game.getObjectById(creep.memory.target).my
			&& creep.renew(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
			)
			||
			(  Game.getObjectById(creep.memory.target).structureType
			&& Game.getObjectById(creep.memory.target).structureType == STRUCTURE_RAMPART
			&& Game.getObjectById(creep.memory.target).my
			)
			|| creep.rangedAttack(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
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
