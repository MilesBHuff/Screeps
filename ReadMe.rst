Screeps
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
|CI Status| |LGTM Alerts|

.. |CI Status| image:: https://travis-ci.com/MilesBHuff/Screeps.svg?branch=master
    :target: https://travis-ci.com/MilesBHuff/Screeps
.. |LGTM Alerts| image:: https://img.shields.io/lgtm/alerts/g/MilesBHuff/Screeps.svg?logo=lgtm&logoWidth=18
   :target: https://lgtm.com/projects/g/MilesBHuff/Screeps/alerts/

|Project Quality| |JS Quality|

.. |Project Quality| image:: https://bestpractices.coreinfrastructure.org/projects/2525/badge
   :target: https://bestpractices.coreinfrastructure.org/projects/2525
.. |JS Quality| image:: https://img.shields.io/lgtm/grade/javascript/g/MilesBHuff/Screeps.svg?logo=lgtm&logoWidth=18
   :target: https://lgtm.com/projects/g/MilesBHuff/Screeps/context:javascript

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
  Likewise, where the military is concerned, I have merged fighters and healers,
  and focused on ranged attacks;  as such, each fighter is a fully self-
  contained unit.
| Generally speaking, I leave construction site placement up to the player, as
  while some aspects of it are algorithmic, most take true intelligence to do
  right.  Plus, it's fun manually laying out a fort.  I have included functions
  that allow the player to manually mark structures for dismantling, and that
  allow the player to take a snapshot of the structures currently present in the
  room -- this snapshot, which can be manually cleared, will then be used to
  ensure that any destroyed structures are automatically rebuilt.

Copyright
================================================================================
| (See ``/Copyright.txt`` for more info)
+ Code is licensed under the GNU Lesser Affero General Public License 3.0 (LAGPL 3).
+ Non-code is licensed under the Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4) license.
+ Everything is Copyright (C) 2017-2018 by Miles Bradley Huff.
