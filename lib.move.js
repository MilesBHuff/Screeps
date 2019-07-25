"use strict"
const LIB_MOVE={move:function(creep,color,cache){if(!creep||!creep.name||!Game.creeps[creep.name]||color===undefined||cache===undefined)return ERR_INVALID_ARGS
if(cache||(creep.memory.path=undefined),creep.memory&&creep.memory.target){let target=Game.getObjectById(creep.memory.target)
if(!target)return ERR_INVALID_TARGET
if(creep.pos===target.pos)return creep.memory.path=undefined,OK
if(creep.room.name!==target.room.name&&(target=creep.pos.findClosestByRange(creep.room.find(creep.room.findExitTo(target.room)))),!creep.memory.path){let pathOpts={ignoreCreeps:!1,ignoreDestructibleStructures:!1,ignoreRoads:!1,maxOps:1e3,maxRooms:4,serialize:!1},path=creep.pos.findPathTo(target,pathOpts),validPath=!1
if(path.length)if(cache&&target.room===creep.room)for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){let pos=new RoomPosition(target.pos.x+x,target.pos.y+y,target.pos.roomName)
pos.x===path[path.length-1].x&&pos.y===path[path.length-1].y&&(validPath=!0)}else validPath=!0
if(!validPath)return creep.memory.path=undefined,ERR_NO_PATH
creep.memory.path=Room.serializePath(path),path=undefined,validPath=undefined}let code=creep.moveByPath(creep.memory.path)
if(!code||code!==ERR_TIRED){if(code&&code!==OK)return creep.memory.path=undefined,code
{let lookCreep,path=Room.deserializePath(creep.memory.path)
if(path.length>=1&&path[1]&&path[1].x&&path[1].y&&(lookCreep=new RoomPosition(path[1].x,path[1].y,creep.room.name).lookFor(LOOK_CREEPS)[0]),lookCreep&&lookCreep!==creep)return creep.memory.path=undefined,ERR_NOT_FOUND
path[0]&&path[0].x===creep.pos.x&&path[0].y===creep.pos.y&&path.shift(),creep.memory.path=Room.serializePath(path)}}switch(color){case COLOR_RED:color="#EA4034"
break
case COLOR_PURPLE:color="#9625A9"
break
case COLOR_BLUE:color="#2090E9"
break
case COLOR_CYAN:color="#00B5CC"
break
case COLOR_GREEN:color="#49A84D"
break
case COLOR_YELLOW:color="#F5E239"
break
case COLOR_ORANGE:color="#F59200"
break
case COLOR_BROWN:color="#745245"
break
case COLOR_GREY:color="#989898"
break
case COLOR_WHITE:color="#F5F5F5"
break
default:color="#090909"}let lineOpts={fill:"transparent",lineStyle:"dashed",opacity:.25,stroke:color,strokeWidth:.15}
return new RoomVisual(creep.room.name).poly(Room.deserializePath(creep.memory.path),lineOpts),code}return ERR_INVALID_TARGET},wander:function(creep){if(creep.pos.x<3||creep.pos.x>46||creep.pos.y<3||creep.pos.y>46)creep.moveTo(24,24)
else{let direction=Math.round(8*Math.random())
direction&&creep.move(direction)}return OK}}
module.exports=LIB_MOVE
