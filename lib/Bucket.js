export default class Bucket {

	// Holder of host server & thread count to run an executed script with!
	// Intended as a util function for controlCycle to be generated with the `distribute` function & returned as a list
	constructor(host, threads) {
		this.host = host;
		this.threads = threads;
	}
}