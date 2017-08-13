// main.js
// #############################################################################

// Set variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Constants
// =============================================================================
const username = "MilesBHuff";
const totalCreepRoles = 7;

// Metrics
// =============================================================================
var   brawlerCount = 0;
var   builderCount = 0;
var   claimerCount = 0;
var    healerCount = 0;
var harvesterCount = 0;
var    rangerCount = 0;
var  upgraderCount = 0;

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
 * @param name     The name of the new creep.
 * @param role     The role the new creep should have.
**/
function spawnCreep(spawn, rawParts, name, role) {
	var bodyParts  = Array();
	var totalParts = (spawn.energyCapacity - 100) / 50;
	for(var i = 0, j = 0; i < totalParts; i++) {
		bodyParts.push(rawParts[j]);
		j++;
		if(j >= rawParts.length) {
			j = 0;
		}
	}
	spawn.createCreep(bodyParts, name, {role: role});
}

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

	// Important variables
	// =========================================================================

	// Metrics
	// -------------------------------------------------------------------------
	var cpuLimit = Game.cpu.limit;
	var cpuUsed  = Game.cpu.getUsed;
	if(!cpuLimit) {
		cpuLimit = 30;
	}
	if(cpuUsed == 0) {
		cpuUsed = creeps.length;
	}

	// Count creeps, buildings, etc
	// -------------------------------------------------------------------------
	// Buildings
	var     towers = _.filter(Game.structures);
	// Creeps
	var   brawlers = _.filter(Game.creeps, (creep) => creep.memory.role == "brawlers" );
	var   builders = _.filter(Game.creeps, (creep) => creep.memory.role == "builder"  );
	var   claimers = _.filter(Game.creeps, (creep) => creep.memory.role == "claimer"  );
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == "harvester");
	var    healers = _.filter(Game.creeps, (creep) => creep.memory.role == "healer"   );
	var    rangers = _.filter(Game.creeps, (creep) => creep.memory.role == "ranger"   );
	var  upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == "upgrader" );

	// Spawn ratios
	// -------------------------------------------------------------------------
	var   brawlerLimit = Math.ceil(0.0 * cpuLimit);
	var   builderLimit = Math.ceil(0.2 * cpuLimit);
	var   claimerLimit = Math.ceil(0.0 * cpuLimit);
	var    healerLimit = Math.ceil(0.0 * cpuLimit);
	var    rangerLimit = Math.ceil(0.0 * cpuLimit);
	var  upgraderLimit = Math.ceil(0.2 * cpuLimit);
	var harvesterLimit = cpuLimit - (brawlerLimit + builderLimit + claimerLimit + healerLimit + rangerLimit + upgraderLimit);
	if(harvesterLimit < 0) {
		console.log("WARNING:  Invalid role ratios!");
	}

	// Cleanup
	// =========================================================================

	// Kill off unneeded creeps
	// -------------------------------------------------------------------------
	killOff(  brawlers,   brawlerLimit);
	killOff(  builders,   builderLimit);
	killOff(  claimers,   claimerLimit);
	killOff(harvesters, harvesterLimit);
	killOff(   healers,    healerLimit);
	killOff(   rangers,    rangerLimit);
	killOff( upgraders,  upgraderLimit);

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
		cpuUsed = Game.creeps.length;
		if(cpuUsed >= cpuLimit) {
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
				console.log("i = " + i + " | #" + harvesters.length + "/" + harvesterLimit);
				if(harvesters.length < harvesterLimit) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Harvester" + harvesterCount, "harvester");
					harvesterCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 1:
				if(upgraders.length < upgraderLimit) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Upgrader" + upgraderCount, "upgrader");
					upgraderCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 2:
				if(builders.length < builderLimit) {
					spawnCreep(spawn, [CARRY, MOVE, WORK], "Builder" + builderCount, "builder");
					builderCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 3:
				if(rangers.length < rangerLimit) {
					spawnCreep(spawn, [RANGED_ATTACK, MOVE, TOUGH], "Ranger" + rangerCount, "ranger");
					rangerCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 4:
				if(claimers.length < claimerLimit) {
					spawnCreep(spawn, [CLAIM, MOVE, TOUGH], "Claimer" + claimerCount, "claimer");
					claimerCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 5:
				if(healers.length < healerLimit) {
					spawnCreep(spawn, [HEAL, MOVE, TOUGH], "Healer" + healerCount, "healer");
					healerCount++;
				}
				if(i == 0 || spawn.spawning) break;

				case 6:
				if(brawlers.length < brawlerLimit) {
					spawnCreep(spawn, [ATTACK, MOVE, TOUGH], "Brawler" + brawlerCount, "brawler");
					brawlerCount++;
				}
				if(i == 0 || spawn.spawning) break;
			}
			if(spawn.spawning) break;
		}
		if(!spawn.spawning) {
			continue;
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
