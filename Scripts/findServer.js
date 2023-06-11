// Goal of this script is to print the path of servers jumps to get to said server!
// Will take in 2 args, the SERVER_NAME, and the JUMP_AMOUNT.
// The JUMP_AMOUNT refers to the players available scan length!

/**
 * NOTABLE SERVERS TO SEARCH FOR:
 * - The-Cave (Must be backdoored before w0rld_d43m0n spawns)
 * - w0r1d_d43m0n
 */

/** @param {NS} ns */
let traversedServers = []
export async function main(ns) {
    ns.disableLog('ALL');
    let jumps = 1
    let target = "The-Cave"

    if (ns.args.length > 0) {
        target = ns.args[0]
    }
    if (ns.args.length > 1) {
        jumps = ns.args[1]
    }
    ns.print(`Target: ${target}`)
    ns.print(`Jumps: ${jumps}`)

    // DFS to find the server, keeping track of the parent server as a list.
    let server = ns.getHostname();
    traversedServers = [server]
    let path = await findServer(ns, server, target)

    if (path.length <= 1) {
        ns.print(`Couldn't find ${target}; ${path.length}`)
    } else {
        printMinPath(ns, jumps, path)
    }
    await ns.sleep(5000)
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

function findServerPath(ns, target) {
    // DFS to find the server, keeping track of the parent server as a list.
    let server = ns.getHostname();
    traversedServers = [server]
    let path = await findServer(ns, server, target)

    if (path.length <= 1) {
        ns.print(`Couldn't find ${target}; ${path.length}`)
    }
    return path;
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