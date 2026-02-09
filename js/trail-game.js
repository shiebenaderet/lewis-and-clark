// ============================================================
// trail-game.js — Oregon Trail-style Lewis & Clark expedition game
// Unlocks after completing the educational journey
// ============================================================

const TrailGame = (() => {

  // --- Constants ---
  const DIFFICULTY = {
    greenhorn:  { label: 'Greenhorn',    foodMult: 0.7, eventChance: 0.5, desc: 'More supplies, fewer dangers. A good first expedition.' },
    explorer:   { label: 'Explorer',     foodMult: 1.0, eventChance: 0.7, desc: 'A balanced challenge worthy of a true explorer.' },
    trailblazer:{ label: 'Trailblazer',  foodMult: 1.3, eventChance: 0.9, desc: 'Harsh conditions. Only the toughest survive.' }
  };

  const PACE = {
    cautious: { label: 'Cautious', speed: 0.7, foodMult: 0.8, healthRisk: 0.05, desc: 'Slow but safe' },
    steady:   { label: 'Steady',   speed: 1.0, foodMult: 1.0, healthRisk: 0.10, desc: 'Normal pace' },
    grueling: { label: 'Grueling', speed: 1.4, foodMult: 1.3, healthRisk: 0.20, desc: 'Fast but exhausting' }
  };

  const PARTY_MEMBERS = [
    { id: 'lewis',       name: 'Capt. Lewis',    role: 'Commander',    health: 100 },
    { id: 'clark',       name: 'Capt. Clark',    role: 'Commander',    health: 100 },
    { id: 'york',        name: 'York',            role: 'Hunter',       health: 100 },
    { id: 'sacagawea',   name: 'Sacagawea',      role: 'Guide',        health: 100 },
    { id: 'drouillard',  name: 'Drouillard',     role: 'Scout',        health: 100 },
    { id: 'charbonneau', name: 'Charbonneau',    role: 'Interpreter',  health: 100 },
    { id: 'ordway',      name: 'Sgt. Ordway',    role: 'Sergeant',     health: 100 },
    { id: 'gass',        name: 'Sgt. Gass',      role: 'Carpenter',    health: 100 }
  ];

  const LEGS = [
    { from: 'Camp Dubois',          to: 'Great Plains',          miles: 600,  days: 67, date: 'May 14 – Jul 20, 1804', terrain: 'River — Missouri', consume: { food: 18, supplies: 8 } },
    { from: 'Great Plains',         to: 'Council Bluffs',        miles: 50,   days: 14, date: 'Jul 20 – Aug 3, 1804',  terrain: 'Prairie & River', consume: { food: 8, supplies: 4 } },
    { from: 'Council Bluffs',       to: 'Mandan Villages',       miles: 630,  days: 86, date: 'Aug 3 – Oct 28, 1804',  terrain: 'River — upper Missouri', consume: { food: 22, supplies: 10 } },
    { from: 'Mandan Villages',      to: 'Fort Mandan (winter)',  miles: 0,    days: 146,date: 'Oct 28, 1804 – Apr 7, 1805', terrain: 'Winter camp', consume: { food: 25, supplies: 5 } },
    { from: 'Fort Mandan',          to: 'Missouri headwaters',   miles: 600,  days: 60, date: 'Apr 7 – Jun 13, 1805',  terrain: 'River — upper Missouri', consume: { food: 16, supplies: 8 } },
    { from: 'Missouri headwaters',  to: 'Great Falls portage',   miles: 18,   days: 30, date: 'Jun 13 – Jul 15, 1805', terrain: 'Overland portage', consume: { food: 14, supplies: 12 } },
    { from: 'Great Falls',          to: 'Camp Fortunate',        miles: 200,  days: 33, date: 'Jul 15 – Aug 17, 1805', terrain: 'River & mountains', consume: { food: 15, supplies: 8 } },
    { from: 'Camp Fortunate',       to: 'Lemhi Pass & Rockies',  miles: 160,  days: 50, date: 'Aug 17 – Oct 7, 1805',  terrain: 'Rocky Mountains', consume: { food: 22, supplies: 14 } },
    { from: 'Rockies (Nez Perce)',  to: 'Columbia River',        miles: 400,  days: 40, date: 'Oct 7 – Nov 7, 1805',   terrain: 'River — Snake & Columbia', consume: { food: 12, supplies: 6 } },
    { from: 'Columbia River',       to: 'Fort Clatsop (Pacific)',miles: 100,  days: 13, date: 'Nov 7 – Nov 20, 1805',  terrain: 'River — Lower Columbia', consume: { food: 6, supplies: 3 } }
  ];

  const STOP_DESCRIPTIONS = [
    'Camp Dubois sits at the confluence of the Mississippi and Missouri Rivers. Your expedition of nearly four dozen men is ready to embark. The keelboat is loaded with supplies, trade goods, and scientific instruments. President Jefferson\'s orders are clear: find a route to the Pacific.',
    'The Great Plains stretch before you — an ocean of grass under an enormous sky. The Platte River marks your entry into the west. Wolves howl at night, and the soil is blackened by Native American controlled burns. Buffalo are plentiful.',
    'You prepare to meet the Oto and Missouri peoples — the first formal diplomatic council of the expedition. Your peace medals, flags, and gifts are ready. This meeting will set the pattern for every tribal encounter ahead.',
    'The Mandan-Hidatsa villages are a bustling trade hub. Thousands of people live here, trading furs, corn, and horses with nations from the Rockies to the Great Lakes. You must build a fort and survive the brutal North Dakota winter.',
    'Winter at Fort Mandan. Temperatures plunge to 40 below zero. You meet Charbonneau and his young Shoshone wife, Sacagawea. On February 11, she gives birth to Jean Baptiste. When spring comes, 33 of you will push west into the unknown.',
    'The Great Falls — five cascading waterfalls blocking your path. You must portage 18 miles overland, hauling boats and supplies through grizzly bear territory, prickly pear cactus, and swarms of mosquitoes.',
    'You desperately need horses to cross the Rocky Mountains. Sacagawea recognizes this landscape — it is her homeland. When you meet the Shoshone, their chief Cameahwait turns out to be her brother. Fortune smiles on the expedition.',
    'The Rocky Mountain crossing begins. The Lolo Trail is treacherous — deep snow, fallen timber, and no game. Your party nearly starves. The Nez Perce save you with food and teach you to build canoes by burning out logs.',
    'Racing down the Columbia River toward the Pacific! The current carries you swiftly past rapids and waterfalls. Native peoples line the banks, watching the strange party pass. The air grows salty.',
    'Clark writes in his journal: "Ocian in view! O! the joy." You\'ve reached the Pacific coast. Now the Corps must vote on where to spend the winter. Everyone votes — including York and Sacagawea.'
  ];

  // --- Game Events ---
  const GAME_EVENTS = [
    // WEATHER
    { id: 'thunderstorm', category: 'weather', title: 'Thunderstorm on the Plains',
      narrative: 'Dark clouds roll in fast. Thunder cracks across the prairie and rain falls in sheets. Lightning strikes nearby.',
      choices: [
        { text: 'Make camp immediately and secure the boats', result: 'You hunker down and ride out the storm. Some supplies get damp, but nothing is lost.', food: 0, health: 0, supplies: -2, morale: -3, good: true },
        { text: 'Press on through the storm to make distance', result: 'The wind tears at your sails and a crate of trade goods is swept overboard.', food: 0, health: -5, supplies: -8, morale: -5, good: false },
        { text: 'Seek shelter in a nearby grove of cottonwoods', result: 'The trees provide cover, but lightning strikes close. Everyone is shaken but safe.', food: 0, health: -2, supplies: 0, morale: -5, good: true }
      ]
    },
    { id: 'hailstorm', category: 'weather', title: 'Violent Hailstorm',
      narrative: 'Hailstones the size of musket balls pound down from the sky. Clark and several men are caught in the open.',
      choices: [
        { text: 'Everyone take cover under the boats!', result: 'The overturned boats shield the party. Some bruises, but no serious injuries.', food: 0, health: -3, supplies: -3, morale: -3, good: true },
        { text: 'Rush to the nearest overhang or ravine', result: 'You find a sheltering bluff just in time. The hail batters the landscape around you.', food: 0, health: -2, supplies: 0, morale: -2, good: true }
      ]
    },
    { id: 'bitter_cold', category: 'weather', title: 'Bitter Cold Snap',
      narrative: 'The temperature plunges to 40 degrees below zero. Frostbite is a real danger. The Missouri River is frozen solid.',
      choices: [
        { text: 'Stay in camp, keep fires burning, melt snow for water', result: 'You lose travel days but keep everyone alive. The hunters bring in some game.', food: -4, health: -3, supplies: -3, morale: -5, good: true },
        { text: 'Send hunters out — the party needs fresh meat', result: 'The hunters brave the cold and return with buffalo. Several suffer frostbite on their fingers.', food: 8, health: -8, supplies: 0, morale: 2, good: false },
        { text: 'Visit the Mandan villages to trade for food and warmth', result: 'The Mandan welcome you. They share corn and dried squash in exchange for metalwork.', food: 6, health: 2, supplies: -5, morale: 5, good: true }
      ]
    },
    { id: 'flash_flood', category: 'weather', title: 'Flash Flood!',
      narrative: 'A wall of water comes roaring down the creek bed. Clark, Sacagawea, and baby Baptiste are nearly swept away.',
      choices: [
        { text: 'Drop everything and scramble to high ground immediately', result: 'Everyone escapes, but Clark\'s compass, gunpowder, and some provisions are lost to the flood.', food: -5, health: 0, supplies: -8, morale: -4, good: true },
        { text: 'Try to save the instruments and supplies first', result: 'You rescue most of the scientific instruments but barely escape the rising water. Close call.', food: -3, health: -5, supplies: -3, morale: -6, good: false }
      ]
    },
    // WILDLIFE
    { id: 'grizzly_bear', category: 'wildlife', title: 'Grizzly Bear Attack!',
      narrative: 'A massive grizzly charges from the brush! Lewis wrote that these bears are "verry hard to kill." Six rifle balls barely slow them down.',
      choices: [
        { text: 'Form a firing line — coordinated volley!', result: 'It takes eight shots, but the bear finally falls. You have hundreds of pounds of meat, but used precious ammunition.', food: 12, health: -3, supplies: -4, morale: 3, good: true },
        { text: 'Run for the river — bears hate deep water', result: 'Several men jump into the Missouri. The bear gives chase briefly, then turns away. Hearts are pounding.', food: 0, health: -2, supplies: 0, morale: -5, good: true },
        { text: 'Play dead and hope it loses interest', result: 'The bear investigates, sniffs at a motionless man, then wanders off. Nobody breathes for a full minute.', food: 0, health: -5, supplies: 0, morale: -8, good: false }
      ]
    },
    { id: 'buffalo_herd', category: 'wildlife', title: 'Buffalo Herd Spotted',
      narrative: 'An enormous herd of buffalo stretches across the plain — thousands of animals. The ground trembles with their movement.',
      choices: [
        { text: 'Organize a careful hunting party', result: 'Drouillard leads the hunt and brings down three buffalo. The party feasts on hump meat and tongue!', food: 15, health: 2, supplies: -2, morale: 8, good: true },
        { text: 'Hunt aggressively — take as many as possible', result: 'You kill six buffalo but can only carry meat from two before it spoils. Ammunition is wasted.', food: 10, health: 0, supplies: -6, morale: 3, good: false },
        { text: 'Observe and document — Jefferson wants scientific data', result: 'Lewis makes detailed sketches and notes on behavior. No meat gained, but the President will be pleased.', food: 0, health: 0, supplies: 0, morale: 5, good: true }
      ]
    },
    { id: 'rattlesnake', category: 'wildlife', title: 'Rattlesnake in Camp',
      narrative: 'A rattlesnake is coiled near the sleeping area. Its rattle buzzes ominously in the darkness.',
      choices: [
        { text: 'Carefully dispatch it with a long stick', result: 'The snake is killed safely. Lewis preserves it as a specimen for President Jefferson.', food: 0, health: 0, supplies: 0, morale: 2, good: true },
        { text: 'Move camp to avoid more snakes', result: 'You relocate but lose half a day. The new campsite is better situated near fresh water.', food: -2, health: 0, supplies: 0, morale: 0, good: true }
      ]
    },
    { id: 'mosquito_swarm', category: 'wildlife', title: 'Mosquito Plague',
      narrative: 'Clouds of mosquitoes descend on the camp. Clark writes they are "so numerous that we can scarcely breathe."',
      choices: [
        { text: 'Build smudge fires with green wood for smoke', result: 'The smoke keeps the worst of them away, but everyone\'s eyes burn and the meat tastes of ash.', food: -2, health: -3, supplies: -2, morale: -4, good: true },
        { text: 'Cover exposed skin with bear grease', result: 'The grease helps somewhat. The bites are still miserable, but infection risk is reduced.', food: 0, health: -5, supplies: -3, morale: -6, good: true },
        { text: 'Push through it — no time to waste', result: 'Men are covered in welts. Several develop fevers from the constant biting.', food: 0, health: -10, supplies: 0, morale: -8, good: false }
      ]
    },
    // HEALTH
    { id: 'dysentery', category: 'health', title: 'Illness Strikes the Camp',
      narrative: 'Several men fall ill with violent stomach cramps and fever. The brackish water may be to blame.',
      choices: [
        { text: 'Rest for two days and boil all drinking water', result: 'The sick men recover slowly. Clark administers "Rush\'s pills" — powerful (and unpleasant) medicine.', food: -5, health: -5, supplies: -3, morale: -3, good: true },
        { text: 'Keep moving — they can ride in the boats', result: 'The sick men worsen on the rough river. One nearly dies before you finally stop to let them recover.', food: -3, health: -12, supplies: 0, morale: -8, good: false },
        { text: 'Ask local tribes for medicinal remedies', result: 'A tribal healer shares a bark tea remedy. The men improve within a day. Lewis carefully documents the treatment.', food: 0, health: 3, supplies: -2, morale: 5, good: true }
      ]
    },
    { id: 'prickly_pear', category: 'health', title: 'Prickly Pear Nightmare',
      narrative: 'The portage route is covered in prickly pear cactus. The spines pierce through double-soled moccasins, leaving men limping and bleeding.',
      choices: [
        { text: 'Wrap feet in extra leather and proceed slowly', result: 'Progress is slow but the extra protection helps. Some spines still get through, but fewer injuries.', food: -3, health: -4, supplies: -5, morale: -3, good: true },
        { text: 'Search for an alternate route around the cactus field', result: 'You find a longer path through rocky ground. More tiring but far less painful.', food: -5, health: -2, supplies: -2, morale: 0, good: true }
      ]
    },
    { id: 'near_starvation', category: 'health', title: 'Food Supplies Running Low',
      narrative: 'Game has been scarce for days. The portable soup (a kind of dried broth) is nearly gone. Men are eating candle tallow to survive.',
      choices: [
        { text: 'Butcher one of the horses for meat', result: 'The horse meat sustains the party for several days. It tastes terrible, but it keeps everyone alive.', food: 10, health: -2, supplies: 0, morale: -5, good: true },
        { text: 'Send the best hunters ahead to find game', result: 'Drouillard and two others scout ahead and find a small herd of elk. Fresh meat at last!', food: 8, health: 0, supplies: -2, morale: 5, good: true },
        { text: 'Push on — we\'ll find food at the next river', result: 'Another day without proper food. Men are weak and stumbling. Morale is dangerously low.', food: -3, health: -8, supplies: 0, morale: -10, good: false }
      ]
    },
    // NAVIGATION
    { id: 'river_fork', category: 'navigation', title: 'The River Forks — Which Way?',
      narrative: 'The Missouri splits into two branches. The men are convinced the muddy north fork is the true Missouri. Lewis suspects the clear south fork is correct.',
      choices: [
        { text: 'Trust Lewis\'s instinct — take the south fork', result: 'Lewis is right! The south fork leads to the Great Falls, confirming this is the true Missouri. The men are impressed.', food: -3, health: 0, supplies: 0, morale: 8, good: true },
        { text: 'Follow the men\'s vote — take the north fork', result: 'After two days, it becomes clear this is the wrong river. You backtrack, losing precious time and supplies.', food: -8, health: -3, supplies: -5, morale: -8, good: false },
        { text: 'Split into two scouting parties to investigate both', result: 'Lewis scouts south while Clark scouts north. After a few days, the answer is clear — south fork is correct.', food: -5, health: -2, supplies: -2, morale: 3, good: true }
      ]
    },
    { id: 'rapids', category: 'navigation', title: 'Dangerous Rapids Ahead',
      narrative: 'The river narrows into churning white water. Rocks jut up everywhere. Running these rapids could capsize the boats.',
      choices: [
        { text: 'Portage around the rapids — carry everything overland', result: 'Exhausting work, but safe. The boats and supplies make it through intact.', food: -4, health: -4, supplies: -2, morale: -2, good: true },
        { text: 'Run the rapids with experienced boatmen at the helm', result: 'One pirogue takes on water and nearly capsizes. Sacagawea calmly saves crucial instruments from the flood.', food: -2, health: -3, supplies: -6, morale: -3, good: false },
        { text: 'Hire local Native guides who know this stretch of river', result: 'The guides expertly navigate the rapids. Your trade goods are well spent for their knowledge.', food: 0, health: 0, supplies: -5, morale: 5, good: true }
      ]
    },
    { id: 'lost_trail', category: 'navigation', title: 'Lost in the Mountains',
      narrative: 'Snow has obscured the trail. Old Toby, your Shoshone guide, is uncertain which ridge to follow. Every wrong turn costs precious energy and daylight.',
      choices: [
        { text: 'Climb to a high point and survey the landscape', result: 'Clark spots a familiar river valley in the distance. You correct course and find the trail again.', food: -3, health: -3, supplies: 0, morale: 2, good: true },
        { text: 'Trust Old Toby\'s instinct — he knows these mountains', result: 'Old Toby finds a faint trail marker. He leads you down a steep ravine to a passable valley.', food: -2, health: -2, supplies: 0, morale: 3, good: true },
        { text: 'Backtrack to the last known landmark', result: 'You lose two days but find the correct trail. The party is exhausted and dispirited.', food: -6, health: -5, supplies: -2, morale: -6, good: false }
      ]
    },
    // ENCOUNTERS
    { id: 'teton_sioux', category: 'encounter', title: 'Confrontation with the Teton Sioux',
      narrative: 'The Teton Sioux block the river and demand tribute. Warriors grab the bow cable of your boat. Their chief, Black Buffalo, watches with crossed arms. This could turn violent.',
      choices: [
        { text: 'Stand firm — ready weapons but do not fire', result: 'A tense standoff ensues. After three agonizing days of negotiation, Black Buffalo allows passage. No blood is shed, but it was close.', food: -5, health: 0, supplies: -8, morale: -5, good: true },
        { text: 'Offer generous gifts and speak of the "great father"', result: 'The gifts satisfy some chiefs, but others feel insulted. You pass, but the Teton Sioux are not pleased.', food: 0, health: 0, supplies: -12, morale: -3, good: true },
        { text: 'Turn the swivel cannon toward them as a show of force', result: 'The show of firepower creates a standoff. Warriors notch arrows. Clark eventually defuses the situation, but relations are poisoned.', food: 0, health: -3, supplies: -5, morale: -8, good: false }
      ]
    },
    { id: 'mandan_feast', category: 'encounter', title: 'Mandan Buffalo Dance',
      narrative: 'The Mandan invite you to a great feast and buffalo dance ceremony. Drums echo through the village as hundreds gather.',
      choices: [
        { text: 'Join the celebration — share food, music, and stories', result: 'York amazes everyone with his dancing. The Mandan are delighted and trade generously. A night to remember!', food: 8, health: 3, supplies: 3, morale: 12, good: true },
        { text: 'Attend respectfully but keep your distance', result: 'You watch politely. The Mandan appreciate your respect but wish you had joined in more.', food: 3, health: 0, supplies: 0, morale: 3, good: true }
      ]
    },
    { id: 'nez_perce_rescue', category: 'encounter', title: 'The Nez Perce Save the Expedition',
      narrative: 'Your party stumbles out of the mountains — starving, exhausted, barely alive. A Nez Perce village lies ahead. They could help... or see you as a threat.',
      choices: [
        { text: 'Approach peacefully, showing empty hands', result: 'The Nez Perce feed you camas root and dried salmon. They teach you to build canoes. The expedition is saved!', food: 14, health: 8, supplies: 5, morale: 15, good: true },
        { text: 'Send Sacagawea ahead as a sign of peace', result: 'Sacagawea\'s presence — a woman with a baby — signals peaceful intentions. The Nez Perce welcome you warmly.', food: 12, health: 6, supplies: 3, morale: 12, good: true }
      ]
    },
    { id: 'chinook_traders', category: 'encounter', title: 'Chinook Trading Party',
      narrative: 'A group of Chinook approach in large, beautifully carved canoes. They are shrewd traders, experienced in dealing with European and American ships.',
      choices: [
        { text: 'Trade metal tools and beads for dried fish and furs', result: 'The Chinook drive a hard bargain. You give up some supplies but gain valuable food and local knowledge.', food: 8, health: 0, supplies: -6, morale: 4, good: true },
        { text: 'Offer to demonstrate your technology in exchange for food', result: 'The Chinook are fascinated by your compass and air gun. They share salmon and directions to the coast.', food: 6, health: 0, supplies: -2, morale: 6, good: true },
        { text: 'Try to impress them with medals and speeches', result: 'The Chinook are unimpressed — they\'ve dealt with Europeans before. They trade, but only at steep prices.', food: 4, health: 0, supplies: -8, morale: -2, good: false }
      ]
    },
    // DISCOVERIES
    { id: 'prairie_dogs', category: 'discovery', title: 'Prairie Dog Town',
      narrative: 'Lewis discovers an enormous "village" of small barking animals — prairie dogs! He\'s determined to capture one alive to send to President Jefferson.',
      choices: [
        { text: 'Spend the afternoon trying to dig one out', result: 'After hours of digging and flooding burrows with water, you capture one alive! Lewis is thrilled.', food: -2, health: -2, supplies: 0, morale: 8, good: true },
        { text: 'Document them in the journal and move on', result: 'Lewis makes detailed sketches and notes. No specimen, but no time wasted either.', food: 0, health: 0, supplies: 0, morale: 3, good: true }
      ]
    },
    { id: 'specimen_collection', category: 'discovery', title: 'New Species Discovered!',
      narrative: 'Lewis spots a bird he\'s never seen before — black and white with a long tail, chattering loudly. It\'s a magpie, unknown to American science!',
      choices: [
        { text: 'Collect specimens and make detailed sketches', result: 'Lewis documents the magpie along with three other new species. Jefferson will be delighted with these scientific discoveries.', food: -1, health: 0, supplies: -1, morale: 6, good: true },
        { text: 'Note its location and keep moving', result: 'You mark it in the journal. Speed is more important right now than specimens.', food: 0, health: 0, supplies: 0, morale: 2, good: true }
      ]
    },
    { id: 'stargazing', category: 'discovery', title: 'Celestial Navigation',
      narrative: 'A clear night sky offers a perfect opportunity for astronomical observations. Lewis can use his sextant to calculate your exact position.',
      choices: [
        { text: 'Spend the evening taking careful measurements', result: 'Lewis records precise latitude and longitude readings. These measurements will help create accurate maps of the territory.', food: -1, health: 0, supplies: 0, morale: 5, good: true },
        { text: 'Everyone needs sleep more than star charts right now', result: 'A good night\'s rest restores the party\'s energy. The stars will be there tomorrow.', food: 0, health: 3, supplies: 0, morale: 2, good: true }
      ]
    },
    // CAMP LIFE
    { id: 'boat_repairs', category: 'camp', title: 'Boats Need Repair',
      narrative: 'The pirogues are leaking badly. Sergeant Gass, the expedition\'s carpenter, says they must be caulked and patched before continuing.',
      choices: [
        { text: 'Stop for a day to make proper repairs', result: 'Gass supervises the repairs. Pine pitch seals the leaks. The boats are better than ever.', food: -3, health: 0, supplies: -4, morale: 3, good: true },
        { text: 'Do quick patches and keep moving', result: 'The hasty repairs hold for a while, but the boats take on water again within days.', food: -1, health: 0, supplies: -2, morale: -2, good: false }
      ]
    },
    { id: 'journal_writing', category: 'camp', title: 'Evening by the Campfire',
      narrative: 'A quiet evening. The men sit around the fire telling stories. Lewis writes in his journal by firelight. Cruzatte plays his fiddle.',
      choices: [
        { text: 'Join the celebration — let the men enjoy themselves', result: 'Music and laughter fill the camp. Even the sentries are smiling. Morale soars around the crackling fire.', food: -1, health: 2, supplies: 0, morale: 10, good: true },
        { text: 'Use the time to organize supplies and plan tomorrow', result: 'Good planning helps you find supplies you thought were lost. A productive evening.', food: 0, health: 0, supplies: 3, morale: 2, good: true }
      ]
    },
    { id: 'equipment_breakdown', category: 'camp', title: 'Iron Boat Frame Fails',
      narrative: 'Lewis\'s experimental iron boat frame — "The Experiment" — cannot be properly sealed. Elk skins won\'t hold without pine pitch, and there are no pine trees here.',
      choices: [
        { text: 'Abandon the iron frame and build new canoes from cottonwood', result: 'It takes days, but the cottonwood dugouts float beautifully. Lewis mourns his invention, but the expedition continues.', food: -5, health: -3, supplies: -5, morale: -3, good: true },
        { text: 'Try animal tallow and charcoal as a sealant', result: 'The improvised sealant fails within hours. Water pours in. You lose a day and still have to build canoes.', food: -6, health: -4, supplies: -8, morale: -8, good: false }
      ]
    },
    { id: 'the_vote', category: 'camp', title: 'The Great Vote',
      narrative: 'You\'ve reached the Pacific coast. Now you must decide where to build winter quarters. Everyone in the party will have a say — including York and Sacagawea.',
      choices: [
        { text: 'South side of the Columbia — near elk and the Clatsop people', result: 'The vote is nearly unanimous. Fort Clatsop will be built on the south shore. Democracy on the frontier!', food: 0, health: 0, supplies: 0, morale: 10, good: true },
        { text: 'North side — better position if a trading ship arrives', result: 'Some prefer this option, but the majority votes south. The democratic process works, even here.', food: 0, health: 0, supplies: 0, morale: 5, good: true }
      ]
    }
  ];

  // --- Game State ---
  let gs = null; // game state

  function newGameState(difficulty) {
    return {
      difficulty: difficulty,
      currentLeg: 0,
      day: 0,
      totalDays: 0,
      food: 100,
      health: 100,
      supplies: 100,
      morale: 80,
      pace: 'steady',
      party: PARTY_MEMBERS.map(m => ({ ...m })),
      journal: [],
      eventsThisLeg: [],
      eventIndex: 0,
      phase: 'start', // start, stop, traveling, event, event-result, gameover, victory
      actionsThisStop: 0,
      maxActionsPerStop: 3,
      huntedThisStop: false,
      restedThisStop: false,
      tradedThisStop: false
    };
  }

  // --- Rendering Helpers ---
  function getEl() { return document.getElementById('trail-game-content'); }

  function statusBarHTML() {
    const g = gs;
    const leg = LEGS[Math.min(g.currentLeg, LEGS.length - 1)];
    const locationName = g.currentLeg >= LEGS.length ? 'Fort Clatsop — Pacific Ocean' : leg.from;
    const dateStr = leg ? leg.date.split('–')[0].split(',')[0].trim() : 'November 1805';
    return `
      <div class="tg-status-bar">
        <div class="tg-status-item">
          <span class="tg-status-label">Food</span>
          <div class="tg-status-bar-track"><div class="tg-status-bar-fill food" style="width:${Math.max(0, g.food)}%"></div></div>
          <span class="tg-status-value">${Math.max(0, g.food)}%</span>
        </div>
        <div class="tg-status-item">
          <span class="tg-status-label">Health</span>
          <div class="tg-status-bar-track"><div class="tg-status-bar-fill health" style="width:${Math.max(0, g.health)}%"></div></div>
          <span class="tg-status-value">${Math.max(0, g.health)}%</span>
        </div>
        <div class="tg-status-item">
          <span class="tg-status-label">Supplies</span>
          <div class="tg-status-bar-track"><div class="tg-status-bar-fill supplies" style="width:${Math.max(0, g.supplies)}%"></div></div>
          <span class="tg-status-value">${Math.max(0, g.supplies)}%</span>
        </div>
        <div class="tg-status-item">
          <span class="tg-status-label">Morale</span>
          <div class="tg-status-bar-track"><div class="tg-status-bar-fill morale" style="width:${Math.max(0, g.morale)}%"></div></div>
          <span class="tg-status-value">${Math.max(0, g.morale)}%</span>
        </div>
        <div class="tg-date-location">
          <span class="tg-date">Day ${g.totalDays} &mdash; ${dateStr}</span>
          <span class="tg-location">${locationName}</span>
        </div>
      </div>`;
  }

  function partyHTML() {
    return `<div class="tg-party-panel">${gs.party.map(m => {
      const hClass = m.health <= 0 ? 'dead' : m.health <= 30 ? 'poor' : m.health <= 60 ? 'fair' : 'good';
      const mClass = m.health <= 0 ? 'dead' : m.health <= 30 ? 'sick' : '';
      return `<div class="tg-party-member ${mClass}">
        <span class="tg-party-health-dot ${hClass}"></span>
        <span>${m.name}</span>
      </div>`;
    }).join('')}</div>`;
  }

  function journalHTML() {
    if (gs.journal.length === 0) return '';
    const recent = gs.journal.slice(-5).reverse();
    return `<div class="tg-journal-log">${recent.map(e =>
      `<div class="tg-journal-entry"><span class="tg-journal-date">Day ${e.day}:</span> ${e.text}</div>`
    ).join('')}</div>`;
  }

  function addJournal(text) {
    gs.journal.push({ day: gs.totalDays, text });
  }

  function clamp(val) { return Math.max(0, Math.min(100, Math.round(val))); }

  function applyEffects(effects) {
    const diff = DIFFICULTY[gs.difficulty];
    gs.food     = clamp(gs.food     + (effects.food || 0));
    gs.health   = clamp(gs.health   + (effects.health || 0));
    gs.supplies = clamp(gs.supplies + (effects.supplies || 0));
    gs.morale   = clamp(gs.morale   + (effects.morale || 0));

    // Random party member health effects
    if (effects.health < -5) {
      const alive = gs.party.filter(m => m.health > 0);
      if (alive.length > 0) {
        const victim = alive[Math.floor(Math.random() * alive.length)];
        victim.health = Math.max(0, victim.health + effects.health);
      }
    }
  }

  function checkGameOver() {
    if (gs.food <= 0 && gs.health <= 15) return 'starvation';
    if (gs.health <= 0) return 'health';
    const alive = gs.party.filter(m => m.health > 0);
    if (alive.length <= 1) return 'party_lost';
    if (gs.morale <= 0 && gs.health <= 20) return 'mutiny';
    return null;
  }

  // --- Phase Renderers ---

  function renderStart() {
    const el = getEl();
    el.innerHTML = `
      <div class="tg-card tg-fade-in">
        <div class="tg-card-header">
          <h2>The Lewis &amp; Clark Expedition</h2>
          <p class="tg-subtitle">An Oregon Trail Adventure, 1804&ndash;1806</p>
        </div>
        <div class="tg-card-body tg-start">
          <p class="tg-start-intro">
            You are Captain Meriwether Lewis. President Jefferson has entrusted you with leading
            the Corps of Discovery across 2,000 miles of uncharted wilderness to the Pacific Ocean.
            Manage your supplies, make critical decisions, and keep your party alive.
          </p>
          <p style="font-weight:bold;margin-bottom:0.5rem;">Choose your difficulty:</p>
          <div class="tg-difficulty-select">
            ${Object.entries(DIFFICULTY).map(([key, d]) =>
              `<button class="tg-difficulty-btn ${gs.difficulty === key ? 'selected' : ''}" onclick="TrailGame.setDifficulty('${key}')">${d.label}</button>`
            ).join('')}
          </div>
          <p class="tg-difficulty-desc">${DIFFICULTY[gs.difficulty].desc}</p>
          <button class="tg-btn tg-btn-primary" onclick="TrailGame.beginExpedition()" style="font-size:1.1rem;padding:0.8rem 2.5rem;">
            Begin the Expedition
          </button>
        </div>
      </div>`;
  }

  function renderStop() {
    const leg = LEGS[gs.currentLeg];
    const desc = STOP_DESCRIPTIONS[gs.currentLeg] || '';
    const actionsLeft = gs.maxActionsPerStop - gs.actionsThisStop;
    const isLastStop = gs.currentLeg >= LEGS.length;
    const el = getEl();

    if (isLastStop) {
      renderVictory();
      return;
    }

    el.innerHTML = `
      ${statusBarHTML()}
      <div class="tg-card tg-fade-in">
        <div class="tg-card-header">
          <h2>${leg.from}</h2>
          <p class="tg-subtitle">${leg.date}</p>
        </div>
        <div class="tg-card-body">
          <p class="tg-stop-desc">${desc}</p>

          <p style="font-size:0.85rem;color:var(--ink-light);margin-bottom:0.75rem;">
            <strong>Actions remaining:</strong> ${actionsLeft} of ${gs.maxActionsPerStop} &nbsp;|&nbsp;
            <strong>Next leg:</strong> ${leg.miles} miles to ${leg.to} (${leg.terrain})
          </p>

          <div class="tg-actions">
            <button class="tg-action-btn" onclick="TrailGame.doAction('hunt')" ${gs.huntedThisStop || actionsLeft <= 0 ? 'disabled' : ''}>
              <span class="tg-action-icon">&#127993;</span>
              <span class="tg-action-label">Hunt<small>Gain food (uses ammo)</small></span>
            </button>
            <button class="tg-action-btn" onclick="TrailGame.doAction('rest')" ${gs.restedThisStop || actionsLeft <= 0 ? 'disabled' : ''}>
              <span class="tg-action-icon">&#9978;</span>
              <span class="tg-action-label">Rest<small>Restore health</small></span>
            </button>
            <button class="tg-action-btn" onclick="TrailGame.doAction('trade')" ${gs.tradedThisStop || actionsLeft <= 0 ? 'disabled' : ''}>
              <span class="tg-action-icon">&#129309;</span>
              <span class="tg-action-label">Trade<small>Supplies for food</small></span>
            </button>
            <button class="tg-action-btn" onclick="TrailGame.doAction('forage')" ${actionsLeft <= 0 ? 'disabled' : ''}>
              <span class="tg-action-icon">&#127807;</span>
              <span class="tg-action-label">Forage<small>Find edible plants</small></span>
            </button>
          </div>

          <div style="margin-top:0.75rem;">
            <p style="font-size:0.85rem;margin-bottom:0.5rem;"><strong>Set pace for next leg:</strong></p>
            <div class="tg-difficulty-select" style="margin-bottom:0.75rem;">
              ${Object.entries(PACE).map(([key, p]) =>
                `<button class="tg-difficulty-btn ${gs.pace === key ? 'selected' : ''}" onclick="TrailGame.setPace('${key}')">${p.label}<br><small>${p.desc}</small></button>`
              ).join('')}
            </div>
          </div>

          <div class="tg-continue-row">
            <button class="tg-btn tg-btn-primary" onclick="TrailGame.startTravel()">
              Continue West &rarr;
            </button>
          </div>

          ${partyHTML()}
          ${journalHTML()}
        </div>
      </div>`;
  }

  function renderTraveling() {
    const leg = LEGS[gs.currentLeg];
    const el = getEl();
    el.innerHTML = `
      ${statusBarHTML()}
      <div class="tg-card">
        <div class="tg-card-body tg-travel-scene">
          <p class="tg-travel-text">Traveling to ${leg.to}...</p>
          <p class="tg-travel-detail">${leg.miles} miles &mdash; ${leg.terrain}</p>
          <div class="tg-travel-progress">
            <div class="tg-travel-progress-fill" style="width:0%"></div>
          </div>
          <p class="tg-travel-detail" style="margin-top:0.5rem;">The ${PACE[gs.pace].label.toLowerCase()} pace ${gs.pace === 'grueling' ? 'pushes the men hard' : gs.pace === 'cautious' ? 'preserves energy' : 'keeps steady progress'}.</p>
        </div>
      </div>`;

    // Animate progress bar
    setTimeout(() => {
      const fill = el.querySelector('.tg-travel-progress-fill');
      if (fill) fill.style.width = '100%';
    }, 100);

    // Apply travel costs
    const diff = DIFFICULTY[gs.difficulty];
    const pace = PACE[gs.pace];
    const foodCost = Math.round(leg.consume.food * pace.foodMult * diff.foodMult);
    const supplyCost = Math.round(leg.consume.supplies * diff.foodMult);

    gs.food = clamp(gs.food - foodCost);
    gs.supplies = clamp(gs.supplies - supplyCost);
    gs.totalDays += Math.round(leg.days / pace.speed);

    // Health risk from pace
    if (Math.random() < pace.healthRisk) {
      gs.health = clamp(gs.health - Math.round(5 * diff.foodMult));
    }

    addJournal(`Departed ${leg.from}. Traveling ${leg.miles} miles at ${gs.pace} pace.`);

    // Determine events for this leg
    const numEvents = Math.random() < diff.eventChance ? (Math.random() < 0.4 ? 2 : 1) : (Math.random() < 0.3 ? 1 : 0);
    const shuffled = [...GAME_EVENTS].sort(() => Math.random() - 0.5);
    gs.eventsThisLeg = shuffled.slice(0, Math.max(1, numEvents));
    gs.eventIndex = 0;

    // After travel animation, show first event or arrive
    setTimeout(() => {
      const go = checkGameOver();
      if (go) { renderGameOver(go); return; }
      if (gs.eventsThisLeg.length > 0) {
        gs.phase = 'event';
        renderEvent();
      } else {
        arriveAtStop();
      }
    }, 1800);
  }

  function renderEvent() {
    const event = gs.eventsThisLeg[gs.eventIndex];
    const el = getEl();
    el.innerHTML = `
      ${statusBarHTML()}
      <div class="tg-card tg-fade-in">
        <div class="tg-card-header">
          <h2>${event.title}</h2>
          <p class="tg-subtitle">Event ${gs.eventIndex + 1} of ${gs.eventsThisLeg.length}</p>
        </div>
        <div class="tg-card-body">
          <div class="tg-event-narrative">${event.narrative}</div>
          <div class="tg-choices">
            ${event.choices.map((c, i) =>
              `<button class="tg-choice-btn" onclick="TrailGame.chooseEvent(${i})">${c.text}</button>`
            ).join('')}
          </div>
          ${partyHTML()}
        </div>
      </div>`;
  }

  function renderEventResult(choiceIndex) {
    const event = gs.eventsThisLeg[gs.eventIndex];
    const choice = event.choices[choiceIndex];
    const el = getEl();

    // Apply effects
    applyEffects(choice);
    addJournal(`${event.title}: ${choice.result.substring(0, 80)}...`);

    const resultClass = choice.good ? 'tg-result-good' : 'tg-result-bad';

    el.innerHTML = `
      ${statusBarHTML()}
      <div class="tg-card tg-fade-in">
        <div class="tg-card-header">
          <h2>${event.title}</h2>
        </div>
        <div class="tg-card-body">
          <div class="tg-event-narrative">${event.narrative}</div>
          <div class="tg-choices">
            ${event.choices.map((c, i) => {
              if (i === choiceIndex) {
                return `<button class="tg-choice-btn ${choice.good ? 'chosen-good' : 'chosen-bad'}">${c.text}</button>`;
              }
              return `<button class="tg-choice-btn disabled-choice">${c.text}</button>`;
            }).join('')}
          </div>
          <div class="tg-result ${resultClass} tg-fade-in">
            <p style="margin:0 0 0.5rem;"><strong>${choice.good ? 'Good decision!' : 'A tough outcome.'}</strong></p>
            <p style="margin:0;">${choice.result}</p>
            <p style="margin:0.5rem 0 0;font-size:0.8rem;opacity:0.8;">
              ${choice.food ? (choice.food > 0 ? `Food +${choice.food}` : `Food ${choice.food}`) : ''}
              ${choice.health ? (choice.health > 0 ? ` | Health +${choice.health}` : ` | Health ${choice.health}`) : ''}
              ${choice.supplies ? (choice.supplies > 0 ? ` | Supplies +${choice.supplies}` : ` | Supplies ${choice.supplies}`) : ''}
              ${choice.morale ? (choice.morale > 0 ? ` | Morale +${choice.morale}` : ` | Morale ${choice.morale}`) : ''}
            </p>
          </div>
          <div class="tg-continue-row">
            <button class="tg-btn tg-btn-leather" onclick="TrailGame.advanceAfterEvent()">Continue &rarr;</button>
          </div>
          ${partyHTML()}
        </div>
      </div>`;
  }

  function renderGameOver(reason) {
    gs.phase = 'gameover';
    const messages = {
      starvation: { title: 'Starvation Claims the Expedition', subtitle: 'The Corps ran out of food in the wilderness.' },
      health: { title: 'The Expedition Perishes', subtitle: 'Disease and injury overwhelmed the party.' },
      party_lost: { title: 'The Corps Has Fallen', subtitle: 'Too few remain to continue the journey.' },
      mutiny: { title: 'The Men Have Had Enough', subtitle: 'With morale broken and bodies failing, the expedition disbands.' }
    };
    const msg = messages[reason] || messages.health;
    const leg = LEGS[Math.min(gs.currentLeg, LEGS.length - 1)];

    const el = getEl();
    el.innerHTML = `
      <div class="tg-card tg-fade-in">
        <div class="tg-card-body tg-endscreen">
          <div class="tg-tombstone">
            <h3>Here Lies the Expedition</h3>
            <p>${msg.subtitle}</p>
            <p style="margin-top:0.75rem;">Near ${leg.from}</p>
            <p>Day ${gs.totalDays} of the journey</p>
          </div>
          <h2 style="color:var(--danger);">${msg.title}</h2>
          <p class="tg-end-subtitle">The real Lewis &amp; Clark expedition made it through — can you?</p>
          <div class="tg-stats-grid">
            <div class="tg-stat-item"><span class="tg-stat-label">Days Survived</span><span class="tg-stat-value">${gs.totalDays}</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Distance Covered</span><span class="tg-stat-value">${LEGS.slice(0, gs.currentLeg).reduce((s, l) => s + l.miles, 0)} miles</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Legs Completed</span><span class="tg-stat-value">${gs.currentLeg} of ${LEGS.length}</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Party Surviving</span><span class="tg-stat-value">${gs.party.filter(m => m.health > 0).length} of ${gs.party.length}</span></div>
          </div>
          <button class="tg-btn tg-btn-primary" onclick="TrailGame.restart()" style="margin-right:0.5rem;">Try Again</button>
          <button class="tg-btn tg-btn-leather" onclick="TrailGame.exitGame()">Return to Expedition</button>
        </div>
      </div>`;
  }

  function renderVictory() {
    gs.phase = 'victory';
    const totalMiles = LEGS.reduce((s, l) => s + l.miles, 0);
    const alive = gs.party.filter(m => m.health > 0);
    const rating = gs.food + gs.health + gs.supplies + gs.morale;
    let rank = 'Frontier Legend';
    if (rating < 100) rank = 'Weary Traveler';
    else if (rating < 200) rank = 'Seasoned Explorer';
    else if (rating < 300) rank = 'Master Pathfinder';

    const el = getEl();
    el.innerHTML = `
      <div class="tg-card tg-fade-in">
        <div class="tg-card-body tg-endscreen">
          <h2 style="color:var(--forest);">Ocian in View! O! the Joy!</h2>
          <p class="tg-end-subtitle">The Corps of Discovery has reached the Pacific Ocean.</p>
          <p style="margin-bottom:1.5rem;">
            After ${gs.totalDays} days and ${totalMiles} miles, your expedition stands on the shores
            of the Pacific. Like the real Lewis and Clark, you have crossed a continent.
            ${alive.length === gs.party.length ? 'Remarkably, every member of your party survived!' :
              `${alive.length} of your ${gs.party.length} party members survived the journey.`}
          </p>
          <div class="tg-stats-grid">
            <div class="tg-stat-item"><span class="tg-stat-label">Total Days</span><span class="tg-stat-value">${gs.totalDays}</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Distance</span><span class="tg-stat-value">${totalMiles} miles</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Party Survived</span><span class="tg-stat-value">${alive.length} of ${gs.party.length}</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Food Remaining</span><span class="tg-stat-value">${gs.food}%</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Health</span><span class="tg-stat-value">${gs.health}%</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Supplies</span><span class="tg-stat-value">${gs.supplies}%</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Morale</span><span class="tg-stat-value">${gs.morale}%</span></div>
            <div class="tg-stat-item"><span class="tg-stat-label">Rank</span><span class="tg-stat-value">${rank}</span></div>
          </div>
          <p style="font-style:italic;color:var(--ink-light);margin-bottom:1.5rem;">
            Difficulty: ${DIFFICULTY[gs.difficulty].label}
          </p>
          ${partyHTML()}
          <div style="margin-top:1.5rem;">
            <button class="tg-btn tg-btn-primary" onclick="TrailGame.restart()" style="margin-right:0.5rem;">Play Again</button>
            <button class="tg-btn tg-btn-leather" onclick="TrailGame.exitGame()">Return to Expedition</button>
          </div>
        </div>
      </div>`;
  }

  // --- Action Handlers ---

  function doAction(action) {
    if (gs.actionsThisStop >= gs.maxActionsPerStop) return;
    gs.actionsThisStop++;

    switch (action) {
      case 'hunt': {
        gs.huntedThisStop = true;
        const success = Math.random() < 0.7;
        if (success) {
          const gain = 6 + Math.floor(Math.random() * 10);
          gs.food = clamp(gs.food + gain);
          gs.supplies = clamp(gs.supplies - 2);
          addJournal(`Successful hunt! Gained food. The men dine well tonight.`);
        } else {
          gs.supplies = clamp(gs.supplies - 3);
          addJournal('Hunting party returns empty-handed. Ammunition wasted.');
        }
        break;
      }
      case 'rest': {
        gs.restedThisStop = true;
        gs.health = clamp(gs.health + 8);
        gs.morale = clamp(gs.morale + 3);
        gs.party.forEach(m => { if (m.health > 0) m.health = Math.min(100, m.health + 10); });
        addJournal('The party rests and recovers. Spirits improve.');
        break;
      }
      case 'trade': {
        gs.tradedThisStop = true;
        gs.supplies = clamp(gs.supplies - 8);
        gs.food = clamp(gs.food + 10);
        gs.morale = clamp(gs.morale + 3);
        addJournal('Traded supplies with local peoples for food and goodwill.');
        break;
      }
      case 'forage': {
        const gain = 2 + Math.floor(Math.random() * 5);
        gs.food = clamp(gs.food + gain);
        addJournal('Foraging party finds berries, roots, and wild onions.');
        break;
      }
    }
    renderStop();
  }

  function startTravel() {
    gs.phase = 'traveling';
    renderTraveling();
  }

  function chooseEvent(choiceIndex) {
    gs.phase = 'event-result';
    renderEventResult(choiceIndex);
  }

  function advanceAfterEvent() {
    const go = checkGameOver();
    if (go) { renderGameOver(go); return; }

    gs.eventIndex++;
    if (gs.eventIndex < gs.eventsThisLeg.length) {
      gs.phase = 'event';
      renderEvent();
    } else {
      arriveAtStop();
    }
  }

  function arriveAtStop() {
    gs.currentLeg++;
    gs.actionsThisStop = 0;
    gs.huntedThisStop = false;
    gs.restedThisStop = false;
    gs.tradedThisStop = false;

    if (gs.currentLeg >= LEGS.length) {
      renderVictory();
      return;
    }

    const leg = LEGS[gs.currentLeg];
    addJournal(`Arrived at ${leg.from}.`);
    gs.phase = 'stop';
    renderStop();
  }

  // --- Public API ---
  return {
    init() {
      gs = newGameState('explorer');
      const container = document.getElementById('trail-game-content');
      if (!container) return;
      renderStart();
    },

    setDifficulty(diff) {
      gs.difficulty = diff;
      renderStart();
    },

    setPace(pace) {
      gs.pace = pace;
      renderStop();
    },

    beginExpedition() {
      gs = newGameState(gs.difficulty);
      gs.phase = 'stop';
      gs.totalDays = 1;
      addJournal('The Corps of Discovery departs Camp Dubois. The great adventure begins!');
      renderStop();
    },

    doAction(action) { doAction(action); },
    startTravel() { startTravel(); },
    chooseEvent(i) { chooseEvent(i); },
    advanceAfterEvent() { advanceAfterEvent(); },

    restart() {
      gs = newGameState('explorer');
      gs.phase = 'start';
      renderStart();
    },

    exitGame() {
      document.getElementById('trail-game-screen').classList.remove('active');
      document.getElementById('completion-screen').classList.add('active');
    },

    launch() {
      // Hide other screens, show trail game
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('trail-game-screen').classList.add('active');
      this.init();
    }
  };
})();
