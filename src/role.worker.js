// role.worker.js
// #############################################################################
/** What this script does, is it causes workers to vary between harvesting and
 *  using energy, the latter meaning to transfer, build, repair, or upgrade.
 *  Which of these tasks is chosen depends on a mixture of strategy and
 *  randomness.
 *  These worker creeps also always look for the closest target first.  If that
 *  target is inaccessible, they then pick one at random within their room.
**/

// Non-member variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Define the role
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
var roleWorker = {
	run: function (creep) {

		// Variables
		// =====================================================================
		var repairLimit = 50000;

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
			var target  = "";
			var targets = new Array();
			const TASKS = Object.freeze({
				"WAIT":    -1,
				"HARVEST":  0,
				"TRANSFER": 1,
				"UPGRADE":  2,
				"BUILD":    3,
				"REPAIR":   4
			})
			var task = TASKS.WAIT;
			for(var i = 0; i < 1; i++) {

				// If harvesting, harvest.
				// -------------------------------------------------------------
				task = TASKS.HARVEST;
				if(creep.memory.harvesting) {
					// Pick up dropped resources
					targets = creep.room.find(FIND_DROPPED_RESOURCES);
					if(targets && targets.length) break;
					// Harvest new energy
					targets = creep.room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
					if(targets && targets.length) break;
					// Get energy from storage
					targets = creep.room.find(FIND_STRUCTURES, {
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
				targets = creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {return(
						   structure.structureType == STRUCTURE_EXTENSION
						&& structure.energy        <  structure.energyCapacity
					);}
				});
				if(targets && targets.length) break;
				// Fill spawns
				targets = creep.room.find(FIND_MY_STRUCTURES, {
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
					targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) =>
						   site.structureType == STRUCTURE_WALL
						|| site.structureType == STRUCTURE_RAMPART
					});
					if(targets && targets.length) break;
				}

				// 75% chance of repairing constructions
				// -------------------------------------------------------------
				task = TASKS.REPAIR;
				if(Math.round(Math.random() * 3)) {
					// Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
					// It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
					targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < (structure.hitsMax * 0.75) && structure.hits < (repairLimit) * 0.75});
				if(targets && targets.length) break;
				}

				// 25% chance of upgrading the controller
				// -------------------------------------------------------------
				task = TASKS.UPGRADE;
				if(!Math.round(Math.random() * 3)) {
					targets = [creep.room.controller];
					if(targets && targets.length) break;
				}

				// 50% chance of maintaining towers
				// -------------------------------------------------------------
				task = TASKS.TRANSFER;
				if(Math.round(Math.random())) {
					targets = creep.room.find(FIND_MY_STRUCTURES, {
						filter: (structure) => {return(
							   structure.structureType == STRUCTURE_TOWER
							&& structure.energy        <  structure.energyCapacity
						);}
					});
					if(targets && targets.length) break;
				}

				// Build new things
				// -------------------------------------------------------------
				task = TASKS.BUILD;
				targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
				if(targets && targets.length) break;

				// Store excess resources
				// -------------------------------------------------------------
				task = TASKS.TRANSFER;
				targets = creep.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => {return(
						   structure.structureType == STRUCTURE_STORAGE
						&& structure.energy        <  structure.energyCapacity
					);}
				});
				if(targets && targets.length) break;

				task = TASKS.WAIT;
			}

			// Find a path to the target
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
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#ff0"}}) == ERR_NO_PATH) {
					creep.memory.target  = undefined;
				}
			}
		} else {

			// Upgrade
			// -----------------------------------------------------------------
			/*//*/ if(Game.getObjectById(creep.memory.target).structureType == STRUCTURE_CONTROLLER) {
				if(creep.upgradeController(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0ff"}}) == ERR_NO_PATH) {
						creep.memory.target = undefined;
					}
				}

			// Build
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).progressTotal) {
				if(creep.build(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0f0"}}) == ERR_NO_PATH) {
						creep.memory.target  = undefined;
					}
				}

			// Repair
			// -----------------------------------------------------------------
			} else  if(Game.getObjectById(creep.memory.target).hits < Game.getObjectById(creep.memory.target).hitsMax
				|| Game.getObjectById(creep.memory.target).hits < repairLimit
				){
				if(creep.repair(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#00f"}}) == ERR_NO_PATH) {
						creep.memory.target = undefined;
					}
				}

			// Transfer
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).energy < Game.getObjectById(creep.memory.target).energyCapacity) {
				if(creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#fff"}}) == ERR_NO_PATH) {
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
