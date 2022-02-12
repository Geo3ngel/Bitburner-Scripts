/**
 * TODO: Make this the ultimate controll script!
 * The goal of this script is to basically be a glorified events manager.
 * [] Then the hackEventCoordinator should manage how we stagger out weaken, grow, and hack commands, 
 * and what vulnerable servers run how many of the threads for each distributed attack!
 * 
 * The contractSolver will ideally automatically solve contracts, and noify me of their completion, so I can choose rep or $$$.
 * - possibly allow myself to assign which company to build rep for, if this is even automatable.
 * [] MVP for now is just identifying which servers have cct files and notifying me.
 * 		- Might be able to run them with a script? Needs further research.
 * 
 * Should map out programs that need stop/start from this script w/ their RAM usage, so we know how much we need to
 * reserve for their respective server! (I.E. autoNode on home takes up X ram, so when we calculate how much to 
 * use for threading, we take that reserved amount into account and avoid using it)
 * - More along this vein, I could very well do ram calcs ahead of time and pass them on as args to other scripts to avoid
 *   eating up unnecessary RAM. [OPTIMIZATION] 
 * - Or try to keep track of this via ports... (Seems messy)
 * 
 * // Would be nice if we had a list of known servers we need to backdoor for FACTIONS, so it would give a toast notification!
 */
import PriorityQueue from "lib/PriorityQueue.js";
import ServerNode from "lib/ServerNode.js";
import {
	PAUSE, UNPAUSE, KILL,
	AUTO_NODE_INBOUND_PORT,
	CONTROL_INBOUND_PORT,
	HOME,
	WEAKEN, GROW, HACK
} from "lib/customConstants.js";
import {
	weakenTime, growTime, hackTime,
	growPercent, hackPercent
} from "lib/formulasHackingFacade.js";

// import Bucket from "lib/Bucket.js";
var player;
var serverMap;
var controlCycle;
// Servers to check through for value/hacking list
var vulnerableServers; // List of servers that have already been cracked (Possibly not hackable yet)
var serversToExploit;
var hackableServers;
var notHackableServers;
var topTargets;
var exploits;
// For traversal
let queuedServers;
let traversedServers;

// Function labels for control cycle
const EXPLOIT_CHECK = 0;
const LVL_UP_CHECK = 1;
const PRIME_ATTACK = 2;

// Timers
var lastAvailableExploitsCheck;

//Player stats to listen to
var hackingLvl;
var ns2;

async function init(ns) {
	ns2 = ns;
	player = ns.getPlayer();
	// If need be, could make an "Event" wrapper class that is the function, 
	// UUID(name, effectively), and other useful vars for ordering.

	// High level functions for the main control loop!
	// Can be inserted & removed as deemed necessary!

	controlCycle = new Map();
	controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });
	controlCycle.set(LVL_UP_CHECK, function (ns) { levelUpCheck(ns) });
	// controlCycle.set(EVALUATE_TARGETS, function (ns) { primeHackableServers(ns) });
	controlCycle.set(PRIME_ATTACK, function (ns) { multiStaggeredHack(ns) });
	// controlCycle.set() //Idk, X_PORT_LISTEN maybe? (I.E. for Node, when that is useful...)
	// Additional EventQueue?
	serverMap = new Map();
	vulnerableServers = [HOME];
	serversToExploit = new PriorityQueue(); // Prioritized by # of exploits required
	exploits = 0;

	hackableServers = [];
	notHackableServers = new PriorityQueue(); // Prioritized by min hacking level required

	topTargets = []

	queuedServers = []
	traversedServers = [HOME]
	lastAvailableExploitsCheck = 0;
	hackingLvl = 1;
}

export async function main(ns) {
	init(ns);
	countExploits(ns);

	// Traversal should generate a list of all servers, ideally seperating them into hackable/notHackable
	// Evaluating Servers & Cracking them!
	traverseServers(ns);
	ns.print(`Servers: ${vulnerableServers}`)
	// await ns.sleep(10000)
	ns.exec("infect.js", HOME, 1);

	let running = true;
	while (running) {
		for (let [key, value] of controlCycle.entries()) {
			// ns.print(`Key: ${key}, ${controlCycle.size}`)
			value(ns);
		}
		// ns.print(`HACKACLE servers: ${hackableServers}`);
		await ns.sleep(1000);
	}

	await ns.sleep(10000)
}

// INITIAL traversal of ALL servers, to split them up into catagories for future processing!
// Evaluating Servers & Cracking them!
async function traverseServers(ns) {
	// Run the initial scan
	queuedServers = ns.scan();
	// ns.print(`Initial servers:${queuedServers}`)
	let server;
	while (queuedServers.length > 0) {
		server = queuedServers.shift();
		traversedServers.push(server);
		// ns.print(`Traversing server: ${server}`)

		processServer(ns, server)
	}
}

async function levelUpCheck(ns) {
	ns.print("Entered Level Up Check")
	if (ns.getHackingLevel() !== hackingLvl) {
		hackingLvl = ns.getHackingLevel();
		// Checks if there are no un-hackable servers remaining, will remove this from controlCycle
		if (notHackableServers.length < 1) {
			controlCycle.delete(LVL_UP_CHECK);
			return;
		}

		// Servers that are now hackable will be moved onto the hackable stack/list
		let server;
		while (serverMap[notHackableServers[0]].getReqHackLvl() <= hackingLvl) {
			server = notHackableServers.shift();
			hackableServers.push(server);

		}
		// sort after adding
		sortHackableServers(ns);
	}
}

async function multiStaggeredHack(ns) {
	// Determines which vulnerable servers are best to hack for $$$
	profileTargets(ns);
	ns.print(`Entering Stagger Attack: ${hackableServers}`);
	let topN = 5; // Maybe tweak this value later
	for (let i = 0; i < topN; i++) {
		let server = hackableServers[i]
		ns.print(`Checking: ${i}, ${server}`)
		if (isPrimed(ns, server)) {
			attackTarget(ns, server);
		} else {
			primeServer(ns, server);
		}
	}
}

export async function countExploits(ns) {
	let changed = false;
	if (ns.fileExists("BruteSSH.exe")) {
		exploits++;
		changed = true;
	}
	if (ns.fileExists("FTPCrack.exe")) {
		exploits++;
		changed = true;
	}
	if (ns.fileExists("HTTPWorm.exe")) {
		exploits++;
		changed = true;
	}
	if (ns.fileExists("relaySMTP.exe")) {
		exploits++;
		changed = true;
	}
	if (ns.fileExists("SQLInject.exe")) {
		exploits++;
		changed = true;
	}
	lastAvailableExploitsCheck = getTime();
	return changed;
}

async function exploitCheck(ns) {
	ns.print("Entered Exploit Check")
	if (exploits < 5 && (getTime() - lastAvailableExploitsCheck) > 10) {
		let changed = countExploits(ns);
		if (changed) {
			crackExploitableServers(ns);
		}
	} else if (exploits === 5) {
		controlCycle.delete(EXPLOIT_CHECK);
		ns.print("Canceling Exploit Check Task")
	}
}

async function crackExploitableServers(ns) {
	let server;
	while (exploits >= serversToExploit.front().getExploitsReq()) {
		server = serversToExploit.dequeue();
		crackServer(ns, server.getName(), server.getExploitsReq);
		vulnerableServers.push(server);
		serverMap[server].setExploited();
	}
	sortVulnerableServersByFreeRam(ns);
}

async function crackServer(ns, server, reqPorts) {
	switch (reqPorts) {
		case 5:
			ns.sqlinject(server)
		case 4:
			ns.httpworm(server)
		case 3:
			ns.relaysmtp(server)
		case 2:
			ns.ftpcrack(server)
		case 1:
			ns.brutessh(server)
		default:
			ns.nuke(server)
	}
}

// Used for initial traversal
export async function processServer(ns, server) {
	ns.print(`Processing Server: ${server}`)
	let exploited = ns.hasRootAccess(server);
	if (!exploited) {
		let reqPorts = ns.getServerNumPortsRequired(server);
		// Attempt to crack
		if (reqPorts <= exploits) {
			crackServer(ns, server, reqPorts);
		} else {
			ns.print(`Can't crack ${server} yet.`);
			serversToExploit.enqueue(server, reqPorts);
		}
	}

	// Add to vulnerable server list
	exploited = ns.hasRootAccess(server);
	if (exploited) {
		vulnerableServers.push(server);
	}
	// Continues with the traversal
	let subServers = ns.scan(server)
	for (let index = 0; index < subServers.length; index++) {
		let subServer = subServers[index];
		if (!traversedServers.includes(subServer) && !queuedServers.includes(subServer)) {
			queuedServers.push(subServer)
		}
	}
	ns.print(`${server}'s subservers: ${subServers}`)

	// Split into hackable/notHackable groupings
	let hackLvlReq = ns.getServerRequiredHackingLevel(server);
	let maxRam = ns.getServerMaxRam(server);
	isHackable(ns, server);
	let traversed = true;
	// TODO: hasCCT check?
	let hasCCT = false;
	// Add server to map w/ it's relevant info stored in a ServerNode for later ease of access.
	map.set(server, new ServerNode(server, reqPorts, hackLvlReq, exploited, maxRam, traversed, hasCCT, subServers));
}

async function isHackable(ns, server) {
	let reqHackingLvl = ns.getServerRequiredHackingLevel(server);
	if (ns.getHackingLevel() >= reqHackingLvl) {
		hackableServers.push(server);
		return true;
	} else {
		notHackableServers.enqueue(server, reqHackingLvl);
	}
	return false;
}

export async function profileTargets(ns) {
	// TODO: What we REALLY want this function to do is SORT targets by value!
	// topTargets should no longer exist once this is accomplished!
	// Q1. How to establish server value
	// Q2. How to initially sort, and then maintain the sorted list?
	// - Probably with a datastructure capable of storing &
	//	 sorting ServerNodes with it's own evaluation & comparison function

	sortHackableServers(ns);
	// Once sorted, we want to allocate the right order & correct amount of threads distributed accross servers.
	// Then, once we have enough allocated to doing those three things (perhaps with a 2nd layer to buffer)
	// we can move on to the next highest valued server to do the same thing, and so on...
	// - To avoid having to re-allocate, we would be listening via ports for when they complete, so we know when we need to launch new tasks.
	//  - OR scheduling them such that they are back to back always (second layer)
}

function sortHackableServers(ns) {
	// TODO: Multiply time by needed threads to get from current price to max!
	/**
	 * let _server = ns.getServer(server);
	let cores = ns.getServer(HOME).cpuCores;
	let neededGrowthPercent = ns.getServerMaxMoney(server) / ns.getServerMoneyAvailable(server);
	let maxGrowThreads = Math.ceil(neededGrowthPercent/growPercent(_server, 1, player, cores));
	// var maxGrowThreads = ((maxRam / ns.getScriptRam(GROW)) - (ns.getScriptRam(WEAKEN) * 2000));
	var weakenThreads = ((ns.getServerSecurityLevel - ns.getServerMinSecurityLevel) + (maxGrowThreads*0.004)) / 0.05
	 */
	hackableServers.sort(function (a, b) {
		// Determines which server has a higher value based on amount possible to earn per second. ($/rate)
		let serverA = ns.getServer(a);
		let serverB = ns.getServer(b);

		// Make sure to cap out hackPercent at 50% [Should probably use a Math.func]
		let hackValueA = hackPercent(serverA, player) * ns.getServerMaxMoney(a);
		let timeA = weakenTime(serverA, player) + growTime(serverA, player) + hackTime(serverA, player);
		let hackValueB = hackPercent(serverB, player) * ns.getServerMaxMoney(b);
		let timeB = weakenTime(serverB, player) + growTime(serverB, player) + hackTime(serverB, player);

		let serverAValue = hackValueA / timeA;
		let serverBValue = hackValueB / timeB;
		return serverAValue < serverBValue ? 1 : serverAValue > serverBValue ? -1 : 0;
	});
}

function isPrimed(ns, server) {
	let availalbeMoney = ns.getServerMoneyAvailable(server);
	let maxMoney = ns.getServerMaxMoney(server);
	let securityLvl = ns.getServerSecurityLevel(server);
	let minSecurity = ns.getServerMinSecurityLevel(server);
	return (availalbeMoney >= maxMoney) && (securityLvl <= minSecurity);
}

// Could also use ports to ensure things are synced up via comm channels, but not sure if that would add to RAM usage..
// It does not! Wow. I'll totally just do that then, that seems way easier than guessing timings!
// Say port 1 is for weaken comms, 2 is for growth, and 3 is for hacking!
async function primeServer(ns, server) {
	/**
	 * PRIMING server.
	 * Growing to max, and weakening to min
	 */
	ns.print(`PRIMING ${server}`);
	let _server = ns.getServer(server);
	let cores = ns.getServer(HOME).cpuCores;
	let neededGrowthPercent = ns.getServerMaxMoney(server) / ns.getServerMoneyAvailable(server);
	let maxGrowThreads = Math.ceil(neededGrowthPercent / growPercent(_server, 1, player, cores));
	// var maxGrowThreads = ((maxRam / ns.getScriptRam(GROW)) - (ns.getScriptRam(WEAKEN) * 2000));
	var weakenThreads = ((ns.getServerSecurityLevel - ns.getServerMinSecurityLevel) + (maxGrowThreads * 0.004)) / 0.05

	let minSecurity = ns.getServerMinSecurityLevel(server);
	let securityLvl = ns.getServerSecurityLevel(server);
	if (securityLvl > minSecurity) {
		distributeAttackLoad(ns, server, WEAKEN, weakenThreads, 100);
	}

	let maxMoney = ns.getServerMaxMoney(server);
	let availalbeMoney = ns.getServerMoneyAvailable(server);
	if (availalbeMoney < maxMoney) {
		// Grow money
		distributeAttackLoad(ns, server, GROW, maxGrowThreads, 50);
	}
	/**
	 * Server is PRIMED
	 */
}

async function attackTarget(ns, server) {
	let _server = ns.getServer(server);
	// Should give the amount of threads needed to grow by 200%
	var growThreads = Math.ceil(((5 / (growPercent(_server, 1, player, 1) - 1))));
	// Should use this amount once determined to split growth across bucket servers
	var hackThreads = threadsToHackPercent(_server, 50);  //Getting the amount of threads I need to hack 50% of the funds
	// TODO: Double check this calculation. It looks horrendously wrong
	var weakenThreads = (2000 - ((ns.getServerMinSecurityLevel(server)) / 0.05));
	weakenThreads = Math.ceil((weakenThreads - (growThreads * 0.004))); //Getting required threads to fully weaken the server

	ns.print(`ATTACKING: ${server} w/ ${hackThreads} hack threads`)
	distributeAttackLoad(ns, server, HACK, hackThreads, 0);
	distributeAttackLoad(ns, server, GROW, growThreads, 50);
	distributeAttackLoad(ns, server, WEAKEN, weakenThreads, 100);
}

function distributeAttackLoad(ns, targetServer, script, totalThreads, delay) { // Consider doing delays by time stamp?
	let scriptRam = ns.getScriptRam(script);
	let host;
	let ram;
	let threads;
	ns.print(`Distributed ${script} attack for ${targetServer}`)
	// Sorted list of vulnerable servers by available free RAM
	// sortVulnerableServersByFreeRam(ns);
	for (let i = 0; i < vulnerableServers.length; i++) {
		// figure out how many threads we can run of our script on the given server
		host = vulnerableServers[i];
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
			ns.exec(script, host, threads, targetServer, delay);
		}
		if (totalThreads <= 0) {
			ns.print(`Distributed ${script} attack for ${targetServer} to: ${host}: COMPETED ALL THREADS! ${totalThreads}`)
			return; // Done distributing the attack load!
		} else {
			ns.print(`Distributed ${script} attack threads remaining: ${totalThreads}`)
		}
	}
}

async function sortVulnerableServersByFreeRam(ns) {
	vulnerableServers.sort(function (a, b) {
		let serverAFreeRam = ns.getServerMaxRam(a) - ns.getServerUsedRam(a);
		let serverBFreeRam = ns.getServerMaxRam(b) - ns.getServerUsedRam(b);
		return serverAFreeRam < serverBFreeRam ? 1 : serverAFreeRam > serverBFreeRam ? -1 : 0;
	});
}

// Returns the amount of threads needed to hack X% of a server's money. (Enter percent as int)
function threadsToHackPercent(server, percent) {
	return Math.floor(percent / (hackPercent(server, player) * 100));
}
// Returns time in seconds!
async function getTime() {
	return Date.now() / 1000;
}