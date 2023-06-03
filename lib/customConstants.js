// Common constants
export const HOME = "home";
export const MAX_SERVER_RAM = 1048576;
export const MAX_SERVER_COST = 57671680000;
// Common script names
export const WEAKEN = "/lib/weaken.js";
export const GROW = "/lib/grow.js";
export const HACK = "/lib/hack.js";
export const VIRUS = "/SimpleScripts/virus.js"
// Reverse Engineered Game Constants
export const SERVER_WEAKEN_AMOUNT = 0.05;  // Amount by which server's security decreases when weakened
export const SERVER_MAX_GROWTH_RATE = 1.0035;
export const SERVER_BASE_GROWTH_RATE = 1.03;
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
		["Compression II: LZ Compression", ["cctSolutions/compression.js", 2]],
		["Compression III: LZ Compression", ["cctSolutions/compression.js", 3]],
		["Shortest Path in a Grid", ["cctSolutions/shortestPathInGrid.js"], 0],
		["Unique Paths in a Grid I", ["cctSolutions/uniquePathsInGrid.js", 1]],
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

export const PURCHASED_SERVER_LIST = [
	"alpha-0", "alpha-1", "alpha-2", "alpha-3", "alpha-4", "alpha-5", "alpha-6", "alpha-7", "alpha-8", "alpha-9", "alpha-10", "alpha-11",
	"alpha-12", "alpha-13", "alpha-14", "alpha-15", "alpha-16", "alpha-17", "alpha-18", "alpha-19", "alpha-20", "alpha-21", "alpha-22", "alpha-23", "alpha-24"
]