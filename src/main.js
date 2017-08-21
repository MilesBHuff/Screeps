// main.js
// #############################################################################

// Set variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Spawn amounts
// =============================================================================
const claimerBaseLimit = 0; // Should only be spawned in special cases
const fighterBaseLimit = 3; // Doubled during conflict
const  healerBaseLimit = 1; // Doubled during conflict
const  workerBaseLimit = 3; // Multiplied by the number of sources

// Miscellaneous
// =============================================================================
const USERNAME = "MilesBHuff";

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
			partCost = 80;
			break;

			case CARRY:
			partCost = 50;
			break;

			case CLAIM:
			partCost = 600;
			break;

			case HEAL:
			partCost = 250;
			break;

			case MOVE:
			partCost = 50;
			break;

			case RANGED_ATTACK:
			partCost = 150;
			break;

			case TOUGH:
			partCost = 10;
			break;

			case WORK:
			partCost = 100;
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

	// If we have parts, create the creep.
	// -------------------------------------------------------------------------
	if(bodyParts[0]) {
		for(var i = 0; spawn.createCreep(bodyParts, name + i, {role: role}) == ERR_NAME_EXISTS; i++) {}
	}
}

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

	// Set limits for creeps in each room
	// =========================================================================
	for(var name in Game.rooms) {
		var room = Game.rooms[name];

		// Set things to their default values.
		// ---------------------------------------------------------------------
		room.memory.claimerLimit = claimerBaseLimit;
		room.memory.fighterLimit = fighterBaseLimit;
		room.memory.healerLimit  =  healerBaseLimit;
		room.memory.workerLimit  =  workerBaseLimit;

		// Multiply workers by the number of sources.
		// ---------------------------------------------------------------------
		room.memory.workerLimit *= room.find(FIND_SOURCES).length;

		// If aggressive creeps are present, double the military creeps.
		// ---------------------------------------------------------------------
		if(room.find(FIND_HOSTILE_CREEPS).length) {
			room.memory.fighterLimit *= 2;
			room.memory.healerLimit  *= 2;
		}
	}

	// Manage creeps
	// =========================================================================
	for(var name in Game.spawns) {
		var spawn = Game.spawns[name];
		if(spawn.spawning || spawn.energy < spawn.energyCapacity) {
			continue;
		}

		// Count creeps, buildings, etc
		// ---------------------------------------------------------------------
		// Buildings
		var   towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER && structure.room == spawn.room);
		// Creeps
		var claimers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.CLAIMER   && creep.room == spawn.room);
		var fighters = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.FIGHTER   && creep.room == spawn.room);
		var  healers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.HEALER    && creep.room == spawn.room);
		var  workers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == DEFINES.ROLES.WORKER    && creep.room == spawn.room);

		// Determine role
		// ---------------------------------------------------------------------
		for(var i = 0; i < 2; i++) {
			var creepRole = 0;
			switch(i) {
				case 0:
				if(workers.length < spawn.room.memory.workerLimit / 2) {
					creepRole = DEFINES.ROLES.WORKER;
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
				if(workers.length < spawn.room.memory.workerLimit) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Worker", DEFINES.ROLES.WORKER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.FIGHTER:
				if(fighters.length < spawn.room.memory.fighterLimit) {
					spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", DEFINES.ROLES.FIGHTER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.HEALER:
				if(healers.length < spawn.room.memory.healerLimit) {
					spawnCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", DEFINES.ROLES.HEALER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.CLAIMER:
				if(claimers.length < spawn.room.memory.claimerLimit) {
					spawnCreep(spawn, [CLAIM, MOVE, TOUGH], "Claimer", DEFINES.ROLES.CLAIMER);
					break;
				}
				break;
			}
			if(spawn.spawning) break;
		}
		if(!spawn.spawning) {
			continue;
		}
		var newCreep = Game.creeps[spawn.spawning.name];

		// Determine starting position
		// ---------------------------------------------------------------------
		var pos = {
			x: spawn.pos.x,
			y: spawn.pos.y
		};
		while((pos.x == spawn.pos.x
			&& pos.y == spawn.pos.y))
			//TODO:  Check for walls.
			//TODO:  Check for other creeps.
		{
//			pos.x = spawn.pos.x + Math.round(Math.random());
			pos.x+= 1;
			if(Math.round(Math.random())) {
				pos.x-= 2;
			}
//			pos.y = spawn.pos.y + Math.round(Math.random());
			pos.y+= 1;
			if(Math.round(Math.random())) {
				pos.y-= 2;
			}
		}

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
//		killOff(claimers, spawn.room.memory.claimerLimit);
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
		} else if(creep.memory.role == DEFINES.ROLES.CLAIMER) {
			require("role.claimer").run(creep);
		} else {
			require("role.manual").run(creep);
		}
	}
}
