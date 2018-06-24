// role.manual.js
// #############################################################################
/** This script is designed to streamline manual control of creeps.
**/
"use strict";

// Variables
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
const DEFINES = require("defines");
let roleManual = {

    // Main
    // *****************************************************************************
    /** This function controls the provided creep.
     * @param creep The creep to control.
    **/
    run: function (creep) {

        // Move to the provided destination, if there is one.
        // =============================================================================
        if(creep.memory && creep.memory.target) {
                DEFINES.move(creep, COLOR_BLUE, false);
        } //fi
    }, //run
}; //roleManual

// Export this file for use in others.
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
module.exports = roleManual;
