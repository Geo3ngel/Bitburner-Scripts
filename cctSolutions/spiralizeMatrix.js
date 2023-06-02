/** @param {NS} ns **/
export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	var data = ns.codingcontract.getData(contract, host)
	ns.print(`data: ${data}`)
	var answer = await solveSpiralOrder(ns, data)
	ns.print(`Answer: ${answer}`)
	var result = ns.codingcontract.attempt(answer, contract, host)
	ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
	ns.print(`RESULT: ${answer}`)
}

async function solveSpiralOrder(ns, matrix) {
	// Trackers for index of current row/column
	let top = 0;
	let bottom = matrix.length - 1;
	let left = 0;
	let right = matrix[0].length - 1;
	let result = []

	// for(top = 0; top <= bottom; )
	while (top <= bottom && left <= right) {
		// Traverse Top
		for (let i = left; i <= right; i++) {
			result.push(matrix[top][i])
		}
		top++;
		// Traverse right column from top to bottom
		for (let i = top; i <= bottom; i++) {
			result.push(matrix[i][right]);
		}
		right--;

		if (top <= bottom) {
			// Traverse bottom row from right to left
			for (let i = right; i >= left; i--) {
				result.push(matrix[bottom][i]);
			}
			bottom--;
		}

		if (left <= right) {
			// Traverse left column from bottom to top
			for (let i = bottom; i >= top; i--) {
				result.push(matrix[i][left]);
			}
			left++;
		}
	}
	return result;
}