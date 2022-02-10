export class ServerNode {

	constructor(name, reqPorts, hackLvlReq, exploited, maxRam, traversed, hasCCT, servers) {
		this.name = name;
		this.hackLvlReq = hackLvlReq;
		this.reqPorts = reqPorts;
		this.exploited = exploited;
		this.traversed = traversed;
		this.hasCCT = hasCCT;
		this.cctName; // Probably want to include what type it is, catagorize it, solve, somehow later down the line.
		this.maxRam = maxRam;
		this.freeRam; // Consider tracking usedRam instead? [Add when running script, remove on completed (will need to await)]
		this.reservedRam = 0;
		this.adjServerNodes = servers;
		// TODO: possibly track running scripts/RAM  too?
	}

	getName(){
		return this.name;
	}
	
	getExploitsReq() {
		return this.reqPorts;
	}

	getReqHackLvl(){
		return this.hackLvlReq;
	}

	// TODO: Account for RAM usage/calculation & reservation for optimizing script usage!
	// When executing a script on the given server, add it to the usedRam value here, as well as a handle for the
	// script that was ran (so it can be killed? Or so it can be tracked?)
	// Ideally I'd like to spawn these exec's off as threads, such that when they are completed, that RAM is 'freed' here.
	// 		- This would mean calling back to the controlScript from the exec'd script.
	// Alternatively, if we know exactly how much time it's going to take, we can free the RAM after that amount of time.

	// The proper method to do this would be using Netscript PORTS! (OR javascript sockets I guess if I wanted to cheat)
}