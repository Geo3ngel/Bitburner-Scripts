import {
    SERVER_LIST,
    HOME
} from "lib/customConstants.js";

export default function randomValue() {
	return Math.floor(Math.random() * 100000);
}

// TODO: Consider adding a general logging utility for outputting to an error log to a specified directory!
// I.E. 
export function debug(script, server, msg, type){
	// save it to the /log directory under it's appropriate "type"
	// Type will use constants for things like: ERROR, PRINT_OUT, etc.
	// E.G. an error message from controllScript.js running on n00dles would look like:
	//	- /log/errors/n00dles_controllScript.js.log 
}

export function getPuchasedServers(ns){
	let purchasedServers = ns.scan(HOME);
	purchasedServers = purchasedServers.filter(e => !SERVER_LIST.includes(e));
	return purchasedServers;
}