import Logger from 'lib/Logger.js';
import {
    getServiceByPort,
    getServicePort,
} from 'lib/util.js'

const logDir = "service/"
/** 
 * This Service class.
 * There should probably only every be one of any Service at a time...
 * 	- Consider using Singleton if needed!
 * @param {parseFunc} is the function that is responsible for parsing datagram information.
 *				This is meant to take place in the Service Implementation!
 * @param {NS} ns
 */
export default class Service {
    constructor(name, port, pollingRate = 30) {
        this.name = name;
        // Port the service receives messages from
        this.port = port;
        this.pollingRate = pollingRate;
        this.running = false;
        this.portHandle;
        this.logger = new Logger(logDir + name, true)
    }

    /**
     * ##################################################################
     * #	FUNCTIONS TO BE OVERWRITTEN BY SERVICE IMPLEMENTATIONS!!!			#
     * ##################################################################
     */
    /**
     * This function is intended to be overwritten by the Service Implementation (Extending class)
     */
    parseDatagram(ns, datagram) {
        ns.print(`Datagram id: ${datagram.id}`)
    }

    /**
     * ##########################################################################
     * #	END  OF FUNCTIONS TO BE OVERWRITTEN BY SERVICE IMPLEMENTATIONS!!!			#
     * ##########################################################################
     */

    /**
     * Assumes the message is using my Datagram architecture! 
     */
    validateDatagram(ns, datagram) {
        if (typeof (datagram) === Object) {
            this.parseDatagram(ns, datagram);
        } else {
            this.logger.log(ns, "ERROR: Datagram is of type: " + typeof (datagram));
        }
    }
    /**
     * 
     */
    async poll(ns) {
        while (this.running) {
            await ns.sleep(this.pollingRate);
            let datagram = await this.portHandle.read(); // What if nothing was read though?
            this.validateDatagram(ns, datagram);
        }
    }

    /**
     * Write out a datagram to another service
     */
    async send(ns, servicePort, datagram) {
        // TODO: Consider ensuring the datagram is signed FROM: (This Service Name)
        let outBoundPortHandle = ns.getPortHandle(servicePort);
        let success = await outBoundPortHandle.tryWritePort(JSON.stringify(datagram));
        if (success) {
            this.logger.log(ns, `SUCCESS: Service ${this.name} => ${getServiceByPort(servicePort)}`)
        } else {
            this.logger.log(ns, `ERROR: Service ${this.name} => ${getServiceByPort(servicePort)} FAILED.`)
        }
    }
    /**
     * Peek to check if the datagram is intended to be recieved by this service!
     *  	- really only useful for 
     */
    // isMsgForService(){

    // }
    async start(ns) {
        this.portHandle = ns.getPortHandle(this.port);

        if (!this.running) {
            this.running = true;
            await this.poll(ns);
        }
    }
    stop() {
        this.running = false;
    }
    /**
     * Kill Command!
     * - Ends the service
     */
    kill() {
        // Kills the script?
        // Useful for ending all Services from controller/dashboard?
        // Also useful for freeing up RAM when a Service is no longer needed.
    }
}