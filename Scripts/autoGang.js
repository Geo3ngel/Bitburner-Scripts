/**
 * TODO: Auto Recruit loop! 
 * Aims to farm rep early until we have max members!
 * - If we lose a member, the slot should also be refilled!
 * 
 * TODO: Ascension function!
 * Determine if it is optimal to ascend the member yet or not.
 * Should also buy equipment if the gang is financially able to support it (Will be replaced quickly)
 * This function should always be included in the loop, will need more complicated checks for the recruit phase
 * though as the rep is needed for getting new members!
 * - Maybe wait to ascend past a certain point until members are maxxed out?
 * - OR have it be proportional? And weighted by the individual member's rep?
 * 
 * TODO: Auto Territory take over!
 * Once we have enough members, start dedicating some/all to territory duty until we have enough of an advantage, 
 * and start/stop participating in Territory clashes based on our worst odds of winning! (Must be atleast 60%)
 * - If not above 60%, stop participating in territory clashes and focus on farming.
 * 		- Ideally, we'd want to track the progress rate of our gang's power vs other faction's power progress rate.
 * 		- Then use this to determine the exact number of members we need to dedicate to power farming/for how long.
 * 		- Realistically, probably don't really need to worry about this, is only useful so we know to avoid farming power if we
 * 		  can't outscale the other fastest growing faction yet, so we know to focus on growing our gang members.
 * 
 * TODO: Determine optimal member task for current goal!
 * Gaining Rep (For members)
 * Gaining Territory
 * Gaining $$$
 */

export async function main(ns) {
	while(true){
		for (let member of ns.gang.getMemberNames()){
			ns.gang.ascendMember(member);
			ns.gang.purchaseEquipment(member, "Baseball Bat") // TODO: Add item names to constants!
		}
		await ns.sleep(100);
	}
	// Check if we have the max amount of members
	if (ns.gang.getMemberNames().length < 15){ // TODO: Put this value in the list of constants!
		// Focus on recruiting members
	}else{
		
	}
	// ns.gang.ascendMember
	// ns.gang.getAscensionResult
	// ns.gang.purchaseEquipment
	// ns.gang.setMemberTask()
}