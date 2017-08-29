// defines.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/

// Constant variables and functions
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = {
	
	// Variables
	// =========================================================================
	// This color is missing from the global game defines.
	COLOR_BLACK: 0,
	// The maximum number of times to run a loop that would otherwise be while(true).
	LOOP_LIMIT: 2, // Should be much higher;  temporarily lowered until the looping bug is fixed with the worker script.
	// This is the number of ticksToLive below which a creep is considered near-death.
	NEAR_DEATH: 150,
	// This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level.
	REPAIR_LIMIT: 62500,
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
	
	// Functions
	// =========================================================================
	
	// Move
	// -------------------------------------------------------------------------
	/** Calculates a path for the creep to get to its target, and moves it.  If
	 *  the creep is unable to move, recalculate its path.  If no path can be
	 *  found, reset its target.  Also displays the creep's path on the map.
	 * @param  creep The creep to move.
	 * @param  color The colour for the creep's path.
	 * @param  cache Whether to use the path cached in the creep's memory.
	 * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET, ERR_INVALID_ARGS
	**/
	MOVE: function (creep, color, cache) {
		// Verify arguments
		if(!creep || !creep.name || !Game.creeps[creep.name] || color == undefined || cache == undefined) {
			return ERR_INVALID_ARGS;
		} //fi
		// If we aren't using cached paths, clear any cached path.
		if(!cache) {
			creep.memory.path = undefined;
		} //fi
		if(creep.memory && creep.memory.target) {
			var target = Game.getObjectById(creep.memory.target);
			// If the creep's position is equal to the target's position, delete the path and return.
			if(creep.pos == target.pos) {
				creep.memory.path = undefined;
				return OK;
			} //fi
			for(var a = 0; a < 2; a++) {
				// If the creep has no path, create one.  If there is no possible path, reset the creep's target and return.
				if(!creep.memory.path) {
					// Configure the pathfinder
					var pathOpts = {
						ignoreCreeps: false,
						ignoreDestructibleStructures: false,
						ignoreRoads:  false,
						maxOps:        1000,
						maxRooms:         3,
						serialize:    false,
					}; //struct
					// Find a path
					var path = creep.pos.findPathTo(target, pathOpts);
					// Validate the path
					var validPath = false;
					if(path.length) {
						for(var x = -1; x < 1; x++) {
							for(var y = -1; y < 1; y++) {
								if(path[path.length - 1].x == target.pos.x + x
								|| path[path.length - 1].y == target.pos.y + y
								){
									validPath = true;
								} //fi
							} //done
						} //done
					} //fi
					// If the path is invalid, then the target cannot be reached.  Find a new target.
					if(!validPath) {
						creep.memory.target = undefined;
						creep.memory.path   = undefined;
						return ERR_NO_PATH;
					} //fi
					// If the path is valid, serialize it and save it in memory.
					creep.memory.path = Room.serializePath(path);
					// Clear unneeded memory.
					     path = undefined;
					validPath = undefined;
				} else {
					// If the creep already had a path, delete path elements that have already been traversed.
					var path = Room.deserializePath(creep.memory.path);
					if(path[0] != creep.pos) {
						path.shift();
					} //fi
					creep.memory.path = Room.serializePath(path);
				} //fi
				// Try to move the creep to the new location.  If this fails, reset the path.
				var code = creep.moveByPath(creep.memory.path);
				if(code && code != ERR_BUSY && code != ERR_TIRED) {
					creep.memory.path = undefined;
					continue;
				} //fi
				code = undefined;
				break;
			} //done
			// Parse the given color
			switch(color) {
				case COLOR_RED:
//				color = "#ED5557"; // Hostile glow
				color = "#EA4034"; // Flags
				break;
				
				case COLOR_PURPLE:
//				color = "#8F6F9F"; // Syntax-highlighting
				color = "#9625A9"; // Flags
				break;
				
				case COLOR_BLUE:
//				color = "#3F51B5"; // Selection color 
				color = "#2090E9"; // Flags
				break;
				
				case COLOR_CYAN:
//				color = "#47A89F"; // GCL color
				color = "#00B5CC"; // Flags
				break;
				
				case COLOR_GREEN:
//				color = "#89B48D"; // Friendly glow
				color = "#49A84D"; // Flags
				break;
				
				case COLOR_YELLOW:
//				color = "#FFE56E"; // Energy
				color = "#F5E239"; // Flags
				break;
				
				case COLOR_ORANGE:
//				color = "#CA7731"; // Syntax-highlighting
				color = "#F59200"; // Flags
				break;
				
				case COLOR_BROWN:
//				color = "#262816"; // Swampland
				color = "#745245"; // Flags
				break;
				
				case COLOR_GREY:
//				color = "#626262"; // Roads
				color = "#989898"; // Flags
				break;
				
				case COLOR_WHITE:
//				color = "#BCBCBC"; // Icons
				color = "#F5F5F5"; // Flags
				break;
				
				default: // COLOR_BLACK
//				color = "#202020"; // Creep outlines
				color = "#090909"; // Wall outlines
				break;
			} //esac
			// Path-drawing settings
			var lineOpts = {
				fill: "transparent",
				lineStyle: "dashed",
				opacity:       0.25,
				stroke:       color,
				strokeWidth:   0.15,
			}; //struct
			// Draw the creep's path
			new RoomVisual(creep.room.name).poly(Room.deserializePath(creep.memory.path), lineOpts);
			return OK;
		} else return ERR_INVALID_TARGET;
	}, //function
	
	// Say
	// -------------------------------------------------------------------------
	/** Spawns text above the given object, similarly to creep.say().
	 * @param  text   The text to display.
	 * @param  object The thing that will display the text.
	 * @return OK, ERR_INVALID_ARGS
	**/
	SAY: function (text, object) {
		if(!text || !text[0] || !object || !object.room || !object.room.pos) {
			return ERR_INVALID_ARGS
		} //fi
		new RoomVisual(object.room).text(
			text,
			object.pos.x,
			object.pos.y - 1,
			{backgroundColor:   "#CCC",
			backgroundPadding: "0.1",
			color:             "#111",
			font:              "bold 0.6 Arial",
		});
		return OK;
	}, //function
	
	// Wander
	// -------------------------------------------------------------------------
	/** Makes the given creep wander around its room at random.
	 * @param  creep The creep to control.
	 ( @return OK
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
			} //fi
		} //fi
		return OK;
	}, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = DEFINES;
