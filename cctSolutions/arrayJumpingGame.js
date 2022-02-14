/** @param {NS} ns **/
export async function main(ns) {
	// var contract = ns.args[0];
	// var host = ns.args[1];
	// var data = ns.codingcontract.getData(contract, host)
	// ns.codingcontract.attempt(solve(data), contract, host)
	var result = await solve(ns, [7,9,7,0,2,8,3,4,6,5,9,7,9,4,1,1,0,1,1,0,0,0])
	ns.toast(`RESULT: ${result}`)
}

async function solve(ns, data) {
	var finalPosition = data.length - 1;
	var index = 0
	var lastIndexStack = [0];
	while (index < finalPosition) {
		if (data[0] == 0) { return 0; }
		// Problem is, this only works once... Need a stack for 'lastIndex' to push/pop from!
		if(!lastIndexStack.includes(index) && data[index] != 0){
			lastIndexStack.push(index)
		}
		// lastIndex = index;
		index = data[index] + index;
		if (data[index] == 0 && index != finalPosition) {
			index = lastIndexStack.pop()
			ns.print(`data[index] before: ${data[index]}`)
			data[index] = data[index] - 1
			ns.print(`data[index] after: ${data[index]}`)
		}
		ns.print(`Index: ${index}, Stack: ${lastIndexStack}`)
		await ns.sleep(1000)
	}
	return 1;
}