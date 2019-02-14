Screeps
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
|CI Status| |LGTM Alerts|

.. |CI Status| image:: https://travis-ci.com/MilesBHuff/Screeps.svg?branch=master
    :target: https://travis-ci.com/MilesBHuff/Screeps
.. |LGTM Alerts| image:: https://img.shields.io/lgtm/alerts/g/MilesBHuff/Screeps.svg
   :target: https://lgtm.com/projects/g/MilesBHuff/Screeps/alerts

|License| |Project Quality|

.. |License| image:: https://img.shields.io/badge/license-LAGPL3%C2%A0%2F%C2%A0CC%C2%A0BY%E2%80%91SA%C2%A04-lightgrey.svg
   :target: https://raw.githubusercontent.com/MilesBHuff/Screeps/master/Copyright.txt
.. |Project Quality| image:: https://bestpractices.coreinfrastructure.org/projects/2525/badge
   :target: https://bestpractices.coreinfrastructure.org/projects/2525

About
================================================================================

Description
--------------------------------------------------------------------------------
| Miles Huff's current Screeps scripts.
| Screeps is an MMO for programmers;  it's played entirely in JavaScript.

Copyright
--------------------------------------------------------------------------------
| (See ``/Copyright.txt`` for more info)
+ Code is licensed under the GNU Lesser Affero General Public License 3.0 (LAGPL 3).
+ Non-code is licensed under the Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4) license.
+ Everything is Copyright (C) 2017-2018 by Miles Bradley Huff.

Paradigms
================================================================================

Roles
--------------------------------------------------------------------------------
| My creep roles are geared towards flexibility, as this makes my colonies more
  robust.
| For example, I use a single "worker" creep that combines the
  functions of the traditional harvester, builder, and upgrader.  This not only
  makes it harder to stop production altogether (as every single worker would
  need to be killed, instead of just the harvesters), but also allows for a more
  even distribution of labour, by using each worker wherever needed, instead of
  limiting each one to a specific task.
| Likewise, where the military is concerned, each soldier is a fully
  self-contained unit, capable of both fighting and healing.  Ranged attacks are
  prioritized over melee attacks to allow for hit-and-run tactics and fighting
  behind a barrier.

Player mediation
--------------------------------------------------------------------------------
| Generally speaking, I leave construction site placement up to the player, as
  while some aspects of it are algorithmic, most take true intelligence to do
  right.  Plus, it's fun manually laying out a fort.  I have included functions
  that allow the player to manually mark structures for dismantling, and that
  one day will allow the player to take a snapshot of the structures currently
  present in the room -- this snapshot, which can be manually cleared, will then
  be used to ensure that any destroyed structures are automatically rebuilt.
| I also leave colony creation up to the player.
