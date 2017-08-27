// defines.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/

// Constant variables and functions
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = {
	
	// Functions
	// =========================================================================
	
	// Move
	// -------------------------------------------------------------------------
	/** Calculates a path for the creep to get to its target, and moves it.  If
	 *  the creep is unable to move, recalculate its path.  If no path can be
	 *  found, reset its target.  Also displays the creep's path on the map.
	 * @param creep The creep to move.
	 * @param color The colour for the creep's path.
	 * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET, ERR_INVALID_ARGS
	**/
	MOVE: function (creep, color) {
		if(!creep || !creep.name || !Game.creeps[creep.name] || !color || !color[0]) {
			return ERR_INVALID_ARGS;
		}
		if(creep.memory && creep.memory.target) {
//			// If the creep has not moved since the last tick, recalculate its path.
//			if(creep.memory.oldPos == creep.pos) {
//				creep.memory.path = undefined;
//			}
			creep.memory.oldPos = creep.pos;
			// If the creep's position is equal to the target's position, delete the path and return.
			if(creep.pos == Game.getObjectById(creep.memory.target).pos) {
				creep.memory.path = undefined;
				return OK;
			}
			// If the creep has no path, create one.  If there is no possible path, reset the creep's target and return.
			if(!creep.memory.path) {
				var pathOpts = {
					serialize: true,
				};
				if(creep.memory.path = creep.pos.findPathTo(Game.getObjectById(creep.memory.target), pathOpts) == ERR_NO_PATH) {
					creep.memory.target = undefined;
					return ERR_NO_PATH;
				}
			}
			// Try to move the creep to the new location.  If this fails, reset the path.
			if(!creep.moveByPath(creep.memory.path)) {
				creep.memory.path = undefined;
				return OK;
			}
			// Draw the creep's path
			new RoomVisual(creep.room).poly(path, {stroke: color, strokeWidth: .15, opacity: .25, lineStyle: 'dashed'});
			if(creep.moveTo(Game.getObjectById(creep.memory.target), {reusePath: creep.ticksToLive, visualizePathStyle: {stroke: "#ff0", opacity: .25}}) == ERR_NO_PATH) {
				creep.memory.target  = undefined;
			}
			return OK;
		} else return ERR_INVALID_TARGET;
	},
	
	// Say
	// -------------------------------------------------------------------------
	/** Spawns text above the given object, similarly to creep.say().
	 * @param text   The text to display.
	 * @param object The thing that will display the text.
	**/
	SAY: function (text, object) {
		if(text && object && object.room && object.room.pos) {
			new RoomVisual(object.room).text(text,
				                             object.pos.x,
				                             object.pos.y - 1,
				                            {backgroundColor:   "#CCC",
				                             backgroundPadding: "0.1",
				                             color:             "#111",
				                             font:              "bold 0.6 Arial",
				                            });
		}
	},
	
	// Wander
	// -------------------------------------------------------------------------
	/** Makes the given creep wander around its room at random.
	 * @param creep The creep to control.
	**/
	WANDER: function (creep) {
		if(creep.pos.x <  3
		|| creep.pos.x > 46
		|| creep.pos.y <  3
		|| creep.pos.y > 46
		){ creep.moveTo(24, 24);
		} else {
			var direction = Math.round(Math.random() * 8);
			if(direction) {
				creep.move(direction);
			}
		}
	},
	
	// Variables
	// =========================================================================
	// This is the number of ticksToLive below which a creep is considered near-death.
	NEAR_DEATH: 150,
	// This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level.
	REPAIR_LIMIT: 24000,
	// These are all the roles available for creeps
	ROLES: Object.freeze({
		"WORKER":  0,
		"FIGHTER": 1,
		"HEALER":  2,
	}),
	// These are all the cannonical tasks that can be assigned to a creep
	TASKS: Object.freeze({
		WAIT:    -1,
		HARVEST:  0,
		TRANSFER: 1,
		UPGRADE:  2,
		BUILD:    3,
		REPAIR:   4,
		ATTACK:   5,
		HEAL:     6,
		CLAIM:    7,
		RENEW:    8,
	}),
	// The player's username
	USERNAME: "MilesBHuff",
};

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = DEFINES;
