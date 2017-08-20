const actions = {
	wander: function (creep) {
		var x = Math.round(Math.random());
		var y = Math.round(Math.random());
		if(Math.round(Math.random())) {
			x *= -1;
		}
		if(Math.round(Math.random())) {
			y *= -1;
		}
		if(!creep.moveTo(creep.pos.x + x, creep.pos.y + y) {
			creep.moveTo(creep.pos.x - x, creep.pos.y - y);
		}
	}
};
module.exports = actions;
