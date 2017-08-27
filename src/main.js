// main.js
// #############################################################################

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
const creepBaseLimit = 3;

// Kill off unneeded creeps
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/** This function kills off excess creeps.
 * @param creeps    The creeps to use.
 * @param maxCreeps The number to cull to.
**/
function killOff(creeps, maxCreeps) {
	for(var i = 0; creeps.length > maxCreeps; i++) {
		creeps[i].suicide();
	}
}

// Spawn new creeps
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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
function spawnCreep(spawn, rawParts, name, role) {
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
	}
	for(var currentPart = 0, failCount = 0; true; currentPart++) {
		// Stop once we've used up as much energy as possible
		if(failCount >= rawParts.length) {
			break;
		}
		// Start over once we finish the parts array
		if(currentPart >= rawParts.length) {
			currentPart = 0;
		}

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
		}

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
			}
		} else {
			failCount++;
			// If this is the absolute first part and we are unable to construct it, there is no point in building this creep.
			if(currentPart == 0 && energyCost == 0) {
				return;
			} else continue;
		}
	}

	// Sort the parts in order to make the creep more resilient in combat
	// -------------------------------------------------------------------------
	for(var i = 0; i < partCount.tough; i++) {
		bodyParts.push(TOUGH);
	}
	for(var i = 0; i < partCount.work; i++) {
		bodyParts.push(WORK);
	}
	for(var i = 0; i < partCount.claim; i++) {
		bodyParts.push(CLAIM);
	}
	for(var i = 0; i < partCount.attack; i++) {
		bodyParts.push(ATTACK);
	}
	for(var i = 0; i < partCount.rangedAttack; i++) {
		bodyParts.push(RANGED_ATTACK);
	}
	for(var i = 0; i < partCount.heal; i++) {
		bodyParts.push(HEAL);
	}
	for(var i = 0; i < partCount.carry; i++) {
		bodyParts.push(CARRY);
	}
	for(var i = 0; i < partCount.move; i++) {
		bodyParts.push(MOVE);
	}
	
	// If the creep is only partially formed, there's no point in spawning it.
	// -------------------------------------------------------------------------
	if(
	!( partCount.move   > 0
	&&
	(  partCount.attack > 0
	|| partCount.carry  > 0
	|| partCount.claim  > 0
	|| partCount.heal   > 0
	|| partCount.rangedAttack > 0
	|| partCount.work   > 0
	))){
		return;
	}
	
	// If any neighbouring owned room lacks spawners, 50% chance of sending this creep to it.
	// -------------------------------------------------------------------------
	var target = undefined;
	if(Math.round(Math.random())) {
		var exits = Game.map.describeExits(spawn.room.name);
		for(var index in exits) {
			var room = Game.rooms[exits[index]];
			if( room.controller.my
			&& !room.find(FIND_MY_STRUCTURES, {filter: (structure) => {
				return(structure.structureType == STRUCTURE_SPAWN)
				}}).length
			){
				target = room.find(FIND_SOURCES, {filter: (source) => source.energy > 0});
				break;
			}
		}
	}

	// If we have parts, create the creep.
	// -------------------------------------------------------------------------
	if(bodyParts[0]) {
		for(var i = 0; spawn.createCreep(bodyParts, name + i, {role: role, target: target}) == ERR_NAME_EXISTS; i++) {}
	}
	
	// Display which type of creep is being spawned
	// -------------------------------------------------------------------------
	DEFINES.SAY(name[0].toUpperCase() + name.slice(1), spawn);
}

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {
	for(var name in Game.rooms) {
		var room = Game.rooms[name];
	
		// Condemned structures
		// =====================================================================
		// If there is no array of condemned structures for this room, create one.
		if(!room.memory || !room.memory.dismantle) {
			room.memory.dismantle = Array();
		}
		// Update the array.  
		for(var i = 0; room.memory.dismantle[i]; i++) {
			if(!Game.getObjectById(room.memory.dismantle[i])) {
				room.memory.dismantle.splice(i, 1);
				i--;
			}
		}

		// Backup of structure layout
		// =====================================================================
		// Create an array if there is none
		if(!room.memory || !room.memory.layout) {
			room.memory.layout = Array();
		}
		// TODO
		
		// Set limits for creeps in each room
		// =====================================================================

		// Create the necessary variables
		// ---------------------------------------------------------------------
		room.memory.fighterLimit = 0;
		room.memory.healerLimit  = 0;
		room.memory.workerLimit  = 0;

		// Set the number of workers to equal creepBaseLimit multiplied by the number of sources in the room.
		// ---------------------------------------------------------------------
		room.memory.workerLimit = creepBaseLimit * room.find(FIND_SOURCES).length;

		// Set the number of fighters to half the number of workers.
		// ---------------------------------------------------------------------
		room.memory.fighterLimit = Math.floor(room.memory.workerLimit / 2);


		// If aggressive creeps are present, double the fighter creeps, and set the healers to equal fighterLimit / creepBaseLimit
		// ---------------------------------------------------------------------
		if(room.find(FIND_HOSTILE_CREEPS).length) {
			room.memory.fighterLimit *= 2;
			room.memory.healerLimit   = room.memory.fighterLimit / creepBaseLimit;
		}
	}

	// Manage creeps
	// =========================================================================
	for(var name in Game.spawns) {
		var spawn  = Game.spawns[name];
		var creeps = _.filter(Game.creeps, (creep) => creep.room == spawn.room);
		if(spawn.spawning || (spawn.energy < spawn.energyCapacity && creeps.length > 0)) {
			continue;
		}

		// Count creeps, buildings, etc
		// ---------------------------------------------------------------------
		// Structures in the current room
		var   towers    = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER       && structure.room == spawn.room);
		// Creeps in the current room
		var fighters    = _.filter(     creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.FIGHTER);
		var  healers    = _.filter(     creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.HEALER );
		var  workers    = _.filter(     creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.WORKER );
		// Creeps in all rooms
		var fightersAll = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.FIGHTER);
		var  healersAll = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.HEALER );
		var  workersAll = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.WORKER );
		// The total creep limits across all owned rooms (this is needed to prevent rooms from respawning all their creeps during an expedition to another room)
		var creepLimitsAll = {
			fighters: 0,
			healers:  0,
			workers:  0,
		};
		for(var roomName in Game.rooms) {
			var room = Game.rooms[roomName];
			creepLimitsAll.fighters += room.memory.fighterLimit;
			creepLimitsAll.healers  += room.memory.healerLimit;
			creepLimitsAll.workers  += room.memory.workerLimit;
		}

		// Determine role
		// ---------------------------------------------------------------------
		for(var i = 0; i < 2; i++) {
			var creepRole = 0;
			switch(i) {
				case 0:
				/*//*/ if(workers.length < spawn.room.memory.workerLimit / 2) {
					creepRole = DEFINES.ROLES.WORKER;
				} else if(healers.length < spawn.room.memory.healerLimit) {
					creepRole = DEFINES.ROLES.HEALER;
				} else {
					creepRole = Math.floor(Math.random() * DEFINES.ROLES.length);
				}
				break;

				case 1:
				creepRole = 0;
				break;
			}
			switch(creepRole) {
				case DEFINES.ROLES.WORKER:
				if(workers.length    < spawn.room.memory.workerLimit
				&& workersAll.length < creepLimitsAll.workers
				){
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Worker", DEFINES.ROLES.WORKER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.FIGHTER:
				if(fighters.length    < spawn.room.memory.fighterLimit
				&& fightersAll.length < creepLimitsAll.fighters
				){
					spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", DEFINES.ROLES.FIGHTER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.HEALER:
				if(healers.length    < spawn.room.memory.healerLimit
				&& healersAll.length < creepLimitsAll.healers
				){
					spawnCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", DEFINES.ROLES.HEALER);
					break;
				}
				if(i == 0) break;
				break;
			}
			if(spawn.spawning) break;
		}
		if(!spawn.spawning) {
			continue;
		}
		var newCreep = Game.creeps[spawn.spawning.name];

		// Display text
		// ---------------------------------------------------------------------
		spawn.room.visual.text(
			newCreep.memory.role.charAt(0).toUpperCase() + newCreep.memory.role.slice(1),
			spawn.pos.x,
			spawn.pos.y,
			{align: 'left', opacity: 0.7}
		);

		// Cleanup
		// =====================================================================

		// Kill off unneeded creeps
		// ---------------------------------------------------------------------
//		killOff(fighters, spawn.room.memory.fighterLimit);
//		killOff( healers, spawn.room.memory.healerLimit );
//		killOff( workers, spawn.room.memory.workerLimit );
	}

	// Delete the memories of dead entities
	// -------------------------------------------------------------------------
	// Creeps
	for(var name in Memory.creeps) {
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}
	// Structures
	for(var name in Memory.structures) {
		if(!Game.structures[name]) {
			delete Memory.structures[name];
		}
	}
	// Rooms
	for(var name in Memory.rooms) {
		if(!Game.rooms[name]) {
			delete Memory.rooms[name];
		}
	}

	// AIs
	// =========================================================================

	// Structures
	// -------------------------------------------------------------------------
	for(var name in Game.structures) {
		var structure = Game.structures[name];
		switch(structure.structureType) {
			case STRUCTURE_TOWER:
			require("role.tower").run(structure);
			break;
		}
	}

	// Creeps
	// -------------------------------------------------------------------------
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		/*//*/ if(creep.memory.role == DEFINES.ROLES.WORKER ) {
			require("role.worker" ).run(creep);
		} else if(creep.memory.role == DEFINES.ROLES.FIGHTER) {
			require("role.fighter").run(creep);
		} else if(creep.memory.role == DEFINES.ROLES.HEALER ) {
			require("role.healer" ).run(creep);
		} else {
			require("role.manual").run(creep);
		}
	}
}
