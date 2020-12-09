/** This script is designed to streamline manual control of creeps. */
module.exports = class ManualRole implements AI {

    ////////////////////////////////////////////////////////////////////////////////
    constructor(
        private readonly moveLib: any,
    ) {
        return this;
    }

    ////////////////////////////////////////////////////////////////////////////////
    public run(creep: Creep): void {

        // Move to the provided destination, if there is one.
        if(creep.memory?.target) {
            this.moveLib.move(creep, COLOR_BLUE, false);
        }
    }
};
