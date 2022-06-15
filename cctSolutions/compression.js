/** @param {NS} ns */
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
            ns.print(`Answer: ${answer}`)
            var result = ns.codingcontract.attempt(answer, contract, host)
            ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
            if (!result) {
                await ns.sleep(10000)
            }
            break;
        case 2:
            ns.print("Case 2")
            break;
        case 3:
            ns.print("Case 3")
            break;
        default:
            ns.print(`Not found: ${contract} V:${version}`)
    }
}

async function solve(ns, inputString) {
    // Simply compress the repeated chars!
    let resultString = ""
    let repeatCount = 1
    let lastChar
    for (let i = 0; i < inputString.length; i++) {
        let currentChar = inputString[i]
        if (lastChar == undefined) {
            lastChar = currentChar
            continue
        }

        // If new character
        if (currentChar != lastChar) {
            if (repeatCount > 1) {
                resultString += repeatCount.toString()
                repeatCount = 1 // Reset count
            } else {
                resultString += repeatCount.toString()
            }
            resultString += lastChar
            ns.print(`Result String: ${resultString}`)
        } else {
            // Iterate repeat count
            repeatCount++
            if (repeatCount > 9) { // If the repeat goes into double digits, segment it out to 9
                resultString += `9${currentChar}`
                repeatCount -= 9
            }
        }
        lastChar = currentChar
    }
    // Add last char
    resultString += repeatCount.toString()
    resultString += lastChar
    return resultString
}