/** @param {NS} ns **/
export async function main(ns) {
    var contract = ns.args[0];
    var host = ns.args[1];
    var data = ns.codingcontract.getData(contract, host)
    var answer = null;
    answer = await solve(ns, data)
    if (answer != null) {
        var result = ns.codingcontract.attempt(answer, contract, host)
        ns.toast(`Contract ${contract} on host ${host} SUCCEEDED: ${result}`)
        ns.print(`Answer: ${answer}`)
        if (!result) {
            await ns.sleep(10000)
        }
    }
    ns.print(`Answer: ${answer}`)
}

function solve(ns, intArr) {
    let max_so_far = intArr[0]
    let curr_max = intArr[0]

    for (let i = 1; i < intArr.length; i++) {
        curr_max = Math.max(intArr[i], curr_max + intArr[i])
        max_so_far = Math.max(max_so_far, curr_max)
    }
    return max_so_far
}