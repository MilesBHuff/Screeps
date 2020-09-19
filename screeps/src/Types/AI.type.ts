interface AI {

    /** This function controls the provided creep.
     * @param creep The creep to control
    **/
    run: (creep: Creep) => void;
}
