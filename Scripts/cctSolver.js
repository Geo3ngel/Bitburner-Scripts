import {
	SERVER_LIST,
    HOME
} from "lib/customConstants.js";

var serversWithCct = []
var running = true;

export async function main(ns) {
	// Go through all servers & search for CCT files.
	while(running){
		findCctFiles(ns);
		for (let i in serversWithCct) {
            var contract = serversWithCct[i];
            var contractType = ns.codingcontract.getContractType(contract[0], contract[1]);
            ns.print(`Found ${contractType} on ${contract[1]}`)
        //     switch (contractType) {
        //         case "Find Largest Prime Factor":
        //             await ns.exec("contract-prime-factor.ns", HOME, 1, contract[0], contract[1]);
        //             break;
        //         case "Total Ways to Sum":
        //             await ns.exec("contract-total-sum.ns", HOME, 1, contract[0], contract[1]);
        //             break;
        //         case "Array Jumping Game":
        //             await ns.exec("contract-array-jump.ns", HOME, 1, contract[0], contract[1]);
        //             break;
        //         case "Algorithmic Stock Trader II":
        //             await ns.exec("contract-stocks-2.ns", HOME, 1, contract[0], contract[1]);
        //             break;
        //         case "Unique Paths in a Grid I":
        //             await ns.exec("contract-unique-paths.ns", HOME, 1, contract[0], contract[1]);
        //             break;
        //         //case "Unique Paths in a Grid II":
        //         //    await ns.exec("contract-unique-paths-2.ns", home, 1, contract[0], contract[1]);
        //         //    break;
        //         case "Find All Valid Math Expressions":
        //             await ns.exec("contract-valid-expressions.ns", home, 1, contract[0], contract[1]);
        //             break;
        //         default:
        //             ns.print(`No match for ${contractType}`)
        //             break;
        //     }
        }
        
        await ns.sleep(60000);
	}	
}

function findCctFiles(ns){
	for(let i = 0; i<SERVER_LIST.length; i++){
		let server = SERVER_LIST[i];
		var serverContracts = ns.ls(server, ".cct");
		for (let c = 0; c < serverContracts.length;c++){
			serversWithCct.push([serverContracts[c], server]);
		}
	}
}