export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	var version = ns.args[2];
	var data = ns.codingcontract.getData(contract, host)
	// var answer = await solveV2(ns, data)
	var answer = null;
	switch (version) {
		case 1:
			ns.print("Case 1")
			var answer = await solve(ns, data)
			var result = ns.codingcontract.attempt(answer, contract, host)
			ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
			await ns.sleep(100000)
			break;
		case 2:
			ns.print("Case 2")
			answer = await solveV2(ns, data)
			// var result = ns.codingcontract.attempt(answer, contract, host)
			// ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
			break;
		case 3:
			break;
		case 4:
			ns.print("Case 4")
			var answer = await solveV4(ns, data)
			var result = ns.codingcontract.attempt(answer, contract, host)
			ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)

			ns.print(`Answer: ${answer}`)
			if (!result) {
				await ns.sleep(1000000)
			}
			break;
	}
	if (answer != null) {
		// var result = ns.codingcontract.attempt(answer, contract, host)
		// ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
	}
	ns.print(`Answer: ${answer}`)
	// await ns.sleep(10000)
	// var result = ns.codingcontract.attempt(answer, contract, host)
	// ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
}

function buildNodeList(data) {
	var nodeList = []

	let startIndex = 0
	let lastIndex = 0
	// Build node array
	for (let i = 0; i < data.length; i++) {
		// Set lower index if value is less than last index value
		if (data[i] < data[lastIndex]) {
			// Push the node of the previous indexies
			nodeList.push(new node(startIndex, lastIndex, data[lastIndex] - data[startIndex]))
			startIndex = i
		}
		lastIndex = i
	}
	// Push on last node
	nodeList.push(new node(startIndex, lastIndex, data[lastIndex] - data[startIndex]))
	return nodeList
}

// TODO: Fix error case?
async function solve(ns, data) {
	var nodeList = [] // value node index

	// Build node array of all index stop/start values! (2D array!)
	// for s (start index)
	// for e (end index)
	for (let s = 0; s < data.length; s++) {
		for (let e = s; e < data.length; e++) {
			let val = data[e] - data[s]
			if (val > 0) {
				nodeList.push(new node(s, e, data[e] - data[s]))
			}
		}
	}
	// get the node w/ the highest value
	var mostValuableNode = nodeList[0]
	for (let i = 1; i < nodeList.length; i++) {
		if (mostValuableNode.getVal() < nodeList[i].getVal()) {
			mostValuableNode = nodeList[i]
		}
	}
	printNodeList(ns, nodeList)
	ns.print(`Most valuable Node: ${mostValuableNode}`)
	ns.print(`Value: ${mostValuableNode.getVal()}`)
	return mostValuableNode.getVal()
}

class node {
	constructor(startIndex, endIndex, value) {
		this.startIndex = startIndex;
		this.endIndex = endIndex;
		this.val = value;
	}

	getVal() {
		return this.val
	}

	getStartIndex() {
		return this.startIndex
	}

	getEndIndex() {
		return this.endIndex;
	}
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

// Returns true if nodes overlap
function nodesOverlap(ns, a, b) {
	let a_start = a.getStartIndex()
	let b_start = b.getStartIndex()
	let a_end = a.getEndIndex()
	let b_end = b.getEndIndex()
	if (a_start <= b_end && a_start >= b_start) {
		return true;
	}
	if (a_end <= b_end && a_end >= b_start) {
		return true;
	}
	if (b_start <= a_end && b_start >= a_start) {
		return true
	}
	if (b_end <= a_end && b_end >= a_start) {
		return true;
	}
	return false
}

function combineNodeListValues(nodeList) {
	let value = 0;
	for (let i = 0; i < nodeList.length; i++) {
		value += nodeList[i].getVal()
	}
	return value;
}

function printNodeList(ns, nodeList) {
	ns.print(`Type of nodeList: ${typeof (nodeList)}`)
	nodeList.forEach(
		node => ns.print(`S: ${node.getStartIndex()} E: ${node.getEndIndex()} V:${node.getVal()}`))
}

// The first element is an integer k. 
// The second element is an array of stock prices (which are numbers) 
// where the i-th element represents the stock price on day i.
// Determine the maximum possible profit you can earn using at most k transactions. 
// A transaction is defined as buying and then selling one share of the stock. 
// Note that you cannot engage in multiple transactions at once. 
// In other words, you must sell the stock before you can buy it again.
async function solveV4(ns, data) {
	// A naiive approach might use my nodeList implementation...  but that wouldn't work... Shit.
	// I'll need to get the ordered largest K gaps
	var k = data[0]
	var prices = data[1]
	ns.print(`K: ${k}\nPrices: ${prices}\n`)

	var nodeList = [] // value node index

	// Build node array of all index stop/start values! (2D array!)
	// for s (start index)
	// for e (end index)
	for (let s = 0; s < prices.length; s++) {
		for (let e = s; e < prices.length; e++) {
			let val = prices[e] - prices[s]
			if (val > 0) {
				nodeList.push(new node(s, e, prices[e] - prices[s]))
			}
		}
	}

	// Sorts ascending (highest values at the end)
	nodeList.sort(function (a, b) {
		return b.getVal() - a.getVal();
	});

	// Create every non-overlapping list permutation (reduce)
	let non_Overlapping_K_NodeLists = []
	for (let i = 0; i < nodeList.length; i++) {
		let noOverlapNodeList = [nodeList[i]]
		for (let j = 0; j < nodeList.length; j++) { // Might have to set j to 0 initially...
			if (j == i) { continue }
			// Overlap check for current node list contents
			let doesNotOverlap = true
			for (let p = 0; p < noOverlapNodeList.length; p++) {
				if (nodesOverlap(ns, noOverlapNodeList[p], nodeList[j])) {
					doesNotOverlap = false
					// Should not include this node in the list!
					break
				}
			}
			if (doesNotOverlap) {
				// If the nodes do not overlap, add the node!
				noOverlapNodeList.push(nodeList[j])
				if (noOverlapNodeList.length == k) {	// Early termination clause
					break; // We have enough to compare to others for the top K!
				}
			}
		}
		non_Overlapping_K_NodeLists.push(noOverlapNodeList)
	}

	// Evaluate list permutations
	let highestValue = 0
	let k_nodes = []
	for (let i = 0; i < non_Overlapping_K_NodeLists.length; i++) {

		let val = combineNodeListValues(non_Overlapping_K_NodeLists[i])
		if (highestValue < val) {
			k_nodes = non_Overlapping_K_NodeLists[i]
			highestValue = val
		}
	}
	printNodeList(ns, k_nodes)
	return highestValue // Pick the highest value!
}