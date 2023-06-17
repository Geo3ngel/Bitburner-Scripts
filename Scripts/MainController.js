import {
	MAIN_CONTROLLER,
	FACTION_MANAGER_SERVICE,
	HACKNET_MANAGER_SERVICE,
	PURCHASED_SERVER_MANAGER_SERVICE,
	HOME_UPGRADE_SERVICE,
	SERVICE_PORTS_MAP,
} from 'lib/customConstants.js';
import {
	getServicePort,
	getServiceByPort,
} from 'lib/util.js';
/**
 * This is the main controller for other game related Services!
 * Should be kept minimal in size ideally, and be used for orchestration/configuration of Services!
 * @param {NS} ns 
 * */
import Service from 'lib/Service.js'
/** @param {NS} ns */
export default class MainControllerService extends Service {
	constructor(name, port, pollingRate=30){
		super(name, port, pollingRate);
		// TODO: Put FactionMgrService specific vars here
	}

	parseDatagram(ns, datagram){
		// TODO: Customize!
		ns.print(`MAIN SERVICE:: ${datagram.id}`)
	}
}
 
/**
 * Entry point, shouldn't hold much logic if any.
 * - Starts the Main Controller Service.
 */
export async function main(ns) {
	ns.print("############################");
	let port = SERVICE_PORTS_MAP.get(MAIN_CONTROLLER);
	let mainControllerService = new MainControllerService(MAIN_CONTROLLER, port);
	await mainControllerService.start(ns);
}

// TODO: Port releveant stuff over from Singlularity Controller
// TODO: Split up services from Singlularity Controller!

/**
 * #####################
 * Service health checks
 * #####################
 *  */ 
// If this service should be running, is it running?
// ns.isRunning(Pid)
// let pid = ns.exec(...);