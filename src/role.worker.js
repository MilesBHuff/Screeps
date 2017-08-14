// role.worker.js
// #############################################################################

var roleWorker = {
	run: function (creep) {

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
		if(creep.memory.target == undefined) {

			// Source
			// -----------------------------------------------------------------
			if(creep.memory.harvesting) {
				var sources = creep.room.find(FIND_SOURCES);
				creep.memory.target = sources[Math.floor(Math.random() * sources.length)].id;
				creep.say("Harvest");

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
								) && structure.energy        <  structure.energyCapacity
							);}
						});
						if(structures) {
							creep.say("Transfer");
							break;
						}
						if(i == 0) break;

						case 1: // Build
						structures = creep.room.find(FIND_CONSTRUCTION_SITES);
						if(structures) {
							creep.say("Build");
							break;
						}
						if(i == 0) break;

						case 2: // Repair
						creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax});
						if(structures) {
							creep.say("Repair");
							break;
						}
						if(i == 0) break;

						case 3: // Upgrade
						structures = [creep.room.controller];
						if(structures) {
							creep.say("Upgrade");
							break;
						}
						if(i == 0) break;
					}
					if(structures) break;
				}
				creep.memory.target = structures[Math.floor(Math.random() * structures.length)].id;
			}
		}

		// Move towards the target
		// =====================================================================

		// Harvest
		// ---------------------------------------------------------------------
		if(creep.memory.harvesting) {
			if( creep.harvest( Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
				creep.moveTo(  Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#ff0"}});
			}
		} else {

			// Upgrade
			// -----------------------------------------------------------------
			/*//*/ if(Game.getObjectById(creep.memory.target).structureType == STRUCTURE_CONTROLLER) {
				if( creep.upgradeController(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(           Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0ff"}});
				}

			// Build
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).progress) {
				if( creep.build( Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#0f0"}});
				}

			// Repair
			// -----------------------------------------------------------------
			} else if(Game.getObjectById(creep.memory.target).hits < Game.getObjectById(creep.memory.target).hitsMax) {
				if( creep.repair(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#00f"}});
				}

			// Transfer
			// -----------------------------------------------------------------
			} else {
				if( creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(  Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#fff"}});
				}
			}
		}
	}
};
module.exports = roleWorker;
