"use strict"
const LIB_MISC=require("lib.misc"),LIB_MOVE=require("lib.move"),ROLE_SPAWN=require("role.spawn"),LIB_COMMANDS={checkProgress:function(structureId){let message="",structure=Game.getObjectById(structureId)
if(structure.progress&&structure.progressTotal)message=structure.progress+" / "+structure.progressTotal
else{if(!structure.hits||!structure.hitsMax)return ERR_INVALID_TARGET
message=structure.hits+" / "+structure.hitsMax}return LIB_MISC.say(structure,message),message},createCreep:function(spawnName,roleName,dryRun){return ROLE_SPAWN.spawnCreep(Game.spawns[spawnName],LIB_MISC.ROLES[roleName],!!dryRun)},dismantle:function(structureId){return Game.getObjectById(structureId).room.memory.dismantle.push(structureId)},moveCreepTo:function(creepName,target){return Game.creeps[creepName].memory.target=target,LIB_MOVE.move(Game.creeps[creepName],COLOR_GREY,!1)},removeConstruction:function(){for(let name in Game.constructionSites)Game.constructionSites[name].remove()
return OK},signController:function(creepName,controllerId,message){return Game.creeps[creepName].signController(Game.getObjectById(controllerId),message)}}
module.exports=LIB_COMMANDS
