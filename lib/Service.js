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
    constructor(name, port, tickRate = 30) {
        this.name = name;
        // Port the service receives messages from
        this.port = port;
        this.tickRate = tickRate;
        this.running = false;
        this.portHandle;
        // Required to set up for processing of datagrams from specific services
        this.serviceProccessDictionary = new Map();
        this.logger = new Logger(logDir + name, true)
        this.initProccessDict(); // TODO: Check this calls the overritten version!
    }

    /**
     * ##################################################################
     * #	FUNCTIONS TO BE OVERWRITTEN BY SERVICE IMPLEMENTATIONS!!!			#
     * ##################################################################
     */
    /**
     * This function is intended to be overwritten by the Service Implementation (Extending class)
     */
    initProccessDict() {
        // let mainControllerProcessMap = new Map();
        // mainControllerProcessMap.set("example", func);
        // this.serviceProccessDictionary.set(MAIN_CONTROLLER, mainControllerProcessMap);
        ns.print(`Process Dict Default.`)
    }

    /**
     * ##########################################################################
     * #	END  OF FUNCTIONS TO BE OVERWRITTEN BY SERVICE IMPLEMENTATIONS!!!			#
     * ##########################################################################
     */

    /**
     * Parse Datagram filters the data and directs it to the appropriate strategy. (AKA Process)
     */
    parseDatagram(ns, datagram) {
        ns.print(`FOCUS MANAGER SERVICE: ${datagram.id}`)
        // Check where it came from, and parse accordingly!
        let processDict = this.serviceProccessDictionary[datagram.id]
        if (processDict ?? null) {
            let data = datagram.data;
            Object.keys(data).forEach(key => {
                const value = data[key];
                const processor = processDict[key];
                if (processor ?? null) {
                    processor(ns, value);
                }
            });
        } else {
            this.logger.log(ns, "ERROR: Datagram service ID not supported: " + datagram.id);
        }
    }

    /**
     * Assumes the message is using my Datagram architecture! 
     */
    validateDatagram(ns, datagramStr) {
        let datagram = null;
        try {
            datagram = JSON.parse(datagramStr);
            if (typeof (datagram) === Object) {
                this.parseDatagram(ns, datagram);
            } else {
                this.logger.log(ns, "ERROR: Datagram is of type: " + typeof (datagram));
            }
        } catch (error) {
            // ns.print("Validation failed. datagramStr Null")
        }
    }

    /**
     * Act on the data parsed out in validation.
     * - Should always be overridden in services!
     */
    process(ns) {
        // TODO: Override!
    }

    /**
     * 
     */
    async tick(ns) {
        while (this.running) {
            await ns.sleep(this.tickRate);
            let datagramStr = await this.portHandle.read(); // What if nothing was read though?
            this.validateDatagram(ns, datagramStr);
            // if (datagramStr && datagramStr.length > 1 && datagramStr.includes("")) {
            // 	// Parse datagram string into object
            // 	let datagram = JSON.parse(datagramStr);
            // 	this.validateDatagram(ns, datagram);
            // 	// Run the process. (isn't necessarily dependand on having received a datagram!)
            // 	process(ns);
            // }
            this.process(ns);
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
            await this.tick(ns);
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