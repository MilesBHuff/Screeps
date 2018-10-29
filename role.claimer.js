"use strict"
const LIB_MOVE=require("lib.move")
let roleClaimer={run:function(creep){let target
creep.memory&&creep.memory.target&&(target=Game.getObjectById(creep.memory.target)),target&&(target.structureType!==STRUCTURE_CONTROLLER||target.my)?(target=null,creep.memory.target=null):(LIB_MOVE.move(creep,COLOR_BLUE,!1),creep.claimController(target),creep.signController(target,"GitHub.com/MilesBHuff/Screeps")),target||LIB_MOVE.wander(creep)}}
module.exports=roleClaimer
