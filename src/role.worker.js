// role.worker.js
// #############################################################################
/** What this script does, is it causes workers to vary between harvesting and
 *  using energy, the latter meaning to transfer, build, repair, or upgrade.
 *  Which of these tasks is chosen depends on a mixture of strategy and
 *  randomness.
 *  These worker creeps also always look for the closest target first.  If that
 *  target is inaccessible, they then pick one at random within their room.  If
 *  the creep cannot find anything to do in its current room, it will look for
 *  things to do in a neighbouring room.
**/

// Non-member variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Define the role
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
var roleWorker = {
	run: function (creep) {
//creep.memory.target = undefined; // Useful when you need to reset everyone's roles.

		// Variables
		// =====================================================================
		var repairLimit = DEFINES.REPAIR_LIMIT * creep.room.controller.level;

		// Decide whether to harvest
		// =====================================================================
		if(creep.memory.harvesting) {
			if(creep.carry.energy >= creep.carryCapacity) {
				creep.memory.harvesting = false;
				creep.memory.target = undefined;
			}
		} else {
			if(creep.carry.energy <= 0) {
				creep.memory.harvesting = true;
				creep.memory.target = undefined;
			}
		}
		// Decide on a target
		// =====================================================================
		if(creep.memory.target == undefined
		|| !Game.getObjectById(creep.memory.target)
		){
			// Variables
			// -----------------------------------------------------------------
			creep.memory.target = undefined;
			var rooms    = Array();
			rooms.push(creep.room.name);
			var roomsRaw = Game.map.describeExits(creep.room.name);
			for(var i = 0; i < 4; i++) {
				var index = ((2 * 1) + 1).toString();
				if(roomsRaw[index] != undefined) {
					rooms.push(roomsRaw[index]);
				}
			}
			var target   = undefined;
			var targets  = Array();
			const TASKS  = Object.freeze({
				"WAIT":    -1,
				"HARVEST":  0,
				"TRANSFER": 1,
				"UPGRADE":  2,
				"BUILD":    3,
				"REPAIR":   4
			})
			var task = TASKS.WAIT;
			for(var i = 0; i < rooms.length;) {
				var room;
				// Use the current room first.
				if(rooms[0] == creep.room.name) {
					room = rooms.shift();
				// If the current room failed...
				//TODO:  A better way to do this, would be to sort the array by distance one time.
				} else {
					// Find the room with the shortest path
					room = creep.pos.findClosestByPath(rooms);
					// Find its index
					var index = 0;
					for(var j = 0; j < rooms.length; j++) {
						if(rooms[j] == room) {
							index = j;
							break;
						}
					}
					// Splice it
					rooms.splice(index, 1);
				}
				room = Game.rooms[room];

				// If harvesting, harvest.
				// -------------------------------------------------------------
				task = TASKS.HARVEST;
				if(creep.memory.harvesting) {
					// Pick up dropped resources
					targets = room.find(FIND_DROPPED_RESOURCES);
					if(targets && targets.length) break;
					// Harvest new energy
					targets = room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
					for(var j = 0, k = 0; j < targets.length; j++) {
						if(creep.moveTo(targets[j]) == ERR_NO_PATH) {
							k++;
						}
						if(k >= targets.length - 1) {
							targets = Array();
						}
					}
					if(targets && targets.length) break;
					// Get energy from storage
					targets = room.find(FIND_STRUCTURES, {
						filter: (structure) => {return(
							   structure.structureType == STRUCTURE_STORAGE
							&& structure.energy        >  0
						);}
					});
					if(targets && targets.length) break;
					// If there's no new energy available, use what you're already carrying, if anything.
					if(creep.carry.energy > 0) {
						creep.memory.harvesting = false;
					}
				}

				// Always keep spawns and extensions filled up to max.
				// -------------------------------------------------------------
				task = TASKS.TRANSFER;
				// Fill extensions
				targets = room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {return(
						   structure.structureType == STRUCTURE_EXTENSION
						&& structure.energy        <  structure.energyCapacity
					);}
				});
				if(targets && targets.length) break;
				// Fill spawns
				targets = room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {return(
						   structure.structureType == STRUCTURE_SPAWN
						&& structure.energy        <  structure.energyCapacity
					);}
				});
				if(targets && targets.length) break;

				// 50% chance to build things that complete instantaneously
				// -------------------------------------------------------------
				task = TASKS.BUILD;
				if(Math.round(Math.random())) {
					targets = room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) =>
						   site.structureType == STRUCTURE_WALL
						|| site.structureType == STRUCTURE_RAMPART
					});
					if(targets && targets.length) break;
				}

				// 50% chance of maintaining towers
				// -------------------------------------------------------------
				task = TASKS.TRANSFER;
				if(Math.round(Math.random())) {
					targets = room.find(FIND_MY_STRUCTURES, {
						filter: (structure) => {return(
							   structure.structureType == STRUCTURE_TOWER
							&& structure.energy        <  structure.energyCapacity
						);}
					});
					if(targets && targets.length) break;
				}

				// 75% chance of repairing constructions
				// -------------------------------------------------------------
				task = TASKS.REPAIR;
				if(Math.round(Math.random() * 3)) {
					// Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
					// It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
					targets = room.find(FIND_STRUCTURES, {filter: (structure) =>
						   structure.hits < (structure.hitsMax * 0.75)
						&& structure.hits < (repairLimit * 0.75)
				   	});
				if(targets && targets.length) break;
				}

				// 25% chance of upgrading the controller
				// -------------------------------------------------------------
				task = TASKS.UPGRADE;
				if(!Math.round(Math.random() * 3)) {
					targets = [room.controller];
					if(targets && targets.length) break;
				}

				// Build new things
				// -------------------------------------------------------------
				task = TASKS.BUILD;
				targets = room.find(FIND_MY_CONSTRUCTION_SITES);
				if(targets && targets.length) break;

				// Store excess resources
				// -------------------------------------------------------------
				task = TASKS.TRANSFER;
				targets = room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {return(
						   structure.structureType == STRUCTURE_STORAGE
						&& structure.energy        <  structure.energyCapacity
					);}
				});
				if(targets && targets.length) break;

				task = TASKS.WAIT;
			}

			// Pick a target from the list of targets
			// -----------------------------------------------------------------
			if((target = creep.pos.findClosestByPath(targets))
			||((target = targets[Math.floor(Math.random() * targets.length)])
			&& creep.pos.findPathTo(target)
			)){
				creep.memory.target = target.id;
				switch(task) {
					case TASKS.HARVEST:
					creep.say("Harvest");
					break;

					case TASKS.TRANSFER:
					creep.say("Transfer");
					break;

					case TASKS.UPGRADE:
					creep.say("Upgrade");
					break;

					case TASKS.BUILD:
					creep.say("Build");
					break;

					case TASKS.REPAIR:
					creep.say("Repair");
					break;
				}
			}
		}

		// Move towards the target
		// =====================================================================

		// Harvest
		// ---------------------------------------------------------------------
		if(creep.memory.harvesting) {
			/*//*/ if(Game.getObjectById(creep.memory.target).energy <= 0) {
				creep.memory.target  = undefined;
			} else if(creep.harvest( Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
				   || creep.pickup(  Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
				   || creep.withdraw(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE
				   ){
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#ff0", opacity: .25}}) == ERR_NO_PATH) {
					creep.memory.target  = undefined;
				}
			}
		} else {

			// Upgrade
			// -----------------------------------------------------------------
			/*//*/ if(Game.getObjectById(creep.memory.target).structureType == STRUCTURE_CONTROLLER) {
				if(creep.upgradeController(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0ff", opacity: .25}}) == ERR_NO_PATH) {
						creep.memory.target = undefined;
					}
				}

			// Build
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).progressTotal) {
				if(creep.build(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0f0", opacity: .25}}) == ERR_NO_PATH) {
						creep.memory.target  = undefined;
					}
				}

			// Repair
			// -----------------------------------------------------------------
			} else  if(Game.getObjectById(creep.memory.target).hits < Game.getObjectById(creep.memory.target).hitsMax
				&& Game.getObjectById(creep.memory.target).hits < repairLimit
				){
				if(creep.repair(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#00f", opacity: .25}}) == ERR_NO_PATH) {
						creep.memory.target = undefined;
					}
				}

			// Transfer
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).energy < Game.getObjectById(creep.memory.target).energyCapacity) {
				if(creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#fff", opacity: .25}}) == ERR_NO_PATH) {
						creep.memory.target  = undefined;
					}
				}
			} else {
				creep.memory.target = undefined;
			}
		}
		
		// If the creep can't find a target, it wanders
		// ---------------------------------------------------------------------
		if(creep.memory.target == undefined) {
			require("actions").wander(creep);
		}
	}
};
module.exports = roleWorker;
