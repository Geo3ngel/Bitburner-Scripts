import {
	WEAKEN, GROW, HACK
} from "lib/customConstants.js";

const serverList = [
	"n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym",
	"darkweb","zer0","nectar-net","max-hardware","CSEC","neo-net","silver-helix","phantasy","omega-net",
	"the-hub","johnson-ortho","avmnite-02h","comptek","crush-fitness","netlink","syscore","summit-uni",
	"rothman-uni","catalyst","zb-institute","I.I.I.I","rho-construction","alpha-ent","millenium-fitness",
	"aevum-police","lexo-corp","aerocorp","galactic-cyber","global-pharm","snap-fitness","deltaone",
	"unitalife","omnia","icarus","univ-energy","solaris","defcomm","zeus-med","infocomm","taiyang-digital",
	"zb-def","nova-med","microdyne","applied-energetics","run4theh111z","titan-labs","stormtech","helios",
	"fulcrumtech","vitalife","omnitek","4sigma","kuai-gong",".","blade","clarkinc","nwo","b-and-a",
	"powerhouse-fitness","ecorp","fulcrumassets","The-Cave","megacorp"]

export async function main(ns) {
	// Go through all servers & infect them!
	for(let i = 0; i<serverList.length; i++){
		await infectVulnerableServer(ns, serverList[i]);
	}
}

async function infectVulnerableServer(ns, server) {
	await ns.scp(WEAKEN, server);
	await ns.scp(GROW, server);
	await ns.scp(HACK, server);
}