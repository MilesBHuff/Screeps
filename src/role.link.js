// role.link.js
// #############################################################################
/** This script governs links. **/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
let roleLink = {

    // Main
    // *****************************************************************************
    /** This function controls the provided link.
     * @param link The link to control
    **/
    run: function(link) {
		// Preliminary verifications
		if(!link || link.structureType !== STRUCTURE_LINK) return ERR_INVALID_TARGET;
		if(link.cooldown > 0) return ERR_TIRED;

		// Find other links
		let targets = link.room.find(FIND_MY_STRUCTURES, {
			filter: (newLink) => {return(
				   newLink.room.memory.dismantle.indexOf(newLink.id) < 0
				&& newLink.structureType === STRUCTURE_LINK
				&&(link.energy && newLink.energy
				&& link.energy >  newLink.energy
				)
			);}
		});
		if(targets.length < 1) return OK;

		// Sort them by energy
		//TODO

		// Equalize with the lowest-energy link
		let transferAmount = link.energy - ((link.energy + targets[0].energy) / 2);
		link.transferEnergy(targets[0], transferAmount);
		return OK;
    }, //run
}; //roleLink

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleLink;
