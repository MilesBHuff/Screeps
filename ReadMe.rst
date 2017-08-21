Screeps
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

About
================================================================================
| My current Screeps scripts.
| Screeps is an MMO for programmers;  it's played entirely in JavaScript.

Goals
================================================================================
| My scripts primarily focus on giving the creeps themselves a sensible AI.
  I also focus on simplifying production.  For example, I use a single "worker"
  creep, that combines the functions of the traditional harvester, builder, and
  upgrader.  This not only makes it harder to stop production altogether (as
  every single worker would need to be killed, rather than just the harvesters),
  but also allows for a more even distribution of labour, by using each worker
  wherever needed, instead of limiting each one to a specific task.
  Likewise, where the military is concerned, I have chosen to only use ranged
  attacks;  so only a single role is needed.  The only other two roles I'm using
  are healers and "claimers", the latter of which is only summoned on-demand,
  and claims the room specified in its spawn call.
| Generally speaking, I leave construction site placement up to the player, as
  while some aspects of it are algorithmic, most take true intelligence to do
  right.  Plus, it's fun manually laying out a fort.

Copyright
================================================================================
+ Code is licensed under the Third Lesser GNU Public License (LGPL3) license.
+ Non-code is licensed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-
  SA 4).
+ Everything is Copyright (C) 2017 by Miles Bradley Huff.
