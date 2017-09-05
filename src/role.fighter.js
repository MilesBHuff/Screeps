// role.fighter.js
// #############################################################################
/** This script provides an AI for fighter creeps.
**/

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES   = require("defines");
var badTargets  = Array();
var hostiles    = Array();
var rooms       = Array();
var roleFighter  = {

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

			// If we've already tried all the rooms we found, return.
			// =================================================================
			if(!rooms.length) {
					return;
			} //fi

			// Variables
			// =================================================================
			hostiles = Game.rooms[rooms[0]].find(FIND_HOSTILE_CREEPS);
			var targets  = Array();
			var task     = DEFINES.TASKS.WAIT;
			switch(true) {
				default:
				// If there are hostiles
				if(hostiles.length) {
//					// Man the ramparts
//					task = DEFINES.TASKS.DEFEND;
//					targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(
//						  structure.structureType == STRUCTURE_RAMPART);}});
//					var b = true;
//					for(var i = 0; targets[i]; i++) {
//						if(!creep.pos.findPathTo(targets[i]).length) {
//							b = false;
//						}
//					}
//					if(targets.length && b) break;
					task = DEFINES.TASKS.ATTACK;
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
				} //fi
//				// Renew if near to a natural death
//				task = DEFINES.TASKS.RENEW;
//				if(creep.ticksToLivenumber < DEFINES.NEAR_DEATH) {
//					targets = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(
//						structure.structureType == STRUCTURE_SPAWN
//					);}}););
//					if(targets.length) break;
//				} //fi
				task = DEFINES.TASKS.HARVEST;
				// Attack enemy structures
				targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
				if(targets.length) break;
				// Attack condemned structures
				if(creep.room.memory && creep.room.memory.dismantle) {
					targets = Array();
					for(var a = 0; creep.room.memory.dismantle[a]; a++) {
						targets.push(Game.getObjectById(creep.room.memory.dismantle[a]));
					} //done
					if(targets && targets.length) break;
				} //fi
				if(targets.length) break;
			} //esac

			// Pick a target from the array of targets
			// =================================================================
			if(targets.length) {
				var target = creep.pos.findClosestByRange(targets);
				if(target && target.id) {
					switch(task) {
						case DEFINES.TASKS.ATTACK:
						creep.memory.say = "Attack";
						break;
						case DEFINES.TASKS.DEFEND:
						creep.memory.say = "Defend";
						break;
						case DEFINES.TASKS.HARVEST:
						creep.memory.say = "Harvest";
						break;
					} //esac
					return target.id;
				} //fi
			} //fi

			// If we reach this line, the current room had no valid targets.  Try another one.
			// =================================================================
rooms = Array(); return undefined; //TODO:  This line is only here until DEFINES.move supports other rooms.
			// If the array of rooms has not yet been sorted, sort it.
			if(rooms[0] != creep.room) {
				rooms = DEFINES.sortRooms(creep.pos, rooms);
			}
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
		// Move towards the target
		// =================================================================
		if(creep.memory.target) {
			if(creep.memory && creep.memory.target) {
				var target = Game.getObjectById(creep.memory.target);
				if(!target) {
					creep.memory.target = undefined;
					creep.memory.path   = undefined;
					return ERR_INVALID_TARGET;
				} //fi
				if(
				(  creep.timeToLive < DEFINES.NEAR_DEATH
				&& target.structureType
				&& target.structureType == STRUCTURE_SPAWN
				&& target.my
				&& creep.renew(target) == ERR_NOT_IN_RANGE
				)
				||
				(  target.structureType
				&& target.structureType == STRUCTURE_RAMPART
				&& target.my
				)
				||
				(  creep.attack(      target) == ERR_NOT_IN_RANGE
				&& creep.rangedAttack(target) == ERR_NOT_IN_RANGE
				)) {
					if(DEFINES.move(creep, COLOR_RED, false) == ERR_NO_PATH) {
						creep.memory.target = undefined;
						creep.memory.path   = undefined;
					} //fi
				} //fi

			// If the creep wasn't able to find a target, it wanders.
			// -----------------------------------------------------------------
			} else {
				DEFINES.wander(creep);
				return OK;
			} //fi

			// If the creep found a target, say what it is.
			// -----------------------------------------------------------------
			if(creep.memory.target) {
				if(creep.memory.say) {
					creep.say(creep.memory.say);
					creep.memory.say = undefined;
				} //fi
				return OK;
			} //fi
		} //fi
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

		// Validate the current target (with a small chance of having to find a new target no matter what)
		// ====================================================================
		if(creep.memory
		&& creep.memory.target
		&&
		(
		!( Game.getObjectById(creep.memory.target)
		&& (target = Game.getObjectById(creep.memory.target))
		)
		||
		(  creep.ticksToLivenumber > DEFINES.NEAR_DEATH
		&& target.structureType
		&& target.structureType == STRUCTURE_SPAWN
		&& target.my
		)
		||
		( !hostiles.length
		&& target.structureType
		&& target.structureType == STRUCTURE_RAMPART
		&& target.my
		)
		||!Math.round(Math.random() * 8)
		)) {
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

		// Find and affect a target
		// =====================================================================
		var loopLimit = Math.ceil(Math.random() * DEFINES.LOOP_LIMIT);
		for(var l = 0; l < loopLimit; l++) {

			// Find a target
			// -----------------------------------------------------------------
			if(!creep.memory || !creep.memory.target) {
				//If the array of rooms has not already been populated, populate it.
				if(!rooms.length) {
					rooms = [creep.room.name];
				} //fi
				// Find a target
				creep.memory.target = roleFighter.findTarget(creep, rooms, badTargets);
			} //fi

			// Affect the target
			// -----------------------------------------------------------------
			if(!roleFighter.affectTarget(creep)) {
				return OK;
			} else {
				// If we were unable to find a path to the target, try to find a new one.
				badTargets.push(creep.memory.target);
				creep.memory.target = undefined;
				creep.memory.path   = undefined;
			} //fi

			// If we're out of rooms, give up.
			// -----------------------------------------------------------------
			if(!rooms.length) break;
		} //done
		DEFINES.wander(creep);
	} //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleFighter;
