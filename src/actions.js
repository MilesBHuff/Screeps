const actions = {
	wander: function (creep) {
		// Don't let the creep wander outside the room
		if(creep.pos.x <  3
		|| creep.pos.x > 46
		|| creep.pos.y <  3
		|| creep.pos.y > 46
		){ creep.moveTo(24, 24);
		} else {
			// Variables
			var direction = Math.round(Math.random() * 8);
			// Move
			if(direction) {
				creep.move(direction);
			}
		}
	}
};
module.exports = actions;
