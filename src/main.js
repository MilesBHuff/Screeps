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
function killOff(creeps, maxCreeps) {
	var i = 0;
	while(creeps.length > maxCreeps) {
		creeps[i].suicide();
		i++;
	}
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
	var maxBuilders   = Math.ceil(0.1 * totalCPU);
	var maxClaimers   = Math.ceil(0.0 * totalCPU);
	var maxHealers    = Math.ceil(0.0 * totalCPU);
	var maxRangers    = Math.ceil(0.0 * totalCPU);
	var maxUpgraders  = Math.ceil(0.1 * totalCPU);
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
				var creepRole = Math.ceil(Math.random() * totalCreepRoles);
				break;

				case 1:
				var creepRole = 1;
				break;
			}
			switch(creepRole) {
				case 1:
				if(brawlers.length < maxBrawlers) {
					spawn.createCreep([MOVE, ATTACK, TOUGH, ATTACK], undefined, {role: "brawler"});
				}
				if(i == 0 || spawn.spawning) break;

				case 2:
				if(brawlers.length < maxBuilders) {
					spawn.createCreep([MOVE, CARRY, WORK,  CARRY], undefined, {role: "builder"});
				}
				if(i == 0 || spawn.spawning) break;

				case 3:
				if(brawlers.length < maxClaimers) {
					spawn.createCreep([MOVE, CLAIM, TOUGH, CLAIM], undefined, {role: "claimer"});
				}
				if(i == 0 || spawn.spawning) break;

				case 4:
				if(brawlers.length < maxHarvesters) {
					spawn.createCreep([MOVE, WORK, CARRY, CARRY], undefined, {role: "harvester"});
				}
				if(i == 0 || spawn.spawning) break;

				case 5:
				if(brawlers.length < maxHealers) {
					spawn.createCreep([MOVE, HEAL, TOUGH, HEAL], undefined, {role: "healer"});
				}
				if(i == 0 || spawn.spawning) break;

				case 6:
				if(brawlers.length < maxRangers) {
					spawn.createCreep([MOVE, RANGED_ATTACK, TOUGH, RANGED_ATTACK], undefined, {role: "ranger"});
				}
				if(i == 0 || spawn.spawning) break;

				case 7:
				if(brawlers.length < maxUpgraders) {
					spawn.createCreep([MOVE, CARRY,  WORK,  CARRY], undefined, {role: "upgrader"});
				}
				break;
			}
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
			pos.x,
			pos.y,
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
