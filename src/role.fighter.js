// role.fighter.js
// #############################################################################
/** This script provides an AI for fighter creeps.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_COMMON   = require("lib.common");
let badTargets  = Array();
let hostiles    = Array();
let roleFighter = {

    // Find target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function finds a target in range of the current creep.
     * @return a valid target.
    **/
    findTarget: function (creep) {
        // Variables
        // =====================================================================
        creep.memory.target = undefined;
        creep.memory.path   = undefined;
        creep.memory.say    = undefined;
        let targets  = Array();
        let task     = LIB_COMMON.TASKS.WAIT;

        switch(true) {
            default:
			// Attack enemy creeps
	        // =================================================================
            task = LIB_COMMON.TASKS.ATTACK;
            hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0) {
                if(targets.length) break;
                // Attack enemy rangers
				// -------------------------------------------------------------
                targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(RANGED_ATTACK) > 0);});
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                if(targets.length) break;
                // Attack enemy brawlers
				// -------------------------------------------------------------
                targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(ATTACK) > 0);});
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                if(targets.length) break;
                // Attack enemy healers
				// -------------------------------------------------------------
                targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(HEAL) > 0);});
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                // Attack enemy claimers
				// -------------------------------------------------------------
                targets = _.filter(hostiles, (hostile) => {return(hostile.getActiveBodyparts(CLAIM) > 0);});
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                if(targets.length) break;
                // Attack other enemy units
				// -------------------------------------------------------------
                targets = hostiles;
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                if(targets.length) break;
            } //fi
			// Attack enemy structures
	        // =================================================================
            task = LIB_COMMON.TASKS.HARVEST;
            targets = creep.room.find(FIND_HOSTILE_STRUCTURES);
            targets = LIB_COMMON.filterTargets(targets, badTargets);
            if(targets.length) break;
            // Attack condemned structures
	        // =================================================================
            if(creep.room.memory && creep.room.memory.dismantle) {
                targets = Array();
                for(let a = 0; creep.room.memory.dismantle[a]; a++) {
                    targets.push(Game.getObjectById(creep.room.memory.dismantle[a]));
                } //done
                targets = LIB_COMMON.filterTargets(targets, badTargets);
                if(targets && targets.length) break;
            } //fi
        } //esac

        // Pick a target from the array of targets
        // =================================================================
        if(targets.length > 0) {
            let target = creep.pos.findClosestByRange(targets);
            if(target && target.id) {
                switch(task) {
                    case LIB_COMMON.TASKS.ATTACK:
                    creep.memory.say = "Attack";
                    break;
                    case LIB_COMMON.TASKS.DEFEND:
                    creep.memory.say = "Defend";
                    break;
                    case LIB_COMMON.TASKS.HARVEST:
                    creep.memory.say = "Harvest";
                    break;
                } //esac
                return target.id;
            } //fi
        } //fi
    }, //function

    // Affect target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function makes the given creep interact with its target.
     * @param  creep The creep to use.
     * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET
    **/
    affectTarget: function (creep) {

        // Move towards the target
        // =====================================================================
        if(creep.memory && creep.memory.target) {
            let target = Game.getObjectById(creep.memory.target);
            if(!target) {
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
                return ERR_INVALID_TARGET;
            } //fi
			let code1;
			if(creep.getActiveBodyparts(ATTACK) > 0) {
				code1 = creep.attack(target);
			} //fi
			let code2;
			if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
				code2 = creep.rangedAttack(target);
			} //fi
            if(code1 || code2) {
                if(LIB_COMMON.move(creep, COLOR_RED, false) === ERR_NO_PATH) {
                    creep.memory.target = undefined;
                    creep.memory.path   = undefined;
                    return ERR_NO_PATH;
                } //fi
				return ERR_NOT_IN_RANGE;
			} //fi

        // If the creep wasn't able to find a target, it wanders.
        // =================================================================
        } else {
            LIB_COMMON.wander(creep);
            return OK;
        } //fi

        // If the creep found a target, say what it is.
        // =================================================================
        if(creep.memory.say) {
            creep.say(creep.memory.say);
            creep.memory.say = undefined;
        } //fi
        return OK;
    }, //function

    // Run
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function controls the provided creep.
     * @param creep The creep to control.
    **/
    run: function (creep) {

        // Validate the current target (with a small chance of having to find a new target no matter what)
        // ====================================================================
        let target;
        hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if(creep.memory && creep.memory.target) {
			target = Game.getObjectById(creep.memory.target);
			if(!target /*|| LIB_COMMON.gamble(1/8)*/) {
				creep.memory.target = undefined;
			} //fi
		} //fi

        // If currently next to a hostile, retreat
        // ====================================================================
        for(let h = 0; h < hostiles.length; h++) {
            if(creep.pos.isNearTo(hostiles[h])) {
                creep.moveTo(creep.pos.x + (creep.pos.x - hostiles[h].pos.x),
                         creep.pos.y + (creep.pos.y - hostiles[h].pos.y));
            } //fi
        } //done

        // Find and affect a target
        // =====================================================================
        for(let l = 0; l < LIB_COMMON.LOOP_LIMIT; l++) {
            // Find a target
            // -----------------------------------------------------------------
            if(!target) {
                creep.memory.target = roleFighter.findTarget(creep);
            } //fi

            // Affect the target
            // -----------------------------------------------------------------
			let code = roleFighter.affectTarget(creep);
            if(!code || code === OK) {
                return OK;
            } else {
                // If we were unable to find a path to the target, try to find a new one.
                badTargets.push(creep.memory.target);
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } //fi
        } //done
        LIB_COMMON.wander(creep);
    } //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleFighter;
