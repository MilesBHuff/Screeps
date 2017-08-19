var roleFighter = {
    run: function (creep) {
		
		// Attack any enemy units present in the room
		// ---------------------------------------------------------------------
		var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if(target) {
			creep.attack(target);

		// If there is no imminent threat, wander around, so as not to interfere with the workers.
		// ---------------------------------------------------------------------
		} else {
			require("actions").wander(creep);
		}
	}
};
module.exports = roleFighter;
