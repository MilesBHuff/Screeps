"use strict"
const LIB_MISC={COLOR_BLACK:0,CONTROLLER_LEVEL_MAX:8,CONTROLLER_NEAR_DEGRADE:3e3+CREEP_LIFE_TIME,LOOP_LIMIT:12,NEAR_DEATH:CREEP_SPAWN_TIME*MAX_CREEP_SIZE,REPAIR_LIMIT:62500,ROLES:Object.freeze({MANUAL:-1,WORKER:0,FIGHTER:1,CLAIMER:2}),TASKS:Object.freeze({WAIT:-1,HARVEST:0,TRANSFER:1,UPGRADE:2,BUILD:3,REPAIR:4,ATTACK:5,HEAL:6,CLAIM:7,RENEW:8,DEFEND:9}),DEVELOPED_CTRL_LVL:3,USERNAME:"MilesBHuff",filterTargets:function(newTargets,badTargets){if(newTargets.length&&badTargets.length)for(let nt=0;newTargets[nt];nt++)for(let bt=0;badTargets[bt];bt++)if(newTargets[nt].id&&newTargets[nt].id===badTargets[bt]){newTargets.splice(nt,1),nt--,badTargets.splice(bt,1),bt--
break}return newTargets},lookAndAct:function(creep,look,act){},findRooms:function(roomName){let rooms=[]
rooms.push(roomName)
let roomsTmp=Game.map.describeExits(roomName)
if(roomsTmp)for(let i=0;i<4;i++){let index=(2*i+1).toString()
roomsTmp[index]&&rooms.push(roomsTmp[index])}roomsTmp=[]
for(let name in rooms){let room=Game.rooms[rooms[name]]
room&&roomsTmp.push(room)}return roomsTmp},gamble:function(odds){return!Math.floor(Math.random()*(1/odds))},killOff:function(creeps,maxCreeps){for(let i=0;creeps.length>maxCreeps;i++)creeps[i].suicide()},say:function(text,object){return text&&text[0]&&object&&object.room&&object.room.pos?(new RoomVisual(object.room).text(text,object.pos.x,object.pos.y-1,{backgroundColor:"#CCC",backgroundPadding:"0.1",color:"#111",font:"bold 0.6 Arial"}),OK):ERR_INVALID_ARGS},sortRooms:function(pos,rooms){let roomsTmp=[]
for(let i=0;0<rooms.length;i++){let testRooms=Game.rooms[pos.findClosestByRange(FIND_EXIT,{filter:room=>(function(room){return-1!==rooms.indexOf(room)})})]
if(!testRooms)return roomsTmp
roomsTmp.push(testRooms.roomName)
let index=0
for(let j=0;rooms[j];j++)if(rooms[j]===roomsTmp[i]){index=j
break}rooms.splice(index,1)}return roomsTmp}}
module.exports=LIB_MISC
