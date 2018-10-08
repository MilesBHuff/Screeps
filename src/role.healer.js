// role.healer.js
// #############################################################################
/** This script provides an AI for healer creeps.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC  = require("lib.misc");
const LIB_MOVE  = require("lib.move");
let badTargets  = Array();
let rooms       = Array();
let roleHealer  = {

    // Find target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function finds a target in range of the current creep.
     * @return a valid target.
    **/
    findTarget: function (creep) {
        for(let l = 0; l < LIB_MISC.LOOP_LIMIT; l++) {

            // Cleanup
            // =================================================================
            creep.memory.target = undefined;
            creep.memory.path   = undefined;
            creep.memory.say    = undefined;

            // If we've already tried all the nearby rooms, return.
            // =================================================================
            if(!rooms.length) {
                    return;
            } //fi

            // Variables
            // =================================================================
            let targets = Array();
            let task    = LIB_MISC.TASKS.WAIT;
            switch(true) {
                default:
                targets = creep.room.find(FIND_MY_CREEPS, {filter: (creepEach) =>
                    creepEach.hits < creepEach.hitsMax
                });
                targets = LIB_MISC.filterTargets(targets, badTargets);
                if(targets.length) break;
            } //esac

            // Pick a target from the array of targets
            // =================================================================
            if(targets.length) {
                let target = creep.pos.findClosestByRange(targets);
                if(target && target.id) {
                    switch(task) {
                        case LIB_MISC.TASKS.HEAL:
                        creep.memory.say = "Heal";
                        break;
                    } //esac
                    return target.id;
                } //fi
            } //fi

            // If we reach this line, the current room had no valid targets.  Try another one.
            // =================================================================
            //TODO:  This line is only here until LIB_MOVE.move supports other rooms.
            rooms = Array();
//            // If the array of rooms has not yet been sorted, sort it.
//            if(rooms[0] !== creep.room) {
//                rooms = LIB_MISC.sortRooms(creep.pos, rooms);
//            }
//            // Remove the current room from the array.
//            rooms.shift();
        } //done
    }, //function

    // Affect target
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    /** This function makes the given creep interact with its target.
     * @param  creep The creep to use.
     * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET
    **/
    affectTarget: function (creep) {

        // Move towards the target
        // =================================================================
        if(creep.memory && creep.memory.target) {
            let target = Game.getObjectById(creep.memory.target);
            if(!target) return ERR_INVALID_TARGET;
            if(creep.heal(target) === ERR_NOT_IN_RANGE) {
                creep.rangedHeal(target);
                if(LIB_MOVE.move(creep, COLOR_GREEN, false) === ERR_NO_PATH) {
                    creep.memory.target = undefined;
                    creep.memory.path   = undefined;
                    return ERR_NO_PATH;
                } //fi
            } //fi
        // If the creep wasn't able to find a target, it wanders.
        // =====================================================================
        } else {
            LIB_MOVE.wander(creep);
            return OK;
        } //fi

        // If the creep found a target, say what it is.
        // =====================================================================
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

        // Find and affect a target
        // =====================================================================
        for(let l = 0; l < LIB_MISC.LOOP_LIMIT; l++) {

            // Find a target
            // -----------------------------------------------------------------
            if(!creep.memory || !creep.memory.target) {
                //If the array of rooms has not already been populated, populate it.
                if(!rooms.length) {
                    rooms = LIB_MISC.findRooms(creep.room.name);
                } //fi
                // Find a target
                creep.memory.target = roleHealer.findTarget(creep, rooms, badTargets);
            } //fi

            // Affect the target
            // -----------------------------------------------------------------
            if(!roleHealer.affectTarget(creep)) {
                return OK;
            } else {
                // If we were unable to find a path to the target, try to find a new one.
                badTargets.push(creep.memory.target);
                creep.memory.target = undefined;
                creep.memory.path   = undefined;
            } //fi

            // If we're out of rooms, give up.
            // -----------------------------------------------------------------
            if(!rooms.length) break;
        } //done
        LIB_MOVE.wander(creep);
    } //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleHealer;
