/**
 * TODO: Make this the ultimate controll script!
 * The goal of this script is to basically be a glorified events manager.
 * [] Should be capable of launching tasks (Executing scripts for designated tasks) and managing their state.
 * Things like cracking servers (making them vulnerable w/ exploits):
 * - in loop that runs, say, every 10 seconds, check how many exploits we have.
 * 		- If the amount of exploits changes;
 * 			- re-run the script that cracks as many servers as possible
 * 			- Re-deploy weaken/grow/hack scripts to newly vulnerable servers
 * 			- Add the new servers to the 'availableBuckets' list to utalize as RAM for hacking.
 * 			- re-apply the hacking regimend! (Don't want to interrupt existing tasks, just assign updated new ones!)
 * 
 * The who to hack script should determine those with the best potential every time we level up!
 * - Maybe create something akin to an event manager that fires an event every time we level to update the topTargets
 * - rather than traversing through all servers, it would be best to map them out in a 2/3D arry w/ the required hack level.
 * - Possibly even store them in a queue of servers I cannot yet hack vs a list that I can, which the topTargets calc uses.
 * 		- each time I lvl up, it checks the queue of servers I cannot yet hack (priority queue?)
 * 			- use imported PriorityQueue
 * 
 * Then the hackEventCoordinator should manage how we stagger out weaken, grow, and hack commands, 
 * and what vulnerable servers run how many of the threads for each distributed attack!
 * 
 * The contractSolver will ideally automatically solve contracts, and noify me of their completion, so I can choose rep or $$$.
 * - possibly allow myself to assign which company to build rep for, if this is even automatable.
 * [] MVP for now is just identifying which servers have cct files and notifying me.
 * 		- Might be able to run them with a script? Needs further research.
 * 
 * Should also have the ability to optionally halt/run autoNode.js when approprite, based on whether we want to buy servers
 * for more hacking money. As to how we're going to determine when to swtich, over, I don't know how I'm going to do that yet.
 * - So for now, maybe just try my hand at doing some HTML injection to create a stop/start button for autoNet.js?
 * 		- kills or starts the script on the same server the controllScript is running on (Reserves RAM space for it)
 * 
 * Should map out programs that need stop/start from this script w/ their RAM usage, so we know how much we need to
 * reserve for their respective server! (I.E. autoNode on home takes up X ram, so when we calculate how much to 
 * use for threading, we take that reserved amount into account and avoid using it)
 * - More along this vein, I could very well do ram calcs ahead of time and pass them on as args to other scripts to avoid
 *   eating up unnecessary RAM. [OPTIMIZATION] 
 */
import PriorityQueue from "lib/PriorityQueue.js";

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
const virus = "/SimpleScripts/virus.js"
const WEAKEN = "weaken.js";
const GROW = "grow.js";
const HACK = "hack.js";

async function init(){
	vulnerableServers = [];
	serversToExploit = new PriorityQueue(); // Prioritized by # of exploits required
	exploits = 0;

	hackableServers = [];
	notHackableServers = new PriorityQueue(); // Prioritized by min hacking level required

	topTargets = []

	queuedServers = []
	traversedServers = ["home"]
}

export async function main(ns) {
	init();
	await countExploits(ns);

	// Run the initial scan
	queuedServers = ns.scan();

	// Evaluating Servers & Cracking them!
	while (queuedServers.length > 0){
		let server = queuedServers.shift();
		traversedServers.push(server);

		await processServer(ns, server)
	}
	ns.print(`Vulnerable Servers: ${vulnerableServers}`);

	// SCPs virus to vulnerable servers
	await infectVulnerableServers(ns);
	ns.print(`Servers infected.`)
	// Determines which vulnerable servers are best to hack for $$$
	await profileTargets(ns);
	ns.print(`High profile targets selected: ${topTargets}`)
	// Initiates attacks on top targets on compromised servers
	await attackTopTargets(ns);

	await ns.sleep(10000)
}

export async function countExploits(ns) {
	if(ns.fileExists("BruteSSH.exe")){
		exploits++;
	}
	if(ns.fileExists("FTPCrack.exe")){
		exploits++;
	}
	if(ns.fileExists("HTTPWorm.exe")){
		exploits++;
	}
	if(ns.fileExists("relaySMTP.exe")){
		exploits++;
	}
	if(ns.fileExists("SQLInject.exe")){
		exploits++;
	}
}

export async function processServer(ns, server) {
	if(!ns.hasRootAccess(server)){
		// Attempt to crack
		if(ns.getServerNumPortsRequired(server) <= exploits){
			try{
				switch (ns.getServerNumPortsRequired(server)){
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
			}catch{
				ns.print(`Can't crack ${server} yet.`);
			}
		}
	}

	if(ns.hasRootAccess(server)){
		vulnerableServers.push(server)
		let subServers = ns.scan(server)
		for (let index = 0; index < subServers.length; index++) {
			let subServer = subServers[index];
			if (!traversedServers.includes(subServer)){
				queuedServers.push(subServer)
			}
		}
	}
}

export async function infectVulnerableServers(ns) {
	// Scp virus script to servers
	for (let index = 0; index < vulnerableServers.length; index++) {
		let server = vulnerableServers[index];
		await ns.scp(virus, server)
		ns.print(`Infected ${server} with Virus.`)
	}

		// TODO: Run virus on vulnerable server(s) against selected target server(s)
	
	// TODO: Determine highest value targetable server (Profile hacking targets)
	// TODO: Target most valuable servers (make a list)
		// Then send out `hack` command to all vulnerable servers targeting X server
	// ns.print(`Hacking ${targetServer}`);
	// await ns.hack(targetServer);
	// await ns.grow(targetServer);
	// await ns.weaken(targetServer);

	/*
		FUTURE FEATURES:
		- remote controll capability: kill other server's scripts to restart w/ new targets!
		- determine high value targets!
		- deploy Virus (attack script) on all cracked servers to attack most valuable targets! (MVTs)
		- Use the maximum threads possible for attack script
	*/
}

// TODO: Determine highest value targetable server (Profile hacking targets)
export async function profileTargets(ns) {
	for (let index = 0; index < vulnerableServers.length; index++) {
		let server = vulnerableServers[index];
		// For now, we're just going with the highest dollar amount :P
		if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server)){
			if(topTargets.length < 5 && !topTargets.includes(server)){
				topTargets.push(server);
			}else{
				for (let i = 0; i < topTargets.length; i++) {
					if(ns.getServerMaxMoney(topTargets[i]) < ns.getServerMaxMoney(server) && !topTargets.includes(server)){
						topTargets[i] = server;
						break;
					}
				}
			}
		}
	}
	// let server = vulnerableServers[index];
	// 	let maxMoney = ns.getServerMaxMoney(server);
	// 	let hackSuccessChance = ns.hackSuccessChance(server);
	// 	// let threadScale = threadsUsed
	// 	let weakenTime = security/weakenProgress
}

export async function attackTopTargets(ns) {
	// Iterate through list of servers, Exec-ing the virus script w/ the top targets as input for arguments.
	// The tricky bit here will be determining max amount of threads to run the virus with
	// for (let index = 0; index < topTargets.length; index++) {
	let threadCost = ns.getScriptRam(virus);
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
		if(maxThreadCount <= 0){
			ns.print(`NOT ENOUGH resources on server: _${server}_ to run virus.`)
		}else{
			switch(topTargets.length){
				case 5:
					ns.exec(virus, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
					break;
				case 3:
					ns.exec(virus, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2]);
					break;
				default:
					ns.print(`Not enough topTagets: ${topTargets.length}`)
			}
		}
	}
	let home = "home";
	let homeThreadCount =  Math.floor((ns.getServerMaxRam(home) - ns.getServerUsedRam(home)) / threadCost);
	// Start hacking script on home server too!

	switch(topTargets.length){
		case 5:
			ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
			break;
		case 3:
			ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2]);
			break;
		default:
			ns.print(`Not enough topTagets: ${topTargets.length}`)
	}
	// ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
}