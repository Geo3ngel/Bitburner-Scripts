import {
	WEAKEN, GROW, HACK,
	SERVER_LIST, PURCHASED_SERVER_LIST
} from "lib/customConstants.js";

export async function main(ns) {
	// var totalServerList = getAllServers(ns);
	var totalServerList = SERVER_LIST + PURCHASED_SERVER_LIST
	// Go through all servers & infect them!
	for (let i = 0; i < totalServerList.length; i++) {
		try {
			await infectVulnerableServer(ns, totalServerList[i]);
		} catch {
			ns.print(`Server ${totalServerList[i]} not in existance yet.`)
		}
	}
}

export default async function infectVulnerableServer(ns, server) {
	await ns.scp(WEAKEN, server);
	await ns.scp(GROW, server);
	await ns.scp(HACK, server);
}