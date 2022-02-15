export async function main(ns) {
	var contract = ns.args[0];
	var host = ns.args[1];
	// var data = ns.codingcontract.getData(contract, host)
	var answer = await solve(ns, "())((a)())a(aa)(((")
	// var result = ns.codingcontract.attempt(answer, contract, host)
	// ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
	ns.print(`RESULT: ${answer}`)
	await ns.sleep(10000)
}

async function solve(ns, data) {
	var resultSet = []
	var dataArr = data.split("");
	var indexArr = []
	var problemIndex = -1;
	ns.print(`Data at start: ${dataArr}`)
	// Trim invalid edges off
	for (let i = 0; i < dataArr.length; i++) {
		if (dataArr[i] == ")") {
			// Remove this parenthesis
			dataArr.shift();
		} else {
			break;
		}
	}
	for (let i = dataArr.length - 1; i >= 0; i--) {
		if (dataArr[i] == "(") {
			// Remove this parenthesis
			dataArr.pop();
		} else {
			break;
		}
	}
	// Use a map to reduce the parenthesis for a count!
	var countMap = dataArr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
	var leftCnt = countMap.get("(");
	var rightCnt = countMap.get(")");
	var notAdjacent = true;
	ns.print(`After trimming: ${dataArr}`)
	ns.print(`${leftCnt} '(' entries, ${rightCnt} ')' entries`)
	if (leftCnt == rightCnt) {
		if (leftCnt == 0) {
			return [""]
		}
		return [dataArr.join('')];
	} else if (leftCnt < rightCnt) {
		// Need to remove right parenthesis
		problemIndex = findProblemIndex(dataArr, ")", "(")
		// Find indexes of all ')' chars and reduce those that are side by side to just one
		for (let i = 0; i <= problemIndex; i++) { // length - 1 because we should never remove the outer edge.
			if (dataArr[i] == ")") {
				if (notAdjacent) {
					// Remove this parenthesis
					indexArr.push(i);
					notAdjacent = false;
				}
			} else {
				// allow next to be pushed
				notAdjacent = true;
			}
		}
	} else {
		// Need to remove left parenthesis
		problemIndex = findProblemIndex(dataArr, "(", ")")
		// Find indexes of all '(' chars and reduce those that are side by side to just one
		for (let i = problemIndex; i <= dataArr.length; i++) { // i = 1 because we should never remove the outer edge.
			if (dataArr[i] == "(") {
				if (notAdjacent) {
					// Remove this parenthesis
					indexArr.push(i);
					notAdjacent = false;
				}
			} else {
				// allow next to be pushed
				notAdjacent = true;
			}
		}
	}
	ns.print(`INDEX ARR: ${indexArr}`)
	// add all permutations of them each being removed
	for (let i = 0; i < indexArr.length; i++) {
		resultSet.push(formStringExcludingIndex(dataArr, indexArr[i]));
	}
	return resultSet;
}

function formStringExcludingIndex(data, dataIndex) {
	let resultArr = []
	for (let i = 0; i < data.length; i++) {
		if (i != dataIndex) {
			resultArr.push(data[i])
		}
	}
	return resultArr.join('')
}
function findProblemIndex(data, charPlus, charMinus) {
	let tracker = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i] == charPlus) {
			tracker++
		} else if (data[i] == charMinus) {
			tracker--
		}
		if (tracker == 1) {
			return i
		}
	}
	return -1
}