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

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
var roleWorker = {
	
	// run()
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

		// Variables
		// =====================================================================
		var badTargets  = Array();
		var repairLimit = DEFINES.REPAIR_LIMIT * creep.room.controller.level;
		var rooms       = Array();
		var roomsSorted = false;

		// Decide whether to harvest
		// =====================================================================
		if(creep.memory.harvesting) {
			if(creep.carry.energy >= creep.carryCapacity) {
				creep.memory.harvesting = false;
				creep.memory.target = undefined;
				creep.memory.path   = undefined;
			} //fi
		} else {
			if(creep.carry.energy <= 0) {
				creep.memory.harvesting = true;
				creep.memory.target = undefined;
				creep.memory.path   = undefined;
			} //fi
		} //fi
		
		for(var g = 0; g < DEFINES.LOOP_LIMIT; g++) {
			var say = undefined;
			
			// Decide on a target
			// =================================================================
			if(!creep.memory.target
			|| !Game.getObjectById(creep.memory.target)
			){
				for(var h = 0; h < DEFINES.LOOP_LIMIT; h++) {
					
					// Cleanup
					// ---------------------------------------------------------
					creep.memory.target = undefined;
					creep.memory.path   = undefined;

					// If we've already tried all the nearby rooms, break.
					// ---------------------------------------------------------
					if(!rooms.length) {
						if(roomsSorted) {
							break;

						// If the array of possible rooms has not yet been populated, populate it.
						// -----------------------------------------------------
						} else {
							// Push the creep's current room.
							rooms.push(creep.room.name);
							// Find all the rooms connected to the current room.
							var roomsTmp = Game.map.describeExits(creep.room.name);
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
							// Save the new array to rooms, and free up memory.
							rooms    = roomsTmp;
							roomsTmp = undefined;
						} //fi
					} //fi

					// If the current room is not the creep's room, sort the remaining rooms by distance if we have not already done so.
					// ---------------------------------------------------------
					if(!roomsSorted && rooms[0] != creep.room) {
						var roomsTmp = Array();
						for(var i = 0; 0 < rooms.length; i++) {
							// Find the nearest room that hasn't been found yet.
							roomsTmp.push(Game.rooms[creep.pos.findClosestByRange(FIND_EXIT, {filter: (room) => function(room) {return rooms.indexOf(room) != -1;}}).roomName]);
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
						// Save the new array to rooms, and free up memory.
						rooms       = roomsTmp;
						roomsTmp    = undefined;
						roomsSorted = true;
					} //fi

					// Variables
					// ---------------------------------------------------------
					var room    = rooms.shift();
					var targets = Array();
					var task    = DEFINES.TASKS.WAIT;
					for(var b = true; b; b = false) {

						// If harvesting, harvest.
						// -----------------------------------------------------
						task = DEFINES.TASKS.HARVEST;
						if(creep.memory.harvesting) {
							// Pick up dropped resources
							targets = room.find(FIND_DROPPED_RESOURCES);
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
							// Withdraw resources from enemy structures
							targets = room.find(FIND_HOSTILE_STRUCTURES);
							if(targets && targets.length) break;
							// 50% chance to withdraw resources from condemned structures
							if(room.memory && room.memory.dismantle && Math.round(Math.random())) {
								for(var a = 0; room.memory.dismantle[a]; a++) {
									targets.push(Game.getObjectById(room.memory.dismantle[a]));
								} //done
								targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
								if(targets && targets.length) break;
							} //fi
							// 25% chance to harvest minerals
							if(!Math.floor(Math.random() * 4)) {
								targets = room.find(FIND_STRUCTURES, {
									filter: (structure) => {return(
										   structure.structureType == STRUCTURE_EXTRACTOR
									);}
								});
								targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
								if((targets && targets.length || room.find(FIND_MINERALS, {filter: (mineral) => mineral.mineralAmount > 0}).length) break;
							}
							// Harvest new energy
							targets = room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
							// Get energy from storage
							targets = room.find(FIND_STRUCTURES, {
								filter: (structure) => {return(
									   structure.structureType == STRUCTURE_STORAGE
									&& structure.energy        >  0
								);}
							});
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
							// If there's no new energy available, use what you're already carrying, if anything.
							if(creep.carry.energy > 0) {
								creep.memory.harvesting = false;
							} else {
								task = DEFINES.TASKS.WAIT;
								break;
							}
						} //fi

						// If the controller is about to degrade, contribute to it
						// -----------------------------------------------------
						task = DEFINES.TASKS.UPGRADE;
						if(room.controller.ticksToDowngrade < DEFINES.NEAR_DEATH * 10) {
							targets = [room.controller];
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// Always keep spawns and extensions filled up to max.
						// -----------------------------------------------------
						task = DEFINES.TASKS.TRANSFER;
						// Fill extensions
						targets = room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_EXTENSION
								&& structure.energy        <  structure.energyCapacity
								&& structure.room.memory.dismantle.indexOf(structure.id) === -1
							);}
						});
						targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
						if(targets && targets.length) break;
						// Fill spawns
						targets = room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_SPAWN
								&& structure.energy        <  structure.energyCapacity
								&& structure.room.memory.dismantle.indexOf(structure.id) === -1
							);}
						});
						targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
						if(targets && targets.length) break;

						// 75% chance of maintaining towers
						// -----------------------------------------------------
						task = DEFINES.TASKS.TRANSFER;
						if(Math.round(Math.random() * 3)) {
							targets = room.find(FIND_MY_STRUCTURES, {
								filter: (structure) => {return(
									   structure.structureType == STRUCTURE_TOWER
									&& structure.energy        <  structure.energyCapacity * 0.75
									&& structure.room.memory.dismantle.indexOf(structure.id) === -1
								);}
							});
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// 50% chance to build things that complete instantaneously
						// -----------------------------------------------------
						task = DEFINES.TASKS.BUILD;
						if(Math.round(Math.random())) {
							targets = room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (site) =>
								   site.structureType == STRUCTURE_WALL
								|| site.structureType == STRUCTURE_RAMPART
							});
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// 75% chance of repairing constructions
						// -----------------------------------------------------
						task = DEFINES.TASKS.REPAIR;
						if(Math.round(Math.random() * 3)) {
							// Only repair structures that are at least 25% of the way damaged, either from their repair maximum, or the global repair maximum.
							// It would seem that walls cannot be owned, so we have to search through all targets in the room, not just our own.
							targets = room.find(FIND_STRUCTURES, {filter: (structure) =>
								   structure.hits < (structure.hitsMax * 0.75)
								&& structure.hits < (repairLimit * 0.75)
								&& structure.room.memory.dismantle.indexOf(structure.id) === -1
							});
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// 50% chance of upgrading the controller, if it's not already at max
						// -----------------------------------------------------
						task = DEFINES.TASKS.UPGRADE;
						if(room.controller.level < 8 && Math.round(Math.random())) {
							targets = [room.controller];
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// Build new things
						// -----------------------------------------------------
						task = DEFINES.TASKS.BUILD;
						targets = room.find(FIND_MY_CONSTRUCTION_SITES);
						targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
						if(targets && targets.length) break;

						// Upgrade the controller if it's not already at max.
						// -----------------------------------------------------
						task = DEFINES.TASKS.UPGRADE;
						if(room.controller.level < 8) {
							targets = [room.controller];
							targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
							if(targets && targets.length) break;
						} //fi

						// Store excess resources
						// -----------------------------------------------------
						task = DEFINES.TASKS.TRANSFER;
						targets = room.find(FIND_MY_STRUCTURES, {
							filter: (structure) => {return(
								   structure.structureType == STRUCTURE_STORAGE
								&& structure.energy        <  structure.energyCapacity
								&& structure.room.memory.dismantle.indexOf(structure.id) === -1
							);}
						});
						targets = targets.filter(function(target) {return badTargets.indexOf(target.id) === -1;});
						if(targets && targets.length) break;

						task = DEFINES.TASKS.WAIT;
						break;
					} //done

					// Pick a target from the array of targets
					// ---------------------------------------------------------
					if(targets.length) {
						creep.memory.target = creep.pos.findClosestByRange(targets).id;
						switch(task) {
							case DEFINES.TASKS.HARVEST:
							say = "Harvest";
							break;

							case DEFINES.TASKS.TRANSFER:
							say = "Transfer";
							break;

							case DEFINES.TASKS.UPGRADE:
							say = "Upgrade";
							break;

							case DEFINES.TASKS.BUILD:
							say = "Build";
							break;

							case DEFINES.TASKS.REPAIR:
							say = "Repair";
							break;
						} //esac
						break;
					} //fi
					if(rooms.length) break;
				} //done
			} //fi

			// Move towards the target
			// =================================================================
			if(creep.memory.target) {
				var target = Game.getObjectById(creep.memory.target);

				// Harvest
				// -------------------------------------------------------------
				if(creep.memory.harvesting) {
					/*//*/  if(!target
						    ||
						    (( !target.energy
						    ||  target.energy <= 0
						    )
							&&
						    !(  target.room.memory
						    &&  target.room.memory.dismantle
						    &&  target.room.memory.dismantle.indexOf(creep.memory.target) != -1
						    ))
					){
						creep.memory.target  = undefined;
					} else  if( creep.harvest( target) == ERR_NOT_IN_RANGE
						    ||  creep.pickup(  target) == ERR_NOT_IN_RANGE
						    ||  creep.withdraw(target) == ERR_NOT_IN_RANGE
						    ||
						    ((( target.room.controller.owner
						    &&  target.room.controller.owner != DEFINES.USERNAME
						    )
							|| 
						    (   target.room.memory
						    &&  target.room.memory.dismantle
						    &&  target.room.memory.dismantle.indexOf(creep.memory.target) != -1
						    ))
							&&  creep.dismantle(target) == ERR_NOT_IN_RANGE
						    )
					){
						if(DEFINES.move(creep, COLOR_YELLOW, true) == ERR_NO_PATH) {
								badTargets.push(target, true);
								creep.memory.target = undefined;
								creep.memory.path   = undefined;
							}
					} //fi
				} else {

					// Upgrade
					// ---------------------------------------------------------
					/*//*/  if(target.structureType == STRUCTURE_CONTROLLER) {
						if(creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
							if(DEFINES.move(creep, COLOR_CYAN, true) == ERR_NO_PATH) {
								badTargets.push(target);
								creep.memory.target = undefined;
								creep.memory.path   = undefined;
							}
						} //fi

					// Build
					// ---------------------------------------------------------
					} else  if(target.progressTotal) {
						if(creep.build(target) == ERR_NOT_IN_RANGE) {
							if(DEFINES.move(creep, COLOR_WHITE, true) == ERR_NO_PATH) {
								badTargets.push(target);
								creep.memory.target = undefined;
								creep.memory.path   = undefined;
							}
						} //fi

					// Repair
					// ---------------------------------------------------------
					} else  if(target.hits < target.hitsMax
						&& target.hits < repairLimit
						){
						if(creep.repair(target) == ERR_NOT_IN_RANGE) {
							if(DEFINES.move(creep, COLOR_PURPLE, true) == ERR_NO_PATH) {
								badTargets.push(target);
								creep.memory.target = undefined;
								creep.memory.path   = undefined;
							}
						} //fi

					// Transfer
					// ---------------------------------------------------------
					} else  if(target.energy < target.energyCapacity) {
						if(creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							if(DEFINES.move(creep, DEFINES.COLOR_BLACK, true) == ERR_NO_PATH) {
								badTargets.push(target);
								creep.memory.target = undefined;
								creep.memory.path   = undefined;
							}
						} //fi
					} else {
						creep.memory.target = undefined;
						creep.memory.path   = undefined;
					} //fi
				} //fi

			// If the creep wasn't able to find a target, it wanders.
			// -----------------------------------------------------------------
			} else {
				DEFINES.wander(creep);
				break;
			} //fi
			
			// If the creep found a target, say what it is.
			// -----------------------------------------------------------------
			if(creep.memory.target) {
				if(say) creep.say(say);
				break;
			}
			
			// If we're out of rooms, give up.
			// -----------------------------------------------------------------
			if(!rooms.length) break;
		} //done
	} //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleWorker;
