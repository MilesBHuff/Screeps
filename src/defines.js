// defines.js
// #############################################################################

const defines = {
	
	// This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level.
	REPAIR_LIMIT: 24000,

	// These are all the roles available for creeps
	ROLES: Object.freeze({
		"WORKER":  0,
		"FIGHTER": 1,
		"HEALER":  2,
		"CLAIMER": 3
	}),
};
module.exports = defines;
