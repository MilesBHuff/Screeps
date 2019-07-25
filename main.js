"use strict"
const LIB_MISC=require("lib.misc")
module.exports.loop=function(){LIB_MISC.gamble(1/8)&&!(function cleanMemories(){for(let name in Memory.creeps)Game.creeps[name]||delete Memory.creeps[name]
for(let name in Memory.structures)Game.structures[name]||delete Memory.structures[name]
for(let name in Memory.rooms)Game.rooms[name]||delete Memory.rooms[name]})(),(function setAis(){!(function upliftRooms(){let name,room
for(name in Game.rooms)try{if(!(room=Game.rooms[name]).controller)continue
switch(room.controller.my){case!0:require("role.room").run(room)}}catch(err){console.log(err.stack)}})(),(function upliftStructures(){for(let name in Game.structures)try{let structure=Game.structures[name]
switch(structure.structureType){case STRUCTURE_SPAWN:require("role.spawn").run(structure)
break
case STRUCTURE_TOWER:require("role.tower").run(structure)
break
case STRUCTURE_TERMINAL:require("role.terminal").run(structure)
break
case STRUCTURE_LINK:require("role.link").run(structure)}}catch(err){console.log(err.stack)}})(),(function upliftCreeps(){for(let name in Game.creeps)try{let creep=Game.creeps[name]
if(creep.memory||(creep.memory={role:LIB_MISC.ROLES.MANUAL}),creep.spawning)continue
switch(creep.memory.role){case LIB_MISC.ROLES.WORKER:require("role.worker").run(creep)
break
case LIB_MISC.ROLES.FIGHTER:require("role.fighter").run(creep)
break
case LIB_MISC.ROLES.CLAIMER:require("role.claimer").run(creep)
break
default:require("role.manual").run(creep)}}catch(err){console.log(err.stack)}})()})()}
