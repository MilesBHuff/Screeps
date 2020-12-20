////////////////////////////////////////////////////////////////////////////////
/** This file lists letious prewritten commands for manual use at the console.
 *  Make sure to include it before trying to use its functions!
**/
module.exports.commands = class Commands {

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly miscLib = require(`lib/misc.lib`),
        private readonly moveLib = require(`lib/move.lib`),
        private readonly spawnAI = require(`ai/structure/spawn.ai`),
    ) {
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().checkProgress("StructureID");
    /** Check the exact progress of a controller or construction site.  If the
     *  specified structure does not have a progress letiable, use its repair
     *  letiable.
     * @param  structureId
     * @return an exit code.
    **/
    public checkProgress(structureId: string): number {
        let message: string;
        const structure: any = Game.getObjectById(structureId);

        if(structure.progress && structure.progressTotal) {
            message = `${structure.progress} / ${structure.progressTotal}`;
        } else
        if(structure.hits && structure.hitsMax) {
            message = `${structure.hits} / ${structure.hitsMax}`;
        } else
            return ERR_INVALID_TARGET;

        return this.miscLib.say(structure, message);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().createCreep("SpawnName", "MANUAL");
    /** This function spawns a creep at the desired spawn, using the same
     *  creep-generation function as main().
     * @param  spawnName The name of the spawn to use
     * @param  roleName  The role to use, if any
     * @param  dryRun    Whether to do a dry run.
     * @return an exit code.
    **/
   public createCreep(
       spawnName: string,
       roleName: string,
       dryRun: boolean = false,
    ): number {
        return this.spawnAI.spawnCreep(
            Game.spawns[spawnName],
            this.miscLib.ROLES[roleName],
            dryRun,
        );
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().dismantle("StructureID");
    /** Marks the specified structure for demolition.
     * @param  structureId The ID of the structure to dismantle.
     * @return An exit code.
    **/
   public dismantle(structureId: string): number {
        const roomMemory = Game.structures[structureId].room.memory;
        if(roomMemory.dismantle === undefined) roomMemory.dismantle = [];
        return roomMemory.dismantle.push(structureId);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().moveCreepTo("CreepName", "TargetID");
    /** Order a creep to move to a particular target.
     * @param  creepName The name of the creep to use
     * @param  target    The ID of the target to move towards
     * @return an exit code.
    **/
    public moveCreepTo(
        creepName: string,
        targetId: string,
    ): number {
        Game.creeps[creepName].memory.target = targetId;
        return this.moveLib.move(Game.creeps[creepName], COLOR_GREY, false);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().removeConstruction();
    /** Remove all construction sites
     * @return an exit code.
    **/
    public removeConstruction(): number {
        for(const constructionSite of Object.values(Game.constructionSites)) {
            constructionSite.remove();
        }
        return OK;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // commands().signController("CreepName", "ControllerID", "Message");
    /** Signs the specified controller with the specified creep.
     * @param  creepName    The name of the creep to use
     * @param  controllerId The ID of the controller to sign
     * @param  message      The message to sign the controller with
    **/
   public signController(
       creepName: string,
       controllerId: string,
       message: string,
    ): number {
        return Game.creeps[creepName].signController(Game.structures[controllerId] as StructureController, message);
    }
};
