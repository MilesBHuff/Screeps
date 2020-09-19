/** This script is designed to streamline claiming new controllers.    Target
 *    acquisition must still be done manually.
**/
module.exports = class ClaimerRole implements Role {

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly moveLib: any,
    ) {
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////
    public run(creep: Creep): void {
        let target: StructureController|null = null;

        // Check the creep's target
        if(creep.memory && creep.memory.target) {
            target = Game.getObjectById(creep.memory.target);
        }

        // If the target is not a controller or if it belongs to us, remove it.
        if(target) {
            if(target.structureType !== STRUCTURE_CONTROLLER || target.my) {
                target = null;
                creep.memory.target = undefined;
            } else {

                // Move to its target
                this.moveLib.move(creep, COLOR_BLUE, false);

                // Attempt to claim the target
                creep.claimController(target);

                // Attempt to sign the target
                creep.signController(target, "GitHub.com/MilesBHuff/Screeps");
            }

        // If no target, wander
        } else this.moveLib.wander(creep);
    }
};
