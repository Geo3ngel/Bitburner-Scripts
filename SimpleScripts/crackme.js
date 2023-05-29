// Servers to check through for value/hacking list
let vulnerableServers = []
let topTargets = []
let exploits = 0;
// For traversal
let queuedServers = []
let traversedServers = ["home"]
let virus = "/SimpleScripts/virus.js"

export async function main(ns) {
    await countExploits(ns);

    // Run the initial scan
    queuedServers = ns.scan();

    // Evaluating Servers & Cracking them!
    while (queuedServers.length > 0) {
        let server = queuedServers.shift();
        traversedServers.push(server);

        await processServer(ns, server)
    }
    ns.print(`Vulnerable Servers: ${vulnerableServers}`);

    // SCPs virus to vulnerable servers
    await infectVulnerableServers(ns);
    ns.print(`Servers infected.`)
    // Determines which vulnerable servers are best to hack for $$$
    await profileTargets(ns);
    ns.print(`High profile targets selected: ${topTargets}`)
    // Initiates attacks on top targets on compromised servers
    await attackTopTargets(ns);

    await ns.sleep(10000)
}

export async function countExploits(ns) {
    if (ns.fileExists("BruteSSH.exe")) {
        exploits++;
    }
    if (ns.fileExists("FTPCrack.exe")) {
        exploits++;
    }
    if (ns.fileExists("HTTPWorm.exe")) {
        exploits++;
    }
    if (ns.fileExists("relaySMTP.exe")) {
        exploits++;
    }
    if (ns.fileExists("SQLInject.exe")) {
        exploits++;
    }
}

export async function processServer(ns, server) {
    if (!ns.hasRootAccess(server)) {
        // Attempt to crack
        if (ns.getServerNumPortsRequired(server) <= exploits) {
            try {
                switch (ns.getServerNumPortsRequired(server)) {
                    case 5:
                        ns.sqlinject(server)
                    case 4:
                        ns.httpworm(server)
                    case 3:
                        ns.relaysmtp(server)
                    case 2:
                        ns.ftpcrack(server)
                    case 1:
                        ns.brutessh(server)
                    default:
                        ns.nuke(server)
                }
            } catch {
                ns.print(`Can't crack ${server} yet.`);
            }
        }
    }

    if (ns.hasRootAccess(server)) {
        vulnerableServers.push(server)
        let subServers = ns.scan(server)
        for (let index = 0; index < subServers.length; index++) {
            let subServer = subServers[index];
            if (!traversedServers.includes(subServer)) {
                queuedServers.push(subServer)
            }
        }
    }
}

export async function infectVulnerableServers(ns) {
    // Scp virus script to servers
    for (let index = 0; index < vulnerableServers.length; index++) {
        let server = vulnerableServers[index];
        await ns.scp(virus, server)
        ns.print(`Infected ${server} with Virus.`)
    }

    // TODO: Run virus on vulnerable server(s) against selected target server(s)

    // TODO: Determine highest value targetable server (Profile hacking targets)
    // TODO: Target most valuable servers (make a list)
    // Then send out `hack` command to all vulnerable servers targeting X server
    // ns.print(`Hacking ${targetServer}`);
    // await ns.hack(targetServer);
    // await ns.grow(targetServer);
    // await ns.weaken(targetServer);

    /*
        FUTURE FEATURES:
        - remote controll capability: kill other server's scripts to restart w/ new targets!
        - determine high value targets!
        - deploy Virus (attack script) on all cracked servers to attack most valuable targets! (MVTs)
        - Use the maximum threads possible for attack script
    */
}

// TODO: Determine highest value targetable server (Profile hacking targets)
export async function profileTargets(ns) {
    for (let index = 0; index < vulnerableServers.length; index++) {
        let server = vulnerableServers[index];
        // For now, we're just going with the highest dollar amount :P
        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server)) {
            if (topTargets.length < 5 && !topTargets.includes(server)) {
                topTargets.push(server);
            } else {
                for (let i = 0; i < topTargets.length; i++) {
                    if (ns.getServerMaxMoney(topTargets[i]) < ns.getServerMaxMoney(server) && !topTargets.includes(server)) {
                        topTargets[i] = server;
                        break;
                    }
                }
            }
        }
    }
    // let server = vulnerableServers[index];
    // 	let maxMoney = ns.getServerMaxMoney(server);
    // 	let hackSuccessChance = ns.hackSuccessChance(server);
    // 	// let threadScale = threadsUsed
    // 	let weakenTime = security/weakenProgress
}

export async function attackTopTargets(ns) {
    // Iterate through list of servers, Exec-ing the virus script w/ the top targets as input for arguments.
    // The tricky bit here will be determining max amount of threads to run the virus with
    // for (let index = 0; index < topTargets.length; index++) {
    let threadCost = ns.getScriptRam(virus);
    let server;
    let maxRam;
    let maxThreadCount;
    ns.print(`Top Targets: ${topTargets}`)
    await ns.sleep(10000)
    for (let index = 0; index < vulnerableServers.length; index++) {
        // const maxThreads = Math.floor(maxRam / threadCost);
        server = vulnerableServers[index];
        ns.killall(server)
        maxRam = ns.getServerMaxRam(server);
        maxThreadCount = Math.floor(maxRam / threadCost);
        if (maxThreadCount <= 0) {
            ns.print(`NOT ENOUGH resources on server: _${server}_ to run virus.`)
        } else {
            switch (topTargets.length) {
                case 5:
                    ns.exec(virus, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
                    break;
                case 3:
                    ns.exec(virus, server, maxThreadCount, topTargets[0], topTargets[1], topTargets[2]);
                    break;
                default:
                    ns.print(`Not enough topTagets: ${topTargets.length}`)
            }
        }
    }
    let home = "home";
    let homeThreadCount = Math.floor((ns.getServerMaxRam(home) - ns.getServerUsedRam(home)) / threadCost);
    // Start hacking script on home server too!

    switch (topTargets.length) {
        case 5:
            ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
            break;
        case 3:
            ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2]);
            break;
        default:
            ns.print(`Not enough topTagets: ${topTargets.length}`)
    }
    // ns.exec(virus, "home", homeThreadCount, topTargets[0], topTargets[1], topTargets[2], topTargets[3], topTargets[4]);
}