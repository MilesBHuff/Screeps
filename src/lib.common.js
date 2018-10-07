// defines.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/
"use strict";

const LIB_COMMON = {

    // Variables
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // This color is missing from the global game defines.
    COLOR_BLACK: 0,
    // This constant is missing from the global game defines.
    CONTROLLER_LEVEL_MAX: 8,
    // This is the remaining repair amount at which you will receive an email about your controller degrading.
    CONTROLLER_NEAR_DEGRADE: 3000,
    // The maximum number of times to run a loop that would otherwise be while(true).
    LOOP_LIMIT: 12,
    // This is the number of ticksToLive below which a creep is considered near-death.
    NEAR_DEATH: CREEP_SPAWN_TIME * MAX_CREEP_SIZE, // Set to the maximal amount of time it can take to spawn a creep.
    // This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level.
    REPAIR_LIMIT: 62500,
    // These are all the roles available for creeps
    ROLES: Object.freeze({
        "WORKER":  0,
        "FIGHTER": 1,
        "HEALER":  2,
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
    // The player's username
    USERNAME: "MilesBHuff",

    // Functions (tier 1)
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    // Filter targets
    // =========================================================================
    /** This function removes any element in badTargets from newTargets.
     * @param  newTargets The array whose IDs to check.
     * @param  badTargets The array whose IDs to filter out.
     * @return targets without badTargets.
    **/
    filterTargets: function (newTargets, badTargets) {
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

    // Find rooms
    // =========================================================================
    /** This function finds and returns the given room and its neighbours.
     * @param  roomName The name of the room whose neighbours to find.
     * @return the given room and its neighbours.
    **/
    findRooms: function (roomName) {
        let rooms = Array();
        // Push the creep's current room.
        rooms.push(roomName);
        // Find all the rooms connected to the current room.
        let roomsTmp = Game.map.describeExits(roomName);
        for(let i = 0; i < 4; i++) {
            let index = ((2 * i) + 1).toString();
            if(roomsTmp[index] !== undefined) {
                rooms.push(roomsTmp[index]);
            } //fi
        } //done
        // Convert the array of strings into an array of objects.  This also trims rooms that we can't see.
        roomsTmp = Array();
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
     * @param  odds The odds of winning, out of 1.
     * @return whether you won.
    **/
    gamble: function (odds) {
        return !Math.floor(Math.random() * (1 / odds));
    }, //gamble

    // Kill off
    // =========================================================================
    /** This function kills off excess creeps.
    * @param creeps    The creeps to use.
    * @param maxCreeps The number to cull to.
    **/
    killOff: function (creeps, maxCreeps) {
        for(let i = 0; creeps.length > maxCreeps; i++) {
            creeps[i].suicide();
        } //done
    }, //function

    // Move
    // =========================================================================
    /** Calculates a path for the creep to get to its target, and moves it.  If
     *  the creep is unable to move, recalculate its path.  If no path can be
     *  found, reset its target.  Also displays the creep's path on the map.
     * @param  creep The creep to move.
     * @param  color The colour for the creep's path.
     * @param  cache Whether to use the path cached in the creep's memory.
     * @return OK, ERR_NO_PATH, ERR_INVALID_TARGET, ERR_INVALID_ARGS
    **/
    move: function (creep, color, cache) {
        // Verify arguments
        if(!creep
        || !creep.name
        || !Game.creeps[creep.name]
        || color === undefined
        || cache === undefined
        ) {
            return ERR_INVALID_ARGS;
        } //fi
        // If we aren't using cached paths, clear any cached path.
        if(!cache) {
            creep.memory.path = undefined;
        } //fi
        if(creep.memory && creep.memory.target) {
            let target = Game.getObjectById(creep.memory.target);
            if(!target) {
//              creep.memory.target = undefined;
                return ERR_INVALID_TARGET;
            } //fi
            // If the creep's position is equal to the target's position, delete the path and return.
            if(creep.pos === target.pos) {
                creep.memory.path = undefined;
                return OK;
            } //fi
            // If the target is in a different room, find the nearest exit to that room
            //TODO:  Check to see if the stated exit is even accessible.
            if(creep.room.name !== target.room.name) {
                target = creep.pos.findClosestByRange(creep.room.find(creep.room.findExitTo(target.room)));
            }
            // If the creep has no path, create one.  If there is no possible path, reset the creep's target and return.
            if(!creep.memory.path) {
                // Configure the pathfinder
                let pathOpts = {
                    ignoreCreeps: false,
                    ignoreDestructibleStructures: false,
                    ignoreRoads:  false,
                    maxOps:        1000,
                    maxRooms:         4,
                    serialize:    false,
                }; //struct
                // Find a path
                let path = creep.pos.findPathTo(target, pathOpts);
                // Validate the path
                let validPath = false;
                if(path.length) {
                    if(target.room === creep.room) {
                        for(let x = -1; x <= 1; x++) {
                            for(let y = -1; y <= 1; y++) {
                                let pos = new RoomPosition(target.pos.x + x,
                                                           target.pos.y + y,
                                                           target.pos.roomName);
                                if(pos.x === path[path.length - 1].x
                                && pos.y === path[path.length - 1].y
                                && pos.lookFor(LOOK_CREEPS).length <= 0
                                ) {
                                    validPath = true;
                                } //fi
                            } //done
                        } //done
                    } else {
                        validPath = true;
                    } //fi
                } //fi
                // If the path is invalid, then the target cannot be reached.  Find a new target.
                if(!validPath) {
//                  creep.memory.target = undefined;
                    creep.memory.path   = undefined;
                    return ERR_NO_PATH;
                } //fi
                // If the path is valid, serialize it and save it in memory.
                creep.memory.path = Room.serializePath(path);
                // Clear unneeded memory.
                     path = undefined;
                validPath = undefined;
            } //fi
			// Try to move the creep to the new location.
            let code = creep.moveByPath(creep.memory.path); //NOTE:  The creep's location doesn't actually change until the next tick.
			//If the creep is tired, then it didn't move, so we don't need to evaluate movement.
			if(!code
			||(code
			&& code !== ERR_TIRED
		    )) {
				// If movement failed, reset the path and return an error.
	            if(code && code !== OK) {
//                  creep.memory.target = undefined;
	                creep.memory.path   = undefined;
	                return code;
	            } else {
					let path = Room.deserializePath(creep.memory.path);
					// If there's a creep in the way, recalculate the path
					if(path[1] && new RoomPosition(path[1].x, path[1].y, creep.room.name).lookFor(LOOK_CREEPS)[0]) {
//                      creep.memory.target = undefined;
		                creep.memory.path   = undefined;
		                return ERR_NO_PATH;
					} //fi
		            // Delete path elements that have already been traversed.
	                if(path[0]
	                && path[0].x === creep.pos.x
	                && path[0].y === creep.pos.y
	                ) {
	                    path.shift();
	                } //fi
	                creep.memory.path = Room.serializePath(path);
	            } //fi
            } //fi
            // Parse the given color
            switch(color) {
                case COLOR_RED:
//              color = "#ED5557"; // Hostile glow
                color = "#EA4034"; // Flags
                break;

                case COLOR_PURPLE:
//              color = "#8F6F9F"; // Syntax-highlighting
                color = "#9625A9"; // Flags
                break;

                case COLOR_BLUE:
//              color = "#3F51B5"; // Selection color
                color = "#2090E9"; // Flags
                break;

                case COLOR_CYAN:
//              color = "#47A89F"; // GCL color
                color = "#00B5CC"; // Flags
                break;

                case COLOR_GREEN:
//              color = "#89B48D"; // Friendly glow
                color = "#49A84D"; // Flags
                break;

                case COLOR_YELLOW:
//              color = "#FFE56E"; // Energy
                color = "#F5E239"; // Flags
                break;

                case COLOR_ORANGE:
//              color = "#CA7731"; // Syntax-highlighting
                color = "#F59200"; // Flags
                break;

                case COLOR_BROWN:
//              color = "#262816"; // Swampland
                color = "#745245"; // Flags
                break;

                case COLOR_GREY:
//              color = "#626262"; // Roads
                color = "#989898"; // Flags
                break;

                case COLOR_WHITE:
//              color = "#BCBCBC"; // Icons
                color = "#F5F5F5"; // Flags
                break;

                default: // COLOR_BLACK
//              color = "#202020"; // Creep outlines
                color = "#090909"; // Wall outlines
                break;
            } //esac
            // Path-drawing settings
            let lineOpts = {
                fill: "transparent",
                lineStyle: "dashed",
                opacity:       0.25,
                stroke:       color,
                strokeWidth:   0.15,
            }; //struct
            // Draw the creep's path
            new RoomVisual(creep.room.name).poly(Room.deserializePath(creep.memory.path), lineOpts);
            // HACK:  Reset the paths of tired creeps
            if(code
            &&(code === ERR_NOT_FOUND
//          || code === ERR_TIRED
            )) {
                creep.memory.path = undefined;
            } //fi
            return code;
        } else return ERR_INVALID_TARGET;
    }, //function

    // Say
    // =========================================================================
    /** Spawns text above the given object, similarly to creep.say().
     * @param  text   The text to display.
     * @param  object The thing that will display the text.
     * @return OK, ERR_INVALID_ARGS
    **/
    say: function (text, object) {
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
     * @param  pos   The position to use.
     * @param  rooms The array to sort.
     * @return the sorted array.
    **/
    sortRooms: function (pos, rooms) {
        let roomsTmp = Array();
        for(let i = 0; 0 < rooms.length; i++) {
            // Find the nearest room that hasn't been found yet.
            roomsTmp.push(Game.rooms[pos.findClosestByRange(FIND_EXIT, {filter: (room) => function(room) {return rooms.indexOf(room) !== -1;}}).roomName]);
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

    // Wander
    // =========================================================================
    /** Makes the given creep wander around its room at random.
     * @param  creep The creep to control.
     ( @return OK
    **/
    wander: function (creep) {
        if(creep.pos.x <  3
        || creep.pos.x > 46
        || creep.pos.y <  3
        || creep.pos.y > 46
        ){ creep.moveTo(24, 24);
        } else {
            let direction = Math.round(Math.random() * 8);
            if(direction) {
                creep.move(direction);
            } //fi
        } //fi
        return OK;
    }, //function
}; //struct

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = LIB_COMMON;
