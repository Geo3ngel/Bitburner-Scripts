import {
	PAUSE, UNPAUSE, KILL,
	AUTO_NODE_INBOUND_PORT,
	CONTROL_INBOUND_PORT,
	HOME, MAX_SERVER_RAM, MAX_SERVER_COST
} from "lib/customConstants.js";
import infectVulnerableServer from "infect.js";
const LVL = 0;
const RAM = 1;
const CORE = 2;
const DEATH_MSG = "AUTO_NET"
const SERVER_MODIFIER = 0.01; // The lower this value, the more favored Servers are to be purchased.
var serverIter = 0;
var maxServersPurchased = false;
var purchaseServersOnly = false;
// TODO: Rework to include purchase of servers & upgrading!
// ns.upgradePurchasedServer() makes buying servers earlier WAY worth while!!!
export async function main(ns) {
	ns.disableLog('sleep');
	ns.disableLog('getServerMoneyAvailable');
	if (ns.args.length > 0 && ns.args[0] == "-s") {
		ns.print("Servers only!")
		purchaseServersOnly = true
	}

	let paused = false;
	while (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
		switch (ns.readPort(AUTO_NODE_INBOUND_PORT)) {
			case PAUSE:
				paused = true;
				break;
			case UNPAUSE:
				paused = false;
				break;
			case KILL:
				ns.tryWritePort(CONTROL_INBOUND_PORT, DEATH_MSG)
				return;
		}

		if (!paused) {
			if (purchaseServersOnly || await checkServerPurchase(ns)) {
				// Attempt purchase
				await newpurchaseServer(ns);
				// await purchaseServer(ns);
			} else { // Buy & upgrade nodes
				let newNodeRatio = await calcNewNodeValueRatio(ns);

				// Find highest ratio from all current nodes!
				let bestNodeToUpgrade = -1;
				let bestProperty = -1; // 0-2 are level, ram, and core
				let bestRatio = 0;
				let lvlRatio;
				let ramRatio;
				let coreRatio;
				// Finds the best upgrade value amongst existing nodes
				for (let i = 0; i < ns.hacknet.numNodes(); i++) {
					lvlRatio = await calcLevelUpgradeValueRatio(ns, i);
					ramRatio = await calcRamUpgradeValueRatio(ns, i);
					coreRatio = await calcCoreUpgradeValueRatio(ns, i);
					// ns.print(`Node${i}: lvl:${lvlRatio}, ram:${ramRatio}, core:${coreRatio}`);
					if (lvlRatio > ramRatio && lvlRatio > coreRatio) {
						// Lvl ratio is the highest for this node
						if (lvlRatio > bestRatio) {
							bestRatio = lvlRatio;
							bestProperty = LVL;
							bestNodeToUpgrade = i;
						}
					} else if (ramRatio > coreRatio) {
						// Ram ratio is the highest for this node
						if (ramRatio > bestRatio) {
							bestRatio = ramRatio;
							bestProperty = RAM;
							bestNodeToUpgrade = i;
						}
					} else {
						// Core ratio is the highest for this node
						if (coreRatio > bestRatio) {
							bestRatio = coreRatio;
							bestProperty = CORE;
							bestNodeToUpgrade = i;
						}
					}
				}

				// Buys a new node or the best valued upgrade
				let bal = ns.getServerMoneyAvailable(HOME);
				// ns.print(`NewNodw:${newNodeRatio} > BestRatio:${bestRatio}`)
				if (newNodeRatio > bestRatio) {
					// Buy a new node!
					ns.print("Trying to buy a new Node...")
					if (ns.hacknet.getPurchaseNodeCost() < bal) {
						ns.hacknet.purchaseNode();
						ns.print("Bought a new Node!")
					}
				} else {
					switch (bestProperty) {
						case LVL:
							if (ns.hacknet.getLevelUpgradeCost(bestNodeToUpgrade) < bal) {
								ns.hacknet.upgradeLevel(bestNodeToUpgrade);
								ns.print(`Upgrading LVL of node ${bestNodeToUpgrade}`)
							}
							break;
						case RAM:
							if (ns.hacknet.getRamUpgradeCost(bestNodeToUpgrade) < bal) {
								ns.hacknet.upgradeRam(bestNodeToUpgrade);
								ns.print(`Upgrading RAM of node ${bestNodeToUpgrade}`)
							}
							break;
						case CORE:
							if (ns.hacknet.getCoreUpgradeCost(bestNodeToUpgrade) < bal) {
								ns.hacknet.upgradeCore(bestNodeToUpgrade);
								ns.print(`Upgrading CORES of node ${bestNodeToUpgrade}`)
							}
							break;
						default:
							ns.print("No best property chosen?")
					}
				}
			}
		}
		await ns.sleep("50");
	}
}

export async function findWeakestNode(ns) {
	// Returns the node that produces the least, i.e. needs to be upgraded
	let weakest = 0;
	for (let i = 0; i < ns.hacknet.numNodes(); i++) {
		if (ns.hacknet.getNodeStats(i).production < ns.hacknet.getNodeStats(weakest).production) {
			weakest = i;
		}
	}
	return weakest;
}

// export async function calcAvgNodeProduction(ns) {
// 	// Returns average production of current nodes
// }

///
/// These functions translate the cost of the next upgrade to a ratio for comparison to see what is worth saving for
///
export async function calcLevelUpgradeValueRatio(ns, nodeNum) {
	let cost = await ns.hacknet.getLevelUpgradeCost(nodeNum, 1);
	let lvl = await ns.hacknet.getNodeStats(nodeNum).level;
	let ram = await ns.hacknet.getNodeStats(nodeNum).ram;
	let core = await ns.hacknet.getNodeStats(nodeNum).cores;
	let value = await levelUpgradeProfit(lvl, ram, core);
	let ratio = value / cost;
	// ns.print(`lvl: ${lvl} cost:${cost}/ value:${value} = Ratio:${ratio}`);
	return ratio
}

export async function calcRamUpgradeValueRatio(ns, nodeNum) {
	let cost = await ns.hacknet.getRamUpgradeCost(nodeNum, 1);
	let lvl = await ns.hacknet.getNodeStats(nodeNum).level;
	let ram = await ns.hacknet.getNodeStats(nodeNum).ram;
	let core = await ns.hacknet.getNodeStats(nodeNum).cores;
	let value = await ramUpgradeProfit(lvl, ram, core);
	let ratio = value / cost;
	return ratio;
}

export async function calcCoreUpgradeValueRatio(ns, nodeNum) {
	let cost = await ns.hacknet.getCoreUpgradeCost(nodeNum, 1);
	let lvl = await ns.hacknet.getNodeStats(nodeNum).level;
	let ram = await ns.hacknet.getNodeStats(nodeNum).ram;
	let core = await ns.hacknet.getNodeStats(nodeNum).cores;
	let value = await coreUpgradeProfit(lvl, ram, core);
	let ratio = value / cost;
	// ns.print(`core: ${core} cost:${cost}/ value:${value} = Ratio:${ratio}`);
	return ratio;
}

export async function calcNewNodeValueRatio(ns) {
	let totalHacknetNodeProduction = 0;
	let numberOfNodes = await ns.hacknet.numNodes();
	for (let i = 0; i < numberOfNodes; i++) {
		totalHacknetNodeProduction += ns.hacknet.getNodeStats(i).production;
	}
	let valueRatio = (totalHacknetNodeProduction / numberOfNodes) / ns.hacknet.getPurchaseNodeCost();
	// ns.print(`valueRatio:${valueRatio}, totalProduction:${totalHacknetNodeProduction}, Node#${numberOfNodes}`)
	if (isNaN(valueRatio)) {
		valueRatio = 1;
	}
	return valueRatio;
}

///
/// Functions for gaining profit of lvl ups
///

export async function levelUpgradeProfit(currentLevel, currentRam, currentLevelCore) {
	return (1 * 1.5) * Math.pow(1.035, currentRam - 1) * ((currentLevelCore + 5) / 6);
}
export async function ramUpgradeProfit(currentLevel, currentRam, currentLevelCore) {
	return (currentLevel * 1.5) * (Math.pow(1.035, (2 * currentRam) - 1) - Math.pow(1.035, currentRam - 1)) * ((currentLevelCore + 5) / 6);
}
export async function coreUpgradeProfit(currentLevel, currentRam, currentLevelCore) {
	return (currentLevel * 1.5) * Math.pow(1.035, currentRam - 1) * (1 / 6);
}

///
///	Case where we absolutely should just buy a new server instead!
/// Returns true if it is saving up for a purchase
async function checkServerPurchase(ns) {
	let serverCost = ns.getPurchasedServerCost(MAX_SERVER_RAM);
	let purchaseNodeCost = ns.hacknet.getPurchaseNodeCost();
	if ((serverCost * SERVER_MODIFIER) < purchaseNodeCost && !maxServersPurchased) {
		return true;
	}
	return false;
}

// TODO: Revamp to purchase the most expensive server I currently can until all slots are full.
// 				Then proceed to try and upgrade them all to the max!
async function newpurchaseServer(ns) {
	let bal = ns.getServerMoneyAvailable(HOME)
	// Set flag to disable future server purchase attempts
	if (ns.getPurchasedServerLimit() <= ns.getPurchasedServers().length) {
		// maxServersPurchased = true; // TODO: Only want to trigger this now if servers are fully upgraded aswell!
		await ns.print(`Server capactity maxxed! Upgrading...`)
		let currentRam = Infinity;
		let upgradeCost = Infinity;
		ns.getPurchasedServers().forEach(server => {
			// Check if it can be upgraded!
			currentRam = ns.getServerMaxRam(server);
			if (currentRam < MAX_SERVER_RAM) {
				let ram = 2;
				// Calculates highest amount of ram I can afford to upgrade by at the moment!
				while (ns.getPurchasedServerCost(ram * 2) < bal && ram < MAX_SERVER_RAM - currentRam) {
					ram = ram * 2; //Math.pow(ram, 2);
				}
				let upgradeCost = ns.getPurchasedServerUpgradeCost(server, ram)
				if (upgradeCost < bal) {
					ns.upgradePurchasedServer(server, ram);
				}
			}
		});
		// TODO: Upgrade servers!
		// 	getPurchasedServerUpgradeCost(hostname, ram)
		// 	upgradePurchasedServer(hostname, ram)
		return;
	}

	let maxServerCost = await ns.getPurchasedServerCost(MAX_SERVER_RAM);

	let ram = 2;
	// Calc max server cost! (min size of X)
	while (ns.getPurchasedServerCost(ram * 2) < bal && ram < MAX_SERVER_RAM) {
		ram = ram * 2; //Math.pow(ram, 2);
	}
	let serverCost = ns.getPurchasedServerCost(ram);
	ns.print(`Ram: ${ram}, cost:${serverCost}`)

	if (serverCost < bal) {
		let serverName = `alpha-${serverIter}`;
		while (await ns.serverExists(serverName)) {
			serverIter++;
			if (serverIter > 24) { serverIter = 0 }
			serverName = `alpha-${serverIter}`;
		}
		await ns.purchaseServer(serverName, ram);
		await ns.print(`PURCHASED: ${serverName}`)
		await infectVulnerableServer(ns, serverName);

	} else {
		// Unable to purchase server
		await ns.print(`Saving for server purchase... price:${serverCost}`)
	}
}