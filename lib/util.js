import {
    SERVER_LIST,
    HOME
} from "lib/customConstants.js";
import DeployingScript from "lib/deployingScript.js";

export default function randomValue() {
	return Math.floor(Math.random() * 100000);
}

// TODO: Consider adding a general logging utility for outputting to an error log to a specified directory!
// I.E. 
export function debug(script, server, msg, type){
	// save it to the /log directory under it's appropriate "type"
	// Type will use constants for things like: ERROR, PRINT_OUT, etc.
	// E.G. an error message from controllScript.js running on n00dles would look like:
	//	- /log/errors/n00dles_controllScript.js.log 
}

/**
 * [] Make distribute a util function if possible?
 * // - should continue attempting until a server is found with enough RAM!
 * 		- think of it as Queueing actions that each need to be completed before it can move onto the next!
 * [] Change this distribution function to use a Queueing mechanism?
 * [] OR: Have a function that HANDLES the attempts at distributing!
 * 	- Iterates through the func distributeScriptLoad w/ different parameters?
 * 	- Will need an obj to represent this data struct
 */

// function manageDistribution(ns){
// 	var distributionQueue = []
// 	let toDeploy = new DeployingScript()
// 	controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });

// 	// Will need to have a queue that manages the order...
// 	// 
// }

function distributeScriptLoad(ns, script, targetServer, totalThreads, delay) {
	let vulnerableServers = getAllServers(ns).filter(e => ns.hasRootAccess(e));
	let scriptRam = ns.getScriptRam(script);
	let host;
	let ram;
	let threads;
	ns.print(`Distributed ${script} attack for ${targetServer}`)
	for (let i = 0; i < vulnerableServers.length; i++) {
		// figure out how many threads we can run of our script on the given server
		host = vulnerableServers[i];
		// ns.print(`ATTEMPT distributing ${totalThreads} ${script} threads to" ${host} w/ ${delay} delay`)
		ram = ns.getServerRam(host);
		threads = Math.floor((ram[0] - ram[1]) / scriptRam);
		if (threads > 0) {
			// Subtract threads from totalThreads value!
			if (threads > totalThreads) {
				// Limit to only the needed amount!
				threads = totalThreads;
			}
			ns.print(`Distributing ${threads} threads to ${host}`)
			totalThreads -= threads;
			ns.exec(script, host, threads, targetServer, delay, randomValue());
		}
		if (totalThreads <= 0) {
			ns.print(`Distributed ${script} attack for ${targetServer} to: ${host}: COMPETED ALL THREADS! ${totalThreads}`)
			return; // Done distributing the attack load!
		}
		else {
			ns.print(`Distributed ${script} attack threads remaining: ${totalThreads}`)
		}
	}
	return totalThreads; // Returns remaining thread count to be distributed
}

// This already existed apparently lol.
// export function getPuchasedServers(ns){
// 	let purchasedServers = ns.scan(HOME);
// 	purchasedServers = purchasedServers.filter(e => !SERVER_LIST.includes(e));
// 	return purchasedServers;
// }

export function getAllServers(ns){
	var totalServerList = SERVER_LIST.concat(ns.getPuchasedServers());
	return totalServerList;
}