////////////////////////////////////////////////////////////////////////////////
/** This file contains constant variables and functions that are used across
 *  multiple files.
**/
module.exports = class MoveLib implements Lib {

    ////////////////////////////////////////////////////////////////////////////////
    /** Calculates a path for the creep to get to its target, and moves it.  If
     *  the creep is unable to move, recalculate its path.  If no path can be
     *  found, reset its target.  Also displays the creep's path on the map.
     * @param  creep The creep to move.
     * @param  color The colour for the creep's path.
     * @param  cache Whether to use the path cached in the creep's memory.
     * @return an exit code.
    **/
    public static readonly move = (
        creep: Creep,
        color: ColorConstant,
        cache: boolean,
    ): OK|ERR_NOT_OWNER|ERR_NO_PATH|ERR_BUSY|ERR_NOT_FOUND|ERR_INVALID_TARGET|ERR_INVALID_ARGS|ERR_TIRED|ERR_NO_BODYPART => {

        // Verify arguments
        if(!creep?.name
        || !Game.creeps[creep.name]
        || color === undefined
        || cache === undefined
        ) return ERR_INVALID_ARGS;

        // If we aren't using cached paths, clear any cached path.
        if(!cache) delete creep.memory.path;

        if(creep.memory && creep.memory.target) {
            let target = Game.getObjectById(creep.memory.target) as any;
            if(!target) {
                delete creep.memory.target;
                return ERR_INVALID_TARGET;
            }

            // If the creep's position is equal to the target's position, delete the path and return.
            if(creep.pos === target.pos) {
                delete creep.memory.path;
                return OK;
            }

            // If the target is in a different room, find the nearest exit to that room
            if(creep.room.name !== target.room.name) {
                //TODO:  Check to see if the stated exit is even accessible.
                // target = creep.pos.findClosestByRange(creep.room.find(creep.room.findExitTo(target.room))); //TODO:  There's no way this works.
            }

            // If the creep has no path, create one.  If there is no possible path, reset the creep's target and return.
            if(!creep.memory.path) {
                // Configure the pathfinder
                const pathOpts = {
                    ignoreCreeps: false,
                    ignoreDestructibleStructures: false,
                    ignoreRoads:  false,
                    maxOps:        1000,
                    maxRooms:         4,
                    serialize:    false,
                };

                // Find a path
                const path = creep.pos.findPathTo(target, pathOpts);

                /* Check to see if the final node node of the path is the
                * target.  The pathfinder returns the best possible path,
                * even if that path doesn't actually reach the target.
                * Good paths always have the target as their final node.
                * There's no need to check this if we're not using cached
                * paths.
                */
                //TODO:  Validate paths that go to other rooms.
                let validPath = false;
                if(path.length) {
                    if(cache && target.room === creep.room) {
                        for(let x = -1; x <= 1; x++) {
                            for(let y = -1; y <= 1; y++) {
                                const pos = new RoomPosition(
                                    target.pos.x + x,
                                    target.pos.y + y,
                                    target.pos.roomName,
                                );
                                if (pos.x === path[path.length - 1].x
                                &&  pos.y === path[path.length - 1].y
                                ) { validPath = true; }
                            } //done
                        } //done
                    } else {
                        validPath = true;
                    } //fi
                } //fi

                // If the path is invalid, then the target cannot be reached.  Find a new target.
                if(!validPath) {
                    // delete creep.memory.target;
                    delete creep.memory.path;
                    return ERR_NO_PATH;
                }
                // If the path is valid, serialize it and save it in memory.
                creep.memory.path = Room.serializePath(path);
            }

            // Try to move the creep to the new location.
            let code = creep.moveByPath(creep.memory.path); //NOTE:  The creep's location doesn't actually change until the next tick.
            if(code === ERR_NOT_OWNER) return code;

            // If the creep is tired, busy, or physically incapable of movement;  then we don't need to tick its path.
            if(code !== ERR_TIRED
            && code !== ERR_BUSY
            && code !== ERR_NO_BODYPART
            ) {

                // If movement failed, reset the path and return the error.
                if(code !== OK) {
                    delete creep.memory.path;
                    return code;
                } else {
                    const path = Room.deserializePath(creep.memory.path);

                    // If there's a creep in the way, recalculate the path
                    let lookCreep: Creep|undefined = new RoomPosition(path[1].x, path[1].y, creep.room.name).lookFor(LOOK_CREEPS)[0];
                    if(!_.isEqual(lookCreep, creep)) {
                        delete creep.memory.path;
                        return ERR_NOT_FOUND;
                    }

                    // Delete path elements that have already been traversed.
                    if(path[0]
                    && path[0].x === creep.pos.x
                    && path[0].y === creep.pos.y
                    )  path.shift();

                    // Set the new path
                    creep.memory.path = Room.serializePath(path);
                }
            }

            // Parse the given color
            let hex: string;
            switch(color) {
                case COLOR_RED:
//              hex = "#ED5557"; // Hostile glow
                hex = "#EA4034"; // Flags
                break;

                case COLOR_PURPLE:
//              hex = "#8F6F9F"; // Syntax-highlighting
                hex = "#9625A9"; // Flags
                break;

                case COLOR_BLUE:
//              hex = "#3F51B5"; // Selection color
                hex = "#2090E9"; // Flags
                break;

                case COLOR_CYAN:
//              hex = "#47A89F"; // GCL color
                hex = "#00B5CC"; // Flags
                break;

                case COLOR_GREEN:
//              hex = "#89B48D"; // Friendly glow
                hex = "#49A84D"; // Flags
                break;

                case COLOR_YELLOW:
//              hex = "#FFE56E"; // Energy
                hex = "#F5E239"; // Flags
                break;

                case COLOR_ORANGE:
//              hex = "#CA7731"; // Syntax-highlighting
                hex = "#F59200"; // Flags
                break;

                case COLOR_BROWN:
//              hex = "#262816"; // Swampland
                hex = "#745245"; // Flags
                break;

                case COLOR_GREY:
//              hex = "#626262"; // Roads
                hex = "#989898"; // Flags
                break;

                case COLOR_WHITE:
//              hex = "#BCBCBC"; // Icons
                hex = "#F5F5F5"; // Flags
                break;

                default: // COLOR_BLACK
//              hex = "#202020"; // Creep outlines
                hex = "#090909"; // Wall outlines
            }

            // Path-drawing settings
            const lineOpts: PolyStyle = {
                fill: "transparent",
                lineStyle: "dashed",
                opacity:       0.25,
                stroke:         hex,
                strokeWidth:   0.15,
            };

            // Draw the creep's path
            new RoomVisual(creep.room.name).poly(Room.deserializePath(creep.memory.path) as any, lineOpts); //TODO: Check typing
            return code;
        } else return ERR_INVALID_TARGET;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** Makes the given creep wander around its room at random.
     * @param  creep The creep to control.
     ( @return an exit code.
    **/
    public static readonly wander = (creep: Creep): OK => {
        if(creep.pos.x <  3
        || creep.pos.x > 46
        || creep.pos.y <  3
        || creep.pos.y > 46
        )    creep.moveTo(24, 24);
        else creep.move(Math.ceil(Math.random() * 8) as DirectionConstant);
        return OK;
    }
};
