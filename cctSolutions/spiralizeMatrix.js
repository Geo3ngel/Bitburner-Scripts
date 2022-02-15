/** @param {NS} ns **/
export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	var data = ns.codingcontract.getData(contract, host)
	var answer = await solve(ns, data)
	var result = ns.codingcontract.attempt(answer, contract, host)
	ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
	ns.print(`RESULT: ${answer}`)
}

// Build it in a destructive manner!
// just concatinate the north boundry to start
// Pop off the remaining right side (if there is any left)
// Pop off the last array & concat it to resultsArr
// Shift off remaining left side values
// Repeat until data.length == 0

async function solve(ns, data) {
	var resultArr = []
	while (data.length > 0) {
		let northernBorder = data.shift()
		resultArr = resultArr.concat(northernBorder);
		for (let i = 0; i < data.length; i++) {
			resultArr.push(data[i].pop())
		}
		resultArr = resultArr.concat(data.pop())
		for (let i = data.length - 1; i > -1; i--) {
			resultArr.push(data[i].shift())
		}
		await ns.sleep(25)
	}
	return resultArr;
}