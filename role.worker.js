const LIB_MISC=require("lib.misc"),LIB_MOVE=require("lib.move")
let repairLimit,badTargets=Array(),canWander=!0,rooms=Array(),roleWorker={run:function(creep){function findTarget(creep){if(creep.memory.target=undefined,creep.memory.path=undefined,creep.memory.say=undefined,!rooms||!rooms.length)return ERR_NOT_FOUND
let targets=Array(),task=LIB_MISC.TASKS.WAIT
switch(!0){default:if(task=LIB_MISC.TASKS.HARVEST,creep.memory.harvesting){if(targets=rooms[0].find(FIND_DROPPED_RESOURCES),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(targets=rooms[0].find(FIND_TOMBSTONES),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(targets=rooms[0].find(FIND_SOURCES,{filter:source=>source.energy>0}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(rooms[0].memory&&rooms[0].memory.dismantle&&LIB_MISC.gamble(1/2)){for(let a=0;rooms[0].memory.dismantle[a];a++)targets.push(Game.getObjectById(rooms[0].memory.dismantle[a]))
if((targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break}if(targets=rooms[0].find(FIND_STRUCTURES,{filter:structure=>(structure.structureType===STRUCTURE_CONTAINER||structure.structureType===STRUCTURE_STORAGE)&&_.sum(structure.store)>0}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(!(creep.carry.energy>0)){task=LIB_MISC.TASKS.WAIT
break}creep.memory.harvesting=!1}if(task=LIB_MISC.TASKS.UPGRADE,rooms[0].controller&&rooms[0].controller.ticksToDowngrade<LIB_MISC.CONTROLLER_NEAR_DEGRADE&&(targets=[rooms[0].controller],(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.TRANSFER,targets=rooms[0].find(FIND_MY_STRUCTURES,{filter:structure=>structure.structureType===STRUCTURE_EXTENSION&&structure.energy<structure.energyCapacity&&-1===structure.room.memory.dismantle.indexOf(structure.id)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(targets=rooms[0].find(FIND_MY_STRUCTURES,{filter:structure=>structure.structureType===STRUCTURE_SPAWN&&structure.energy<structure.energyCapacity&&-1===structure.room.memory.dismantle.indexOf(structure.id)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(task=LIB_MISC.TASKS.TRANSFER,LIB_MISC.gamble(3/4)&&(targets=rooms[0].find(FIND_MY_STRUCTURES,{filter:structure=>structure.structureType===STRUCTURE_TOWER&&structure.energy<.75*structure.energyCapacity&&-1===structure.room.memory.dismantle.indexOf(structure.id)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.REPAIR,LIB_MISC.gamble(3/4)&&(targets=rooms[0].find(FIND_STRUCTURES,{filter:structure=>structure.hits<.75*structure.hitsMax&&structure.hits<.75*repairLimit&&-1===structure.room.memory.dismantle.indexOf(structure.id)&&!(structure.structureType===STRUCTURE_WALL&&structure.hits>.125*repairLimit||structure.structureType===STRUCTURE_RAMPART&&structure.hits>.125*repairLimit)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.BUILD,LIB_MISC.gamble(1/2)&&(targets=rooms[0].find(FIND_MY_CONSTRUCTION_SITES,{filter:site=>site.structureType===STRUCTURE_SPAWN||site.structureType===STRUCTURE_ROAD}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.BUILD,LIB_MISC.gamble(1/4)&&(targets=rooms[0].find(FIND_MY_CONSTRUCTION_SITES,{filter:site=>site.structureType===STRUCTURE_WALL||site.structureType===STRUCTURE_RAMPART}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.TRANSFER,LIB_MISC.gamble(1/2)&&(targets=rooms[0].find(FIND_MY_STRUCTURES,{filter:structure=>structure.structureType===STRUCTURE_LAB||structure.structureType===STRUCTURE_NUKER||structure.structureType===STRUCTURE_POWER_SPAWN}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.REPAIR,LIB_MISC.gamble(1/2)&&(targets=rooms[0].find(FIND_STRUCTURES,{filter:structure=>structure.hits<.75*structure.hitsMax&&structure.hits<.75*repairLimit&&-1===structure.room.memory.dismantle.indexOf(structure.id)&&(structure.structureType===STRUCTURE_WALL||structure.structureType===STRUCTURE_RAMPART)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(LIB_MISC.gamble(3/4)&&(task=LIB_MISC.TASKS.BUILD,targets=rooms[0].find(FIND_MY_CONSTRUCTION_SITES),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.UPGRADE,rooms[0].controller&&rooms[0].controller.level&&(rooms[0].controller.level<8||rooms[0].controller.ticksToDowngrade<3/4*CONTROLLER_DOWNGRADE[rooms[0].controller.level])&&(targets=[rooms[0].controller],(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length))break
if(task=LIB_MISC.TASKS.TRANSFER,targets=rooms[0].find(FIND_MY_STRUCTURES,{filter:structure=>(structure.structureType===STRUCTURE_LINK||structure.structureType===STRUCTURE_TERMINAL)&&(structure.energy&&structure.energyCapacity&&structure.energy<structure.energyCapacity||structure.store&&structure.storeCapacity&&_.sum(structure.store)<structure.storeCapacity)&&-1===structure.room.memory.dismantle.indexOf(structure.id)}),(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
if(task=LIB_MISC.TASKS.UPGRADE,targets=[rooms[0].controller],(targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break
task=LIB_MISC.TASKS.WAIT}if(targets.length){let target=creep.pos.findClosestByRange(targets)
if(target&&target.id){switch(task){case LIB_MISC.TASKS.HARVEST:creep.memory.say="Harvest"
break
case LIB_MISC.TASKS.TRANSFER:creep.memory.say="Transfer"
break
case LIB_MISC.TASKS.UPGRADE:creep.memory.say="Upgrade"
break
case LIB_MISC.TASKS.BUILD:creep.memory.say="Build"
break
case LIB_MISC.TASKS.REPAIR:creep.memory.say="Repair"}return creep.memory.target=target.id,OK}}return rooms[0]!==creep.room&&(rooms=LIB_MISC.sortRooms(creep.pos,rooms)),rooms.shift(),ERR_NOT_FOUND}function affectTarget(creep){let code=OK
if(creep.memory&&creep.memory.target){let target=Game.getObjectById(creep.memory.target)
if(!target)return ERR_INVALID_TARGET
if(creep.memory.harvesting){if(!(target.store&&_.sum(target.store)>0||target.energy&&target.energy>0||target.room.memory&&target.room.memory.dismantle&&-1!==target.room.memory.dismantle.indexOf(creep.memory.target)))return ERR_INVALID_TARGET
creep.harvest(target)&&creep.pickup(target)&&creep.withdraw(target,RESOURCE_ENERGY)&&(target.room.controller&&target.room.controller.owner&&target.room.controller.owner!==LIB_MISC.USERNAME||target.room.memory&&target.room.memory.dismantle&&-1!==target.room.memory.dismantle.indexOf(creep.memory.target))&&creep.dismantle(target)&&(code=LIB_MOVE.move(creep,COLOR_YELLOW,!0))}else if(target.structureType===STRUCTURE_CONTROLLER)creep.upgradeController(target)&&(code=LIB_MOVE.move(creep,COLOR_CYAN,!0))
else if(target.progressTotal)creep.build(target)&&(code=LIB_MOVE.move(creep,COLOR_WHITE,!0))
else if(target.hits<target.hitsMax&&target.hits<repairLimit)creep.repair(target)&&(code=LIB_MOVE.move(creep,COLOR_PURPLE,!0))
else{if(!(target.energy<target.energyCapacity))return ERR_INVALID_TARGET
creep.transfer(Game.getObjectById(creep.memory.target),RESOURCE_ENERGY)&&(code=LIB_MOVE.move(creep,LIB_MISC.COLOR_BLACK,!0))}}return!creep.memory.say||code!==OK&&code!==ERR_TIRED&&code!==ERR_NOT_FOUND||(creep.say(creep.memory.say),creep.memory.say=undefined),code}repairLimit=0,creep&&creep.room&&creep.room.controller&&creep.room.controller.level&&(repairLimit=LIB_MISC.REPAIR_LIMIT*creep.room.controller.level),repairLimit||(repairLimit=LIB_MISC.REPAIR_LIMIT),creep.memory&&creep.memory.target&&(canWander=!1),creep.memory.harvesting?_.sum(creep.carry)>=creep.carryCapacity&&(creep.memory.harvesting=!1,creep.memory.target=undefined,creep.memory.path=undefined):_.sum(creep.carry)<=0&&(creep.memory.harvesting=!0,creep.memory.target=undefined,creep.memory.path=undefined)
for(let l=0;l<LIB_MISC.LOOP_LIMIT;l++){let code=OK
if(rooms.length||(rooms=LIB_MISC.findRooms(creep.room.name)),!rooms.length)break
if(creep.memory&&creep.memory.target||(code=findTarget(creep))!==ERR_NOT_FOUND){if(!(code=affectTarget(creep))||code===OK||code===ERR_TIRED||code===ERR_NOT_FOUND)break
badTargets.push(creep.memory.target),creep.memory.target=undefined,creep.memory.path=undefined}}canWander&&LIB_MOVE.wander(creep)}}
module.exports=roleWorker
