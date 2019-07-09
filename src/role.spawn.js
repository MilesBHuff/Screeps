// role.spawn.js
// #############################################################################
/** This script provides an AI for spawns.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC = require("lib.misc");
let roleSpawn  = {

    // Main
    // *************************************************************************
    /** This function controls the provided spawn.
     * @param spawn The spawn to control.
    **/
    run: function(spawn) {

        // Variables
        let creepLimitsGlobal = {
            workers:  999,
            fighters: 999,
            claimers: 999,
        };
        let creepsGlobal = {
            workers:  Array(),
            fighters: Array(),
            claimers: Array(),
        };
        let creepsLocal = {
            workers:  Array(),
            fighters: Array(),
            claimers: Array(),
        };
        countCreeps();

        // Unless already spawning or not at full energy.
        // Exception:  If there are no workers left, spawn even if not at full energy.
        if(!spawn.spawning && (spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable || creepsLocal.workers.length <= 0 || (creepsLocal.fighters.length <= 0 && spawn.room.find(FIND_HOSTILE_CREEPS).length > 0))) {
            trySpawnCreep();
        } //fi

        // Count creeps, buildings, etc
        // =====================================================================
        function countCreeps() {

            // Only count creeps that aren't close to death
            // -----------------------------------------------------------------
            let livelyCreeps = findLivelyCreeps(0);

            // Creeps in all rooms
            // -----------------------------------------------------------------
            creepsGlobal.workers  = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_MISC.ROLES.WORKER );
            creepsGlobal.fighters = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_MISC.ROLES.FIGHTER);
            creepsGlobal.claimers = _.filter(livelyCreeps, (creep) => creep.memory.role === LIB_MISC.ROLES.CLAIMER );

            // Creeps in the current room
            // -----------------------------------------------------------------
            creepsLocal.workers   = _.filter(creepsGlobal.workers,  (creep) => creep.room === spawn.room);
            creepsLocal.fighters  = _.filter(creepsGlobal.fighters, (creep) => creep.room === spawn.room);
            creepsLocal.claimers  = _.filter(creepsGlobal.claimers, (creep) => creep.room === spawn.room);

            // The total creep limits across all owned rooms (this is needed to prevent rooms from respawning all their creeps during an expedition to another room)
            // -----------------------------------------------------------------
            for(let roleLimit in creepLimitsGlobal) { // lgtm [js/unused-loop-variable] // LGTM falsely detects this as an unused loop variable instead of a useless assignment:  https://discuss.lgtm.com/t/resolved-javascript-false-positive-for-loop-variable-rolelimit-is-not-used-in-the-loop-body/1758
                roleLimit = 0; // The assignment may be useless, but I hate leaving variables uninitialized.
            } //done
            for(let roomName in Game.rooms) {
                let room = Game.rooms[roomName];
                creepLimitsGlobal.workers  += room.memory.workerLimit;
                creepLimitsGlobal.fighters += room.memory.fighterLimit;
                creepLimitsGlobal.claimers += room.memory.claimerLimit;
            } //done

            // Find lively creeps
            // =================================================================
            function findLivelyCreeps(algorithm) {
                switch(algorithm) {
                    case 1:
                        // Calculates how long it would take to spawn an identical creep, and considers the creep to be near-death if it has less time to live than it would take to create a new copy of it.
                        return _.filter(Game.creeps, (creep) => function() {
                            if(creep.spawning) {
                                return true;
                            } //fi
                            let timeToRegrow;
                            for(timeToRegrow = 0; timeToRegrow < creep.body.length; timeToRegrow++) {
                                timeToRegrow+= CREEP_SPAWN_TIME;
                            } //done
                            if(creep.ticksToLive <= timeToRegrow) {
                                return false;
                            } //fi
                            return true;
                        });
                    //break;

                    //case 0:
                    default:
                        // Considers any creeps with less than a certain amount of time to live, to be near-death.
                        return _.filter(Game.creeps, (creep) => creep.spawning || creep.ticksToLive >= LIB_MISC.NEAR_DEATH);
                    //break;
                } //esac
            } //findLivelyCreeps
        } //countCreeps

        // Create creep
        // =====================================================================
		/** Figure out what kind of creep to spawn, and then spawn that creep.
		 *  The algorithm works like this:  Spawn workers before fighters before
		 *  claimers, and make sure that none has more that one more than
		 *  another (within precalculated limits).
		 * @return an error code.
		**/
        function trySpawnCreep() {
            for(let i = 0;
				    i < spawn.room.memory.workerLimit
				 || i < spawn.room.memory.fighterLimit
				 || i < spawn.room.memory.claimerLimit;
				    i++
			) {
                // Figure out what kind of creep to spawn
                // -------------------------------------------------------------
//				//TODO:  This is a pending refactor;  it can completely replace the rest of the function, below.
//				for(let role in LIB_MISC.ROLES) {
//					if(creeps. local[role].length <= i
//					&& creeps. local[role].length < spawn.room.memory.limits[role]
//					&& creeps.global[role].length <       creepLimits.global[role]
//					) {
//						roleSpawn.spawnCreep(spawn, LIB_MISC.ROLES[role]);
//						if(spawn.spawning) break;
//					} //fi
//				} //done
//				if(!spawn.spawning) return ERR_NOT_FOUND;
                /*//*/ if(  creepsLocal.workers.length <= i
				       &&   creepsLocal.workers.length < spawn.room.memory.workerLimit
					   &&  creepsGlobal.workers.length < creepLimitsGlobal.workers
				) { roleSpawn.spawnCreep(spawn, LIB_MISC.ROLES.WORKER);
                } else if( creepsLocal.fighters.length <= i
					   &&  creepsLocal.fighters.length < spawn.room.memory.fighterLimit
					   && creepsGlobal.fighters.length < creepLimitsGlobal.fighters
				) { roleSpawn.spawnCreep(spawn, LIB_MISC.ROLES.FIGHTER);
                } else if( creepsLocal.claimers.length <= i
					   &&  creepsLocal.claimers.length < spawn.room.memory.claimerLimit
					   && creepsGlobal.claimers.length < creepLimitsGlobal.claimers
				) { roleSpawn.spawnCreep(spawn, LIB_MISC.ROLES.CLAIMER);
                } else
				  { continue;
                } //fi
                if(spawn.spawning) break;
            } //done
            if(!spawn.spawning) return ERR_NOT_FOUND;
        } //trySpawnCreep
    }, //run

    // Spawn creep
    // =========================================================================
    // Depends: LIB_MISC.say()
    /** The idea behind this function, is to create each creep with as many parts as
     *  possible, given the room's current energy total.  It cycles through the
     *  given parts array, and continues until there is no more energy to spend.  It
     *  then sorts the parts in such a way that maximises each creep's
     *  survivability.
     * @param spawn    The spawner to use
     * @param role     The role the new creep should have.
     * @param dryRun   Whether to do a dry run.
    **/
    spawnCreep: function(spawn, role, dryRun) {
		dryRun = dryRun ? true : false;
		let name = "";

        // Determine what kind of creep to build
        // ---------------------------------------------------------------------

        // Define the order of preference for the main part types.
        // `````````````````````````````````````````````````````````````````````
        //NOTE:  MOVE and TOUGH are to be handled separately.
        // We can't just use a spliced BODYPARTS_ALL, since I need the parts to be in a specific order:  namely, how important they are for a given creep to have.
        let partTypes = [ // These are stored on separate lines in order to make rearrangement easier.
            WORK,
            CARRY,
            RANGED_ATTACK,
            HEAL,
            ATTACK,
            CLAIM,
        ];

        // Set up the partRatios object
        // `````````````````````````````````````````````````````````````````````
        let partRatios = {
            movesPerPart:  1.00, // How many MOVEs to add per each normal body part
            useTough:     false, // Whether to use TOUGH when we can't afford a normal body part, or when normal body part ratios don't sum to 1
        };
        for(let p = 0; p < partTypes.length; p++) {
            partRatios[partTypes[p]] = 0.00;
        } //done

        // Fill-in the partRatios object
        // `````````````````````````````````````````````````````````````````````
        switch(role) {
            case LIB_MISC.ROLES.WORKER:
            name = "Worker";
            partRatios.movesPerPart = 0.50; // Ideal for roads
            partRatios[CARRY]       = 0.50;
            partRatios[WORK]        = 0.50;
            break;

            case LIB_MISC.ROLES.FIGHTER:
            name = "Fighter";
            partRatios.useTough       = true;
            partRatios.movesPerPart   = 1.00; // Ideal for plains
            partRatios[HEAL]          = 0.50;
            partRatios[RANGED_ATTACK] = 0.49;
            partRatios[ATTACK]        = 0.01;
            break;

            case LIB_MISC.ROLES.CLAIMER:
            name = "Claimer";
            partRatios.useTough     = true;
            partRatios.movesPerPart = 5.00; // Ideal for swamps
            partRatios[CLAIM]       = 0.01;
            break;

			default:
			return ERR_INVALID_ARGS;
        } //esac
        if(spawn.room.controller && spawn.room.controller.level < LIB_MISC.DEVELOPED_CTRL_LVL) {
            // When the controller level is below this value, movesPerPart is ignored, and all creeps spawn with a 1:1 ratio of MOVEs:ControllerLevels is used as a proxy for infrastructure development, as 1:1 for everyone only makes sense when there are no roads.
            partRatios.movesPerPart = 1.00;
        } //fi

        // Declare calculation variables
        // ---------------------------------------------------------------------
        let energyCost  = 0;
        let energyTotal = spawn.room.energyAvailable;
        let partCounts  = {total: 0,};
        for(let p = 0; p < BODYPARTS_ALL.length; p++) {
            partCounts[BODYPARTS_ALL[p]] = 0;
        } //done

        // Calculate a minimal creep, and make sure we can even afford it.
        // ---------------------------------------------------------------------
        //NOTE:  While this may seem unnecessary, it ensures that every nonzero part is used at least once.
        for(let p = 0; p < partTypes.length; p++) {
            if(partRatios[partTypes[p]] > 0) {
                partCounts.total++;
                partCounts[partTypes[p]]++;
                energyCost+= BODYPART_COST[partTypes[p]];
            } //fi
        } //done

        if(partCounts.total <= 0) return OK; // Avoids a divide-by-zero error
        while(partRatios.movesPerPart > partCounts[MOVE] / (partCounts.total - partCounts[MOVE])) {
            partCounts.total++;
            partCounts[MOVE]++;
            energyCost+= BODYPART_COST[MOVE];
        } //done
        if(energyCost > energyTotal) return ERR_NOT_ENOUGH_ENERGY;

        // Build the creep until there's no energy left in the room
        // ---------------------------------------------------------------------
        while(true) {
//          if(energyCost >= energyTotal || partCounts.total >= MAX_CREEP_SIZE) break; // Shouldn't be necessary.
            let movelessParts = partCounts.total - partCounts[MOVE];

            // If we're short on MOVEs, add a MOVE.
            // `````````````````````````````````````````````````````````````````
            if(partRatios.movesPerPart > partCounts[MOVE] / movelessParts) {
                //NOTE:  Given all the checks related to MOVE's energy costs up above and down below, we don't actually need to check them here.
                partCounts.total++;
                partCounts[MOVE]++;
                energyCost+= BODYPART_COST[MOVE];
                continue;
            } //fi

            // If adding an extra part would take us over our MOVE ratio...
            // `````````````````````````````````````````````````````````````````
            let exitLoop = false;
            let neededMovesCost = 0;
            if(partRatios.movesPerPart > partCounts[MOVE] / (movelessParts + 1)) {
                let neededMoves = 0;
                // Calculate how many MOVEs it would cost to reattain balance
                while(partRatios.movesPerPart > (partCounts[MOVE] + neededMoves) / (movelessParts + 1)) {
                    neededMoves++;
                    // If we can't fit enough MOVEs in before reaching MAX_CREEP_SIZE, then this creep is finished.
                    if(MAX_CREEP_SIZE < partCounts.total + 1 + neededMoves) {
                        exitLoop = true;
                        break;
                    } //fi
                } //done
                // Calculate how much energy needs to be in the room in order to reattain balance
                neededMovesCost = neededMoves * BODYPART_COST[MOVE];
                //NOTE:  The checks for this will come when we add regular parts.
            } else if(MAX_CREEP_SIZE < partCounts.total + 1) {
                exitLoop = true;
            } //fi
            if(exitLoop) break;

            // If any other parts are below their ratios, add them.
            // `````````````````````````````````````````````````````````````````
            exitLoop = false;
            for(let p = 0; p < partTypes.length; p++) {
                if(partRatios[partTypes[p]] > 0 && partRatios[partTypes[p]] >= partCounts[partTypes[p]] / movelessParts
                && energyTotal >= energyCost + BODYPART_COST[partTypes[p]] + neededMovesCost
                ) {
                    partCounts.total++;
                    partCounts[partTypes[p]]++;
                    energyCost+= BODYPART_COST[partTypes[p]];
                    exitLoop = true;
                    break;
                } //fi
            } //done
            if(exitLoop) continue;

            // Add TOUGH parts if they have been enabled in the current creep build.
            // `````````````````````````````````````````````````````````````````
            if(partRatios.useTough
            && energyTotal >= energyCost + BODYPART_COST[TOUGH] + neededMovesCost
            ) {
                partCounts.total++;
                partCounts[TOUGH]++;
                energyCost+= BODYPART_COST[TOUGH];
                continue;
            } //fi

            // If we reach this point, then nothing more can be added to the creep.
            break;
        } //done

        // Assemble the pre-calculated creep, making sure to sort its parts in a way that maximises combat survivability
        // ---------------------------------------------------------------------
        // We can't just use BODYPARTS_ALL, since I need the parts to be in a specific order:  namely, how important they are for a given creep to not lose during combat.
        partTypes = [ // These are stored on separate lines in order to make rearrangement easier.
            TOUGH,
            WORK,
            CARRY,
            MOVE,
            CLAIM,
            RANGED_ATTACK,
            ATTACK,
            HEAL,
        ];
        let bodyParts = [];
        for(let p = 0; p < partTypes.length; p++) {
            while(partCounts[partTypes[p]] > 0) {
                partCounts[partTypes[p]]--;
                bodyParts.push(partTypes[p]);
            } //done
        } //done

        // Figure out spawn direction
        // ---------------------------------------------------------------------
        let directions = [BOTTOM, TOP, RIGHT, LEFT, BOTTOM_RIGHT, BOTTOM_LEFT, TOP_RIGHT, TOP_LEFT];
        //TODO

        // Grab energy from the extensions/spawners nearest a source
        // ---------------------------------------------------------------------
        //let energyStructures = [];
        //TODO

        // Create the creep.
        // ---------------------------------------------------------------------
		if(dryRun) console.log(bodyParts.length, bodyParts);
        for(let i = 0; true; i++) {
            let code = spawn.spawnCreep(
                bodyParts,
                name + i, {
                    memory: {role: role,},
//                  energyStructures: energyStructures,
                    dryRun: dryRun,
                    directions: directions,
            });
            if(code) {
                if(code === ERR_NAME_EXISTS) continue;
                return code;
            } //fi
            break;
        } //done
        LIB_MISC.say(name.charAt(0).toUpperCase() + name.slice(1), spawn);
        return OK;
    }, //spawnCreep
}; //roleSpawn

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleSpawn;
