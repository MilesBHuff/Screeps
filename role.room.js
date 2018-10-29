"use strict"
const LIB_MISC=require("lib.misc")
let roleRoom={run:function(room){!(function setCreepLimits(){room.memory.workerLimit=1,room.memory.fighterLimit=1.5,room.memory.claimerLimit=0,(function setWorkerLimit(){let maxExtensions=CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][LIB_MISC.CONTROLLER_LEVEL_MAX],actualExtensions=room.find(FIND_MY_STRUCTURES,{filter:structure=>structure.structureType===STRUCTURE_EXTENSION}).length
room.memory.workerLimit=(maxExtensions-actualExtensions)/(maxExtensions/3),room.memory.workerLimit<=0&&(room.memory.workerLimit=1),room.memory.workerLimit*=room.find(FIND_SOURCES).length,room.memory.workerLimit<=0&&(room.memory.workerLimit=1)})(),(function setFighterLimit(){let exits=Game.map.describeExits(room.name),exitsCount=0
if(exits&&exits.length&&4===exits.length)for(let i=0;i<4;i++){let index=(2*i+1).toString()
!exits[index]||Game.rooms[exits[index]]&&Game.rooms[exits[index]].controller&&Game.rooms[exits[index]].controller.my||exitsCount++}exits=undefined,room.memory.fighterLimit*=exitsCount})(),(function setIfHostiles(){let hostileCount=room.find(FIND_HOSTILE_CREEPS).length
hostileCount&&(room.memory.fighterLimit+=hostileCount),hostileCount=undefined})(),(function roundLimits(){room.memory.workerLimit=Math.round(room.memory.workerLimit),room.memory.fighterLimit=Math.round(room.memory.fighterLimit),room.memory.claimerLimit=Math.round(room.memory.claimerLimit)})()})(),(function condemnedStructures(){room.memory&&room.memory.dismantle||(room.memory.dismantle=Array())
for(let i=0;room.memory.dismantle[i];i++)Game.getObjectById(room.memory.dismantle[i])||(room.memory.dismantle.splice(i,1),i--)})(),LIB_MISC.gamble(1/8)&&(function savedStructures(){room.memory&&room.memory.layout||(room.memory.layout=Array())})()}}
module.exports=roleRoom
