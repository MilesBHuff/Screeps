interface CreepMemory {
    role?: CreepRole;
    target?: string;
}
enum CreepRole {
    manual  = -1,
    worker  =  0,
    fighter =  1,
    claimer =  2,
}
