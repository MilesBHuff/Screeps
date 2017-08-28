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
	Game.spawns["Spawn Name"].createCreep([PARTS], "Creep Name", {role: role});
	// Remove all construction sites
	for(var name in Game.constructionSites) {Game.constructionSites[name].remove();}
	// Check the exact progress of a controller
	var controller = Game.getObjectById("Controller ID"); console.log(controller.progress + " / " + controller.progressTotal);
}
