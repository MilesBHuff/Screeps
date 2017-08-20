var roleHealer = {
	run: function (creep) {
		
		// Heal any damaged allied units present in the room
		// ---------------------------------------------------------------------
		var target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (eachCreep) => eachCreep.hits < eachCreep.hitsMax});
	    	if(target && target.id) {
			creep.memory.target = target.id;
			if(creep.heal(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
				if(creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: "#f00"}}) == ERR_NO_PATH) {
					creep.memory.target = undefined;
				}
			}
		}

		// If there is no imminent threat, wander around, so as not to interfere with the workers.
		// ---------------------------------------------------------------------
		else {
			require("actions").wander(creep);
		}
	}
};
module.exports = roleHealer;
