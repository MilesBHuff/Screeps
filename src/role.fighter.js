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
			var x = Math.round(Math.random());
			var y = Math.round(Math.random());
			if(Math.floor(Math.random())) {
				x*= -1;
			}
			if(Math.floor(Math.random())) {
				y*= -1;
			}
			creep.moveTo(creep.pos.x + x, creep.pos.y + y);
		}
	}
};
module.exports = roleFighter;
