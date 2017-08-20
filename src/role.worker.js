// role.worker.js
// #############################################################################
/** What this script does, is it causes workers to vary between harvesting and
 *  using energy, the latter meaning to transfer, build, repair, or upgrade.
 *  Which of these tasks is chosen is random, and resets at completion.
 *  These worker creeps also always look for the closest target first.  If that
 *  target is inaccessible, they then pick one at random within their room.
**/

// Set variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Define the role
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
var roleWorker = {
	run: function (creep) {
		// Variables
		// =====================================================================
		var repairLimit = 100000;

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
			creep.memory.target = undefined;

			// Source
			// -----------------------------------------------------------------
			if(creep.memory.harvesting) {
				var sources = undefined;
				var target  = undefined;
				for(var i = 0; i < 1; i++) {
					var sources = creep.room.find(FIND_DROPPED_RESOURCES);
					if(sources && sources.length) break;

					var sources = creep.room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
					if(sources && sources.length) break;
				}
				if((target = creep.pos.findClosestByPath(sources))
				||((target = sources[Math.floor(Math.random() * sources.length)])
				&& creep.pos.findPathTo(target)
				)){
					creep.memory.target = target.id;
					creep.say("Harvest");
				}

			// Structure
			// -----------------------------------------------------------------
			} else {
				var structures;
				for(var i = 0; i < 2; i++) {
					var quote = "";
					var targetType = 0;
					// Make sure we always have the max number of creeps
					if(i == 0
					&& creep.room.memory.claimerLimit >= _.filter(Game.creeps, (eachCreep) => eachCreep.memory.role == DEFINES.ROLES.CLAIMER && eachCreep.room == creep.room).length
					&& creep.room.memory.fighterLimit >= _.filter(Game.creeps, (eachCreep) => eachCreep.memory.role == DEFINES.ROLES.FIGHTER && eachCreep.room == creep.room).length
					&& creep.room.memory.healerLimit  >= _.filter(Game.creeps, (eachCreep) => eachCreep.memory.role == DEFINES.ROLES.HEALER  && eachCreep.room == creep.room).length
					&& creep.room.memory.workerLimit  >= _.filter(Game.creeps, (eachCreep) => eachCreep.memory.role == DEFINES.ROLES.WORKER  && eachCreep.room == creep.room).length) {
						targetType = Math.floor(Math.random() * 4);
					}
					switch(targetType) {
						case 0: // Transfer
						quote = "Transfer";
						// Fill extensions
						structures = creep.room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_EXTENSION
								&& structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures && structures.length) break;
						// Fill spawns
						structures = creep.room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_SPAWN
								&& structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures && structures.length) break;
						// Fill towers
						structures = creep.room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_TOWER
								&& structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures && structures.length) break;
						// Fill storage
						structures = creep.room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_STORAGE
								&& structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures && structures.length) break;

						quote = "";
						if(i == 0) break;

						case 1: // Build
						structures = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
						if(structures && structures.length) {
							quote = "Build";
							break;
						}
						if(i == 0) break;

						case 2: // Repair
						structures = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax && structure.hits < repairLimit}); // It would seem that walls cannot be owned, so we have to search through all structures in the room, not just our own.
						if(structures && structures.length) {
							quote = "Repair";
							break;
						}
						if(i == 0) break;

						case 3: // Upgrade
						structures = [creep.room.controller];
						if(structures && structures.length) {
							quote = "Upgrade";
							break;
						}
						if(i == 0) break;
					}
					if(structures && structures.length) {
						var target = undefined;
						if((target = creep.pos.findClosestByPath(structures))
						||((target = structures[Math.floor(Math.random() * structures.length)])
						&& creep.pos.findPathTo(target)
						)){
							creep.memory.target = target.id;
							if(quote != "") creep.say(quote);
							break;
						}
					} else if(i >= 1) break;
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
			} else if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE || creep.pickup(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
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
			} else if(Game.getObjectById(creep.memory.target).hits < Game.getObjectById(creep.memory.target).hitsMax) {
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
	}
};
module.exports = roleWorker;
