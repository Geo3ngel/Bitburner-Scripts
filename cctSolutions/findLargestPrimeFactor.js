/** @param {NS} ns **/
export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	var data = ns.codingcontract.getData(contract, host)
	ns.codingcontract.attempt(solve(data), contract, host)
}

function solve(number){
	var divisor = 2;
	while (number > 1) {
		if (number % divisor === 0) {
			number /= divisor;
		} else {
			divisor++;
		}
	}
	return divisor;
}