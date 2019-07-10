MilesBHuff's Screeps ToDo List
################################################################################

Meta
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Migrate to eslint from jshint

General
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Creeps should each have a home room in memory.  This is the room to which they
  will bring resources.  With this, colonization should become as simple as
  setting a creep's home room.  This should also make it possible for rooms to
  mine neighbouring maps.
+ Allow setting a colonization target in the memory of a room, so that I won't
  have to do it manually anymore.
+ DEFINES.wander() should avoid swamps and paths wherever possible, and should
  not position a creep adjacent to a source.
+ Creep pathfinding should treat roads identically to plains if the creep is
  50% MOVE parts, and swamps identically to roads if the creep has 80% MOVE parts.
+ Toy with the idea of renewing boosted creeps.
+ Figure out how to get creeps of all types to bolster neighbouring owned maps.
+ Cheap scout creeps should be sent to neighbouring unowned maps in order to get
  vision on them.  They should not enter hostile rooms.
+ Cache all duplicate `find` operations to save CPU.
+ Claimers should have a much-more robust AI.

Buildings
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Only the nearest towers should repair things -- we shouldn't have all towers
  repairing all things.  The only exception should be walls and ramparts, which
  should be repaired by all towers, but which should only receive repairs if
  there are hostiles in the room.
+ Equalize the contents of all terminals.  Empty any terminals that are marked
  for deconstruction.

Workers
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
+ Add support for mineral extraction.
+ Get rid of the harvest variable.  Instead, simply have creeps harvest whenever
  they have no energy.  If they have energy when they have no target, their
  target should always be an energy-expending task.
+ Structures should generally pass isActive() in order to be valid targets.
+ Increase the priority of spawns in brand-new rooms.

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
+ Watch nearby rooms for enemy presence.  If any nearby rooms experience a flux
  in enemy combat creeps, increase production of combat creeps.  Don't consider
  owned enemy rooms, though, since these will always have some combat creeps
  for defence, and we don't want to risk an endless production loop if they're
  doing the same kind of thing.
