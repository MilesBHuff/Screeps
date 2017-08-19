var roleFighter = {
    run: function (creep) {
		var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if(hostile) {
			creep.attack(hostile);
		} else {
			var x = Math.round(Math.random());
			var y = Math.round(Math.random());
			if(Math.floor(Math.random())) {
				x*= -1;
			}
			if(Math.floor(Math.random())) {
				y*= -1;
			}
			x+= creep.pos.x;
			y+= creep.pos.y;
			creep.moveTo(x, y);
		}
	}
};
module.exports = roleFighter;
