// role.room.js
// #############################################################################
/** This script provides an AI for rooms.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MISC = require("lib.misc");
let roleRoom   = {

    // Main
    // *****************************************************************************
    /** This function controls the provided room.
     * @param room The room to control
    **/
    run: function(room) {

        // Every tick
        setCreepLimits();
        condemnedStructures();

        // Every 8 ticks
        if(LIB_MISC.gamble(1 / 8)) {
            savedStructures();
        } //fi

        // Condemned structures
        // =============================================================================
        function condemnedStructures() {

            // If there is no array of condemned structures for this room, create one.
            if(!room.memory || !room.memory.dismantle) {
                room.memory.dismantle = Array();
            } //fi

            // Update the array.
            for(let i = 0; room.memory.dismantle[i]; i++) {
                if(!Game.getObjectById(room.memory.dismantle[i])) {
                    room.memory.dismantle.splice(i, 1);
                    i--;
                } //fi
            } //done

        } //condemnedStructures

        // TODO:  Saved structures
        // =============================================================================
        function savedStructures() {
            if(!room.memory || !room.memory.layout) {
                room.memory.layout = Array();
            } //fi
        } //savedStructures

        // Set limits for creeps in each room
        // =============================================================================
        function setCreepLimits() {
            room.memory.workerLimit  = 1.0;
            room.memory.fighterLimit = 1.5;
            room.memory.claimerLimit = 0.0;

            setWorkerLimit();
            setFighterLimit();
            setIfHostiles();
            roundLimits();

            // Workers
            // -----------------------------------------------------------------------------
            //NOTE:  While this could be made more accurate by actually calculating a new worker creep, it is extremely unlikely to be worth the CPU.
            function setWorkerLimit() {
                // Get the extension limit at the highest controller level
                let maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][LIB_MISC.CONTROLLER_LEVEL_MAX];
                // Get the number of extensions actually in the room
                let actualExtensions = room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(structure.structureType === STRUCTURE_EXTENSION);}}).length;
                // Set the number of workers per the number of extensions in the room (This effectively results in 3 per source at 0 extensions.)
                room.memory.workerLimit = (maxExtensions - actualExtensions) / (maxExtensions / 3);
                if(room.memory.workerLimit <= 0) room.memory.workerLimit = 1;
                // Multiply the number of workers by the number of sources and mineral extractors in the room.
                room.memory.workerLimit*= room.find(FIND_SOURCES).length; // + room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return(structure.structureType === STRUCTURE_EXTRACTOR);}}).length;
                if(room.memory.workerLimit <= 0) room.memory.workerLimit = 1;
            } //setWorkerLimit

            // Fighters
            // -----------------------------------------------------------------------------
            function setFighterLimit() {

                // Count the number of exits to uncontrolled rooms
                let exits      = Game.map.describeExits(room.name);
                let exitsCount = 0;
                if(exits && exits.length && exits.length === 4) {
                    for(let i = 0; i < 4; i++) {
                        let index = ((2 * i) + 1).toString();
                        if(exits[index]
                            &&  !( Game.rooms[exits[index]]
                                && Game.rooms[exits[index]].controller
                                && Game.rooms[exits[index]].controller.my
                            )
                        ) {
                            exitsCount++;
                        } //fi
                    } //done
                } //fi
                exits = undefined;

                // Multiply fighterLimit by the number of exits
                room.memory.fighterLimit *= exitsCount;

            } //fighterLimit

            // When hostiles are present
            // -----------------------------------------------------------------------------
            function setIfHostiles() {
                // Increment fighterLimit by the number of hostiles
                let hostileCount = room.find(FIND_HOSTILE_CREEPS).length;
                if(hostileCount) {
                    room.memory.fighterLimit += hostileCount;
                } //fi
                hostileCount = undefined;
            } //setIfHostiles

            // Round off the creep limits
            // -----------------------------------------------------------------------------
            function roundLimits() {
                room.memory.workerLimit  = Math.round(room.memory.workerLimit );
                room.memory.fighterLimit = Math.round(room.memory.fighterLimit);
                room.memory.claimerLimit = Math.round(room.memory.claimerLimit);
            } //roundLimits
        } //creepLimits
    }, //run
}; //roleRoom

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleRoom;
