/** @param {NS} ns **/
/*
	TODO: Make this Virus intelligent!
    Leaving as simple brute for now, as it's good enough for base early game.
 */
export async function main(ns) {
	let targets = [ns.args[0], ns.args[1], ns.args[2], ns.args[3], ns.args[4]]
	while(targets.length > 0){
		for (let index = 0; index < targets.length; index++) {
			await ns.weaken(targets[index])
			await ns.grow(targets[index])
			await ns.hack(targets[index]);
		}
	}	
}