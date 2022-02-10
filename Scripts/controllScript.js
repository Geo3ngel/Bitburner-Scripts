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

// Timers
var lastAvailableExploitsCheck;

//Player stats to listen to
var hackingLvl;

async function init(ns) {
	player = ns.getPlayer();
	// If need be, could make an "Event" wrapper class that is the function, 
	// UUID(name, effectively), and other useful vars for ordering.

	// High level functions for the main control loop!
	// Can be inserted & removed as deemed necessary!

	controlCycle = new Map();
	controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });
	controlCycle.set(LVL_UP_CHECK, function (ns) { levelUpCheck(ns) });
	// controlCycle.set() //Idk, X_PORT_LISTEN maybe? (I.E. for Node, when that is useful...)
	// Additional EventQueue?
	serverMap = new Map();
	vulnerableServers = [];
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

	let running = true;
	while (running) {
		for (let [key, value] of controlCycle.entries()) {
			// ns.print(`Key: ${key}, ${controlCycle.size}`)
			value(ns);
		}
		await ns.sleep(2500);
	}

	// Determines which vulnerable servers are best to hack for $$$
	profileTargets(ns);
	ns.print(`High profile targets selected: ${topTargets}`)
	// Initiates attacks on top targets on compromised servers
	attackTopTargets(ns);

	await ns.sleep(10000)
}

// INITIAL traversal of ALL servers, to split them up into catagories for future processing!
// Evaluating Servers & Cracking them!
async function traverseServers(ns) {
	// Run the initial scan
	queuedServers = ns.scan();
	ns.print(`Initial servers:${queuedServers}`)
	let server;
	while (queuedServers.length > 0) {
		server = queuedServers.shift();
		traversedServers.push(server);
		ns.print(`Traversing server: ${server}`)

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
		infectVulnerableServer(ns, server);
		vulnerableServers.push(server);
	}
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
	isHackable();
	let traversed = true;
	// TODO: hasCCT check?
	let hasCCT = false;
	// Add server to map w/ it's relevant info stored in a ServerNode for later ease of access.
	map.set(server, new ServerNode(server, reqPorts, hackLvlReq, exploited, maxRam, traversed, hasCCT, subServers));
}

async function isHackable(server) {
	let reqHackingLvl = ns.getServerRequiredHackingLevel(server);
	if (ns.getHackingLevel() >= reqHackingLvl) {
		hackableServers.push(server);
		return true;
	} else {
		notHackableServers.enqueue(server, reqHackingLvl);
	}
	return false;
}

// TODO: Completely revamp/replace this with Hacking event manager.
export async function infectVulnerableServers(ns) {
	// Scp virus script to servers
	for (let index = 0; index < vulnerableServers.length; index++) {
		let server = vulnerableServers[index];
		await ns.scp(VIRUS, server)
		ns.print(`Infected ${server} with Virus.`)
	}
	/*
		FUTURE FEATURES:
		- remote controll capability: kill other server's scripts to restart w/ new targets!
			- Will need to keep track of what scripts are running on which servers
		- determine high value targets!
		- deploy Virus (attack script) on all cracked servers to attack most valuable targets! (MVTs)
		- Use the maximum threads possible for attack script
	*/
}
async function infectVulnerableServer(ns, server) {
	await ns.scp(WEAKEN, server);
	await ns.scp(GROW, server);
	await ns.scp(HACK, server);
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

function sortHackableServers(ns){
	hackableServers.sort(function (a, b) {
		// Determines which server has a higher value based on amount possible to earn per second. ($/rate)
		let serverA = ns.getServer(a);
		let serverB = ns.getServer(b);

		let hackValueA = hackPercent(serverA, player) * getServerMaxMoney(serverA, player);
		let timeA = weakenTime(serverA, player) + growTime(serverA, player) + hackTime(serverA, player);
		let hackValueB = hackPercent(serverB, player) * getServerMaxMoney(serverB, player);
		let timeB = weakenTime(serverB, player) + growTime(serverB, player) + hackTime(serverB, player);

		let serverAValue = hackValueA / timeA;
		let serverBValue = hackValueB / timeB;
		return serverAValue > serverBValue ? 1 : serverAValue < serverBValue ? -1 : 0;
	});
}

export async function attackTopTargets(ns) {
	// Iterate through list of servers, Exec-ing the virus script w/ the top targets as input for arguments.
	// The tricky bit here will be determining max amount of threads to run the virus with
	// for (let index = 0; index < topTargets.length; index++) {
	let threadCost = ns.getScriptRam(VIRUS);
	let server;
	let maxRam;
	let maxThreadCount;
	ns.print(`Top Targets: ${topTargets}`)
	await ns.sleep(10000)
	for (let index = 0; index < vulnerableServers.length; index++) {
		// const maxThreads = Math.floor(maxRam / threadCost);
		server = vulnerableServers[index];
		ns.killall(server)
		maxRam = ns.getServerMaxRam(server);
		maxThreadCount = Math.floor(maxRam / threadCost);
		if (maxThreadCount <= 0) {
			ns.print(`NOT ENOUGH resources on server: _${server}_ to run virus.`)
		} else {
			switch (topTargets.length) {
				case 5:
					ns.exec(VIRUS, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
					break;
				case 3:
					ns.exec(VIRUS, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2]);
					break;
				default:
					ns.print(`Not enough topTagets: ${topTargets.length}`)
			}
		}
	}
	let homeThreadCount = Math.floor((ns.getServerMaxRam(HOME) - ns.getServerUsedRam(HOME)) / threadCost);
	// Start hacking script on home server too!

	switch (topTargets.length) {
		case 5:
			ns.exec(VIRUS, HOME, homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
			break;
		case 3:
			ns.exec(VIRUS, HOME, homeThreadCount, topTargets[0], topTargets[1], topTargets[2]);
			break;
		default:
			ns.print(`Not enough topTagets: ${topTargets.length}`)
	}
	// ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
}

// Returns time in seconds!
async function getTime() {
	return Date.now() / 1000;
}