// main.js
// #############################################################################
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_COMMON = require("lib.common");

// Main loop
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports.loop = function () {

    cleanup();
    setAis();

    // Cleanup
    // *****************************************************************************
    function cleanup() {
        // Every 8 ticks
        if(LIB_COMMON.gamble(1 / 8)) {
            cleanMemories();
        } //fi

        // Delete the memories of dead entities
        // =============================================================================
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
    } //cleanup

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
                room = Game.rooms[name];
                switch(room.controller.my) {
                    case true:
                    require("role.room").run(room);
                    break;
                } //esac
            } //done
        } //upliftRooms

        // Structures
        // =============================================================================
        function upliftStructures() {
            for(let name in Game.structures) {
                let structure = Game.structures[name];
                switch(structure.structureType) {

                    case STRUCTURE_SPAWN:
                    require("role.spawn").run(structure);
                    break;

                    case STRUCTURE_TOWER:
                    require("role.tower").run(structure);
                    break;
                } //esac
            } //done
        } //upliftStructures

        // Creeps
        // =============================================================================
        function upliftCreeps() {
            for(let name in Game.creeps) {
                let creep = Game.creeps[name];
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

                    default:
                    require("role.manual" ).run(creep);
                    break;
                } //esac
            } //done
        } //upliftCreeps
    } //setAis
}; //function
