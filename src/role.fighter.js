// role.fighter.js
// #############################################################################
/** This script provides an AI for fighter creeps.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC  = require("lib.misc");
const LIB_MOVE  = require("lib.move");
let badTargets  = Array();
let hostiles    = Array();
let roleFighter = {
    // Run
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function controls the provided creep.
     * @param creep The creep to control
    **/
    run: function(creep) {

		// If currently next to a hostile, retreat
		// =====================================================================
		hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
		for(let h = 0; h < hostiles.length; h++) {
			if(creep.pos.isNearTo(hostiles[h])) {
			   creep.moveTo(creep.pos.x + (creep.pos.x - hostiles[h].pos.x),
							creep.pos.y + (creep.pos.y - hostiles[h].pos.y));
			} //fi
		} //done

        // Validate the current target (with a small chance of having to find a new target no matter what)
        // ====================================================================
        if(creep.memory && creep.memory.target) {
            if(!Game.getObjectById(creep.memory.target) /*|| LIB_MISC.gamble(1/8)*/) {
                creep.memory.target = undefined;
            } //fi
        } //fi

        // Find and affect a target
        // =====================================================================
        for(let l = 0; l < LIB_MISC.LOOP_LIMIT; l++) {

            // Find a target
            // -----------------------------------------------------------------
			if(!creep.memory) {
				creep.memory = {};
			} //fi
            if(!creep.memory.target) {
                creep.memory.target = findTarget(creep);
				if(creep.memory.target) {
					break;
				} //fi
            } //fi

            // Affect the target
            // -----------------------------------------------------------------
            let code = affectTarget(creep);
            // If an error ocurred during pathfinding, reset the current target.
            if(code
            && code !== OK
            && code !== ERR_TIRED
            && code !== ERR_NOT_FOUND
            ) {
                badTargets.push(creep.memory.target);
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } else return OK;
        } //done
        LIB_MOVE.wander(creep);

        // Find target
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        /** This function finds a target in range of the current creep.
         * @return a valid target.
        **/
        function findTarget(creep) {
            // Variables
            // =====================================================================
            creep.memory.target = undefined;
            creep.memory.path   = undefined;
            creep.memory.say    = undefined;
            let targets = Array();
            let task    = LIB_MISC.TASKS.WAIT; // lgtm [js/useless-assignment-to-local] // It's cleaner to declare it here, and I don't like leaving variables uninitialized.

            switch(true) {
                default:
                // Attack enemy creeps
                // =================================================================
                task = LIB_MISC.TASKS.ATTACK;
                hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if(hostiles.length > 0) {
                    if(targets.length) break;

                    // Attack enemy rangers
                    // -------------------------------------------------------------
                    targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(RANGED_ATTACK) > 0);});
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets.length) break;

                    // Attack enemy brawlers
                    // -------------------------------------------------------------
                    targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(ATTACK) > 0);});
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets.length) break;

                    // Attack enemy healers
                    // -------------------------------------------------------------
                    targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(HEAL) > 0);});
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets.length) break;

                    // Attack enemy claimers
                    // -------------------------------------------------------------
                    targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(CLAIM) > 0);});
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets.length) break;

                    // Attack other enemy units
                    // -------------------------------------------------------------
                    targets = hostiles;
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets.length) break;
                } //fi

                // Heal allied creeps
                // =================================================================
                //task = LIB_MISC.TASKS.REPAIR;
				//TODO

                // Attack enemy structures
                // =================================================================
                task = LIB_MISC.TASKS.HARVEST;
                targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
                targets = LIB_MISC.filterTargets(targets, badTargets);
                if(targets.length) break;

                // Attack condemned structures
                // =================================================================
                if(creep.room.memory && creep.room.memory.dismantle) {
                    targets = Array();
                    for(let a = 0; creep.room.memory.dismantle[a]; a++) {
                        targets.push(Game.getObjectById(creep.room.memory.dismantle[a]));
                    } //done
                    targets = LIB_MISC.filterTargets(targets, badTargets);
                    if(targets && targets.length) break;
                } //fi
            } //esac

            // Pick a target from the array of targets
            // =================================================================
            if(targets.length > 0) {
                let target = creep.pos.findClosestByRange(targets);
                if(target && target.id) {
                    switch(task) {
                        case LIB_MISC.TASKS.ATTACK:
                        creep.memory.say = "Attack";
                        break;
                        case LIB_MISC.TASKS.DEFEND:
                        creep.memory.say = "Defend";
                        break;
                        case LIB_MISC.TASKS.HARVEST:
                        creep.memory.say = "Harvest";
                        break;
                        case LIB_MISC.TASKS.REPAIR:
                        creep.memory.say = "Repair";
                        break;
                    } //esac
                    return target.id;
                } //fi
            } //fi
        } //function

        // Affect target
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        /** This function makes the given creep interact with its target.
         * @param  creep The creep to use.
         * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET
        **/
        function affectTarget(creep) {

            // Variables
            // =====================================================================
            let target = Game.getObjectById(creep.memory.target);
			if(!target) {
				creep.memory.target = undefined;
				creep.memory.path   = undefined;
				return ERR_INVALID_TARGET;
			} //fi
            let getCloser = false;

			// Try to heal the target
			// -----------------------------------------------------------------
			if(creep.getActiveBodyparts(HEAL) > 0) {
				if(creep.hits < creep.hitsMax) {
					creep.heal(creep);
				} else if(target.my && target.hits < target.hitsMax) {
					let code = creep.heal(target);
					if(code !== OK) getCloser = true;
				} //fi
			} //fi

			// Try to melee the target
			// -----------------------------------------------------------------
            if(creep.getActiveBodyparts(ATTACK) > 0) {
                let code = creep.attack(target);
				if(code !== OK) getCloser = true;
            } //fi

			// Try to range the target
			// -----------------------------------------------------------------
            if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                let code = creep.rangedAttack(target);
				if(code !== OK) getCloser = true;
            } //fi

			// If we're not close enough, get closer.
			// -----------------------------------------------------------------
            if(getCloser) {
                let code = LIB_MOVE.move(creep, COLOR_RED, false);
				if(code === ERR_NO_PATH) {
                    creep.memory.target = undefined;
                    creep.memory.path   = undefined;
                    return ERR_NO_PATH;
                } //fi
            } //fi

            // If the creep found a target, say what it is.
            // =================================================================
            if(creep.memory.say) {
                creep.say(creep.memory.say);
                creep.memory.say = undefined;
            } //fi
            return OK;
        } //function
    } //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleFighter;
