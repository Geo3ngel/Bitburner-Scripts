import {
    SERVER_LIST,
    CCT_MAP,
    HOME
} from "lib/customConstants.js";
import randomValue from "lib/util.js"

var serversWithCct = []
var running = true;

export async function main(ns) {
    // Go through all servers & search for CCT files.
    while (running) {
        findCctFiles(ns);
        for (let i in serversWithCct) {
            var contract = serversWithCct[i];
            var contractType = ns.codingcontract.getContractType(contract[0], contract[1]);
            var solveScript = CCT_MAP.get(contractType);
            var version = getVersion(contractType);
            ns.print(`Found "${contractType}" on ${contract[1]} => ${solveScript}`)
            ns.exec(solveScript, HOME, 1, contract[0], contract[1], version, randomValue());
        }

        await ns.sleep(60000);
    }
}

function findCctFiles(ns) {
    for (let i = 0; i < SERVER_LIST.length; i++) {
        let server = SERVER_LIST[i];
        var serverContracts = ns.ls(server, ".cct");
        for (let c = 0; c < serverContracts.length; c++) {
            serversWithCct.push([serverContracts[c], server]);
        }
    }
}

function getVersion(string) {
    if (string.endsWith("IV")) {
        return 4;
    } else if (string.endsWith("III")) {
        return 3;
    } else if (string.endsWith("II")) {
        return 2;
    } else if (string.endsWith("I")) {
        return 1;
    }
    return 0;
}