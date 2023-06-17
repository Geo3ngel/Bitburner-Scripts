import {
    HOME,
    LOG_LEVEL_ALL,
} from "lib/customConstants.js";
import {
    getTimestamp,
} from "lib/util.js"

/**
 * ###########################################################################
 * 		For solving all my complex logging needs!
 * ###########################################################################
 * If 'appending' is true, we are adding to the log file rather than overriding it! (default is false)
 * Can disable timestamp in logs by setting timestamping=false. (defaults to true)
 */
const BASE_PATH = "/log/"
export default class Logger {
    // TODO: Consider making logLevel set by default in the construct to make things easier to set up...?
    constructor(outputFile, appending = false, logLevel = LOG_LEVEL_ALL, server = HOME, timestamping = true) {
        this.logPath = BASE_PATH + outputFile + ".txt"
        this.logLevel = logLevel;
        this.server = server;
        this.appending = appending;
        this.timestamping = timestamping
    }
    log(ns, msg, logLvl = LOG_LEVEL_ALL) {
        if (this.logLevel <= logLvl) {
            let timestamp = getTimestamp();
            let append = this.appending ? "a" : "w";
            let msg_output = this.timestamping ? timestamp + ": " + msg : msg
            msg_output += " logLvl:" + logLvl

            ns.write(this.logPath, msg_output, append)
        }
    }
}