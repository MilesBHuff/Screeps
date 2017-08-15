var roleRanger = {
    run: function (creep) {
		var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		if(hostile) {
			creep.attack(hostile);
		}
	}
};
module.exports = roleRanger;
