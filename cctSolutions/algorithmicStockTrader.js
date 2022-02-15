export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	var version = ns.args[2];
	var data = ns.codingcontract.getData(contract, host)
	// var answer = await solveV2(ns, data)
	switch (version) {
		case 1:
			var answer = await solve(ns, data)
			break;
		case 2:
			answer = await solveV2(ns, data)
			var result = ns.codingcontract.attempt(answer, contract, host)
			ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
			break;
		case 3:
			break;
		case 4:
			break;
	}
	ns.print(`Answer: ${answer}`)
	// await ns.sleep(10000)
	// var result = ns.codingcontract.attempt(answer, contract, host)
	// ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
}

async function solve(ns, data) {
	let topPricePositions = []
	let bottomPricePositions = []
}

// Solution for v2! (No need to worry about only N buy/sell options!)
async function solveV2(ns, data) {
	let lowerValue = 0
	let higherValue = 0
	if (data.length > 0) {
		lowerValue = data[0]
		higherValue = data[0]
	}
	let totalProfit = 0;
	for (let i = 0; i < data.length; i++) {
		if (higherValue < data[i]) {
			higherValue = data[i]
		}
		if (lowerValue > data[i] || higherValue > data[i]) {
			// Only add to profit when either a new lower value is found, or the end is reached!
			totalProfit += higherValue - lowerValue
			lowerValue = data[i]
			higherValue = data[i]
		}
	}
	// If last value is higher than lower, add to total profit!
	totalProfit += higherValue - lowerValue
	return totalProfit;
}