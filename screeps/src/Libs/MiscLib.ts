////////////////////////////////////////////////////////////////////////////////
/** This file contains constant variables and functions that are used across multiple files. */
module.exports = class MiscLib implements Lib {

    ////////////////////////////////////////////////////////////////////////////////
    /** This color is missing from the global game defines. */
    public static readonly COLOR_BLACK = 0;
    /** This constant is missing from the global game defines. */
    public static readonly CONTROLLER_LEVEL_MAX = 8;
    /** This is the remaining repair amount at which you will receive an email about your controller degrading.
     *  3000 is when you get an email, and CREEP_LIFE_TIME is how long a normal creep lives.
    **/
    public static readonly CONTROLLER_NEAR_DEGRADE = 3000 + CREEP_LIFE_TIME;
    /** The maximum number of times to run a loop that would otherwise be while(true). */
    public static readonly LOOP_LIMIT = 12;
    /** This is the number of ticksToLive below which a creep is considered near-death. */
    public static readonly NEAR_DEATH = CREEP_SPAWN_TIME * MAX_CREEP_SIZE; // Set to the maximal amount of time it can take to spawn a creep.
    /** This is the base limit to which things should be repaired.  It should be multiplied by the room in-question's current control level. */
    public static readonly REPAIR_LIMIT = 62500;
    /** These are all the roles available for creeps */
    public static readonly ROLES = Object.freeze({
        "MANUAL":  -1,
        "WORKER":   0,
        "FIGHTER":  1,
        "CLAIMER":  2,
    });
    /** These are all the cannonical tasks that can be assigned to a creep */
    public static readonly TASKS = Object.freeze({
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
    });
    /** This is the controller level by which a room is expected to be "developed" -- ie, have enough roads to benefit from MOVE skewing. */
    public static readonly DEVELOPED_CTRL_LVL = 3;
    /** The player's username */
    public static readonly USERNAME = "MilesBHuff";

    ////////////////////////////////////////////////////////////////////////////////
    /** This function removes any element in badTargets from newTargets.
     * @param  newTargets The array whose IDs to check
     * @param  badTargets The array whose IDs to filter out
     * @return targets without badTargets.
    **/
   public static filterTargets(
       newTargets: any[],
       badTargets: any[],
    ): any[] {
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
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** This function uses the provided functions to find and perform work with
     *  the provided creep
     * @param  creep The creep to control
     * @param  look  The search
     * @param  act   The performance
     * @return an exit code.
    **/
    public static lookAndAct(
        creep: Creep,
        look: number,
        act: unknown,
    ): void {
        //TODO
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** This function finds and returns the given room and its neighbours.
     * @param  roomName The name of the room whose neighbours to find
     * @return the given room and its neighbours.
    **/
    public static findRooms(roomName: string): Room[] {

        // Push the creep's current room.
        const rooms: string[] = [roomName];

        // Find all the rooms connected to the current room.
        const roomExits = Game.map.describeExits(roomName);
        for(let edge = 0; edge < 4; edge++) {
            const index = String((2 * edge) + 1) as ExitKey;
            if(roomExits[index] !== undefined) { //@ts-ignore
                rooms.push(roomExits[index]);
            } //fi
        } //done

        // Convert the array of strings into an array of objects.  This also trims rooms that we can't see.
        const roomsFound: Room[] = [];
        for(let name in rooms) {
            let room = Game.rooms[rooms[name]];
            if(room) roomsFound.push(room);
        }

        // Return the array.
        return roomsFound;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** This function rolls the dice at the odds specified, and returns whether
     *  you won.
     * @param  odds The odds of winning, out of 1
     * @return whether you won.
    **/
    public static gamble(odds: number): boolean {
        return !Math.floor(Math.random() * (1 / odds));
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** This function kills off excess creeps.
    * @param creeps    The creeps to use
    * @param maxCreeps The number to cull to
    **/
    public static killOff(
        creeps: Creep[],
        maxCreeps: number,
    ): void {
        for(let i = 0; creeps.length > maxCreeps; i++) {
            creeps[i].suicide();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** Spawns text above the given object, similarly to creep.say().
     * @param  text   The text to display
     * @param  object The thing that will display the text
     * @return an exit code.
    **/
    public static say(
        text: string,
        object: Structure,
    ): OK|ERR_INVALID_ARGS {

        if(!text
        || !object?.room
        || !object?.pos
        ) {
            return ERR_INVALID_ARGS;
        } //fi

        new RoomVisual(object.room.name).text(
            text,
            object.pos.x,
            object.pos.y - 1, {
            backgroundColor:   "#CCC",
            backgroundPadding:  0.1,
            color:             "#111",
            font:              "bold 0.6 Arial",
        });

        return OK;
    }

    ////////////////////////////////////////////////////////////////////////////////
    /** This function sorts the given rooms by distance from the given position.
     * @param  pos   The position to use
     * @param  rooms The array to sort
     * @return the sorted array.
    **/
    public static sortRooms(
        pos: RoomPosition,
        rooms: Room[],
    ): Room[] {
        const roomsSorted: Room[] = [];
        while(0 < rooms.length) {

            // Find the nearest room that hasn't been found yet.
            const nearestExit = pos.findClosestByRange(FIND_EXIT, {
                filter: exit =>
                    _.some(rooms, roomArbitrary =>
                        _.isEqual(roomArbitrary, Game.rooms[exit.roomName])
            )});

            // If we didn't find anything, then there's no way to access the remaining rooms.  That means we're done, and can break.
            if(nearestExit === null) break;

            // Push the room with the nearest exit onto our sorted array
            roomsSorted.push(Game.rooms[nearestExit.roomName]);

            // Remove the room from the original array.
            for(let i = 0; i < rooms.length; i++) {
                if(_.isEqual(rooms[i], roomsSorted[i])) {
                    rooms.splice(i, 1);
                    break;
                }
            }
        }

        // Return the sorted array.
        return roomsSorted;
    }
};
