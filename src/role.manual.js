var roleManual = {
	run: function (creep) {
		if(creep.memory._move.dest) {
    		creep.moveTo(creep.memory._move.dest.x, creep.memory._move.dest.y);
		}
	}
};
module.exports = roleManual;
