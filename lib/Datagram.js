/**
 * 	For sending data to/fro ports!
 *  @param {NS} ns 
 * */
export default class Datagram {
    constructor(id, data, block = [], trigger = []) {
        // Who the datagram is being sent from (What kind of Service!)
        this.id = id;
        // Data to be parsed depending on datagram ID!
        this.data = data;
        // What services need to be blocked until some service action is complete [USE CONSTANTS]
        // NOTE: Requires a future Datagram follow to UNBLOCK! (Or another service to override)
        //		- Maybe track the blocker to see if that process is still alive? 
        // 			(Otherwise unblock to avoid deadlocks!)
        this.block = block;
        // Things to kick off in response to this datagram message?? (easier to parse?)
        this.trigger = trigger;
    }
}