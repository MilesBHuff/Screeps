// main.js
// #############################################################################
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_COMMON = require("lib.common");

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

    // Every 8 ticks
    if(LIB_COMMON.gamble(1 / 8)) {
        cleanMemories();
    } //fi

    // Every tick
    setAis();

    // Delete the memories of dead entities
    // *****************************************************************************
    function cleanMemories() {
        // Creeps
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            } //fi
        } //done

        // Structures
        for(let name in Memory.structures) {
            if(!Game.structures[name]) {
                delete Memory.structures[name];
            } //fi
        } //done

        // Rooms
        for(let name in Memory.rooms) {
            if(!Game.rooms[name]) {
                delete Memory.rooms[name];
            } //fi
        } //done
    } //cleanMemories

    // AIs
    // *****************************************************************************
    function setAis() {
        upliftRooms();
        upliftStructures();
        upliftCreeps();

        // Rooms
        // =============================================================================
        function upliftRooms() {
            let name, room;
            for(name in Game.rooms) {
				try {
		            room = Game.rooms[name];
		            if(!room.controller) continue;
		            switch(room.controller.my) {
		                case true:
		                require("role.room").run(room);
		                break;
		            } //esac
				} catch(err) {
					console.log(err.stack);
				} //finally
            } //done
        } //upliftRooms

        // Structures
        // =============================================================================
        function upliftStructures() {
            for(let name in Game.structures) {
				try {
	                let structure = Game.structures[name];
	                switch(structure.structureType) {

	                    case STRUCTURE_SPAWN:
	                    require("role.spawn").run(structure);
	                    break;

	                    case STRUCTURE_TOWER:
	                    require("role.tower").run(structure);
	                    break;
	                } //esac
				} catch(err) {
					console.log(err.stack);
				} //finally
            } //done
        } //upliftStructures

        // Creeps
        // =============================================================================
        function upliftCreeps() {
            for(let name in Game.creeps) {
				try {
	                let creep = Game.creeps[name];
	                //if(!creep.memory) continue;
	                if(creep.spawning) continue;
	                switch(creep.memory.role) {

	                    case LIB_COMMON.ROLES.WORKER:
	                    require("role.worker" ).run(creep);
	                    break;

	                    case LIB_COMMON.ROLES.FIGHTER:
	                    require("role.fighter").run(creep);
	                    break;

	                    case LIB_COMMON.ROLES.HEALER:
	                    require("role.healer" ).run(creep);
	                    break;

	                    case LIB_COMMON.ROLES.CLAIMER:
	                    require("role.claimer").run(creep);
	                    break;

	                    default:
	                    require("role.manual" ).run(creep);
	                    break;
	                } //esac
				} catch(err) {
					console.log(err.stack);
				} //finally
            } //done
        } //upliftCreeps
    } //setAis
}; //function
