// main.js
// #############################################################################

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {
	for(var name in Game.rooms) {
		var room = Game.rooms[name];
		if(!room.controller.my) break;
	
		// Condemned structures
		// =====================================================================
		// If there is no array of condemned structures for this room, create one.
		if(!room.memory || !room.memory.dismantle) {
			room.memory.dismantle = Array();
		} //fi
		// Update the array.  
		for(var i = 0; room.memory.dismantle[i]; i++) {
			if(!Game.getObjectById(room.memory.dismantle[i])) {
				room.memory.dismantle.splice(i, 1);
				i--;
			} //fi
		} //done
		
		// Saved structures
		// =====================================================================
		if(!room.memory || !room.memory.layout) {
			room.memory.layout = Array();
		} //fi
		//TODO:  Create construction sites at coordinates where structures are missing.
		
		// Only run this every once in a while
		if(Math.round(Math.random() * 8)) {
		
			// Set limits for creeps in each room
			// =====================================================================

			// Create the necessary variables
			// ---------------------------------------------------------------------
			room.memory.fighterLimit = 4;
			room.memory.healerLimit  = 0;
			room.memory.workerLimit  = 1;

			// Set up the worker creep limit
			// ---------------------------------------------------------------------
			// Then, modify the number of workers per the level of the controller.
			room.memory.workerLimit += (DEFINES.CONTROLLER_LEVEL_MAX - room.controller.level) / 2;
			// Multiply the number of workers by the number of sources in the room.
			room.memory.workerLimit *= room.find(FIND_SOURCES).length;
			room.memory.workerLimit  = Math.round(room.memory.workerLimit);

			// Set the number of fighter creeps to equal the number of accessible uncontrolled neighbour rooms
			// ---------------------------------------------------------------------
			var exits    = Array();
			var exitsTmp = Game.map.describeExits(room.name);
			for(var i = 0; i < 4; i++) {
				var index = ((2 * i) + 1).toString();
				if(exitsTmp[index] != undefined && !Game.rooms[exitsTmp[index].name]) {
					exits.push(exitsTmp[index]);
				} //fi
			} //done
			room.memory.fighterLimit = exits.length
			exits = undefined;
			
			// If hostiles are present, increment fighterLimit by their number, and set healerLimit to fighterLimit / 4.
			// ---------------------------------------------------------------------
			var hostileCount = room.find(FIND_HOSTILE_CREEPS).length;
			if(hostileCount) {
				room.memory.fighterLimit += hostileCount;
				room.memory.healerLimit   = Math.round(room.memory.fighterLimit / 4);
			} //fi
			hostileCount = undefined;
		} //fi
	} //done

	// Manage creeps
	// =========================================================================
	for(var name in Game.spawns) {
		var spawn  = Game.spawns[name];
		var creeps = _.filter(Game.creeps, (creep) => creep.room == spawn.room);
		if(spawn.spawning || (spawn.energy < spawn.energyCapacity && creeps.length > 0)) {
			continue;
		} //fi

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
		}; //struct
		for(var roomName in Game.rooms) {
			var room = Game.rooms[roomName];
			creepLimitsAll.fighters += room.memory.fighterLimit;
			creepLimitsAll.healers  += room.memory.healerLimit;
			creepLimitsAll.workers  += room.memory.workerLimit;
		} //done

		// Determine role
		// ---------------------------------------------------------------------
		for(var i = 0; i < 2; i++) {
			var creepRole = 0;
			switch(i) {
				case 0:
				/*//*/ if(workers.length  < spawn.room.memory.workerLimit  / 2) {
					creepRole = DEFINES.ROLES.WORKER;
				} else if(healers.length  < spawn.room.memory.healerLimit  / 2) {
					creepRole = DEFINES.ROLES.HEALER;
				} else if(fighters.length < spawn.room.memory.fighterLimit / 2) {
					creepRole = DEFINES.ROLES.FIGHTER;
				} else {
					creepRole = Math.floor(Math.random() * DEFINES.ROLES.length);
				}
				break;

				case 1:
				creepRole = 0;
				break;
			} //esac
			switch(creepRole) {
				case DEFINES.ROLES.WORKER:
				if(workers.length    < spawn.room.memory.workerLimit
				&& workersAll.length < creepLimitsAll.workers
				){
					DEFINES.createCreep(spawn, [CARRY, MOVE, WORK], "Worker", DEFINES.ROLES.WORKER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.FIGHTER:
				if(fighters.length    < spawn.room.memory.fighterLimit
				&& fightersAll.length < creepLimitsAll.fighters
				){
					DEFINES.createCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Fighter", DEFINES.ROLES.FIGHTER);
					break;
				}
				if(i == 0) break;

				case DEFINES.ROLES.HEALER:
				if(healers.length    < spawn.room.memory.healerLimit
				&& healersAll.length < creepLimitsAll.healers
				){
					DEFINES.createCreep(spawn, [HEAL, MOVE, TOUGH], "Healer", DEFINES.ROLES.HEALER);
					break;
				} //fi
				if(i == 0) break;
				break;
			} //esac
			if(spawn.spawning) break;
		} //done
		if(!spawn.spawning) {
			continue;
		} //fi
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
//		DEFINES.killOff(fighters, spawn.room.memory.fighterLimit);
//		DEFINES.killOff( healers, spawn.room.memory.healerLimit );
//		DEFINES.killOff( workers, spawn.room.memory.workerLimit );
	} //done

	// Delete the memories of dead entities
	// -------------------------------------------------------------------------
	// Creeps
	for(var name in Memory.creeps) {
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
		} //fi
	} //done
	// Structures
	for(var name in Memory.structures) {
		if(!Game.structures[name]) {
			delete Memory.structures[name];
		} //fi
	} //done
	// Rooms
	for(var name in Memory.rooms) {
		if(!Game.rooms[name]) {
			delete Memory.rooms[name];
		} //fi
	} //done

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
		} //esac
	} //done

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
		} //fi
	} //done
} //function
