var roleFighter = {
    run: function (creep) {
		var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if(hostile) {
			creep.attack(hostile);
		} else {
			var x = Math.ceil(Math.random() * 6);
			var y = Math.ceil(Math.random() * 6);
			if(Math.floor(Math.random()) {
				if(Math.floor(Math.random()) {
					   x*= -1;
				} else y*= -1;
			}
			creep.moveTo(x, y);
		}
	}
};
module.exports = roleFighter;
