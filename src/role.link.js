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
		let sigDiff = LINK_CAPACITY / 100;

		// Find other links
		let targets = link.room.find(FIND_MY_STRUCTURES, {
			filter: (newLink) => {return(
			    newLink.room.memory.dismantle.indexOf(newLink.id) < 0
			 && newLink.structureType === STRUCTURE_LINK
			 && link.energy > newLink.energy + sigDiff
			);}
		});
		if(targets.length < 1) return OK;

		// Equalize with the lowest-energy link
		//targets = _.orderBy(targets, "energy", "asc");  //TODO:  Uncomment when the game's version of Lodash has ben updated.
		let transferAmount = Math.ceil(link.energy - ((link.energy + targets[0].energy) / 2));
		link.transferEnergy(targets[0], transferAmount);
		return OK;
    }, //run
}; //roleLink

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleLink;
