
const INSECTS_DATABASE = {
  locust: {
    name: "Locust",
    emoji: "🦗",
    scientificName: "Schistocerca gregaria and related species",
    description: "Large grasshoppers capable of forming massive swarms that can devastate crops. In biblical times, locust plagues were one of the most destructive natural disasters.",
    biblicalReferences: [
      { verse: "Exodus 10:12-15", context: "The eighth plague of Egypt—a swarm of locusts that covered the land and consumed all remaining vegetation." },
      { verse: "Joel 1:4-7", context: "A metaphorical description of destruction using locusts as an image of divine judgment." },
      { verse: "Revelation 9:3-7", context: "Symbolic locusts in John's apocalyptic vision, described with characteristics suggesting judgment." },
      { verse: "Mark 1:6", context: "John the Baptist ate locusts and wild honey in the wilderness, a protein source in the desert." }
    ],
    spiritualSignificance: "Locusts in Scripture often symbolize divine judgment, destruction, and the consequences of unfaithfulness. They represent God's power to bring plague and pestilence.",
    symbolism: "Judgement, destruction, divine wrath, and the fleeting nature of worldly pursuits."
  },
  ant: {
    name: "Ant",
    emoji: "🐜",
    scientificName: "Formicidae family",
    description: "Small, social insects known for their industriousness, organization, and ability to work together. Ants were observed in biblical culture as models of cooperation and preparation.",
    biblicalReferences: [
      { verse: "Proverbs 6:6-8", context: "The ant is praised for its industry and wisdom: 'Go to the ant, thou sluggard; consider her ways, and be wise.'" },
      { verse: "Proverbs 30:25", context: "Ants are listed as one of four small creatures on earth that are exceeding wise, stored provision in summer." }
    ],
    spiritualSignificance: "Ants represent hard work, diligence, prudence, and foresight. They are biblical examples of how the weak can achieve much through cooperation and planning.",
    symbolism: "Industry, wisdom, preparation, cooperation, and foresight."
  },
  bee: {
    name: "Bee",
    emoji: "🐝",
    scientificName: "Apis mellifica and related species",
    description: "Honey-producing insects highly valued in ancient Near Eastern cultures for their honey and wax. Bees were essential to daily life and economy.",
    biblicalReferences: [
      { verse: "Judges 14:8", context: "Samson found a swarm of bees and honey in the carcass of a lion, which he used in a riddle." },
      { verse: "1 Samuel 14:25-26", context: "Jonathan and the army found honeycomb in the forest, illustrating the abundance of the land." },
      { verse: "Psalm 119:103", context: "The sweetness of God's word is compared to honey: 'How sweet are thy words unto my taste! yea, sweeter than honey.'" },
      { verse: "Song of Solomon 4:11", context: "Honey is used as a metaphor for sweetness and delight in romantic love." }
    ],
    spiritualSignificance: "Bees symbolize diligence, sweetness, divine provision, and the gifts of the Holy Spirit. Honey represents the sweetness of God's word and blessings.",
    symbolism: "Sweetness, provision, diligence, the promised land flowing with milk and honey, blessing, and God's favor."
  },
  fly: {
    name: "Fly",
    emoji: "🪰",
    scientificName: "Musca domestica and related species",
    description: "Common insects associated with filth, disease, and decay. In ancient times, flies were vectors of disease and symbols of corruption.",
    biblicalReferences: [
      { verse: "Exodus 8:20-32", context: "The fourth plague of Egypt—swarms of flies that infested the land and corrupted it." },
      { verse: "Ecclesiastes 10:1", context: "'Dead flies cause the ointment of the apothecary to send forth a stinking savour; so doth a little folly him that is in reputation for wisdom.'" },
      { verse: "Isaiah 7:18", context: "The Lord will whistle for the fly to come from Egypt, symbolizing future invasion and judgment." }
    ],
    spiritualSignificance: "Flies represent corruption, decay, sin, disease, and divine judgment. They symbolize the spreading of evil and corruption in the world.",
    symbolism: "Corruption, decay, sin, pestilence, and judgment."
  },
  moth: {
    name: "Moth",
    emoji: "🦋",
    scientificName: "Lepidoptera order",
    description: "Nocturnal insects that eat fabric and stored goods. In biblical times, moths were pests that destroyed wealth and possessions.",
    biblicalReferences: [
      { verse: "Matthew 6:19-20", context: "Jesus warns against storing treasures on earth where 'moth and rust doth corrupt.'" },
      { verse: "Luke 12:33", context: "Similar warning about treasures where moths and thieves corrupt and steal." },
      { verse: "Job 13:28", context: "A metaphor for human decay: 'He wears away as a moth-eaten garment.'" }
    ],
    spiritualSignificance: "Moths symbolize decay, impermanence, and the futility of material wealth. They represent how earthly possessions cannot last forever.",
    symbolism: "Decay, impermanence, transience, futility of material possession."
  },
  worm: {
    name: "Worm",
    emoji: "🪱",
    scientificName: "Various species",
    description: "Larvae and segmented invertebrates associated with decay, death, and decomposition. Worms appear throughout Scripture as symbols of judgment and mortality.",
    biblicalReferences: [
      { verse: "Mark 9:48", context: "Jesus speaks of hell 'where their worm dieth not, and the fire is not quenched.'" },
      { verse: "Isaiah 14:11", context: "A prophecy of judgment: 'The worm is spread under thee, and the worms cover thee.'" },
      { verse: "Job 17:14", context: "Job laments: 'I have said to corruption, Thou art my father: to the worm, Thou art my mother.'" }
    ],
    spiritualSignificance: "Worms represent mortality, decay, judgment, and the consequences of sin. They symbolize the transience of human flesh and earthly life.",
    symbolism: "Death, decay, judgment, hell, mortality, and the corruption of the flesh."
  },
  spider: {
    name: "Spider",
    emoji: "🕷️",
    scientificName: "Arachnida class",
    description: "Eight-legged arachnids known for spinning webs to trap prey. In biblical culture, spiders represented fragility and the futility of human works.",
    biblicalReferences: [
      { verse: "Isaiah 59:5-6", context: "The wicked's works are compared to spider webs: 'Their webs shall not become garments.'" },
      { verse: "Job 8:14-15", context: "Job describes trusting in godlessness as fragile as a spider's web that cannot hold." }
    ],
    spiritualSignificance: "Spiders symbolize fragility, deception, and the weakness of human efforts without God. Their webs represent the futility of worldly works.",
    symbolism: "Fragility, deception, futility, weakness, and the inadequacy of human effort."
  }
};

Deno.serve(async (req) => {
  try {

    const body = await req.json();
    const searchQuery = body.query?.toLowerCase().trim();

    if (!searchQuery) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    // Search by name
    const result = INSECTS_DATABASE[searchQuery];

    if (result) {
      return Response.json({ found: true, ...result });
    } else {
      return Response.json({
        found: false,
        message: "Insect not found. Try searching for: locust, ant, bee, fly, moth, worm, or spider."
      });
    }
  } catch (error) {
    console.error("Error in getBibleInsects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});