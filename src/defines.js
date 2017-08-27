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
