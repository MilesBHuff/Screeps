// main.js
// #############################################################################

// Set variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Define roles
// =============================================================================
const ROLES = Object.freeze({
	"WORKER":  0,
	"FIGHTER": 1,
	"HEALER":  2,
	"CLAIMER": 3
})

// Spawn amounts
// =============================================================================
const claimerBaseLimit = 1;
const  healerBaseLimit = 2; // Doubled during conflict
const fighterBaseLimit = 4; // Doubled during conflict
const  workerBaseLimit = 4; // Multiplied by the number of sources

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
	var i = 0;
	while(creeps.length > maxCreeps) {
		creeps[i].suicide();
		i++;
	}
}

// Spawn new creeps
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/** The idea behind this function, is to create each creep with the maximum
 *  number of parts possible, per the currently energy maximum.
 * @param spawn    The spawner to use
 * @param rawParts This is an array of body parts;  this function reduplicates
 *                 it infinitely.
 * @param name     The name of the new creep.
 * @param role     The role the new creep should have.
**/
function spawnCreep(spawn, rawParts, name, role) {
	var bodyParts  = Array();
	var totalParts = (spawn.room.energyCapacityAvailable - 100) / 50;
	for(var i = 0, j = 0; i < totalParts; i++) {
		bodyParts.push(rawParts[j]);
		j++;
		if(j >= rawParts.length) {
			j = 0;
		}
	}
	for(var i = 0; spawn.createCreep(bodyParts, name + i, {role: role}) == ERR_NAME_EXISTS; i++) {}
}

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

	// Set limits for creeps in each room
	// =====================================================================
	for(var name in Game.rooms) {
		var room = Game.rooms[name];

		// Set things to their default values.
		// -------------------------------------------------------------
		room.memory.claimerLimit = claimerBaseLimit;
		room.memory.healerLimit  =  healerBaseLimit;
		room.memory.fighterLimit = fighterBaseLimit;
		room.memory.workerLimit  =  workerBaseLimit;

		// Multiply workers by the number of sources.
		// -------------------------------------------------------------
		room.memory.workerLimit *= room.find(FIND_SOURCES).length;

		// If aggressive creeps are present, double the military creeps.
		// -------------------------------------------------------------
		if(false) { //TODO
			room.memory.healerLimit  *= 2;
			room.memory.fighterLimit *= 2;
		}
	}

	// Manage creeps
	// =====================================================================
	for(var name in Game.spawns) {
		var spawn = Game.spawns[name];
		if(spawn.spawning || spawn.energy < spawn.energyCapacity) {
			continue;
		}

		// Count creeps, buildings, etc
		// -------------------------------------------------------------
		// Buildings
		var   towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER && structure.room == spawn.room);
		// Creeps
		var claimers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == ROLES.CLAIMER   && creep.room == spawn.room);
		var  healers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == ROLES.HEALER    && creep.room == spawn.room);
		var fighters = _.filter(Game.creeps,     (creep)     => creep.memory.role       == ROLES.FIGHTER   && creep.room == spawn.room);
		var  workers = _.filter(Game.creeps,     (creep)     => creep.memory.role       == ROLES.WORKER    && creep.room == spawn.room);

		// Determine role
		// -------------------------------------------------------------
		for(var i = 0; i < 2; i++) {
			var creepRole = 0;
			switch(i) {
				case 0:
				if(workers.length < spawn.room.memory.workerLimit / 2) {
					creepRole = ROLES.WORKER;
				} else {
					creepRole = Math.floor(Math.random() * ROLES.length);
				}
				break;

				case 1:
				creepRole = 0;
				break;
			}
			switch(creepRole) {
				case ROLES.WORKER:
				if(workers.length < workerBaseLimit) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Worker", ROLES.WORKER);
					break;
				}
				if(i == 0) break;

				case ROLES.FIGHTER:
				if(fighters.length <fighterBaseLimit) {
					spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", ROLES.FIGHTER);
					break;
				}
				if(i == 0) break;

				case ROLES.HEALER:
				if(healers.length < healerBaseLimit) {
					spawnCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", ROLES.HEALER);
					break;
				}
				if(i == 0) break;

				case ROLES.CLAIMER:
				if(claimers.length < claimerBaseLimit) {
					spawnCreep(spawn, [CLAIM, MOVE, TOUGH], "Claimer", ROLES.CLAIMER);
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
		// -------------------------------------------------------------
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
		// -------------------------------------------------------------
		spawn.room.visual.text(
			newCreep.memory.role.charAt(0).toUpperCase() + newCreep.memory.role.slice(1),
			spawn.pos.x,
			spawn.pos.y,
			{align: 'left', opacity: 0.7}
		);

		// Cleanup
		// =============================================================

		// Kill off unneeded creeps
		// -------------------------------------------------------------
		killOff(claimers, room.memory.claimerLimit);
		killOff( healers, room.memory.healerLimit );
		killOff(fighters, room.memory.fighterLimit);
		killOff( workers, room.memory.workerLimit );
	}

	// Delete the memories of dead entities
	// ---------------------------------------------------------------------
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
	// =====================================================================

	// Structures
	// ---------------------------------------------------------------------
	for(var name in Game.structures) {
		var structure = Game.structures[name];
		/*//*/ if(structure.structureType == ROLES.TOWER) {
			require("role.tower").run(structure);
		}
	}

	// Creeps
	// ---------------------------------------------------------------------
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		/*//*/ if(creep.memory.role == ROLES.WORKER ) {
			require("role.worker" ).run(creep);
		} else if(creep.memory.role == ROLES.FIGHTER) {
			require("role.fighter").run(creep);
		} else if(creep.memory.role == ROLES.HEALER ) {
			require("role.healer" ).run(creep);
		} else if(creep.memory.role == ROLES.CLAIMER) {
			require("role.claimer").run(creep);
		}
	}
}
