// Common constants
export const HOME = "home";
export const MAX_SERVER_RAM = 1048576;
export const MAX_SERVER_COST = 57671680000;
export const HOME_RESERVED_RAM = 50;
// Common script names
export const WEAKEN = "/lib/weaken.js";
export const GROW = "/lib/grow.js";
export const HACK = "/lib/hack.js";
export const VIRUS = "/SimpleScripts/virus.js"
// Reverse Engineered Game Constants
export const SERVER_WEAKEN_AMOUNT = 0.05;  // Amount by which server's security decreases when weakened
export const SERVER_MAX_GROWTH_RATE = 1.0035;
export const SERVER_BASE_GROWTH_RATE = 1.03;
export const SERVER_FORTIFY_AMOUNT = 0.002; // Amount by which server's security increases when it's hacked/grown
export const CCT_MAP = new Map(
	[
		["Find Largest Prime Factor", ["cctSolutions/findLargestPrimeFactor.js", 0]],
		["Total Ways to Sum", ["cctSolutions/totalWaysToSum.js", 0]],
		["Array Jumping Game", ["cctSolutions/arrayJumpingGame.js", 0]],
		["Algorithmic Stock Trader I", ["cctSolutions/algorithmicStockTrader.js", 1]],
		["Algorithmic Stock Trader II", ["cctSolutions/algorithmicStockTrader.js", 2]],
		["Algorithmic Stock Trader III", ["cctSolutions/algorithmicStockTrader.js", 3]],
		["Algorithmic Stock Trader IV", ["cctSolutions/algorithmicStockTrader.js", 4]],
		["Compression I: RLE Compression", ["cctSolutions/compression.js", 1]],
		["Compression II: LZ Decompression", ["cctSolutions/compression.js", 2]],
		["Compression III: LZ Compression", ["cctSolutions/compression.js", 3]],
		["Shortest Path in a Grid", ["cctSolutions/shortestPathInGrid.js", 0]],
		["Unique Paths in a Grid I", ["cctSolutions/uniquePathsInGrid.js", 1]],		//FAILING: UniquePathsInGrid
		["Unique Paths in a Grid II", ["cctSolutions/uniquePathsInGrid.js", 2]],
		["Find All Valid Math Expressions", ["cctSolutions/findAllValidMathExpressions.js", 0]],
		["Merge Overlapping Intervals", ["cctSolutions/mergeOverlappingIntervals.js", 0]],
		["Sanitize Parentheses in Expression", ["cctSolutions/sanitizeParentheses.js", 0]],
		["Spiralize Matrix", ["cctSolutions/spiralizeMatrix.js", 0]],
		["Generate IP Addresses", ["cctSolutions/generateIpAddresses.js", 0]],
		["Subarray with Maximum Sum", ["cctSolutions/subarrayWithMaximumSum.js", 0]],
		["Minimum Path Sum in a Triangle", ["cctSolutions/minimumPathSumInATriangle.js", 0]],
		["Encryption I: Caesar Cipher", ["cctSolutions/encryption.js", 1]],
		["Encryption II: Vigenère Cipher", ["cctSolutions/encryption.js", 2]]
	]
);

// Port labels
export const CONTROL_INBOUND_PORT = 0;
export const AUTO_NODE_INBOUND_PORT = 20
// Port commands
export const PAUSE = "PAUSE";
export const UNPAUSE = "UNPAUSE"
export const KILL = "KILL";

// Server Lists
export const SERVER_LIST = [
	"n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym",
	"darkweb", "zer0", "nectar-net", "max-hardware", "CSEC", "neo-net", "silver-helix", "phantasy", "omega-net",
	"the-hub", "johnson-ortho", "avmnite-02h", "computek", "crush-fitness", "netlink", "syscore", "summit-uni",
	"rothman-uni", "catalyst", "zb-institute", "I.I.I.I", "rho-construction", "alpha-ent", "millenium-fitness",
	"aevum-police", "lexo-corp", "aerocorp", "galactic-cyber", "global-pharm", "snap-fitness", "deltaone",
	"unitalife", "omnia", "icarus", "univ-energy", "solaris", "defcomm", "zeus-med", "infocomm", "taiyang-digital",
	"zb-def", "nova-med", "microdyne", "applied-energetics", "run4theh111z", "titan-labs", "stormtech", "helios",
	"fulcrumtech", "vitalife", "omnitek", "4sigma", "kuai-gong", ".", "blade", "clarkinc", "nwo", "b-and-a",
	"powerhouse-fitness", "ecorp", "fulcrumassets", "The-Cave", "megacorp"]
// Need some way of adding "Alpha servers", aka the ones I buy...
/**
 * Includes HOME
 */
export const FULL_SERVER_LIST = [HOME].concat(SERVER_LIST)
export const PURCHASED_SERVER_LIST = [
	"alpha-0", "alpha-1", "alpha-2", "alpha-3", "alpha-4", "alpha-5", "alpha-6", "alpha-7", "alpha-8", "alpha-9", "alpha-10", "alpha-11",
	"alpha-12", "alpha-13", "alpha-14", "alpha-15", "alpha-16", "alpha-17", "alpha-18", "alpha-19", "alpha-20", "alpha-21", "alpha-22", "alpha-23", "alpha-24"
]
export const TO_BACK_DOOR = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "fulcrumassets", "w0rld_d43m0n"] //"w0rld_d43m0n" needs check if it exists first?

/**
 * ############
 * 		Exploit List
 * ############
 */
export const BRUTE = "BruteSSH.exe";
export const FTP_CRACK = "FTPCrack.exe";
export const HTTP_WORM = "HTTPWorm.exe";
export const REPLAY_SMTP = "relaySMTP.exe";
export const SQL_INJECT = "SQLInject.exe";
export const EXPLOIT_LIST = [
	BRUTE, FTP_CRACK, HTTP_WORM, REPLAY_SMTP, SQL_INJECT
]

export const PURCHASING_EXPLOIT = "PURCHASING_EXPLOIT";
export const PURCHASING_SERVER = "PURCHASING_SERVER";
export const PURCHASING_HACK_NET_NODE = "PURCHASING_HACK_NET_NODE";
export const PURCHASING_AUGMENTATION = "PURCHASING_AUGMENTATION";
export const PURCHASING_HOME_UPGRADE = "PURCHASING_HOME_UPGRADE";
export const PURCHASE_EVENT_LIST = [
	PURCHASING_EXPLOIT, PURCHASING_SERVER, PURCHASING_HACK_NET_NODE, PURCHASING_AUGMENTATION, PURCHASING_HOME_UPGRADE
]

/**
 * ########################
 * 			FACTION LISTS
 * ########################
 */
// TODO: Add more factions lists as needed?
// Would be nice to have a map of factions to Augs w/ requirements to intelligently parse through...
export const FACTIONS_TO_AUTOJOIN = [
	"CyberSec", "Tian Di Hui", "Netburners", // Early Game
	"NiteSec", "The Black Hand", "Bitrunners", // Hacking Groups
	"ECorp", "MegaCorp", "KuaiGong International", "Four Sigma", "NWO", "Blade Industries", //Megacorps
	"OmniTek Incorporated", "Bachman & Associates", "Clarke Incorporated", "Fulcrum Secret Technologies",
	"Slum Snakes", "Tetrads", "Silhouette", "Speakers for the Dead", "The Dark Army", "The Syndicate", // Criminal Organizations
	"The Covenant", "Daedalus", "Illuminati" // Endgame 
]

/**
 * ############
 * 		PORTS
 * ############
 */
export const MAIN_CONTROLLER = "MAIN_CONTROLLER";
export const FACTION_MANAGER_SERVICE = "FACTION_MANAGER_SERVICE";
export const HACKNET_MANAGER_SERVICE = "HACKNET_MANAGER_SERVICE";
export const PURCHASED_SERVER_MANAGER_SERVICE = "PURCHASED_SERVER_MANAGER_SERVICE";
export const HOME_UPGRADE_SERVICE = "PURCHASED_SERVER_MANAGER_SERVICE";
export const SERVICE_PORTS_MAP = new Map([
	[MAIN_CONTROLLER, 1],
	[FACTION_MANAGER_SERVICE, 2],
	[HACKNET_MANAGER_SERVICE, 3],
	[PURCHASED_SERVER_MANAGER_SERVICE, 4],
	[HOME_UPGRADE_SERVICE, 5],
	// [, 6],
	// [, 7],
	// [, 8],
	// [, 9],
	// [, 10],
	// [, 11],
	// [, 12],
	// [, 13],
	// [, 14],
	// [, 15],
	// [, 16],
	// [, 17],
	// [, 18],
	// [, 19],
	// [, 20],
]);
export const NULL_PORT_DATA = "NULL PORT DATA";
export const HACK_QUEUE_PORT = 1;
export const CONFIG_PORT = 20; // Used to set/update variables in control script for state change!

/**
 * #######################################
 * 		Function labels for control cycle
 * #######################################
 */
export const EXPLOIT_CHECK = "EXPLOIT_CHECK"; // Deprecated. To be removed
export const LVL_UP_CHECK = "LVL_UP_CHECK";
export const PRIME_ATTACK = "PRIME_ATTACK";
export const PURCHASE_PHASE = "PURCHASE_PHASE";
export const FACTION_CONTROLLER = "FACTION_CONTROLLER";

/**
 * ###############################################################
 * 		Types of WORK (singularity.getCurrentWork().type)
 * ###############################################################
 */
export const CRIME = "CRIME";
export const CLASS = "CLASS";
export const CREATE_PROGRAM = "CREATE_PROGRAM";
export const GRAFTING = "GRAFTING";
export const FACTION = "FACTION";
export const COMPANY = "COMPANY";
export const WORK_TYPES = [
	CRIME, CLASS, CREATE_PROGRAM, GRAFTING, FACTION, COMPANY
]

/**
 * LOG LEVELS
 * TODO: Implement more log levels as needed!
 */
export const LOG_LEVEL_ALL = 0;