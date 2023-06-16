import {
	HOME,
	SERVER_BASE_GROWTH_RATE,
	SERVER_MAX_GROWTH_RATE,
	SERVER_LIST,
	HOME_RESERVED_RAM,
	PURCHASED_SERVER_LIST
} from "lib/customConstants.js";
import DeployingScript from "lib/deployingScript.js";


export default class Util {

}

export function disableLogs(ns) {
	ns.disableLog("ALL")
	// ns.disableLog("disableLog");
	// ns.disableLog("getServerMaxRam");
	// ns.disableLog("getServerUsedRam");
	// ns.disableLog("getServerMoneyAvailable");
	// ns.disableLog("getServerMaxMoney");
	// ns.disableLog("getServerSecurityLevel");
	// ns.disableLog("getServerMinSecurityLevel");
	// ns.disableLog("getServerNumPortsRequired");
	// ns.disableLog("getServerRequiredHackingLevel");
	// ns.disableLog("getHackingLevel");
	// ns.disableLog("exec");
	// ns.disableLog("scan");
	// ns.disableLog("sleep");
	// ns.disableLog("getServerGrowth");
}

export function randomValue() {
	return Math.floor(Math.random() * 100000);
}

export function getTimestamp() {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');

	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

	return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
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

/**
 * NEW WORLD ATTEMPT!!( Needs big rework! )
 */

// TODO: Need to move this behind some interface/make it read/writeable?
// var serverMap;
// var controlCycle;
// var serversToExploit;
// var hackableServers;
// var notHackableServers;
// var topTargets;
// var exploits;
// var vulnerableServers; // List of servers that have already been cracked (Possibly not hackable yet)
// async function init(ns) {
// 	baseDelay = 0;

// 	controlCycle = new Map();
// 	controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });
// 	controlCycle.set(LVL_UP_CHECK, function (ns) { levelUpCheck(ns) });
// 	// controlCycle.set(EVALUATE_TARGETS, function (ns) { primeHackableServers(ns) });
// 	controlCycle.set(PRIME_ATTACK, function (ns) { multiStaggeredHack(ns) });
// 	// controlCycle.set() //Idk, X_PORT_LISTEN maybe? (I.E. for Node, when that is useful...)
// 	// Additional EventQueue?
// 	serverMap = new Map();
// 	vulnerableServers = [HOME];
// 	serversToExploit = new PriorityQueue(); // Prioritized by # of exploits required
// 	exploits = 0;

// 	hackableServers = [];
// 	notHackableServers = new PriorityQueue(); // Prioritized by min hacking level required

// 	topTargets = []

// 	queuedServers = []
// 	traversedServers = [HOME]
// 	lastAvailableExploitsCheck = 0;
// 	hackingLvl = 1;
// }

// /**
//  * Checks how manny exploits we have...
//  * Will probably be replaced later on?
//  */
// async function exploitCheck(ns) {
// 	// ns.print("Entered Exploit Check")
// 	if (exploits < 5 && (getTime() - lastAvailableExploitsCheck) > 10) {
// 		let changed = countExploits(ns);
// 		if (changed) {
// 			crackExploitableServers(ns);
// 		}
// 	} else if (exploits === 5) {
// 		controlCycle.delete(EXPLOIT_CHECK);
// 		// ns.print("Canceling Exploit Check Task")
// 	}
// }

// // Builds up list of vulnerable servers
// async function crackExploitableServers(ns) {
// 	let server;
// 	while (exploits >= serversToExploit.front().getExploitsReq()) {
// 		server = serversToExploit.dequeue();
// 		crackServer(ns, server.getName(), server.getExploitsReq);
// 		vulnerableServers.push(server);
// 		serverMap[server].setExploited();
// 	}
// 	sortVulnerableServersByFreeRam(ns);
// }

// // TODO: Change this to be smarter based on what ports we have!
// async function crackServer(ns, server, reqPorts) {
// 	switch (reqPorts) {
// 		case 5:
// 			ns.sqlinject(server)
// 		case 4:
// 			ns.httpworm(server)
// 		case 3:
// 			ns.relaysmtp(server)
// 		case 2:
// 			ns.ftpcrack(server)
// 		case 1:
// 			ns.brutessh(server)
// 		default:
// 			ns.nuke(server)
// 	}
// }

// // OLD WORLD
// function distributeScriptLoad(ns, script, targetServer, totalThreads, delay) {
// 	let vulnerableServers = getAllServers(ns).filter(e => ns.hasRootAccess(e));
// 	let scriptRam = ns.getScriptRam(script);
// 	let host;
// 	let ram;
// 	let threads;
// 	ns.print(`Distributed ${script} attack for ${targetServer}`)
// 	for (let i = 0; i < vulnerableServers.length; i++) {
// 		// figure out how many threads we can run of our script on the given server
// 		host = vulnerableServers[i];
// 		// ns.print(`ATTEMPT distributing ${totalThreads} ${script} threads to" ${host} w/ ${delay} delay`)
// 		ram = ns.getServerRam(host);
// 		threads = Math.floor((ram[0] - ram[1]) / scriptRam);
// 		if (threads > 0) {
// 			// Subtract threads from totalThreads value!
// 			if (threads > totalThreads) {
// 				// Limit to only the needed amount!
// 				threads = totalThreads;
// 			}
// 			ns.print(`Distributing ${threads} threads to ${host}`)
// 			totalThreads -= threads;
// 			ns.exec(script, host, threads, targetServer, delay, randomValue());
// 		}
// 		if (totalThreads <= 0) {
// 			ns.print(`Distributed ${script} attack for ${targetServer} to: ${host}: COMPETED ALL THREADS! ${totalThreads}`)
// 			return; // Done distributing the attack load!
// 		}
// 		else {
// 			ns.print(`Distributed ${script} attack threads remaining: ${totalThreads}`)
// 		}
// 	}
// 	return totalThreads; // Returns remaining thread count to be distributed
// }

export function getAllServers(ns) {
	var totalServerList = SERVER_LIST.concat(ns.getPurchasedServers());
	return totalServerList;
}

export function arrayRemoveByValue(arr, value) {
	return arr.filter(function (ele) {
		return ele != value;
	});
}

export function arrayRemoveByIndex(arr, index) {
	return arr.filter(function (e, _index) {
		return index != _index;
	});
}

/**
 * ####################################################################################################
 * 		PORTS Utilities!
 * I'll likely be reserving ports for specific types of communication.
 * These values will be mapped in customConstants!
 * - Should take in the message to look for, and return the contents
 * - NOTE! Info in ports is wiped when game is closed! (It's just a queue in memory)
 * 		- Each port only holds 50 items. (Limited queue size!)
 * 
 * Do I want to make this a pub-sub kind of structure?
 * a script that reads a port for a given msg would be subbed
 * a script that writes to the port would be a pub...
 * - how to guerentee every sub gets the published message though before removal?
 * 		- I could just use a timer... i.e it's there for 10 seconds, then moves to the next step...
 * 			- that feels sloppy!
 * 
 * [] Need to account for the fact that ports don't automatically reset when installing augmentations!
 * 	- use this? JSON.stringify(data) to serialize & deserialize
 * ####################################################################################################
 */

/**
 * TODO: See if I can set a map to a port and just peek?
 */
export async function peekPort(ns, port) {
	// Do we need to read them all out and pop them back in? Or is there another way to read all the data?
	let portHandle = ns.getPortHandle(port);
	let data = await portHandle.peek();
	if (data === NULL_PORT_DATA) { return null; }
	else {
		ns.print(`Port ${port} data: ${data}`)
	}
	return data;
}

export async function readPort(ns, port) {
	let portHandle = ns.getPortHandle(port);
	let data = await portHandle.read();
	if (data === NULL_PORT_DATA) { return null; }
	return data;
}

/**
 * The msg should be a constant from customConstants for consistancy.
 * Data is the value we send via the port if any. I.E. a flag, or String.
 */
export async function writeToPort(ns, port, data) { // TODO: Try to do a msg in association w/ data?
	let portHandle = ns.getPortHandle(port);
	let wroteToPort = await portHandle.tryWrite(data);//portHandle.tryWrite(portNum, data)
	if (!wroteToPort) {
		// ns.print(`ERROR: failed to write to port ${port}`)
		return false;
	} else {
		// ns.print(`SUCCESS: Wrote "${data}" to port ${port}`)
	}
	return true;
}

export function resetPorts(ns) {
	// TODO: Account for ports not automatically reseting when installing augmentations!
	// We'll want to clear them with the exception of some reserved ports used for carrying
	// data across iterations

	// Clears all ports (for now, no exceptions!)
	for (let i = 1; i <= 20; i++) {
		ns.clearPort(i)
	}
}

/**
 * Some one else's way of getting around constraints lol:
 * 
 * You could write some wrappers that just saves an object to port 1, item 1, 
 * and then use that object as a map to basically have infinite ports. 
 * Read the object using peek, change it, then rewrite it. 
 * 
 * And you're also not limited to it being a queue then, read it anyway you want
 */
let traversedServers = []

/**
 * ###########################################################################################
 * 	Returns path from server A to the target server B.
 * 		Useful for Connecting to specific servers for running singularity functions
 * ###########################################################################################
 */
export async function connectTo(ns, target) {
	// DFS to find the server, keeping track of the parent server as a list.
	let server = ns.getHostname();
	traversedServers = [server]
	let path = await findServer(ns, server, target)

	if (path.length <= 1) {
		ns.print(`Couldn't find ${target}; ${path.length}`)
	} else {
		path.forEach(step => {
			ns.singularity.connect(step);
		})
	}
}

/**
 * ###########################################################################################
 * 	Returns path from server A to the target server B.
 * 		Useful for Connecting to specific servers for running singularity functions.
 * 		Recursivly DFS through all server nodes!
 * 		- Does need traversedServers to be cleared when being used for different purposes!
 * ###########################################################################################
 */
export async function findServer(ns, server, target) {
	// start at X server
	let path = [server]
	if (server === target) {
		return path;
	}

	let servers = await ns.scan(server);
	for (let i = 0; i < servers.length; i++) {
		if (traversedServers.includes(servers[i])) {
			continue;
		}
		traversedServers.push(servers[i])
		let pathway = await findServer(ns, servers[i], target)
		if (pathway.includes(target)) {
			// target has been found! Add it to the path
			return path.concat(pathway)
		}
	}
	return path;
}

// Used externally!
export function clearTraversedServers() {
	traversedServers = [];
}

/**
 * ###################################################################################################
 * ###################################################################################################
 * 		HACKING RELATED FUNCTIONS!!
 * ###################################################################################################
 * ###################################################################################################
 */

/**
 * This calculates the number of threads needed to grow a server from one $amount to a higher $amount
 */
export async function calcGrowthThreads(ns, targetServer, startMoney, targetMoney, cores = 1) {
	let server = ns.getServer(targetServer);

	// exponential base adjusted by security
	const adjGrowthRate = 1 + (SERVER_BASE_GROWTH_RATE - 1) / server.hackDifficulty;
	const exponentialBase = Math.min(adjGrowthRate, SERVER_MAX_GROWTH_RATE); // Cap growth rate

	const serverGrowthPercentage = ns.getServerGrowth(targetServer) / 100;
	const coreMultiplier = 1 + (cores - 1) / 16;
	let bitMult = ns.getBitNodeMultipliers();
	let playerMult = ns.getHackingMultipliers();
	let threadMultiplier = serverGrowthPercentage * playerMult.growth * coreMultiplier * bitMult.ServerGrowthRate;

	//### Gross math stuff. For explanation, see this reference: https://github.com/danielyxie/bitburner/blob/be42689697164bf99071c0bcf34baeef3d9b3ee8/src/Server/ServerHelpers.ts#L51
	const x = threadMultiplier * Math.log(exponentialBase);
	const y = startMoney * x + Math.log(targetMoney * x);

	let w;
	if (y < Math.log(2.5)) {
		const ey = Math.exp(y);
		w = (ey + (4 / 3) * ey * ey) / (1 + (7 / 3) * ey + (5 / 6) * ey * ey);
	} else {
		w = y;
		if (y > 0) w -= Math.log(y);
	}
	let cycles = w / x - startMoney;

	// ################################
	let bt = exponentialBase ** threadMultiplier;
	if (bt == Infinity) bt = 1e300;
	let corr = Infinity;
	// Two sided error because we do not want to get stuck if the error stays on the wrong side
	do {
		// c should be above 0 so Halley's method can't be used, we have to stick to Newton-Raphson
		let bct = bt ** cycles;
		if (bct == Infinity) bct = 1e300;
		const opc = startMoney + cycles;
		let diff = opc * bct - targetMoney;
		if (diff == Infinity) diff = 1e300;
		corr = diff / (opc * x + 1.0) / bct;
		cycles -= corr;
	} while (Math.abs(corr) >= 1);
	/* c is now within +/- 1 of the exact result.
	 * We want the ceiling of the exact result, so the floor if the approximation is above,
	 * the ceiling if the approximation is in the same unit as the exact result,
	 * and the ceiling + 1 if the approximation is below.
	 */
	const fca = Math.floor(cycles);
	if (targetMoney <= (startMoney + fca) * Math.pow(exponentialBase, fca * threadMultiplier)) {
		return fca;
	}
	const cca = Math.ceil(cycles);
	if (targetMoney <= (startMoney + cca) * Math.pow(exponentialBase, cca * threadMultiplier)) {
		return cca;
	}
	return cca + 1;
}

/**
 * ########################
 * 		Revamp/Redo?
 * 	- Could I move this into Util class if I passed in a list of vulnerable servers?
 * ########################
 * v1 New World version of distributeAttackLoad!
 * should ensure batch is evenly distributed! (Proportionally? or...?)
 * - Should ideally use a messaging system, but that might be a v2 rework. 
 */
export async function distributeLoad(ns, server, script, threads, delay, vulnerableServers, queued = false) {
	let scriptRam = ns.getScriptRam(script);
	let remainingThreads = threads;
	ns.print(`Distributing: ${script} Threads: ${remainingThreads} Targeting: ${server} Delay: ${delay}`);
	vulnerableServers.forEach(host => {
		let maxHostRam = ns.getServerMaxRam(host);
		let hostUsedRam = ns.getServerUsedRam(host);

		// ### Short circuits
		if (maxHostRam === 0 || remainingThreads < 1) {
			return;
		}

		// Reserves some running space for the home server to execute other scripts!
		if (host == HOME) {
			maxHostRam -= HOME_RESERVED_RAM;
		}
		let remainingRam = (maxHostRam - hostUsedRam);

		// ### Space Check
		let availableHostThreads = Math.floor(remainingRam / scriptRam);
		if (availableHostThreads >= 1) {
			if (availableHostThreads > remainingThreads) {
				availableHostThreads = remainingThreads;
				remainingThreads = 0;
			} else {
				remainingThreads -= availableHostThreads;
			}
			ns.exec(script, host, availableHostThreads, server, delay, randomValue());
		}
	})
}

export function isMyServer(server) {
	if (server === HOME || PURCHASED_SERVER_LIST.includes(server)) {
		return true;
	}
	return false;
}