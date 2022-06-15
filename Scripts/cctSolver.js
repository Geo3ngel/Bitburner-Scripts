import {
    SERVER_LIST,
    CCT_MAP,
    HOME
} from "lib/customConstants.js";
import randomValue from "lib/util.js"

/**
 * REQUIRES FORMULAS TO FUNCTION!!
 * [] TODO: Remove from list serversWithCct once it has been completed!
 * [] Make actual logging & use it in the cctScripts to give results. (So I can debug/verify it's working
 */

var serversWithCct = []
var running = true;
const CONTRACT_TYPE_INDEX = 0
const VERSION_INDEX = 1

// TODO: Revamp this script to function smarter!
// Should queue known script locations, then chug through them until solved or failed.
// - remove when failed, or retry until none are left?
export async function main(ns) {
    // TODO: Distribute to servers with available memory to solve CCT scritps!
    // TODO: Add logging for failed scripts, to log the problem so we can see why it failed!
    // Go through all servers & search for CCT files.
    while (running) {
        findCctFiles(ns);
        for (let i in serversWithCct) {
            var contract = serversWithCct[i];
            var contractType = ns.codingcontract.getContractType(contract[0], contract[1]);
            var contractArr = CCT_MAP.get(contractType)
            if (contractArr == undefined) {
                ns.print(`Err. ${contractType} results in Null from contract array in constants.`)
                continue
            }
            var solveScript = contractArr[CONTRACT_TYPE_INDEX];
            var version = contractArr[VERSION_INDEX]//getVersion(contractType);
            try {
                ns.print(`Found "${contractType}" on ${contract[1]} => ${solveScript}`)
                var result = ns.exec(solveScript, HOME, 1, contract[0], contract[1], version, randomValue());
                ns.print(`Success: ${result}`)
            } catch (err) {
                ns.print(`Contract type: ${contractType} on ${contract[1]} is not solved/mapped yet.`)
            }
        }
        await ns.sleep(5000)
        // await ns.sleep(60000);
    }
}

function findCctFiles(ns) {
    serversWithCct = []
    for (let i = 0; i < SERVER_LIST.length; i++) {
        let server = SERVER_LIST[i];
        var serverContracts = ns.ls(server, ".cct");
        for (let c = 0; c < serverContracts.length; c++) {
            serversWithCct.push([serverContracts[c], server]);
            ns.print(`Pushing ${serverContracts[c]} here ${SERVER_LIST[i]}`)
        }
    }
}