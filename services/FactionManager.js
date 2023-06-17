import Service from 'lib/Service.js'
/** @param {NS} ns */
export default class FactionManagerService extends Service {
    constructor(name, port, pollingRate = 30) {
        super(name, port, pollingRate);
        // TODO: Put FactionMgrService specific vars here
    }
}