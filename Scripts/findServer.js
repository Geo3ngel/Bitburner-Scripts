// Goal of this script is to print the path of servers jumps to get to said server!
// Will take in 2 args, the SERVER_NAME, and the JUMP_AMOUNT.
// The JUMP_AMOUNT refers to the players available scan length!

/**
 * NOTABLE SERVERS TO SEARCH FOR:
 * - w0rld_d43m0n
 */

/** @param {NS} ns */
let traversedServers = ["home"]
export async function main(ns) {
    ns.disableLog('ALL');
    let target = "icarus"//"icarus" // TODO: Example server, use ARGS input
    let jumps = 10
    let path = []
    // DFS to find the server, keeping track of the parent server as a list.
    let initialScan = await ns.scan();
    for (let i = 0; i < initialScan.length; i++) {
        // Trims out purchased servers
        if (initialScan[i].includes("alpha-") && initialScan[i] !== "alpha-ent") {
            continue
        }

        path = await findServer(ns, initialScan[i], target)
        if (path.includes(target)) {
            break;
        }
    }
    // Then reduce to minimum servers to jump
    if (path.length <= 0) {
        ns.print(`Couldn't find ${target}; ${path.length}`)
    } else {
        printMinPath(ns, jumps, path)
    }
}

function printMinPath(ns, jumps, path) {
    ns.print("=======================\n     CONNECTION PATH    \n=======================\n")
    if (jumps >= path.length) {
        ns.print(`Direct connect to: ${path[path.length - 1]}`)
        return
    }
    let iter = jumps - 1;
    while (iter < path.length) {
        ns.print(`Connect to: ${path[iter]}`)
        iter += jumps
    }
}

// Recursivly DFS through all server nodes!
async function findServer(ns, server, target) {
    // start at X server
    let path = [server]
    if (server === target) {
        return path;
    }

    let servers = await ns.scan(server);
    for (let i = 0; i < servers.length; i++) {
        if (traversedServers.includes(servers[i])) {
            continue;
        }
        traversedServers.push(servers[i])
        let pathway = await findServer(ns, servers[i], target)
        if (pathway.includes(target)) {
            // target has been found! Add it to the path
            return path.concat(pathway)
        }
    }
    return path;
}