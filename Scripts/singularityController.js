import { connectTo } from "lib/util.js";
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
    SERVER_FORTIFY_AMOUNT,
    SERVER_LIST,
    EXPLOIT_CHECK,
    LVL_UP_CHECK,
    PRIME_ATTACK,
    EXPLOIT_LIST,
    PURCHASE_EVENT_LIST,
    PURCHASING_EXPLOIT, PURCHASING_SERVER, PURCHASING_HACK_NET_NODE, PURCHASING_AUGMENTATION, PURCHASING_HOME_UPGRADE,
    BRUTE, FTP_CRACK, HTTP_WORM, REPLAY_SMTP, SQL_INJECT,
    PURCHASE_PHASE
} from "lib/customConstants.js";
import {
    disableLogs,
    distributeLoad,
    calcGrowthThreads,
} from "lib/util.js";
/**
 * What should my new controlCycle look like? Should I even use one like this?
 */

// Lists events in the controlCycle that are being blocked from running by other tasks!
let blockedEvents = []
let controlCycle = new Map();
// controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns) });
controlCycle.set(LVL_UP_CHECK, function (ns) { levelUpCheck(ns) });
// // controlCycle.set(EVALUATE_TARGETS, function (ns) { primeHackableServers(ns) });
controlCycle.set(PRIME_ATTACK, function (ns) { multiStaggeredHack(ns) });
let purchasePhases = new Map();

serverMap = new Map();
var vulnerableServers; // List of servers that have already been cracked (Possibly not hackable yet)
var serversToExploit;
var hackableServers;
var notHackableServers;

var hackingLvl;
/**
 * Singularity docs: https://bitburner-beta.readthedocs.io/en/latest/netscript/netscriptsingularityfunctions.html#:~:text=The%20Singularity%20Functions%20are%20a,installing%20Augmentations%2C%20and%20creating%20programs.
 * 
 * I want this to be the master controll script for fulling automating bitbodes ideally!
 * Or at least dictating what tasks I'm currently working on, and delegating from there!
 * 
 * I want to be able to target an organization automatically based on the augs they have and buy them! 
 * @param {NS} ns */
export async function main(ns) {
    init(ns);
    /**
     * ControlCycle is basically a setup loop for listeners!
     * Things to include in controlCycle
     * - if a player levels up hacking
     * 		- RE-traverse servers to see if any are now hackable/backdoorable?
     */

    /**
     * #######################################################
     * 	I do need the ability to do blocking procedures...
     * 		- prevent other controlCycle stuff from running
     * 				- Specify what to blockby eventID
     * #######################################################
     */
    let running = true;
    while (running) {
        for (let [key, value] of controlCycle.entries()) {
            // ns.print(`Key: ${key}, ${controlCycle.size}`)
            if (!blockedEvents.includes(key))
                await value(ns);
        }
        await ns.sleep(25);
    }
    // ### Faction joining & rep gaining automation!
    // ### Work Automation system? (Focus state management system?)
    // ### Augmentation purchase automation!
}

function init(ns) {
    disableLogs(ns);
    hackingLvl = 1;
    ns.exec("lib/infect.js", HOME, 1);
    countExploits(ns)
    initPurchasePhases(ns);

    vulnerableServers = [HOME];
    hackableServers = [];
    serversToExploit = new PriorityQueue();
    notHackableServers = new PriorityQueue(); // Prioritized by min hacking level required
    processServersToNodes(ns);
    traverseServerNodes(ns, initServerNode, processServerNode)
    resetServerNodesTraversalState(ns);

    // Should be re-run after every vulnerable server is added!
    sortVulnerableServersByFreeRam(ns);
}

/**
 * ################################################################################
 * 		One of the main cycles!
 * 			Runs periodically to see what needs purchasing...
 * 			Might move purchase related tasks to an external script and
 * 			communicate via PORTS logic/api using msgDTOs!
 * - Uses PURCHASE_EVENT_LIST event array
 * ################################################################################
 */
async function purchasePhase(ns) {
    // PURCHASE_EVENT_LIST
    // PURCHASING_EXPLOIT, PURCHASING_SERVER, PURCHASING_HACK_NET_NODE, PURCHASING_AUGMENTATION,
    // Need some way of determining what I should focus on for this cycle...
    // Obv I should base this on what the bitnode sees at best?
    // Are hacknet nodes crap? Never buy them. is hacking crap? Ignore additional servers?
    // Weighing when I should buy AUGs is going to be tricky...
    // Try to base on income rate & distance from best case augs!
    // For now, assume priority of purchasing exploits, then go for augmentations automatically.
    // Can always work in nodes later from autoNet. Same for Servers!
    // 		Do based on the rate distance from being able to afford augs we're targeting!
}

function initPurchasePhases(ns) {
    if (availableExploits.length) {
        purchasePhases.set(PURCHASING_EXPLOIT, function (ns) { tryBuyExploits(ns) })
    }
    // ### Home server upgrade automation!
    //		- might do to move these to a version of my auto script?
    // - Ram upgrade
    // purchasePhases.set(PURCHASING_HOME_UPGRADE, function (ns) {tryBuyHomeUpgrade(ns)})
    // purchasePhases.set(PURCHASING_SERVER, function (ns) {tryBuyServer(ns)})
    // purchasePhases.set(PURCHASING_HACK_NET_NODE, function (ns) {tryBuyHackNetNode(ns)})

    // purchasePhases.set(PURCHASING_AUGMENTATION, function (ns) {tryBuyAugmentation(ns)})
    // The idea is to switch between phases at will. Not necessarily entirely remove them once done, like control cycle.
    controlCycle.set(PURCHASE_PHASE, function (ns) { purchasePhase(ns) });
}

/**
 * ################################################################################
 * 		Try buying Exploits periodically!
 * 			How can I avoid queueing multiple Exploit checks...
 * 			- Will also buy Tor!
 * ################################################################################
 */
async function tryBuyExploits(ns) {
    // Check if available first
    EXPLOIT_LIST.forEach(exploit => {
        // If we already have it, skip.
        if (!availableExploits.includes(exploit)) {
            // Do we have darkweb access? And enough funds? Buy it.
            let hasTor = ns.singularity.purchaseTor();
            let cost = ns.singularity.getDarkwebProgramCost(exploit);
            if (hasTor && cost < ns.getServerMoneyAvailable(HOME)) {
                ns.singularity.purchaseProgram(exploit)
                availableExploits.push(exploit)
            }
            // else work on it if not focused on anything else!
            else if (!ns.singularity.isBusy()) {
                ns.singularity.createProgram(exploit)
                // Enqueues task to see if program creation completes in the cycle!
                controlCycle.set(EXPLOIT_CHECK, function (ns) { exploitCheck(ns, exploit) });
            }
        }
    })
    if (availableExploits.length >= 5) {
        // Dequeue tryBuyExploits! (Remove from ever being callable again!)
        purchasePhases.delete(PURCHASING_EXPLOIT)
    }
}

/**
 * ################################################################################
 * 		Checks for completion of programmed exploits!			
 * ################################################################################
 */
async function exploitCheck(ns, exploit) {
    if (ns.fileExists(exploit)) {
        // EXPLOIT has been created
        availableExploits.push(exploit)
        controlCycle.delete(EXPLOIT_CHECK);
    } else if (!ns.singularity.isBusy()) {
        // EXPLOIT creation was canceled.
        controlCycle.delete(EXPLOIT_CHECK);
    }
}

/**
 * #######################################
 * 		Counts current exploits available
 * 			- Only really runs on init!
 * #######################################
 */
let availableExploits = []
export async function countExploits(ns) {
    let exploits = []
    EXPLOIT_LIST.forEach(exploit => {
        if (ns.fileExists(exploit)) {
            exploits.push(exploit)
        }
    });
    if (exploits == availableExploits) {
        return false;
    } else {
        availableExploits = exploits
        return true;
    }
}

/**
 * 	Prime servers for traversal as nodes
 */
function processServersToNodes(ns) {
    // Converts flat map of hostnames to serverNodes
    SERVER_LIST.forEach(server => {
        serverToNode(server)
    })
    // Sets serverNode's subServers to lists of serverNodes
    SERVER_LIST.forEach(server => {
        let subServerHostnames = ns.scan(server)
        let subServers = []
        subServerHostnames.forEach(hostname => {
            subServers.push(serverMap[hostname])
        })
        serverMap[server].setSubServers(subServers)
    })
}

function serverToNode(ns, server) {
    let serverNode = new ServerNode(server, ns.hasRootAccess(server), false);
    serverMap.set(server, serverNode);
}

/**
 * Recursively traverse server nodes
 * {@Param} SERVER: server to traverse first!
 * {@Param} toRun: function to be run for the given node uppon traversal!
 * traverseServerNodes(ns, initServerNode, processServerNode)
 */
function traverseServerNodes(ns, serverNode, toRun) {
    let subServers = serverNode.getSubServers();
    serverNode.setTraversed()

    subServers.forEach(server => {
        traverseServerNodes(ns, server, toRun)
    })

    toRun(ns, serverNode.getHostname());
}

/**
 * Iterates through ALL the serverNodes and reset their traversed to false
 */
function resetServerNodesTraversalState(ns) {
    SERVER_LIST.forEach(server => {
        serverMap[server].resetTraversed();
    })
}

function processServerNode(ns, server) {
    exploitServerNode(ns, server);
    isHackable(ns, server);
}

/**
 * 	Used for initial traversal
 */
async function exploitServerNode(ns, server) {
    // Attempt to crack
    let exploited = exploitServer(ns, server);

    log(ns, `Can't crack ${server} yet.`)
    if (exploited) {
        vulnerableServers.push(server);
        serverMap[server].setExploited();
    } else {
        let reqPorts = ns.getServerNumPortsRequired(server);
        serversToExploit.enqueue(server, reqPorts);
    }
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

/**
 * ##########################################################################################
 * [] Connection routing/pathing for backdooring automagically
 * ##########################################################################################
 */
async function backdoor(ns, server) {
    connectTo(server);
    await ns.singularity.installBackdoor();
}

/**
 * Returns true if it successfully exploits the server
 * - Should be run on list of all servers!
 * 	- pop off servers that are successfully exploited into "Vulnerable"
 * 	- Then from vulnerable into "hackable. (optionally backdoor?)"
 */
function exploitServer(ns, server) {
    let requiredPorts = ns.getServerNumPortsRequired(server)
    if (requiredPorts > availableExploits.length) {
        return false; // Failed to Exploit
    }
    availableExploits.forEach(exploit => {
        runExploit(ns, exploit, server);
    });
    ns.nuke(server);
    return true
}

function runExploit(ns, exploit, server) {
    switch (exploit) {
        case SQL_INJECT:
            ns.sqlinject(server)
            break;
        case HTTP_WORM:
            ns.httpworm(server)
            break;
        case REPLAY_SMTP:
            ns.relaysmtp(server)
            break;
        case FTP_CRACK:
            ns.ftpcrack(server)
            break;
        case BRUTE:
            ns.brutessh(server)
            break;
    }
}

async function sortVulnerableServersByFreeRam(ns) {
    vulnerableServers.sort(function (a, b) {
        let serverAFreeRam = ns.getServerMaxRam(a) - ns.getServerUsedRam(a);
        let serverBFreeRam = ns.getServerMaxRam(b) - ns.getServerUsedRam(b);
        return serverAFreeRam < serverBFreeRam ? 1 : serverAFreeRam > serverBFreeRam ? -1 : 0;
    });
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
    let chanceSuccess = ns.hackAnalyzeChance(server);
    let hackTime = ns.getHackTime(server);
    let growTime = ns.getGrowTime(server);
    let weakenTime = ns.getWeakenTime(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let time = hackTime + growTime + weakenTime * 2;

    let profitRating = (maxMoney / time) * chanceSuccess;
    return profitRating;
}

async function levelUpCheck(ns) {
    // Checks if there are no un-hackable servers remaining, will remove this from controlCycle
    if (notHackableServers.length < 1) {
        sortHackableServers(ns);
        return;
    }

    if (ns.getHackingLevel() !== hackingLvl) {
        hackingLvl = ns.getHackingLevel();

        // Servers that are now hackable will be moved onto the hackable stack/list
        let server;
        while (
            notHackableServers[0] !== undefined &&
            ns.getServerRequiredHackingLevel(notHackableServers[0]) <= ns.getHackingLevel() &&
            ns.hasRootAccess(notHackableServers[0])
        ) {
            server = notHackableServers.shift();
            hackableServers.push(server);
        }
        // sort after adding
        sortHackableServers(ns);
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

async function primeServer(ns, server) {
    let weakenTime = ns.getWeakenTime(server);
    let cores = ns.getServer(HOME).cpuCores; //1
    let coreBonus = 1 + (cores - 1) / 16;

    serverMap.get(server).setPriming(true);
    let minSecurityLvl = ns.getServerMinSecurityLevel(server);
    let currentSecurityLvl = ns.getServerSecurityLevel(server);
    let currentMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let securityIncrease = 0
    // Do we need to grow money?
    if (currentMoney < maxMoney) {
        let growthMultiplier = (maxMoney / currentMoney);
        let growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, cores));
        // Accounts for growth in weaken threads
        securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);
        // ns.print(`Growing by ${growthMultiplier} using ${growthThreads} threads.`)
        distributeLoad(ns, server, GROW, growthThreads, 0, vulnerableServers);
    }
    let securityDiff = (currentSecurityLvl + securityIncrease) - minSecurityLvl;
    let weakenThreads = Math.ceil(securityDiff / (coreBonus * SERVER_WEAKEN_AMOUNT));

    distributeLoad(ns, server, WEAKEN, weakenThreads, 0, vulnerableServers);
    ns.print("Sleeping for:", (weakenTime * 2))
    await ns.asleep(weakenTime * 2);
    // Prevents the script from trying to prime this server again!
    serverMap.get(server).setPrimed(true)
    serverMap.get(server).setPriming(false);
}

async function batchAttack(ns, server) {

    let hackTime = ns.getHackTime(server);
    let growTime = ns.getGrowTime(server); 			// hackTime * 3.2;
    let weakenTime = ns.getWeakenTime(server);	// hackTime * 4;

    // ##### TO TUNE THIS VALUE!!! ##### \\
    let profitPercent = 0.1;
    const step = 100; // time delay in ms between each action!
    let cores = ns.getServer(HOME).cpuCores; //1
    const coreBonus = 1 + (cores - 1) / 16;

    // Assumes the server is in a primed state.
    // ### HACK ###
    // # Ratio of the server's current money we want to take! (Maybe I should base this on the MAX money...?)
    let currentMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let profitAmount = maxMoney * profitPercent;

    let hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, profitAmount))
    let securityIncrease = ns.hackAnalyzeSecurity(hackThreads, server);
    // ### WEAKEN ###
    // Calculates the amount of weakening threads needed based on the amount security has increased!
    let weakenHackThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));

    // ### GROW ###
    let postHackMoney = currentMoney - profitAmount;
    let growthThreads = await calcGrowthThreads(ns, server, postHackMoney, maxMoney);
    securityIncrease = growthAnalyzeSecurity(growthThreads);
    // ns.print("SECURITY INCREASE POST GROWTH:", securityIncrease)
    // ### WEAKEN ###
    let weakenGrowthThreads = Math.ceil(securityIncrease / (coreBonus * SERVER_WEAKEN_AMOUNT));

    let hackingDelay = baseDelay + weakenTime - hackTime - step;
    let hackingWeakeningDelay = baseDelay; // hackingWeakening has no delay modifier
    let growthDelay = baseDelay + weakenTime - growTime + step;
    let growthWeakeningDelay = baseDelay + 2 * step;
    baseDelay = 2 * step;

    // ### See if we have enough threads for the entire batch to run
    let threadedHackRam = hackThreads * ns.getScriptRam(HACK);
    let hackWeakenRam = weakenHackThreads * ns.getScriptRam(WEAKEN);
    let growthWeakenRam = weakenGrowthThreads * ns.getScriptRam(WEAKEN);
    let growRam = growthThreads * ns.getScriptRam(GROW);
    let batchRam = threadedHackRam + hackWeakenRam + growthWeakenRam + growRam;
    let availableHostRam = calcHostRam(ns)

    if (availableHostRam > batchRam) {
        ns.print(`Distributing from ATTACK! MAX: ${ns.getServerMaxMoney(server)}, CURRENT: ${ns.getServerMoneyAvailable(server)}`)
        distributeLoad(ns, server, HACK, hackThreads, hackingDelay, vulnerableServers);
        distributeLoad(ns, server, WEAKEN, weakenHackThreads, hackingWeakeningDelay, vulnerableServers);
        distributeLoad(ns, server, GROW, growthThreads, growthDelay, vulnerableServers);
        distributeLoad(ns, server, WEAKEN, weakenGrowthThreads, growthWeakeningDelay, vulnerableServers);
    } else if (forceAttack) {
        // Eventually the overflow from distributeLoad will need to be re-queued properly...
        distributeLoad(ns, server, HACK, hackThreads, hackingDelay, vulnerableServers);
        distributeLoad(ns, server, WEAKEN, weakenHackThreads, hackingWeakeningDelay, vulnerableServers);
        distributeLoad(ns, server, GROW, growthThreads, growthDelay, vulnerableServers);
        distributeLoad(ns, server, WEAKEN, weakenGrowthThreads, growthWeakeningDelay, vulnerableServers);
    }
}

async function multiStaggeredHack(ns) {
    // Determines which vulnerable servers are best to hack for $$$
    sortHackableServers(ns);
    // ns.print(`ENTERING Stagger Attack: ${hackableServers}`);
    let topN = 1; // Maybe tweak this value later
    for (let i = 0; i < topN; i++) {
        let server = hackableServers[i]
        if (server != undefined) {
            let primed = isPrimed(ns, server);
            if (primed) {
                // ns.print(`Is Primed! Attacking: ${server}`)
                await batchAttack(ns, server);
            }
            else {
                if (!serverMap.get(server).isPriming()) {
                    await ns.print(`Is Priming: ${server} MAX: ${ns.getServerMaxMoney(server)}, CURRENT: ${ns.getServerMoneyAvailable(server)}`)
                    await primeServer(ns, server);
                } else {
                    await ns.print("Already Priming!");
                }
            }
        }
    }
}

function isPrimed(ns, server) {
    let availalbeMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let securityLvl = ns.getServerSecurityLevel(server);
    let minSecurity = ns.getServerMinSecurityLevel(server);
    return ((availalbeMoney >= maxMoney) && (securityLvl <= minSecurity)) || serverMap.get(server).isPrimed();
}

/**
 * ##########################################################################################
 * 	Port Communication interface! (Should this be moved out to lib/util.js?)
 * ##########################################################################################
 * - (Docs)[https://bitburner.readthedocs.io/en/latest/netscript/netscriptmisc.html]
 * - limited to ports 1-20
 */

/**
 * ##########################################################################################
 * 	Crime automation script [ Probably just launch/communicate with other script?]
 * ##########################################################################################
 */
var doingCrime = false;
function doCrime(ns) {
    if (!doingCrime) {
        // Execute crime doin' script
    }
    // Communicate with crime script as necessary
    if (doingCrime) {
        // stop doing crime?
        // Kill the script.
    }
}