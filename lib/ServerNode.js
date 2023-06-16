export default class ServerNode {

	constructor(hostname, exploited, traversed) {
		this.hostName = hostname;
		this.exploited = false;
		this.traversed = false;
		this.reservedRam = 0;
		this.subServers = [];	// Other nodes, not just server names.
		this.priming = false;
		this.primed = false;
	}
	getSubServers() {
		return this.subServers;
	}
	setSubServers(subServers) {
		this.subServers = subServers;
	}

	getHostname() {
		return this.hostName;
	}
	setExploited() {
		this.exploited = true;
	}
	isExploited() {
		return this.exploited;
	}

	reserveRam(ram) {
		this.reservedRam += ram;
	}
	freeRam(ram) {
		this.reservedRam -= ram;
	}

	setPriming(flag) {
		this.priming = flag;
	}
	isPriming() {
		return this.priming;
	}
	isPrimed() {
		return this.primed;
	}
	setPrimed(bool) {
		this.primed = bool;
	}

	setTraversed() {
		this.traversed = true;
	}
	isTraversed() {
		return this.traversed
	}
	resetTraversed() {
		this.traversed = false;
	}
}