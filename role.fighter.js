"use strict"
const LIB_MISC=require("lib.misc"),LIB_MOVE=require("lib.move")
let badTargets=Array(),hostiles=Array(),roleFighter={run:function(creep){function findTarget(creep){creep.memory.target=undefined,creep.memory.path=undefined,creep.memory.say=undefined
let targets=Array(),task=LIB_MISC.TASKS.WAIT
switch(!0){default:if(task=LIB_MISC.TASKS.ATTACK,(hostiles=creep.room.find(FIND_HOSTILE_CREEPS)).length>0){if(targets.length)break
if(targets=_.filter(hostiles,hostile=>hostile.getActiveBodyparts(RANGED_ATTACK)>0),(targets=LIB_MISC.filterTargets(targets,badTargets)).length)break
if(targets=_.filter(hostiles,hostile=>hostile.getActiveBodyparts(ATTACK)>0),(targets=LIB_MISC.filterTargets(targets,badTargets)).length)break
if(targets=_.filter(hostiles,hostile=>hostile.getActiveBodyparts(HEAL)>0),targets=LIB_MISC.filterTargets(targets,badTargets),targets=_.filter(hostiles,hostile=>hostile.getActiveBodyparts(CLAIM)>0),(targets=LIB_MISC.filterTargets(targets,badTargets)).length)break
if(targets=hostiles,(targets=LIB_MISC.filterTargets(targets,badTargets)).length)break}if(task=LIB_MISC.TASKS.HARVEST,targets=creep.room.find(FIND_HOSTILE_STRUCTURES),(targets=LIB_MISC.filterTargets(targets,badTargets)).length)break
if(creep.room.memory&&creep.room.memory.dismantle){targets=Array()
for(let a=0;creep.room.memory.dismantle[a];a++)targets.push(Game.getObjectById(creep.room.memory.dismantle[a]))
if((targets=LIB_MISC.filterTargets(targets,badTargets))&&targets.length)break}}if(targets.length>0){let target=creep.pos.findClosestByRange(targets)
if(target&&target.id){switch(task){case LIB_MISC.TASKS.ATTACK:creep.memory.say="Attack"
break
case LIB_MISC.TASKS.DEFEND:creep.memory.say="Defend"
break
case LIB_MISC.TASKS.HARVEST:creep.memory.say="Harvest"}return target.id}}}function affectTarget(creep){if(!creep.memory||!creep.memory.target)return LIB_MOVE.wander(creep),OK
{let code1,code2,target=Game.getObjectById(creep.memory.target)
if(!target)return creep.memory.target=undefined,creep.memory.path=undefined,ERR_INVALID_TARGET
if(creep.getActiveBodyparts(ATTACK)>0&&(code1=creep.attack(target)),creep.getActiveBodyparts(RANGED_ATTACK)>0&&(code2=creep.rangedAttack(target)),code1||code2)return LIB_MOVE.move(creep,COLOR_RED,!1)===ERR_NO_PATH?(creep.memory.target=undefined,creep.memory.path=undefined,ERR_NO_PATH):ERR_NOT_IN_RANGE}return creep.memory.say&&(creep.say(creep.memory.say),creep.memory.say=undefined),OK}let target
hostiles=creep.room.find(FIND_HOSTILE_CREEPS),creep.memory&&creep.memory.target&&((target=Game.getObjectById(creep.memory.target))||(creep.memory.target=undefined))
for(let h=0;h<hostiles.length;h++)creep.pos.isNearTo(hostiles[h])&&creep.moveTo(creep.pos.x+(creep.pos.x-hostiles[h].pos.x),creep.pos.y+(creep.pos.y-hostiles[h].pos.y))
for(let l=0;l<LIB_MISC.LOOP_LIMIT;l++){target||(creep.memory.target=findTarget(creep))
let code=affectTarget(creep)
if(!code||code===OK)return OK
badTargets.push(creep.memory.target),creep.memory.target=undefined,creep.memory.path=undefined}LIB_MOVE.wander(creep)}}
module.exports=roleFighter
