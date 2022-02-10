/** @param {NS} ns **/
export async function main(ns) {
	const HOME = "home"
	var serverName = ns.args[0]; // This way it can be used in other scripts?
	var maxAffordableRamSize = 2;
	var powerIter = 1;
	var lastAffordableRamSize = maxAffordableRamSize;
	var currentServerSizeCost = ns.getPurchasedServerCost(maxAffordableRamSize);
	while(currentServerSizeCost < ns.getServerMoneyAvailable(HOME)){
		lastAffordableRamSize = maxAffordableRamSize;
		maxAffordableRamSize = Math.pow(2, powerIter);
		powerIter++;
		currentServerSizeCost = ns.getPurchasedServerCost(maxAffordableRamSize);
	}
	ns.print(`Purchasing ${lastAffordableRamSize} for \$${ns.getPurchasedServerCost(lastAffordableRamSize)}`)
	ns.print(`Couldn't afford ${maxAffordableRamSize}ram for \$${ns.getPurchasedServerCost(maxAffordableRamSize)}.`)
	// ns.purchaseServer(serverName, lastAffordableRamSize);
	await ns.sleep(10000)
}