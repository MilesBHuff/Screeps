// commands.js
// #############################################################################
/** This file lists various prewritten commands for manual use at the console.
**/

if(false) {
	// Mark the specified structure for demolition
	Game.rooms["Room ID"].memory.dismantle.push("Structure ID");
	// Set a sign on the specified controller with the specified creep
	Game.getObjectById("Creep ID").signController(Game.getObjectById("Controller ID"), "GitHub.com/MilesBHuff/Screeps");
	// Move the specified creep towards coordinates
	Game.getObjectById("Creep ID").moveTo(x, y);
	// Spawn a creep at the specified spawn
}
