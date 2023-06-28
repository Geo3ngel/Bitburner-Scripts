import Service from 'lib/Service.js';
import {
    getMilliseconds,
    distributeLoad,
    PRIMING_SERVICE,
    MAIN_CONTROLLER,
} from 'lib/util.js';
import Datagram from 'lib/Datagram.js';

/**
 * TODO:
 * - Need some way of obtaining/passing around list of vulnerable servers! (Next service to build???)
 */
export default class PrimingService extends Service {
    constructor(name, port, tickRate = 30) {
        super(name, port, tickRate);
        // Map of servers being primed.
        this.primingServers = new Map();
        // Maps the variable names expected to be in datagram.data to function to process them
        this.dataProcessors = {
            "server": targetServer,
        };
    }

    /**
     * Sets up the Dictionary mapping Services to value proccessing.
     */
    initProccessDict() {
        let mainControllerProcessMap = new Map();
        mainControllerProcessMap.set("server", targetServer);
        // Might end up having to use 'super' instead of 'this'
        this.serviceProccessDictionary.set(MAIN_CONTROLLER, mainControllerProcessMap);
    }
    /**
     * Custom datagram intake for this Service!
     * TODO: Put this logic in Service.js, and focus on implementing the dataProcess[] Map in each service!
     * 				- If I do so, I'll also need to account for mapping to different ServiceIDs!
     * 				- Could be done with a map of Map[id:{Map[dataType: Processor]}]
     * 					- Map[ID][Key]
     */
    // parseDatagram(ns, datagram) {
    // 	ns.print(`FOCUS MANAGER SERVICE: ${datagram.id}`)
    // 	// Check where it came from, and parse accordingly!
    // 	// - Assuming it's coming from controller for now. Will likely really come from hack attack in the future? 
    // 	let data = datagram.data;
    // 	Object.keys(data).forEach(key => {
    // 		const value = data[key];
    // 		const processor = this.dataProcessors[key];
    // 		if (processor ?? null) {
    // 			processor(ns, value);
    // 		}
    // 	});
    // }

    /**
     * Function that runs the service?
     */
    process(ns) {
        for (const [key, value] of this.primingServers.entries()) {
            value.phaseFunction(ns, key);
        }
    }

    /**
     * Resets priming values for a given server.
     */
    onPrimingReset(server) {
        let primingServer = this.primingServers.get(server);
        primingServer.setComlpetionTime(0);
        primingServer.setRemainingWeakenThreads(0);
        primingServer.setRemainingGrowThreads(0);
        this.primingServers.set(server, primingServer);
    }

    /**
     * Singals to reserve RAM. (Use datagram.id to determine reason)
     * Might do to move this to util!
     *  - If so, have parameter for from server ID in datagram param.
     */
    reserveRam(ns, server, ramAmount) {
        let data = {
            reserveRam: {
                server: server,
                amount: ramAmount,
            }
        }
        let datagram = new Datagram(PRIMING_SERVICE, data);
        this.send(ns, MAIN_CONTROLLER, datagram); // Might need to use super.send rather than this.send?
    }

    /**
     * Signals for Ram to be cleared that is no longer needing to be reserved.
     */
    freeRam(ns, server, ramAmount) {
        let data = {
            freeRam: {
                server: server,
                amount: ramAmount,
            }
        }
        let datagram = new Datagram(PRIMING_SERVICE, data);
        this.send(ns, MAIN_CONTROLLER, datagram); // Might need to use super.send rather than this.send?
    }

    // TODO: Run script to prime the target server!
    // TODO: Send signal to MainController/HackAttack to reserve RAM needed to prime!

    /**
     * This should be called during the data parsing phase.
     */
    targetServer(ns, server) {
        let primingServer = new PrimingServer(server, this.startPrimingServer);
        this.primingServers.set(server, primingServer);
    }

    /**
     * Determines how manny threads are needed to weaken & grow the server
     */
    startPrimingServer(ns, server) {
        let cores = ns.getServer(HOME).cpuCores;
        let coreBonus = 1 + (cores - 1) / 16;

        let currentMoney = ns.getServerMoneyAvailable(server);
        let maxMoney = ns.getServerMaxMoney(server);
        // Do we need to grow money?
        let growthMultiplier = (maxMoney / currentMoney);
        let growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, cores));

        // Accounts for growth in weaken threads
        let minSecurityLvl = ns.getServerMinSecurityLevel(server);
        let currentSecurityLvl = ns.getServerSecurityLevel(server);
        let securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);
        let securityDiff = (currentSecurityLvl + securityIncrease) - minSecurityLvl;
        let weakenThreads = Math.ceil(securityDiff / (coreBonus * SERVER_WEAKEN_AMOUNT));

        let weakenTime = ns.getWeakenTime(server);
        let growTime = ns.getGrowTime(server);
        let completionTime = 0;
        if (growthThreads < 0) {
            growthThreads = 0;
            completionTime = getMilliseconds() + growTime;
        }
        if (weakenThreads < 0) {
            weakenThreads = 0;
            completionTime = getMilliseconds() + weakenTime;
        }

        this.primingServers.get(server).setComlpetionTime(completionTime);
        this.primingServers.get(server).setRemainingWeakenThreads(weakenThreads);
        this.primingServers.get(server).setRemainingGrowthThreads(growthThreads);

        if (completionTime > 0) {
            this.primingServers.get(server).setPhase(this.continuePrimingServer);
        } else {
            this.primingServers.get(server).setPhase(this.endPriming);
        }
    }

    /**
     * Handles continual distribution of priming (assuming low ram environment)
     */
    continuePrimingServer(ns, server) {
        let primingServer = this.primingServers.get(server);
        let remainingWeakenThreads = primingServer.remainingWeakenThreads;
        let remainingGrowthThreads = primingServer.remainingGrowThreads;
        let completionTime = primingServer.primingCompletionTime;
        if (completionTime < getMilliseconds()) {
            // Finished Priming
            this.primingServers.get(server).setPhase(this.endPriming);
        }
        let weakenTime = ns.getWeakenTime(server);
        let growTime = ns.getGrowTime(server);
        let undistributedWeakenThreads = 0;
        let undistributedGrowthThreads = 0;

        if (remainingWeakenThreads > 0) {
            undistributedWeakenThreads = distributeLoad(ns, server, WEAKEN, weakenThreads, 0, vulnerableServers);
            this.primingServers.get(server).setRemainingWeakenThreads(undistributedWeakenThreads);
        }

        if (remainingGrowthThreads > 0) {
            undistributedGrowthThreads = distributeLoad(ns, server, GROW, growthThreads, 0, vulnerableServers);
            this.primingServers.get(server).setRemainingGrowthThreads(undistributedGrowthThreads);
        }
        // If weakenThreads is not 0, but unDistributedWeakenThreads is 0, set time!
        // else if weakenThreads is 0, and growthTime+date > completionTime, set completion time!
        if (remainingWeakenThreads > 0 && undistributedWeakenThreads <= 0) {
            this.primingServers.get(server).setComlpetionTime(getMilliseconds() + weakenTime);
        } else
            if (
                remainingGrowthThreads > 0 && undistributedGrowthThreads <= 0 &&
                growTime + getMilliseconds() > completionTime
            ) {
                this.primingServers.get(server).setComlpetionTime(getMilliseconds() + growTime);
            }
    }

    endPriming(ns, server) {
        // Remove entry from map
        this.primingServers.delete(server);
        // TODO: Unblock/Trigger hack targeting of the server!
        // let data = {
        // 	reserveRam: {
        // 		server: server,
        // 		amount: ramAmount,
        // 	}
        // }
        // let datagram = new Datagram(PRIMING_SERVICE, data);
        // this.send(ns, MAIN_CONTROLLER, datagram); // Might need to use super.send rather than this.send?
    }
}

/**
 * Struct to hold data for a given server being primed
 * @Param {Function} phaseFunc - The function to run for the given phase.
 * - Supports the following Phases:
 * 		- start
 * 		- distribute
 * 		- end
 */
class PrimingServer {
    constructor(name, phaseFunc) {
        this.name = name;
        this.primingCompletionTime = 0;
        this.remainingWeakenThreads = 0;
        this.remainingGrowThreads = 0;
        this.phaseFunction = phaseFunc;
    }

    setComlpetionTime(time) {
        this.primingCompletionTime = time;
    }
    setRemainingWeakenThreads(threads) {
        this.remainingGrowThreads = threads;
    }
    setRemainingGrowThreads(threads) {
        this.remainingGrowThreads = threads;
    }
    setPhase(func) {
        this.phaseFunction = func;
    }
}
// TODO: Integrate w/ interface to tell who we're priming? (Display available/max ram?)


//////////////////////////////////////////////////////////////////////////////////////////////
/**
 * TODO: Split this up some more, and make it more conditional!
 * - i.e. if there are more weaken threads, we want to continually re-check if space is available
 * TODO: Only set the wait if there are no remaining threads!
 */
// primeServer(ns, server, remainingWeakenThreads, remainingGrowThreads) {
// 	let weakenTime = ns.getWeakenTime(server);
// 	let growTime = ns.getGrowTime(server);
// 	let cores = ns.getServer(HOME).cpuCores;
// 	let coreBonus = 1 + (cores - 1) / 16;
// 	let completionTime = this.primingServers.get(server).primingCompletionTime;

// 	// serverMap[server].setPriming(true);
// 	let growthThreads = remainingGrowThreads;
// 	if (remainingGrowThreads <= 0) {
// 		let currentMoney = ns.getServerMoneyAvailable(server);
// 		let maxMoney = ns.getServerMaxMoney(server);
// 		// Do we need to grow money?
// 		let growthMultiplier = (maxMoney / currentMoney);
// 		growthThreads = Math.ceil(ns.growthAnalyze(server, growthMultiplier, cores));
// 	}

// 	let weakenThreads = remainingWeakenThreads;
// 	if (remainingWeakenThreads <= 0) {
// 		// Accounts for growth in weaken threads
// 		let minSecurityLvl = ns.getServerMinSecurityLevel(server);
// 		let currentSecurityLvl = ns.getServerSecurityLevel(server);
// 		let securityIncrease = ns.growthAnalyzeSecurity(growthThreads, server);
// 		let securityDiff = (currentSecurityLvl + securityIncrease) - minSecurityLvl;
// 		weakenThreads = Math.ceil(securityDiff / (coreBonus * SERVER_WEAKEN_AMOUNT));
// 	}

// 	let undistributedWeakenThreads = distributeLoad(ns, server, WEAKEN, weakenThreads, 0, vulnerableServers);
// 	let undistributedGrowthThreads = 0;
// 	if (currentMoney < maxMoney && growthThreads > 0) {
// 		//Moved this down here temp to prioritize weakening of server!
// 		undistributedGrowthThreads = distributeLoad(ns, server, GROW, growthThreads, 0, vulnerableServers);
// 	}
// 	ns.print("Sleeping for:", weakenTime)
// 	// If weakenThreads is not 0, but unDistributedWeakenThreads is 0, set time!
// 	// else if weakenThreads is 0, and growthTime+date > completionTime, set completion time!
// 	if (weakenThreads > 0 && undistributedWeakenThreads <= 0) {
// 		this.primingServers.get(server).setComlpetionTime(getMilliseconds() + weakenTime);
// 	} else
// 		if (
// 			growthThreads > 0 &&
// 			growTime + getMilliseconds() > completionTime
// 		) {
// 			this.primingServers.get(server).setComlpetionTime(getMilliseconds() + growTime);
// 		}
// 	// Set remaining threads for the server!
// 	this.primingServers.get(server).setRemainingWeakenThreads(undistributedWeakenThreads);
// 	this.primingServers.get(server).setRemainingGrowthThreads(undistributedGrowthThreads);
// }