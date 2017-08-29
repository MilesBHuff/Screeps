MilesBHuff's Screeps ToDo List
################################################################################

General
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ DEFINES.wander() should wander only on paths.
+ Toy with the idea of renewing creeps.
+ Figure out how to get creeps to bolster neighbouring owned maps.
+ Cheap scout creeps should be sent to neighbouring unowned maps in order to get
  vision on them.  They should not enter hostile rooms.
+ Consider caching all find operations.

Workers
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Figure out how to get creeps to mine on bordering maps.
+ Get creeps to efficiently use links etc.  (Possibly designate one as the
  deposit box in the room's memory)
+ Fix the script.  It shouldn't be looping infinitely, and it should gracefully
  fall back to other courses of action when the first-guessed one fails.
+ Workers should never be adjacent to a source when not harvesting.

Combat
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ The standing army should probably be equivalent to the number of ramparts in
  the room.
+ Run to the nearest healer or tower on the current map whenever there're no
  more attack/work/carry/claim/heal parts.
+ Allow manually setting an "invasion" target in the memory of a room;  this
  target will be a hostile room.  While it is set, military creeps spawn at
  elevated levels, and are all directed to the target map before looking for
  enemies.
