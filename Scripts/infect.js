import {
	WEAKEN, GROW, HACK
} from "lib/customConstants.js";
import { getAllServers } from "lib/util.js"

export async function main(ns) {
	var totalServerList = getAllServers(ns);
	// Go through all servers & infect them!
	for (let i = 0; i < totalServerList.length; i++) {
		await infectVulnerableServer(ns, totalServerList[i]);
	}
}

async function infectVulnerableServer(ns, server) {
	await ns.scp(WEAKEN, server);
	await ns.scp(GROW, server);
	await ns.scp(HACK, server);
}