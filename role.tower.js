"use strict"
const LIB_MISC=require("lib.misc")
let roleTower={run:function(structure){let repairLimit=LIB_MISC.REPAIR_LIMIT
structure.room.controller&&(repairLimit*=structure.room.controller.level)
for(let b=!0;b;b=!1){let targets=Array()
if((targets=structure.room.find(FIND_MY_CREEPS,{filter:creep=>creep.hits<creep.hitsMax})).length){structure.heal(structure.pos.findClosestByRange(targets))
break}if((targets=structure.room.find(FIND_HOSTILE_CREEPS)).length){structure.attack(structure.pos.findClosestByRange(targets))
break}if((targets=structure.room.find(FIND_STRUCTURES,{filter:structureEach=>structureEach.hits<.75*structureEach.hitsMax&&structureEach.hits<.75*repairLimit&&-1===structure.room.memory.dismantle.indexOf(structureEach.id)})).length){structure.repair(structure.pos.findClosestByRange(targets))
break}if((targets=structure.room.find(FIND_HOSTILE_STRUCTURES)).length){structure.attack(structure.pos.findClosestByRange(targets))
break}}}}
module.exports=roleTower
