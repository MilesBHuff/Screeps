// lib.move.js
// #############################################################################
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const LIB_MOVE = {

    // Functions
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

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
    move: function(creep, color, cache) {
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
                /* Check to see if the final node node of the path is the
                * target.  The pathfinder returns the best possible path,
                * even if that path doesn't actually reach the target.
                * Good paths always have the target as their final node.
                * There's no need to check this if we're not using cached
                * paths.
                *TODO:  Validate paths that go to other rooms.
                */
                let validPath = false;
                if(path.length) {
                    if(cache && target.room === creep.room) {
                        for(let x = -1; x <= 1; x++) {
                            for(let y = -1; y <= 1; y++) {
                                let pos = new RoomPosition(target.pos.x + x,
                                                           target.pos.y + y,
                                                           target.pos.roomName);
                                if (pos.x === path[path.length - 1].x
                                &&  pos.y === path[path.length - 1].y
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
            ||(code !== ERR_TIRED
          //&& code !== ERR_NOT_FOUND
            )) {
                // If movement failed, reset the path and return an error.
                if(code && code !== OK) {
//                  creep.memory.target = undefined;
                    creep.memory.path   = undefined;
                    return code;
                } else {
                    let path = Room.deserializePath(creep.memory.path);
                    // If there's a creep in the way, recalculate the path
                    let lookCreep;
                    if(path.length >= 1 && path[1] && path[1].x && path[1].y) {
                        lookCreep = new RoomPosition(path[1].x, path[1].y, creep.room.name).lookFor(LOOK_CREEPS)[0];
                    } //fi
                    if(lookCreep && lookCreep !== creep) {
                        creep.memory.path = undefined;
                        return ERR_NOT_FOUND;
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
            return code;
        } else return ERR_INVALID_TARGET;
    }, //function

    // Wander
    // =========================================================================
    /** Makes the given creep wander around its room at random.
     * @param  creep The creep to control.
     ( @return OK
    **/
    wander: function(creep) {
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
module.exports = LIB_MOVE;
