// Import roles
var roleBrawler   = require("role.brawler");
var roleBuilder   = require("role.builder"  );
var roleClaimer   = require("role.claimer");
var roleHarvester = require("role.harvester");
var roleHealer    = require("role.healer");
var roleRanger    = require("role.ranger"  );
var roleTower     = require("role.tower" );
var roleUpgrader  = require("role.upgrader" );

// Set constants
const username = "MilesBHuff";

// Kill off unneeded creeps
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
function killOff(creeps, maxCreeps) {
	while(creeps.length > maxCreeps) {
	    creeps[0].suicide();
	    Game.creeps.
	    break;
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
	var maxHarvesters = totalCPU - (maxBrawlers + maxBuilders + maxClaimers + maxHealers + maxRangers + maxUpgraders)
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
	killOff(upgraders , maxUpgraders );

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
		/*//*/ if(harvesters.length < maxHarvesters) {
			spawn.createCreep([MOVE, WORK,          CARRY, WORK,          CARRY], undefined, {role: "harvester"});
		} else if(claimers.length < maxClaimers) {
			spawn.createCreep([MOVE, CLAIM,         TOUGH, CLAIM,         TOUGH], undefined, {role: "claimer"  });
		} else if(rangers.length < maxRangers) {
			spawn.createCreep([MOVE, RANGED_ATTACK, TOUGH, RANGED_ATTACK, TOUGH], undefined, {role: "ranger"   });
		} else if(brawlers.length < maxBrawlers) {
			spawn.createCreep([MOVE, ATTACK,        TOUGH, ATTACK,        TOUGH], undefined, {role: "brawler" });
		} else if(healers.length < maxHealers) {
			spawn.createCreep([MOVE, RANGED_ATTACK, TOUGH, RANGED_ATTACK, TOUGH], undefined, {role: "healer"   });
		} else if(upgraders.length < maxUpgraders) {
			spawn.createCreep([MOVE, CARRY,         WORK,  CARRY,         WORK ], undefined, {role: "builder"  });
		} else if(builders.length < maxBuilders) {
			spawn.createCreep([MOVE, CARRY,         WORK,  CARRY,         WORK ], undefined, {role: "upgrader" });
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
