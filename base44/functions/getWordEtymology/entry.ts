import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ETYMOLOGY_DATABASE = {
  gospel: {
    word: "gospel",
    timeline: [
      { era: "Old English (725 AD)", form: "godspel", description: "From 'god' (good) + 'spel' (speech/story). Originally meant 'good news' or 'good tidings'." },
      { era: "Middle English (1200s)", form: "gospel", description: "The word evolved to refer specifically to the four accounts of Christ's life and teachings." },
      { era: "Modern English", form: "gospel", description: "Retained its meaning as the Christian narrative of salvation through Jesus Christ." }
    ],
    meaning: "The Christian message of salvation; the four biblical accounts of Jesus's life and teachings; good news.",
    biblicalContext: "Gospel literally means 'good news' and refers to the four canonical books (Matthew, Mark, Luke, John) describing Christ's life, death, and resurrection."
  },
  blessing: {
    word: "blessing",
    timeline: [
      { era: "Old English", form: "bletsian", description: "From Germanic roots meaning 'to mark with blood' or 'to consecrate' in religious ritual." },
      { era: "Middle English (1200s)", form: "blessing", description: "The noun form emerged, referring to divine favor or a prayer spoken over something." },
      { era: "Modern English", form: "blessing", description: "Extended meaning to include any benefit, advantage, or expression of goodwill." }
    ],
    meaning: "Divine favor; a beneficial gift; an expression of goodwill or hope for someone's well-being.",
    biblicalContext: "In Scripture, a blessing is God's grace and favor bestowed upon His people, often formally pronounced. Examples include Abraham's blessings and Jesus blessing the disciples."
  },
  salvation: {
    word: "salvation",
    timeline: [
      { era: "Latin (Ancient)", form: "salvatio", description: "From 'salvus' meaning 'safe' or 'whole'. Referred to deliverance from danger." },
      { era: "Old French (1100s)", form: "sauvation", description: "The French adapted the Latin term for use in Christian theology." },
      { era: "Middle English (1200s)", form: "salvation", description: "Entered English as a theological term meaning spiritual rescue from sin and damnation." }
    ],
    meaning: "Deliverance or protection from danger, destruction, or loss; in Christianity, redemption from sin through Christ.",
    biblicalContext: "Salvation is the central Christian concept of being saved from sin and its consequences through faith in Jesus Christ and His redemptive work."
  },
  mercy: {
    word: "mercy",
    timeline: [
      { era: "Latin (Ancient)", form: "misericordia", description: "From 'misereri' (to pity) + 'cor' (heart). Literally 'heart for the miserable'." },
      { era: "Old French (1100s)", form: "merci", description: "The French shortened form, used in medieval courtly language." },
      { era: "Middle English (1200s)", form: "mercy", description: "Adopted into English, maintaining its meaning of compassionate treatment and forgiveness." }
    ],
    meaning: "Compassion and forgiveness shown to someone who is helpless or in one's power; an act of kindness or leniency.",
    biblicalContext: "God's mercy is His compassion toward sinners and His willingness to forgive. It is central to Christian theology and appears throughout Scripture."
  },
  grace: {
    word: "grace",
    timeline: [
      { era: "Latin (Ancient)", form: "gratia", description: "Related to 'gratus' meaning 'pleasing' or 'grateful'. Referred to favor or kindness." },
      { era: "Old French (1100s)", form: "grace", description: "Adopted for use in Christian theology to describe God's unmerited favor." },
      { era: "Middle English (1200s)", form: "grace", description: "Became a core theological term in English Christianity, referring to God's saving gift." }
    ],
    meaning: "Elegance of movement or bearing; divine favor or blessing; a prayer before meals; forgiveness offered freely.",
    biblicalContext: "In Christianity, grace is God's unmerited favor and love toward humanity. It is the basis of salvation and redemption offered through Christ."
  },
  faith: {
    word: "faith",
    timeline: [
      { era: "Latin (Ancient)", form: "fides", description: "Meant 'trust', 'confidence', and 'loyalty'. A fundamental concept in Roman ethics." },
      { era: "Old French (1100s)", form: "fei", description: "The French adapted the Latin term for medieval Christian use." },
      { era: "Middle English (1200s)", form: "faith", description: "Entered English as both a general and theological term for trust and belief." }
    ],
    meaning: "Confidence or trust in a person or thing; belief in God or in the doctrines of a religion; reliance on religious tenets.",
    biblicalContext: "Faith in Scripture refers to trust in God's promises and belief in Jesus Christ as savior. It is presented as essential for salvation."
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const searchWord = body.word?.toLowerCase().trim();

    if (!searchWord) {
      return Response.json({ error: "No word provided" }, { status: 400 });
    }

    const result = ETYMOLOGY_DATABASE[searchWord];

    if (result) {
      return Response.json({ found: true, ...result });
    } else {
      return Response.json({
        found: false,
        word: searchWord,
        message: "Etymology data not found for this word."
      });
    }
  } catch (error) {
    console.error("Error in getWordEtymology:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});