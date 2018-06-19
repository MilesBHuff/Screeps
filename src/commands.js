// commands.js
// #############################################################################
/** This file lists letious prewritten commands for manual use at the console.
 *  Make sure to include it before trying to use its functions!
**/

// letiables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
let commands = {

	// Check progress
	// =========================================================================
	// require("commands").checkProgress("StructureID");
	/** Check the exact progress of a controller or construction site.  If the
	 *  specified structure does not have a progress letiable, use its repair
	 *  letiable.
	 * @param  structureId
	 * @return An exit-code.
	**/
	checkProgress: function (structureId) {
		let message   = "";
		let structure = Game.getObjectById(structureId);
		/*//*/ if(structure.progress && structure.progressTotal) {
			message = structure.progress + " / " + structure.progressTotal;
		} else if(structure.hits && structure.hitsMax) {
			message = structure.hits + " / " + structure.hitsMax;
		} else return ERR_INVALID_TARGET;
		DEFINES.say(structure, message)
		return message;
	}, //function

	// Create creep
	// =========================================================================
	// require("commands").createCreep("SpawnName", [MOVE], "CreepName", require("defines").ROLES.MANUAL);
	/** This function spawns a creep at the desired spawn, using the same
	 *  creep-generation function as main().
	 * @param  spawnName The name of the spawn to use.
	 * @param  partTypes The types of parts to use.
	 * @param  creepName The name of the creep to use.
	 * @param  role      The role to use, if any.
	 * @return An exit-code.
	**/
	createCreep: function (spawnName, partTypes, creepName, role) {
		return DEFINES.createCreep(Game.spawns[spawnName], partTypes, creepName, role);
	}, //function;

	// Dismantle
	// =========================================================================
	// require("commands").dismantle("StructureID");
	/** Marks the specified structure for demolition.
	 * @param  structureId The ID of the structure to dismantle.
	 * @return An exit-code.
	**/
	dismantle: function (structureId) {
		return Game.getObjectById(structureId).room.memory.dismantle.push(structureId);
	}, //function

	// Move creep to
	// =========================================================================
	// require("commands").moveCreepTo("CreepName", "TargetID");
	/** Order a creep to move to a particular target.
	 * @param  creepName The name of the creep to use.
	 * @param  target    The ID of the target to move towards.
	 * @return An exit-code.
	**/
	moveCreepTo: function (creepName, target) {
		Game.creeps[creepName].memory.target = target;
		return DEFINES.move(Game.creeps[creepName], COLOR_GREY, false);
	}, //function

	// Remove construction
	// =========================================================================
	// require("commands").removeConstruction();
	/** Remove all construction sites
	 * @return An exit-code.
	**/
	removeConstruction: function () {
		for(let name in Game.constructionSites) {
			Game.constructionSites[name].remove();
		}
		return OK;
	}, //function

	// Sign controller
	// =========================================================================
	// require("commands").signController("CreepName", "ControllerID", "Message");
	/** Signs the specified controller with the specified creep.
	 * @param  creepName    The name of the creep to use.
	 * @param  controllerId The ID of the controller to sign.
	 * @param  message      The message to sign the controller with.
	**/
	signController: function (creepName, controllerId, message) {
		return Game.creeps[creepName].signController(Game.getObjectById(controllerId), message);
	}, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = commands;
