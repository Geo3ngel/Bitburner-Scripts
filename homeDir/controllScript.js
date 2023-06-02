/**
 * TODO: Make this the ultimate controll script!
 * The goal of this script is to basically be a glorified events manager.
 * 
 * [] The contractSolver will ideally automatically solve contracts, and noify me of their completion, so I can choose rep or $$$.
 * - Requires 5b API from darkweb to run.
 * - Could check for that too when counting executables!
 * 		- When we first detect it, we should launch the cctScript if it isn't already running
 * [] Now I just need to actually solve them all!
 * // Would be nice if we had a list of known servers we need to backdoor for FACTIONS, so it would give a toast notification!
 */

/**
 * [] Start breaking down my monolithic script into smaller bits for easier debugging!
 */
import PriorityQueue from "lib/PriorityQueue.js";
import ServerNode from "lib/ServerNode.js";
import {
    PAUSE, UNPAUSE, KILL,
    AUTO_NODE_INBOUND_PORT,
    CONTROL_INBOUND_PORT,
    HOME,
    WEAKEN, GROW, HACK, SERVER_WEAKEN_AMOUNT,
    SERVER_BASE_GROWTH_RATE,
    SERVER_MAX_GROWTH_RATE,
    SERVER_LIST
} from "lib/customConstants.js";
import {
    weakenTime, growTime, hackTime,
    growPercent, hackPercent
} from "lib/formulasHackingFacade.js";

// import Bucket from "lib/Bucket.js";
var player;
var serverMap;
var controlCycle;
// Servers to check through for value/hacking list
var vulnerableServers; // List of servers that have already been cracked (Possibly not hackable yet)
var serversToExploit;
var hackableServers;
var notHackableServers;
var topTargets;
var exploits;
var baseDelay; // Amount used to track delays between Batches! (Might need to be tweated/changed to time stamps?)
// For traversal
let queuedServers;
let traversedServers;

// Function labels for control cycle
const EXPLOIT_CHECK = 0;
const LVL_UP_CHECK = 1;
const PRIME_ATTACK = 2;

// Timers
var lastAvailableExploitsCheck;

//Player stats to listen to
var hackingLvl;
var logging_level;
var logging_enabled;
var ns2;
var homeReservedRam = 50;

async function init(ns) {
    baseDelay = 0;
    logging_level = 0;
    logging_enabled = false;
    ns2 = ns;
    player = ns.getPlayer();
    disableLogs(ns);
    // If need be, could make an "Event" wrapper class that is the function, 
    // UUID(name, effectively), and other useful vars for ordering.

    // High level functions for the main control loop!
    // Can be inserted & removed as deemed necessary!

    controlCycle = new Map();
    controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });
    controlCycle.set(LVL_UP_CHECK, function (ns) { levelUpCheck(ns) });
    // controlCycle.set(EVALUATE_TARGETS, function (ns) { primeHackableServers(ns) });
    controlCycle.set(PRIME_ATTACK, function (ns) { multiStaggeredHack(ns) });
    // controlCycle.set() //Idk, X_PORT_LISTEN maybe? (I.E. for Node, when that is useful...)
    // Additional EventQueue?
    serverMap = new Map();
    vulnerableServers = [HOME];
    serversToExploit = new PriorityQueue(); // Prioritized by # of exploits required
    exploits = 0;

    hackableServers = [];
    notHackableServers = new PriorityQueue(); // Prioritized by min hacking level required

    topTargets = []

    queuedServers = []
    traversedServers = [HOME]
    lastAvailableExploitsCheck = 0;
    hackingLvl = 1;
}

function disableLogs(ns) {
    ns.disableLog("disableLog");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("getServerSecurityLevel");
    ns.disableLog("getServerMinSecurityLevel");
    ns.disableLog("getServerNumPortsRequired");
    ns.disableLog("getServerRequiredHackingLevel");
    ns.disableLog("getHackingLevel");
    ns.disableLog("exec");
    ns.disableLog("scan");
    ns.disableLog("sleep");
    ns.disableLog("getServerGrowth");
}

function log(ns, string, level = 0) {
    if (logging_enabled && level <= logging_level) {
        ns.print(string);
    }
}

export async function main(ns) {
    init(ns);
    countExploits(ns);
    // Traversal should generate a list of all servers, ideally seperating them into hackable/notHackable
    // Evaluating Servers & Cracking them!
    traverseServers(ns);
    // ns.print(`Servers: ${vulnerableServers}`)
    await ns.exec("lib/infect.js", HOME, 1);

    let running = true;
    while (running) {
        for (let [key, value] of controlCycle.entries()) {
            // ns.print(`Key: ${key}, ${controlCycle.size}`)
            await value(ns);
        }
        await ns.sleep(25);
    }

    await ns.sleep(10000)
}

// INITIAL traversal of ALL servers, to split them up into catagories for future processing!
// Evaluating Servers & Cracking them!
async function traverseServers(ns) {
    // Run the initial scan
    queuedServers = ns.scan();
    // ns.print(`Initial servers:${queuedServers}`)
    let server;
    while (queuedServers.length > 0) {
        server = queuedServers.shift();
        traversedServers.push(server);
        // ns.print(`Traversing server: ${server}`)

        processServer(ns, server)
    }

    // TODO: Change to use SERVER_LIST & custom servers? (Write to this file when we have them? Only needs to be run once.)
    // Currently we have a problem where the alpha scripts don't have the infection files spread to them properly.
}

async function levelUpCheck(ns) {
    // ns.print("Entered Level Up Check")
    if (ns.getHackingLevel() !== hackingLvl) {
        hackingLvl = ns.getHackingLevel();
        // Checks if there are no un-hackable servers remaining, will remove this from controlCycle
        if (notHackableServers.length < 1) {
            controlCycle.delete(LVL_UP_CHECK);
            return;
        }

        // Servers that are now hackable will be moved onto the hackable stack/list
        let server;
        while (
            notHackableServers[0] !== undefined &&
            serverMap.get(notHackableServers[0]).getReqHackLvl() <= hackingLvl &&
            ns.hasRootAccess(notHackableServers[0])
        ) {
            server = notHackableServers.shift();
            hackableServers.push(server);
        }
        // sort after adding
        sortHackableServers(ns);
    }
}

// TODO: REDO SERVER TARGETING!!!
async function multiStaggeredHack(ns) {
    // Determines which vulnerable servers are best to hack for $$$
    sortHackableServers(ns);
    // ns.print(`ENTERING Stagger Attack: ${hackableServers}`);
    let topN = 1; // Maybe tweak this value later
    for (let i = 0; i < topN; i++) {
        let server = hackableServers[i]
        if (server != undefined) {
            let primed = isPrimed(ns, server);
            // let growthRate = ns.getServerGrowth(server)
            // ns.print(`Growth Rate: ${growthRate}`);
            // ns.print(`Primed status: ${primed}. MAX: ${ns.getServerMaxMoney(server)}, CURRENT: ${ns.getServerMoneyAvailable(server)}`)
            if (primed) {
                // ns.print(`Is Primed! Attacking: ${server}`)
                await batchAttack(ns, server);
            }
            else {
                if (!serverMap.get(server).isPriming()) {
                    await ns.print(`Is Priming: ${server} MAX: ${ns.getServerMaxMoney(server)}, CURRENT: ${ns.getServerMoneyAvailable(server)}`)
                    await primeServer(ns, server);
                } else {
                    // await ns.print("Already Priming!");
                }
            }
        }
    }
    // ns.print(`Finished multiStaggeredHack`)
}

export async function countExploits(ns) {
    let changed = false;
    if (ns.fileExists("BruteSSH.exe")) {
        exploits++;
        changed = true;
    }
    if (ns.fileExists("FTPCrack.exe")) {
        exploits++;
        changed = true;
    }
    if (ns.fileExists("HTTPWorm.exe")) {
        exploits++;
        changed = true;
    }
    if (ns.fileExists("relaySMTP.exe")) {
        exploits++;
        changed = true;
    }
    if (ns.fileExists("SQLInject.exe")) {
        exploits++;
        changed = true;
    }
    lastAvailableExploitsCheck = getTime();
    return changed;
}

async function exploitCheck(ns) {
    // ns.print("Entered Exploit Check")
    if (exploits < 5 && (getTime() - lastAvailableExploitsCheck) > 10) {
        let changed = countExploits(ns);
        if (changed) {
            crackExploitableServers(ns);
        }
    } else if (exploits === 5) {
        controlCycle.delete(EXPLOIT_CHECK);
        // ns.print("Canceling Exploit Check Task")
    }
}

async function crackExploitableServers(ns) {
    let server;
    while (exploits >= serversToExploit.front().getExploitsReq()) {
        server = serversToExploit.dequeue();
        crackServer(ns, server.getName(), server.getExploitsReq);
        vulnerableServers.push(server);
        serverMap[server].setExploited();
    }
    sortVulnerableServersByFreeRam(ns);
}

async function crackServer(ns, server, reqPorts) {
    switch (reqPorts) {
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
}

// Used for initial traversal
export async function processServer(ns, server) {
    let exploited = ns.hasRootAccess(server);
    let reqPorts = ns.getServerNumPortsRequired(server);
    if (!exploited) {
        // Attempt to crack
        if (reqPorts <= exploits) {
            crackServer(ns, server, reqPorts);
        } else {
            log(ns, `Can't crack ${server} yet.`)
            serversToExploit.enqueue(server, reqPorts);
        }
    }

    // Add to vulnerable server list
    exploited = ns.hasRootAccess(server);
    if (exploited) {
        vulnerableServers.push(server);
    }
    // Continues with the traversal
    let subServers = ns.scan(server)
    for (let index = 0; index < subServers.length; index++) {
        let subServer = subServers[index];
        if (!traversedServers.includes(subServer) && !queuedServers.includes(subServer)) {
            queuedServers.push(subServer)
        }
    }
    // ns.print(`${server}'s subservers: ${subServers}`)

    // Split into hackable/notHackable groupings
    let hackLvlReq = ns.getServerRequiredHackingLevel(server);
    let maxRam = ns.getServerMaxRam(server);
    isHackable(ns, server);
    let traversed = true;
    // TODO: hasCCT check?
    let hasCCT = false;
    // Add server to map w/ it's relevant info stored in a ServerNode for later ease of access.
    let serverNode = new ServerNode(server, reqPorts, hackLvlReq, exploited, maxRam, traversed, hasCCT, subServers);
    serverMap.set(server, serverNode);
    // ns.print(`SET SERVERNODE for ${server}, ${Array.from(serverMap.keys())} === ${vulnerableServers.length}`)
}

async function isHackable(ns, server) {
    let reqHackingLvl = ns.getServerRequiredHackingLevel(server);
    if (ns.getHackingLevel() >= reqHackingLvl && ns.hasRootAccess(server)) {
        hackableServers.push(server);
        return true;
    } else {
        notHackableServers.enqueue(server, reqHackingLvl);
    }
    return false;
}

// Util function
function sortHackableServers(ns) {
    hackableServers.sort(function (a, b) {
        let serverAValue = calcProfitRating(ns, a);
        let serverBValue = calcProfitRating(ns, b);
        return serverAValue < serverBValue ? 1 : serverAValue > serverBValue ? -1 : 0;
    });
}

function calcProfitRating(ns, server) {
    // (profit`/hackTime)*chanceSuccess
    // TO CONSIDER: Is it worth trying to factor in security level increase from successful hacks? (Can check ahead of time)
    // 		Could also use ns.hackAnalyzeThreads() to find hackThreads needed based on the amount of $$$ we want~
    //			- see if we have enough RAM for those threads maybe?
    // - Maybe use the growth rate too?
    // let growthParameter = ns.getServerGrowth(server); // Rate at which the server grows
    let chanceSuccess = ns.hackAnalyzeChance(server);
    let hackTime = ns.getHackTime(server);
    let maxMoney = ns.getServerMaxMoney(server);

    let profitRating = (maxMoney / hackTime) * chanceSuccess;
    return profitRating;
}

function isPrimed(ns, server) {
    let availalbeMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let securityLvl = ns.getServerSecurityLevel(server);
    let minSecurity = ns.getServerMinSecurityLevel(server);
    return (availalbeMoney >= maxMoney) && (securityLvl <= minSecurity);
}

// Could also use ports to ensure things are synced up via comm channels, but not sure if that would add to RAM usage..
// It does not! Wow. I'll totally just do that then, that seems way easier than guessing timings!
// Say port 1 is for weaken comms, 2 is for growth, and 3 is for hacking!


async function primeServer(ns, server) {
    let weakenTime = ns.getWeakenTime(server);
    // TODO: This miscalculates! should use the host server's cpu core count! Not Home for all!
    let cores = 1//ns.getServer(HOME).cpuCores;
    let coreBonus = 1 + (cores - 1) / 16;

    serverMap.get(server).setPriming(true);
    let minSecurityLvl = ns.getServerMinSecurityLevel(server);
    let currentSecurityLvl = ns.getServerSecurityLevel(server);
    let currentMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    if (currentSecurityLvl > minSecurityLvl) {
        // Pre-growth weakening necessary!
        let securityDiff = currentSecurityLvl - minSecurityLvl;
        let weakenThreads = Math.ceil(securityDiff / (coreBonus * SERVER_WEAKEN_AMOUNT));
        distributeLoad(ns, server, WEAKEN, weakenThreads, 0);
        ns.asleep(weakenTime); // Try breaking this out into it's own funciton to see if that helps...
    }

    if (currentMoney < maxMoney) {
        // Grow money!
        let growthRate = ns.getServerGrowth(server)
        let growthMultiplier = (maxMoney / currentMoney);//*(1/growthRate);
        let growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, cores));
        let securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);

        let weakenGrowthThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));
        ns.print(`Growing by ${growthMultiplier} using ${growthThreads} threads.`)
        distributeLoad(ns, server, GROW, growthThreads, 0);
        distributeLoad(ns, server, WEAKEN, weakenGrowthThreads, 0);
        await ns.asleep(weakenTime);
    }

    serverMap.get(server).setPriming(false);
}

async function primeServer2(ns, server) {
    let weakenTime = ns.getWeakenTime(server);
    // TODO: This miscalculates! should use the host server's cpu core count! Not Home for all!
    let cores = ns.getServer(HOME).cpuCores;
    let coreBonus = 1 + (cores - 1) / 16;

    serverMap.get(server).setPriming(true);
    let minSecurityLvl = ns.getServerMinSecurityLevel(server);
    let currentSecurityLvl = ns.getServerSecurityLevel(server);
    let currentMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    if (currentSecurityLvl > minSecurityLvl) {
        // Pre-growth weakening necessary!
        let securityDiff = currentSecurityLvl - minSecurityLvl;
        let weakenThreads = Math.ceil(securityDiff / (coreBonus * SERVER_WEAKEN_AMOUNT));
        distributeLoad(ns, server, WEAKEN, weakenThreads, 0);
        ns.asleep(weakenTime); // Try breaking this out into it's own funciton to see if that helps...
    }

    if (currentMoney < maxMoney) {
        // Grow money!
        let growthRate = ns.getServerGrowth(server)
        let growthMultiplier = (maxMoney / currentMoney);//*(1/growthRate);
        // Not certain if this accounts for server cores in any capacity?
        let growthThreads = Math.ceil(Math.log2(growthMultiplier) / Math.log2(growthRate));
        // ### Maybe I should assume 1 core for the base threads calc, and subtract based on the core modifier
        // in the distribution method?
        // let growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, 1 /*cores*/));
        let securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);

        let weakenGrowthThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));
        distributeLoad(ns, server, GROW, growthThreads, 0);
        distributeLoad(ns, server, WEAKEN, weakenGrowthThreads, 0);
        await ns.asleep(weakenTime);
    }

    serverMap.get(server).setPriming(false);
}

async function distributeGrowth(
    ns,
    targetServer, // Server being grown
    targetMoney = ns2.getServerMaxMoney(targetServer),
    startMoney = ns2.getServerMoneyAvailable(targetServer),
    // cores=ns2.getServer(targetServer).cpuCores // TODO: Change this to use the HOST's cores!
) {
    // How to distribute threads to servers such that the host server's cores are accounted for
    // in thread disbursing...?
    let cores;
    vulnerableServers.forEach(host => {
        cores = ns.getServer(host).cpuCores;
        ns.print(`Server: ${host}, Cores:${cores}`);
    })
}

async function batchAttack(ns, server) {

    let hackTime = ns.getHackTime(server);
    let growTime = ns.getGrowTime(server); 			// hackTime * 3.2;
    let weakenTime = ns.getWeakenTime(server);	// hackTime * 4;

    // ##### TO TUNE THIS VALUE!!! ##### \\
    let profitPercent = 0.5;
    const step = 200; // time delay in ms between each action!
    let cores = 1;//ns.getServer(HOME).cpuCores;
    const coreBonus = 1 + (cores - 1) / 16;

    // Assumes the server is in a primed state.
    // ### HACK ###
    // # Ratio of the server's current money we want to take! (Maybe I should base this on the MAX money...?)
    let currentMoney = ns.getServerMoneyAvailable(server);
    let profitAmount = currentMoney * profitPercent;
    let hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, profitAmount))
    let securityIncrease = ns.hackAnalyzeSecurity(hackThreads, server);
    // ### WEAKEN ###
    // Calculates the amount of weakening threads needed based on the amount security has increased!
    let weakenHackThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));

    // ### GROW ###
    // IS this calc incorrect? Or is there only so much we can grow at a given time?
    // let growthMultiplier = ns.getServerMaxMoney(server) / ns.getServerMoneyAvailable(server);
    // OOOOH, it's failing to do this calc because it views it as already at MAX!
    // We need to essentially do growthAnalyze based on what it WILL be! NOT where it is at run time!
    //	- Going to need to know how much the hack thread is going to end up taking... (profitAmount)
    // let growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, cores));
    let postHackMoney = currentMoney - profitAmount;
    let growthThreads = calcGrowthThreads(server, postHackMoney);
    securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);
    // ### WEAKEN ###
    let weakenGrowthThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));

    // ### Need to ensure the above occurs in the given order!
    let hackingDelay = baseDelay + weakenTime - hackTime - step;
    let hackingWeakeningDelay = baseDelay; // hackingWeakening has no delay modifier
    let growthDelay = baseDelay + weakenTime - growTime + step;
    let growthWeakeningDelay = baseDelay + 2 * step;
    baseDelay = 2 * step;

    // ### See if we have enough threads for the entire batch to run...
    let threadedHackRam = hackThreads * ns.getScriptRam(HACK);
    let hackWeakenRam = weakenHackThreads * ns.getScriptRam(WEAKEN);
    let growthWeakenRam = weakenGrowthThreads * ns.getScriptRam(WEAKEN);
    let growRam = growthThreads * ns.getScriptRam(GROW);
    let batchRam = threadedHackRam + hackWeakenRam + growthWeakenRam + growRam;
    let availableHostRam = calcHostRam(ns)

    if (availableHostRam > batchRam) {
        // ### POTENTIAL PROBLEM!! ###
        // Will splitting these across servers cause issues with the calculated results? (It might not)
        // ### Calculate time it will take to run them all! (Thread count shouldn't matter/affect this?)
        //			- but other modifiers might!
        ns.print(`Distributing from ATTACK! MAX: ${ns.getServerMaxMoney(server)}, CURRENT: ${ns.getServerMoneyAvailable(server)}`)
        distributeLoad(ns, server, HACK, hackThreads, hackingDelay);
        distributeLoad(ns, server, WEAKEN, weakenHackThreads, hackingWeakeningDelay);
        distributeLoad(ns, server, GROW, growthThreads, growthDelay);
        distributeLoad(ns, server, WEAKEN, weakenGrowthThreads, growthWeakeningDelay);
    }
}

/**
 * This calculates the number of threads needed to grow a server from one $amount to a higher $amount
 */
function calcGrowthThreads(ns, targetServer, startMoney, targetMoney = ns.getServerMaxMoney(targetServer), cores = 1) {
    // Multiplier to get to MAX server value!
    let growthMultiplier = targetMoney / startMoney;
    let server = ns.getServer(targetServer);

    // exponential base adjusted by security
    const adjGrowthRate = 1 + (SERVER_BASE_GROWTH_RATE - 1) / server.hackDifficulty;
    const exponentialBase = Math.min(adjGrowthRate, SERVER_MAX_GROWTH_RATE); // Cap growth rate

    const serverGrowthPercentage = ns.getServerGrowth(targetServer) / 100;
    const coreMultiplier = 1(cores - 1) / 16;
    let bitMult = ns.getBitNodeMultipliers();
    let playerMult = ns.getHackingMultipliers();
    let threadMultiplier = serverGrowthPercentage * playerMult.growth * coreMultiplier * bitMult.ServerGrowthRate;

    //### Gross math stuff. For explanation, see this reference: https://github.com/danielyxie/bitburner/blob/be42689697164bf99071c0bcf34baeef3d9b3ee8/src/Server/ServerHelpers.ts#L51
    const x = threadMultiplier * Math.log(exponentialBase);
    const y = startMoney * x + Math.log(targetMoney * x);

    let w;
    if (y < Math.log(2.5)) {
        const ey = Math.exp(y);
        w = (ey + (4 / 3) * ey * ey) / (1 + (7 / 3) * ey + (5 / 6) * ey * ey);
    } else {
        w = y;
        if (y > 0) w -= Math.log(y);
    }
    let cycles = w / x - startMoney;

    // ################################
    let bt = exponentialBase ** threadMultiplier;
    if (bt == Infinity) bt = 1e300;
    let corr = Infinity;
    // Two sided error because we do not want to get stuck if the error stays on the wrong side
    do {
        // c should be above 0 so Halley's method can't be used, we have to stick to Newton-Raphson
        let bct = bt ** cycles;
        if (bct == Infinity) bct = 1e300;
        const opc = startMoney + cycles;
        let diff = opc * bct - targetMoney;
        if (diff == Infinity) diff = 1e300;
        corr = diff / (opc * x + 1.0) / bct;
        cycles -= corr;
    } while (Math.abs(corr) >= 1);
    /* c is now within +/- 1 of the exact result.
     * We want the ceiling of the exact result, so the floor if the approximation is above,
     * the ceiling if the approximation is in the same unit as the exact result,
     * and the ceiling + 1 if the approximation is below.
     */
    const fca = Math.floor(cycles);
    if (targetMoney <= (startMoney + fca) * Math.pow(exponentialBase, fca * threadMultiplier)) {
        return fca;
    }
    const cca = Math.ceil(cycles);
    if (targetMoney <= (startMoney + cca) * Math.pow(exponentialBase, cca * threadMultiplier)) {
        return cca;
    }
    return cca + 1;
}

/**
 * v1 New World version of distributeAttackLoad!
 * should ensure batch is evenly distributed! (Proportionally? or...?)
 * - Should ideally use a messaging system, but that might be a v2 rework. 
 */
async function distributeLoad(ns, server, script, threads, delay, queued = false) {
    // TODO: Ensure batching is distributed evenly somehow...?
    let scriptRam = ns.getScriptRam(script);
    let remainingThreads = threads;
    // TODO: Log estimated completion time to make sure they're sync'd?
    ns.print(`Distributing: ${script} Threads: ${remainingThreads} Targeting: ${server} Delay: ${delay}`);
    // TODO: Ideally this would go through vulnerableServers sorted by MAX Ram!
    // 			- Control sorting of vulnerableServers before calling distributeLoad?
    vulnerableServers.forEach(host => {
        let maxHostRam = ns.getServerMaxRam(host);
        let hostUsedRam = ns.getServerUsedRam(host);
        if (script == GROW) {
            // ns.print(`Growth is being distributed! ${host}`)
        }

        // ### Short circuits
        if (maxHostRam === 0 || remainingThreads < 1) {
            if (script == GROW) {
                // ns.print(`Short Circuit! ${host}`)
            }
            return;
        }

        // Reserves some running space for the home server to execute other scripts!
        if (host == HOME) {
            if (script == GROW) {
                // ns.print(`On Home!! ${host}`)
            }
            maxHostRam -= homeReservedRam;
        }
        let remainingRam = (maxHostRam - hostUsedRam);

        // ### Space Check
        let availableHostThreads = Math.floor(remainingRam / scriptRam);
        if (availableHostThreads >= 1) {
            if (availableHostThreads > remainingThreads) {
                availableHostThreads = remainingThreads;
                remainingThreads = 0;
            } else {
                remainingThreads -= availableHostThreads;
            }
            ns.exec(script, host, availableHostThreads, server, delay, randomValue());
        } else {
            if (script == GROW) {
                // ns.print(`Not enough Room!! ${host}`)
            }
        }
    })
    if (queued) {
        // reduce amount of threads from queued call??
        // 	-Would it just be easier to requeue?
        // TODO: Implement this after to see if it works better.
    }
    else if (remainingThreads > 0) {
        ns.print(`Leftover Threads: ${remainingThreads} for ${script}`)
        // If there are threads remaining here, we want to queue the task w/ Remaining threads!
        // Shouldn't allow any more distributions to run while queue has any items!
        //	- Enqueue this task for future running!
        //	- prioritize that over any other task! (Set to current focus?)
        //		- CAREFUL to ensure it isn't requeued!
    }
}

function calcHostRam(ns) {
    let totalAvailableRam = 0;
    let maxHostRam;
    let hostUsedRam;
    let availableRam;
    vulnerableServers.forEach(host => {
        maxHostRam = ns.getServerMaxRam(host);
        hostUsedRam = ns.getServerUsedRam(host);
        availableRam = maxHostRam - hostUsedRam;
        totalAvailableRam += availableRam;
    })
    return totalAvailableRam;
}

function randomValue() {
    return Math.floor(Math.random() * 100000);
}

async function sortVulnerableServersByFreeRam(ns) {
    vulnerableServers.sort(function (a, b) {
        let serverAFreeRam = ns.getServerMaxRam(a) - ns.getServerUsedRam(a);
        let serverBFreeRam = ns.getServerMaxRam(b) - ns.getServerUsedRam(b);
        return serverAFreeRam < serverBFreeRam ? 1 : serverAFreeRam > serverBFreeRam ? -1 : 0;
    });
}

// Returns the amount of threads needed to hack X% of a server's money. (Enter percent as int)
function threadsToHackPercent(server, percent) {
    return Math.floor(percent / (hackPercent(server, player) * 100));
}
// Returns time in seconds!
async function getTime() {
    return Date.now() / 1000;
}