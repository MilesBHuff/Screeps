"use strict"
const LIB_MISC=require("lib.misc")
let roleSpawn={run:function(spawn){let creepLimitsGlobal={workers:999,fighters:999,claimers:999},creepsGlobal={workers:Array(),fighters:Array(),claimers:Array()},creepsLocal={workers:Array(),fighters:Array(),claimers:Array()}
!(function countCreeps(){let livelyCreeps=(function findLivelyCreeps(algorithm){switch(algorithm){case 1:return _.filter(Game.creeps,creep=>(function(){if(creep.spawning)return!0
let timeToRegrow
for(timeToRegrow=0;timeToRegrow<creep.body.length;timeToRegrow++)timeToRegrow+=CREEP_SPAWN_TIME
return!(creep.ticksToLive<=timeToRegrow)}))
default:return _.filter(Game.creeps,creep=>creep.spawning||creep.ticksToLive>=LIB_MISC.NEAR_DEATH)}})(0)
creepsGlobal.workers=_.filter(livelyCreeps,creep=>creep.memory.role===LIB_MISC.ROLES.WORKER),creepsGlobal.fighters=_.filter(livelyCreeps,creep=>creep.memory.role===LIB_MISC.ROLES.FIGHTER),creepsGlobal.claimers=_.filter(livelyCreeps,creep=>creep.memory.role===LIB_MISC.ROLES.CLAIMER),creepsLocal.workers=_.filter(creepsGlobal.workers,creep=>creep.room===spawn.room),creepsLocal.fighters=_.filter(creepsGlobal.fighters,creep=>creep.room===spawn.room),creepsLocal.claimers=_.filter(creepsGlobal.claimers,creep=>creep.room===spawn.room)
for(let roleLimit in creepLimitsGlobal)roleLimit=0
for(let roomName in Game.rooms){let room=Game.rooms[roomName]
creepLimitsGlobal.workers+=room.memory.workerLimit,creepLimitsGlobal.fighters+=room.memory.fighterLimit,creepLimitsGlobal.claimers+=room.memory.claimerLimit}})(),!spawn.spawning&&(spawn.room.energyAvailable>=spawn.room.energyCapacityAvailable||creepsLocal.workers.length<=0)&&(function trySpawnCreep(){for(let i=0;i<2;i++){let creepRole=0
switch(i){case 0:creepRole=creepsLocal.workers.length<Math.ceil(spawn.room.memory.workerLimit/2)?LIB_MISC.ROLES.WORKER:creepsLocal.fighters.length<Math.ceil(spawn.room.memory.fighterLimit/2)?LIB_MISC.ROLES.FIGHTER:creepsLocal.claimers.length<Math.ceil(spawn.room.memory.claimerLimit/2)?LIB_MISC.ROLES.CLAIMER:Math.floor(Math.random()*LIB_MISC.ROLES.length)
break
case 1:creepRole=LIB_MISC.ROLES.WORKER}switch(creepRole){case LIB_MISC.ROLES.WORKER:if(creepsLocal.workers.length<spawn.room.memory.workerLimit&&creepsGlobal.workers.length<creepLimitsGlobal.workers){roleSpawn.spawnCreep(spawn,LIB_MISC.ROLES.WORKER)
break}if(0===i)continue
case LIB_MISC.ROLES.FIGHTER:if(creepsLocal.fighters.length<spawn.room.memory.fighterLimit&&creepsGlobal.fighters.length<creepLimitsGlobal.fighters){roleSpawn.spawnCreep(spawn,LIB_MISC.ROLES.FIGHTER)
break}if(0===i)continue
case LIB_MISC.ROLES.CLAIMER:if(creepsLocal.claimers.length<spawn.room.memory.claimerLimit&&creepsGlobal.claimers.length<creepLimitsGlobal.claimers){roleSpawn.spawnCreep(spawn,LIB_MISC.ROLES.CLAIMER)
break}if(0===i)continue}if(spawn.spawning)break}if(!spawn.spawning)return ERR_NOT_FOUND})()},spawnCreep:function(spawn,role){let name="",partTypes=[WORK,CARRY,RANGED_ATTACK,HEAL,ATTACK,CLAIM],partRatios={movesPerPart:1,useTough:!1}
for(let p=0;p<partTypes.length;p++)partRatios[partTypes[p]]=0
switch(role){case LIB_MISC.ROLES.WORKER:name="Worker",partRatios.movesPerPart=.5,partRatios[CARRY]=.5,partRatios[WORK]=.5
break
case LIB_MISC.ROLES.FIGHTER:name="Fighter",partRatios.useTough=!0,partRatios.movesPerPart=1,partRatios[HEAL]=.5,partRatios[RANGED_ATTACK]=.49,partRatios[ATTACK]=.01
break
case LIB_MISC.ROLES.CLAIMER:name="Claimer",partRatios.useTough=!0,partRatios.movesPerPart=5,partRatios[CLAIM]=.01
break
default:return ERR_INVALID_ARGS}spawn.room.controller&&spawn.room.controller.level<LIB_MISC.DEVELOPED_CTRL_LVL&&(partRatios.movesPerPart=1)
let energyCost=0,energyTotal=spawn.room.energyAvailable,partCounts={total:0}
for(let p=0;p<BODYPARTS_ALL.length;p++)partCounts[BODYPARTS_ALL[p]]=0
for(let p=0;p<partTypes.length;p++)partRatios[partTypes[p]]>0&&(partCounts.total++,partCounts[partTypes[p]]++,energyCost+=BODYPART_COST[partTypes[p]])
if(partCounts.total<=0)return OK
for(;partRatios.movesPerPart>partCounts[MOVE]/(partCounts.total-partCounts[MOVE]);)partCounts.total++,partCounts[MOVE]++,energyCost+=BODYPART_COST[MOVE]
if(energyCost>energyTotal)return ERR_NOT_ENOUGH_ENERGY
for(;1;){let movelessParts=partCounts.total-partCounts[MOVE]
if(partRatios.movesPerPart>partCounts[MOVE]/movelessParts){partCounts.total++,partCounts[MOVE]++,energyCost+=BODYPART_COST[MOVE]
continue}let exitLoop=!1,neededMovesCost=0
if(partRatios.movesPerPart>partCounts[MOVE]/(movelessParts+1)){let neededMoves=0
for(;partRatios.movesPerPart>(partCounts[MOVE]+neededMoves)/(movelessParts+1);)if(neededMoves++,MAX_CREEP_SIZE<partCounts.total+1+neededMoves){exitLoop=!0
break}neededMovesCost=neededMoves*BODYPART_COST[MOVE]}else MAX_CREEP_SIZE<partCounts.total+1&&(exitLoop=!0)
if(exitLoop)break
exitLoop=!1
for(let p=0;p<partTypes.length;p++)if(partRatios[partTypes[p]]>=partCounts[partTypes[p]]/movelessParts&&energyTotal>=energyCost+BODYPART_COST[partTypes[p]]+neededMovesCost){partCounts.total++,partCounts[partTypes[p]]++,energyCost+=BODYPART_COST[partTypes[p]],exitLoop=!0
break}if(!exitLoop){if(!(partRatios.useTough&&energyTotal>=energyCost+BODYPART_COST[TOUGH]+neededMovesCost))break
partCounts[TOUGH]++,energyCost+=BODYPART_COST[TOUGH]}}partTypes=[TOUGH,WORK,CARRY,MOVE,CLAIM,RANGED_ATTACK,ATTACK,HEAL]
let bodyParts=[]
for(let p=0;p<partTypes.length;p++)for(;partCounts[partTypes[p]];)partCounts[partTypes[p]]--,bodyParts.push(partTypes[p])
let directions=[BOTTOM,TOP,RIGHT,LEFT,BOTTOM_RIGHT,BOTTOM_LEFT,TOP_RIGHT,TOP_LEFT]
for(let i=0;1;i++){let code=spawn.spawnCreep(bodyParts,name+i,{memory:{role:role},dryRun:!1,directions:directions})
if(code){if(code===ERR_NAME_EXISTS)continue
return code}break}return LIB_MISC.say(name.charAt(0).toUpperCase()+name.slice(1),spawn),OK}}
module.exports=roleSpawn
