"use strict"
let roleLink={run:function(link){if(!link||link.structureType!==STRUCTURE_LINK)return ERR_INVALID_TARGET
if(link.cooldown>0)return ERR_TIRED
let sigDiff=LINK_CAPACITY/100,targets=link.room.find(FIND_MY_STRUCTURES,{filter:newLink=>newLink.room.memory.dismantle.indexOf(newLink.id)<0&&newLink.structureType===STRUCTURE_LINK&&link.energy>newLink.energy+sigDiff})
if(targets.length<1)return OK
let transferAmount=Math.ceil(link.energy-(link.energy+targets[0].energy)/2)
return link.transferEnergy(targets[0],transferAmount),OK}}
module.exports=roleLink
