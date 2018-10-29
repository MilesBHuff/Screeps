// lib.misc.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/
"use strict";

const LIB_MISC = {

    // Variables
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // This color is missing from the global game defines.
    COLOR_BLACK: 0,
    // This constant is missing from the global game defines.
    CONTROLLER_LEVEL_MAX: 8,
    // This is the remaining repair amount at which you will receive an email about your controller degrading.
    // 3000 is when you get an email, and CREEP_LIFE_TIME is how long a normal creep lives.
    CONTROLLER_NEAR_DEGRADE: 3000 + CREEP_LIFE_TIME,
    // The maximum number of times to run a loop that would otherwise be while(true).
    LOOP_LIMIT: 12,
    // This is the number of ticksToLive below which a creep is considered near-death.
    NEAR_DEATH: CREEP_SPAWN_TIME * MAX_CREEP_SIZE, // Set to the maximal amount of time it can take to spawn a creep.
    // This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level.
    REPAIR_LIMIT: 62500,
    // These are all the roles available for creeps
    ROLES: Object.freeze({
        "MANUAL":  -1,
        "WORKER":   0,
        "FIGHTER":  1,
        "CLAIMER":  2,
    }),
    // These are all the cannonical tasks that can be assigned to a creep
    TASKS: Object.freeze({
        WAIT:    -1,
        HARVEST:  0,
        TRANSFER: 1,
        UPGRADE:  2,
        BUILD:    3,
        REPAIR:   4,
        ATTACK:   5,
        HEAL:     6,
        CLAIM:    7,
        RENEW:    8,
        DEFEND:   9,
    }),
    // This is the controller level by which a room is expected to be "developed" -- ie, have enough roads to benefit from MOVE skewing.
    DEVELOPED_CTRL_LVL: 3,
    // The player's username
    USERNAME: "MilesBHuff",

    // Functions
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    // Filter targets
    // =========================================================================
    /** This function removes any element in badTargets from newTargets.
     * @param  newTargets The array whose IDs to check
     * @param  badTargets The array whose IDs to filter out
     * @return targets without badTargets.
    **/
    filterTargets: function(newTargets, badTargets) {
        if(newTargets.length && badTargets.length) {
            for(let nt = 0; newTargets[nt]; nt++) {
                for(let bt = 0; badTargets[bt]; bt++) {
                    if(newTargets[nt].id && newTargets[nt].id === badTargets[bt]) {
                        newTargets.splice(nt, 1);
                        nt--;
                        badTargets.splice(bt, 1);
                        bt--;
                        break;
                    } //fi
                } //done
            } //done
        } //fi
        return newTargets;
    }, //function

    // Look and act
    // =========================================================================
    /** This function uses the provided functions to find and perform work with
     *  the provided creep
     * @param  creep The creep to control
     * @param  look  The search
     * @param  act   The performance
     * @return an exit code.
    **/
    lookAndAct: function(creep, look, act) {
        //TODO
    },

    // Find rooms
    // =========================================================================
    /** This function finds and returns the given room and its neighbours.
     * @param  roomName The name of the room whose neighbours to find
     * @return the given room and its neighbours.
    **/
    findRooms: function(roomName) {
        let rooms = [];
        // Push the creep's current room.
        rooms.push(roomName);
        // Find all the rooms connected to the current room.
        let roomsTmp = Game.map.describeExits(roomName);
		if(roomsTmp) {
			for(let i = 0; i < 4; i++) {
                let index = ((2 * i) + 1).toString();
                if(roomsTmp[index]) {
                    rooms.push(roomsTmp[index]);
                } //fi
            } //done
        } //fi
        // Convert the array of strings into an array of objects.  This also trims rooms that we can't see.
        roomsTmp = [];
        for(let name in rooms) {
            let room = Game.rooms[rooms[name]];
            if(room) roomsTmp.push(room);
        } //done
        // Return the array.
        return roomsTmp;
    }, //function

    // Gamble
    // =========================================================================
    /** This function rolls the dice at the odds specified, and returns whether
     *  you won.
     * @param  odds The odds of winning, out of 1
     * @return whether you won.
    **/
    gamble: function(odds) {
        return !Math.floor(Math.random() * (1 / odds));
    }, //gamble

    // Kill off
    // =========================================================================
    /** This function kills off excess creeps.
    * @param creeps    The creeps to use
    * @param maxCreeps The number to cull to
    **/
    killOff: function(creeps, maxCreeps) {
        for(let i = 0; creeps.length > maxCreeps; i++) {
            creeps[i].suicide();
        } //done
    }, //function

    // Say
    // =========================================================================
    /** Spawns text above the given object, similarly to creep.say().
     * @param  text   The text to display
     * @param  object The thing that will display the text
     * @return OK, ERR_INVALID_ARGS.
    **/
    say: function(text, object) {
        if(!text || !text[0] || !object || !object.room || !object.room.pos) {
            return ERR_INVALID_ARGS;
        } //fi
        new RoomVisual(object.room).text(
            text,
            object.pos.x,
            object.pos.y - 1,
            {backgroundColor:   "#CCC",
            backgroundPadding: "0.1",
            color:             "#111",
            font:              "bold 0.6 Arial",
        });
        return OK;
    }, //function

    // Sort rooms
    // =========================================================================
    /** This function sorts the given rooms by distance from the given position.
     * @param  pos   The position to use
     * @param  rooms The array to sort
     * @return the sorted array.
    **/
    sortRooms: function(pos, rooms) {
        let roomsTmp = [];
        for(let i = 0; 0 < rooms.length; i++) {
            // Find the nearest room that hasn't been found yet.
            let testRooms = Game.rooms[pos.findClosestByRange(FIND_EXIT, {filter: (room) => function(room) {return rooms.indexOf(room) !== -1;}})];
            if(!testRooms) return roomsTmp;
            roomsTmp.push(testRooms.roomName);
            // Find its index.
            let index = 0;
            for(let j = 0; rooms[j]; j++) {
                if(rooms[j] === roomsTmp[i]) {
                    index = j;
                    break;
                } //fi
            } //done
            // Splice it.
            rooms.splice(index, 1);
        } //done
        // Return the sorted array.
        return roomsTmp;
    }, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = LIB_MISC;
