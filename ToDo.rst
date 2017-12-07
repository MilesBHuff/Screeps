MilesBHuff's Screeps ToDo List
################################################################################

General
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ DEFINES.wander() should avoid swamps and paths wherever possible, and should
  not position a creep adjacent to a source.
+ Toy with the idea of renewing creeps.
+ Figure out how to get creeps of all types to bolster neighbouring owned maps.
+ Cheap scout creeps should be sent to neighbouring unowned maps in order to get
  vision on them.  They should not enter hostile rooms.
+ Cache all duplicate find operations to save CPU.
+ Allow setting a colonization target in the memory of a room, so that I won't
  have to do it manually anymore (a very time-consuming process).
+ Store a tower tasklist in the memory of the room, so that only the nearest
  tower performs repairs, and so that multiple towers don't repair the same
  thing (unless that thing's a wall).

Workers
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Add support for mineral extraction.
+ Get creeps to efficiently use links etc.  (Consider designating certain links
  as withdrawls, and then transferring energy to those.)
+ Get rid of the harvest variable.  Instead, simply have creeps harvest whenever
  they have no energy.  If they have energy when they have no target, their
  target should always be an energy-expending task.
+ Structures should generally pass isActive() in order to be valid targets.

Combat
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ The standing army should probably be equivalent to the number of ramparts in
  the room, or 0 if all bordering rooms are owned.
+ Run to the nearest healer or tower on the current map whenever there're no
  more attack/work/carry/claim/heal parts.
+ Allow manually setting an "invasion" target in the memory of a room;  this
  target will be a hostile room.  While it is set, military creeps spawn at
  elevated levels, and are all directed to the target map before looking for
  enemies.
