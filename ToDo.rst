MilesBHuff's Screeps ToDo List
################################################################################

General
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ DEFINES.wander() should avoid swamps and paths wherever possible, and should
  not position a creep adjacent to a source.
+ Toy with the idea of renewing boosted creeps.
+ When counting the numbers of existing creeps, don't consider creeps with less
  than ??? ticks to live.
+ Figure out how to get creeps of all types to bolster neighbouring owned maps.
+ Cheap scout creeps should be sent to neighbouring unowned maps in order to get
  vision on them.  They should not enter hostile rooms.
+ Cache all duplicate find operations to save CPU.
+ Allow setting a colonization target in the memory of a room, so that I won't
  have to do it manually anymore (a very time-consuming process).
+ Store a tower tasklist in the memory of the room, so that only the nearest
  tower performs repairs, and so that multiple towers don't repair the same
  thing (unless that thing's a wall).
+ Equalize the contents of all links in each room.  Empty any links that are
  marked for deconstruction.
+ Equalize the contents of all terminals.  Empty any terminals that are marked
  for deconstruction.
+ If a non-tired creep didn't move last tick and the square to which it wants to
  move is blocked, recalculate its path.

Workers
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Add support for mineral extraction.
+ Get rid of the harvest variable.  Instead, simply have creeps harvest whenever
  they have no energy.  If they have energy when they have no target, their
  target should always be an energy-expending task.
+ Structures should generally pass isActive() in order to be valid targets.
+ Add a 50% chance of storing energy before upgrading a controller, if that
  controller is already at the maximal level.

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
