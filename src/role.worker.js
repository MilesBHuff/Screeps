// role.worker.js
// #############################################################################
/** What this script does, is it causes workers to vary between harvesting and
 *  using energy, the latter meaning to transfer, build, repair, or upgrade.
 *  Which of these tasks is chosen is random, and resets at every harvest.
 *  These worker creeps also always look for the closest target first.  If that
 *  target is inaccessible, they then pick one at random within their room.
**/

var roleWorker = {
	run: function (creep) {
// creep.memory.target = undefined; // Useful when you need to reset everyone's task.

		// Decide whether to harvest
		// =====================================================================
		if(creep.memory.harvesting) {
			if(creep.carry.energy >= creep.carryCapacity) {
				creep.memory.harvesting = false;
				creep.memory.target = undefined;
				creep.memory.closest = true;
			}
		} else {
			if(creep.carry.energy <= 0) {
				creep.memory.harvesting = true;
				creep.memory.target = undefined;
				creep.memory.closest = true;
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
				var sources = creep.room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
				var target = undefined;
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
					var targetType = 0;
					if(i == 0) {
						targetType = Math.floor(Math.random() * 4);
					}
					switch(targetType) {
						case 0: // Transfer
						structures = creep.room.find(FIND_STRUCTURES, {
							filter: (structure) => {return(
								(	 structure.structureType == STRUCTURE_EXTENSION
								  || structure.structureType == STRUCTURE_SPAWN
								  || structure.structureType == STRUCTURE_TOWER
								  || structure.structureType == STRUCTURE_CONTAINER
								) && structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures && structures.length) {
							creep.say("Transfer");
							break;
						}
						if(i == 0) break;

						case 1: // Build
						structures = creep.room.find(FIND_CONSTRUCTION_SITES);
						if(structures && structures.length) {
							creep.say("Build");
							break;
						}
						if(i == 0) break;

						case 2: // Repair
						creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax});
						if(structures && structures.length) {
							creep.say("Repair");
							break;
						}
						if(i == 0) break;

						case 3: // Upgrade
						structures = [creep.room.controller];
						if(structures && structures.length) {
							creep.say("Upgrade");
							break;
						}
						if(i == 0) break;
					}
					if(structures && structures.length) break;
				}
				if(creep.memory.closest) {
					creep.memory.target = creep.pos.findClosestByPath(structures).id;
				} else {
					creep.memory.target = structures[Math.floor(Math.random() * structures.length)].id;
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
				creep.memory.closest = false;
			} else if(creep.harvest(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#ff0"}}) == ERR_NO_PATH) {
					creep.memory.target  = undefined;
					creep.memory.closest = false;
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
						creep.memory.closest = false;
					}
				}

			// Repair
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).hits < Game.getObjectById(creep.memory.target).hitsMax) {
				if(creep.repair(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#00f"}}) == ERR_NO_PATH) {
						creep.memory.target = undefined;
						creep.memory.closest = false;
					}
				}

			// Transfer
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).energy < Game.getObjectById(creep.memory.target).energyCapacity) {
				if(creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#fff"}}) == ERR_NO_PATH) {
						creep.memory.target  = undefined;
						creep.memory.closest = false;
					}
				}
			} else {
				creep.memory.target = undefined;
			}
		}
	}
};
module.exports = roleWorker;
