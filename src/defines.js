// defines.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/

const DEFINES = {

	// Variables
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	// This color is missing from the global game defines.
	COLOR_BLACK: 0,
	// This constant is missing from the global game defines.
	CONTROLLER_LEVEL_MAX: 8,
	// This is the remaining repair amount at which you will receive an email about your controller degrading.
	CONTROLLER_NEAR_DEGRADE: 3000,
	// The maximum number of times to run a loop that would otherwise be while(true).
	LOOP_LIMIT: 6,
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

	// Functions (tier 1)
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

	// Filter targets
	// =========================================================================
	/** This function removes any element in badTargets from targets.
	 * @param  targets    The array to filter.
	 * @param  badTargets The items to remove from targets.
	 * @return targets without badTargets.
	**/
	filterTargets: function (targets, badTargets) {
return targets; //TODO
		var badTargetsCopy = badTargets;
		for(var i = 0; targets[i]; i++) {
			for(var j = 0; badTargets[j]; j++) {
				if(targets[i].id == badTargets[j]) {
					targets.splice(i, 1);
					i--;
					badTargets.splice(j, 1);
					j--;
					break;
				}
			}
		}
		badTargets = badTargetsCopy;
		badTargetsCopy = undefined;
		return targets;
	}, //function

	// Find rooms
	// =========================================================================
	/** This function finds and returns the given room and its neighbours.
	 * @param  roomName The name of the room whose neighbours to find.
	 * @return the given room and its neighbours.
	**/
	findRooms: function (roomName) {
		var rooms = Array();
		// Push the creep's current room.
		rooms.push(roomName);
		// Find all the rooms connected to the current room.
		var roomsTmp = Game.map.describeExits(roomName);
		for(var i = 0; i < 4; i++) {
			var index = ((2 * i) + 1).toString();
			if(roomsTmp[index] != undefined) {
				rooms.push(roomsTmp[index]);
			} //fi
		} //done
		// Convert the array of strings into an array of objects.  This also trims rooms that we can't see.
		roomsTmp = Array();
		for(var name in rooms) {
			var room = Game.rooms[rooms[name]];
			if(room) roomsTmp.push(room);
		} //done
		// Return the array.
		return roomsTmp;
	}, //function

	// Kill off
	// =========================================================================
	/** This function kills off excess creeps.
	* @param creeps    The creeps to use.
	* @param maxCreeps The number to cull to.
	**/
	killOff: function (creeps, maxCreeps) {
		for(var i = 0; creeps.length > maxCreeps; i++) {
			creeps[i].suicide();
		} //done
	}, //function

	// Move
	// =========================================================================
	/** Calculates a path for the creep to get to its target, and moves it.  If
	 *  the creep is unable to move, recalculate its path.  If no path can be
	 *  found, reset its target.  Also displays the creep's path on the map.
	 * @param  creep The creep to move.
	 * @param  color The colour for the creep's path.
	 * @param  cache Whether to use the path cached in the creep's memory.
	 * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET, ERR_INVALID_ARGS
	**/
	move: function (creep, color, cache) {
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
	// =========================================================================
	/** Spawns text above the given object, similarly to creep.say().
	 * @param  text   The text to display.
	 * @param  object The thing that will display the text.
	 * @return OK, ERR_INVALID_ARGS
	**/
	say: function (text, object) {
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

	// Sort rooms
	// =========================================================================
	/** This function sorts the given rooms by distance from the given position.
	 * @param  pos   The position to use.
	 * @param  rooms The array to sort.
	 * @return the sorted array.
	**/
	sortRooms: function (pos, rooms) {
		var roomsTmp = Array();
		for(var i = 0; 0 < rooms.length; i++) {
			// Find the nearest room that hasn't been found yet.
			roomsTmp.push(Game.rooms[pos.findClosestByRange(FIND_EXIT, {filter: (room) => function(room) {return rooms.indexOf(room) != -1;}}).roomName]);
			// Find its index.
			var index = 0;
			for(var j = 0; rooms[j]; j++) {
				if(rooms[j] == roomsTmp[i]) {
					index = j;
					break;
				} //fi
			} //done
			// Splice it.
			rooms.splice(index, 1);
		} //done
		// Return the sorted array.
		return roomsTmp
	}, //function

	// Wander
	// =========================================================================
	/** Makes the given creep wander around its room at random.
	 * @param  creep The creep to control.
	 ( @return OK
	**/
	wander: function (creep) {
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

	// Functions (tier 2)
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

	// Create creep
	// =========================================================================
	// Depends: DEFINES.say()
	/** The idea behind this function, is to create each creep with as many parts as
	*  possible, given the room's current energy total.  It cycles through the
	*  given parts array, and continues until there is no more energy to spend.  It
	*  then sorts the parts in such a way that maximises each creep's
	*  survivability.
	* @param spawn    The spawner to use
	* @param rawParts This is an array of body parts;  this function reduplicates
	*                 it infinitely.
	* @param name     The name of the new creep.
	* @param role     The role the new creep should have.
	**/
	createCreep: function (spawn, rawParts, name, role) {
		// Variables
		// -------------------------------------------------------------------------
		var bodyParts   = Array();
		var energyCost  = 0;
		var energyTotal = spawn.room.energyAvailable;
		var partCount   = {
			attack: 0,
			carry:  0,
			claim:  0,
			heal:   0,
			move:   0,
			rangedAttack: 0,
			tough:  0,
			work:   0
		}; //struct
		for(var currentPart = 0, failCount = 0; true; currentPart++) {
			// Stop once we've used up as much energy as possible
			if(failCount >= rawParts.length) {
				break;
			} //fi
			// Start over once we finish the parts array
			if(currentPart >= rawParts.length) {
				currentPart = 0;
			} //fi

			// Find out how expensive the current part is
			// ---------------------------------------------------------------------
			var partCost = 0;
			switch(rawParts[currentPart]) {
				case ATTACK:
				partCost = BODYPART_COST[ATTACK];
				break;

				case CARRY:
				partCost = BODYPART_COST[CARRY];
				break;

				case CLAIM:
				partCost = BODYPART_COST[CLAIM];
				break;

				case HEAL:
				partCost = BODYPART_COST[HEAL];
				break;

				case MOVE:
				partCost = BODYPART_COST[MOVE];
				break;

				case RANGED_ATTACK:
				partCost = BODYPART_COST[RANGED_ATTACK];
				break;

				case TOUGH:
				partCost = BODYPART_COST[TOUGH];
				break;

				case WORK:
				partCost = BODYPART_COST[WORK];
				break;

				default:
				console.log("ERROR:  Spawn:  Part doesn't exist!");
				return;
			} //esac

			// See whether we can afford the part.  If so, count it.
			// ---------------------------------------------------------------------
			if(energyCost + partCost <= energyTotal) {
				failCount = 0;
				energyCost += partCost;
				switch(rawParts[currentPart]) {
					case ATTACK:
					partCount.attack++;
					break;

					case CARRY:
					partCount.carry++;
					break;

					case CLAIM:
					partCount.claim++;
					break;

					case HEAL:
					partCount.heal++;
					break;

					case MOVE:
					partCount.move++;
					break;

					case RANGED_ATTACK:
					partCount.rangedAttack++;
					break;

					case TOUGH:
					partCount.tough++;
					break;

					case WORK:
					partCount.work++;
					break;

					default:
					console.log("ERROR:  Spawn:  Part doesn't exist!");
					return;
				} //esac
			} else {
				failCount++;
				// If this is the absolute first part and we are unable to construct it, there is no point in building this creep.
				if(currentPart == 0 && energyCost == 0) {
					return;
				} else continue;
			} //if
		} //done

		// Sort the parts in order to make the creep more resilient in combat
		// -------------------------------------------------------------------------
		for(var i = 0; i < partCount.tough; i++) {
			bodyParts.push(TOUGH);
		} //done
		for(var i = 0; i < partCount.work; i++) {
			bodyParts.push(WORK);
		} //done
		for(var i = 0; i < partCount.claim; i++) {
			bodyParts.push(CLAIM);
		} //done
		for(var i = 0; i < partCount.attack; i++) {
			bodyParts.push(ATTACK);
		} //done
		for(var i = 0; i < partCount.rangedAttack; i++) {
			bodyParts.push(RANGED_ATTACK);
		} //done
		for(var i = 0; i < partCount.heal; i++) {
			bodyParts.push(HEAL);
		} //done
		for(var i = 0; i < partCount.carry; i++) {
			bodyParts.push(CARRY);
		} //done
		for(var i = 0; i < partCount.move; i++) {
			bodyParts.push(MOVE);
		} //done

		// If the creep is only partially formed, there's no point in spawning it.
		// -------------------------------------------------------------------------
		if(
		!( partCount.move   > 0
		//	&&
		//	(  partCount.attack > 0
		//	|| partCount.carry  > 0
		//	|| partCount.claim  > 0
		//	|| partCount.heal   > 0
		//	|| partCount.rangedAttack > 0
		//	|| partCount.work   > 0
		//	)
		)) {
			return;
		} //fi

		// Remove excess body parts
		// -------------------------------------------------------------------------
		//TODO:  If energy remains, replace TOUGH parts with non-TOUGH parts.
		for(var i = bodyParts.length; i > MAX_CREEP_SIZE; i--) {
			bodyParts.pop();
		} //done

		// If any neighbouring owned room lacks spawners, 50% chance of sending this creep to it.
		// -------------------------------------------------------------------------
		var target = undefined;
		if(Math.round(Math.random())) {
			var exits = Game.map.describeExits(spawn.room.name);
			for(var index in exits) {
				var room = Game.rooms[exits[index]];
				if( room && room.controller && room.controller.my
				&& !room.find(FIND_MY_STRUCTURES, {filter: (structure) => {
					return(structure.structureType == STRUCTURE_SPAWN)
					}}).length
				){
					target = room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
					break;
				} //fi
			} //done
		} //fi

		// If we have parts, create the creep.
		// -------------------------------------------------------------------------
		if(bodyParts[0]) {
			for(var i = 0; spawn.createCreep(bodyParts, name + i, {role: role, target: target}) == ERR_NAME_EXISTS; i++) {}
		} //fi

		// Display which type of creep is being spawned
		// -------------------------------------------------------------------------
		DEFINES.say(name[0].toUpperCase() + name.slice(1), spawn);
	}, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = DEFINES;
