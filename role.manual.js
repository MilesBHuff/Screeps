"use strict"
const LIB_MOVE=require("lib.move")
let roleManual={run:function(creep){creep.memory&&creep.memory.target&&LIB_MOVE.move(creep,COLOR_BLUE,!1)}}
module.exports=roleManual
