////////////////////////////////////////////////////////////////////////////////
/** A class containing methods for controlling some element of the Screeps gameworld. */
interface AI {

    //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //  //
    /** This function controls the provided entity.
     * @param entity The entity to control
    **/
    run: (entity: any) => void;
}

////////////////////////////////////////////////////////////////////////////////
/** A utility class containing only static variables. */
interface Lib {}
