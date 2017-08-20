const actions = {
	wander: function (creep) {
		// Variables
		var direction = Math.round(Math.random() * 8);
		// Move
		if(direction) {
			creep.move(direction);
		}
	}
};
module.exports = actions;
