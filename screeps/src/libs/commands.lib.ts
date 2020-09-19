// lib.commands.js
// #############################################################################
/** This file lists letious prewritten commands for manual use at the console.
 *  Make sure to include it before trying to use its functions!
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC = require("lib.misc");
const LIB_MOVE = require("lib.move");
const ROLE_SPAWN = require("role.spawn");
const LIB_COMMANDS = {

    // Check progress
    // =========================================================================
    // require("lib.commands").checkProgress("StructureID");
    /** Check the exact progress of a controller or construction site.  If the
     *  specified structure does not have a progress letiable, use its repair
     *  letiable.
     * @param  structureId
     * @return an exit-code.
    **/
    checkProgress: function(structureId) {
        let message   = "";
        let structure = Game.getObjectById(structureId);
        /*//*/ if(structure.progress && structure.progressTotal) {
            message = structure.progress + " / " + structure.progressTotal;
        } else if(structure.hits && structure.hitsMax) {
            message = structure.hits + " / " + structure.hitsMax;
        } else return ERR_INVALID_TARGET;
        LIB_MISC.say(structure, message);
        return message;
    }, //function

    // Create creep
    // =========================================================================
    // require("lib.commands").createCreep("SpawnName", "MANUAL");
    /** This function spawns a creep at the desired spawn, using the same
     *  creep-generation function as main().
     * @param  spawnName The name of the spawn to use
     * @param  roleName  The role to use, if any
     * @param  dryRun    Whether to do a dry run.
     * @return an exit-code.
    **/
    createCreep: function(spawnName, roleName, dryRun) {
        return ROLE_SPAWN.spawnCreep(Game.spawns[spawnName], LIB_MISC.ROLES[roleName], dryRun ? true : false);
    }, //function;

    // Dismantle
    // =========================================================================
    // require("lib.commands").dismantle("StructureID");
    /** Marks the specified structure for demolition.
     * @param  structureId The ID of the structure to dismantle.
     * @return An exit-code.
    **/
    dismantle: function(structureId) {
        return Game.getObjectById(structureId).room.memory.dismantle.push(structureId);
    }, //function

    // Move creep to
    // =========================================================================
    // require("lib.commands").moveCreepTo("CreepName", "TargetID");
    /** Order a creep to move to a particular target.
     * @param  creepName The name of the creep to use
     * @param  target    The ID of the target to move towards
     * @return an exit-code.
    **/
    moveCreepTo: function(creepName, target) {
        Game.creeps[creepName].memory.target = target;
        return LIB_MOVE.move(Game.creeps[creepName], COLOR_GREY, false);
    }, //function

    // Remove construction
    // =========================================================================
    // require("lib.commands").removeConstruction();
    /** Remove all construction sites
     * @return an exit-code.
    **/
    removeConstruction: function() {
        for(let name in Game.constructionSites) {
            Game.constructionSites[name].remove();
        }
        return OK;
    }, //function

    // Sign controller
    // =========================================================================
    // require("lib.commands").signController("CreepName", "ControllerID", "Message");
    /** Signs the specified controller with the specified creep.
     * @param  creepName    The name of the creep to use
     * @param  controllerId The ID of the controller to sign
     * @param  message      The message to sign the controller with
    **/
    signController: function(creepName, controllerId, message) {
        return Game.creeps[creepName].signController(Game.getObjectById(controllerId), message);
    }, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = LIB_COMMANDS;
