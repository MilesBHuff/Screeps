// main.js
// #############################################################################

// Set variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Set constants
// =============================================================================
const username = "MilesBHuff";
const totalCreepRoles = 7;

// Import roles
// =============================================================================
var roleBrawler   = require("role.brawler"  );
var roleBuilder   = require("role.builder"  );
var roleClaimer   = require("role.claimer"  );
var roleHarvester = require("role.harvester");
var roleHealer    = require("role.healer"   );
var roleRanger    = require("role.ranger"   );
var roleTower     = require("role.tower"    );
var roleUpgrader  = require("role.upgrader" );

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
 * @param unknown  I don't known what this parameter does, yet.
 * @param role     The role the new creep should have.
**/
function spawnCreep(spawn, rawParts, unknown, role) {
	var bodyParts  = Array();
	var totalParts = (spawn.energyCapacity - 100) / 50;
	for(var i = 0, j = 0; i < totalParts; i++) {
		bodyParts.push(rawParts[j]);
		j++;
		if(j >= rawParts.length) {
			j = 0;
		}
	}
	spawn.createCreep(bodyParts, unknown, {role: role});
}

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

	// Important variables
	// =========================================================================

	// Important metrics
	// -------------------------------------------------------------------------
	var totalCPU = 30; //TODO:  Determine automatically
	var usedCPU = Game.creeps.length;

	// Count creeps, buildings, etc
	// -------------------------------------------------------------------------
	// Buildings
	var towers = _.filter(Game.structures);
	// Creeps
	var brawlers   = _.filter(Game.creeps, (creep) => creep.memory.role == "brawlers" );
	var builders   = _.filter(Game.creeps, (creep) => creep.memory.role == "builder"  );
	var claimers   = _.filter(Game.creeps, (creep) => creep.memory.role == "claimer"  );
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == "harvester");
	var healers    = _.filter(Game.creeps, (creep) => creep.memory.role == "healer"   );
	var rangers    = _.filter(Game.creeps, (creep) => creep.memory.role == "ranger"   );
	var upgraders  = _.filter(Game.creeps, (creep) => creep.memory.role == "upgrader" );

	// Spawn ratios
	// -------------------------------------------------------------------------
	var maxBrawlers   = Math.ceil(0.0 * totalCPU);
	var maxBuilders   = Math.ceil(0.2 * totalCPU);
	var maxClaimers   = Math.ceil(0.0 * totalCPU);
	var maxHealers    = Math.ceil(0.0 * totalCPU);
	var maxRangers    = Math.ceil(0.0 * totalCPU);
	var maxUpgraders  = Math.ceil(0.2 * totalCPU);
	var maxHarvesters = totalCPU - (maxBrawlers + maxBuilders + maxClaimers + maxHealers + maxRangers + maxUpgraders);
	if(maxHarvesters < 0) {
		console.log("WARNING:  Invalid role ratios!");
	}

	// Cleanup
	// =========================================================================

	// Kill off unneeded creeps
	// -------------------------------------------------------------------------
	killOff(brawlers,   maxBrawlers  );
	killOff(builders,   maxBuilders  );
	killOff(claimers,   maxClaimers  );
	killOff(harvesters, maxHarvesters);
	killOff(healers,    maxHealers   );
	killOff(rangers,    maxRangers   );
	killOff(upgraders,  maxUpgraders );

	// Delete the memories of dead creeps
	// -------------------------------------------------------------------------
	for(var name in Memory.creeps) {
		if(!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}

	// Spawn new creeps
	// =========================================================================
	for(var name in Game.spawns) {
		var spawn = Game.spawns[name];
		usedCPU = Game.creeps.length;
		if(usedCPU >= totalCPU) {
			break;
		}
		if(spawn.spawning || spawn.energy < spawn.energyCapacity) {
			continue;
		}

		// Determine role
		// -----------------------------------------------------------------
		for(var i = 0; i < 2; i++) {
			switch(i) {
				case 0:
				if(harvesters.length < 3) {
					var creepRole = 0;
				} else {
					var creepRole = Math.floor(Math.random() * totalCreepRoles);
				}
				break;

				case 1:
				var creepRole = 0;
				break;
			}
			switch(creepRole) {
				case 0:
				if(harvesters.length < maxHarvesters) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], undefined, "harvester");
				}
				if(i == 0 || spawn.spawning) break;

				case 1:
				if(upgraders.length < maxUpgraders) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], undefined, "upgrader");
				}
				if(i == 0 || spawn.spawning) break;

				case 2:
				if(builders.length < maxBuilders) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], undefined, "builder");
				}
				if(i == 0 || spawn.spawning) break;

				case 3:
				if(rangers.length < maxRangers) {
					spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], undefined, "ranger");
				}
				if(i == 0 || spawn.spawning) break;

				case 4:
				if(healers.length < maxHealers) {
					spawnCreep(spawn, [CLAIM, MOVE, TOUGH], undefined, "claimer");
				}
				if(i == 0 || spawn.spawning) break;

				case 5:
				if(claimers.length < maxClaimers) {
					spawnCreep(spawn, [HEAL, MOVE, TOUGH], undefined, "healer");
				}
				if(i == 0 || spawn.spawning) break;

				case 6:
				if(brawlers.length < maxBrawlers) {
					spawnCreep(spawn, [ATTACK, MOVE, TOUGH], undefined, "brawler");
				}
				if(i == 0 || spawn.spawning) break;
			}
			if(spawn.spawning) break;
		}
		var newCreep = Game.creeps[spawn.spawning.name];

		// Determine starting position
		// -----------------------------------------------------------------
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
		// -----------------------------------------------------------------
		spawn.room.visual.text(
			"🛠️ " + newCreep.memory.role.charAt(0).toUpperCase() + newCreep.memory.role.slice(1),
			spawn.pos.x,
			spawn.pos.y,
			{align: 'left', opacity: 0.7}
		);
	}

	// AIs
	// =========================================================================

	// Structures
	// -------------------------------------------------------------------------
	for(var name in Game.structures) {
		var structure = Game.structures[name];
		if(structure.owner.username != username) {
			continue
		}
		/*//*/ if(structure.structureType == "tower") {
			roleTower.run(structure);
		}
	}

	// Creeps
	// -------------------------------------------------------------------------
	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		if(creep.owner.username != username) {
			continue
		}
		/*//*/ if(creep.memory.role == "brawler"  ) {
			roleBrawler.run(creep);
		} else if(creep.memory.role == "builder"  ) {
			roleBuilder.run(creep);
		} else if(creep.memory.role == "claimer"  ) {
			roleClaimer.run(creep);
		} else if(creep.memory.role == "harvester") {
			roleHarvester.run(creep);
		} else if(creep.memory.role == "healer"   ) {
			roleHealer.run(creep);
		} else if(creep.memory.role == "ranger"   ) {
			roleRanger.run(creep);
		} else if(creep.memory.role == "upgrader" ) {
			roleUpgrader.run(creep);
		}
	}
}
