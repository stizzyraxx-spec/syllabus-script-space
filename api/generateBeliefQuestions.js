
const QUESTIONS_BY_DIFFICULTY = {
  theologian: [
    {
      category: "textual_criticism",
      question: "The Criterion of Embarrassment (multiple gospel accounts contain unflattering details about disciples/Jesus) is considered one of the strongest attestations to historical reliability. Why would fabricators include embarrassing material that weakens their narrative?",
      options: [
        "Later editors added embarrassing details to seem more authentic",
        "Embarrassing details would only be included if historically true — fabricators optimize for positive messaging",
        "All ancient texts contain random negative details",
        "Embarrassment is subjective and proves nothing"
      ],
      correct_index: 1,
      reasoning: "This criterion is universally accepted by scholars (believers and skeptics alike). Negative material wouldn't serve the disciples' interests, making authentic testimony more likely than invention."
    },
    {
      category: "archaeological_consistency",
      question: "The Apostle Paul's letters predate all four gospels by 15-20 years. Yet Paul's abbreviated Christology (death, resurrection, appearances to 500+ witnesses, to James, to Peter) perfectly parallels Gospel narratives written later. How would this be possible if the Gospels invented the resurrection narrative?",
      options: [
        "Paul invented the resurrection; Gospels copied him",
        "All sources independently reflect a single core tradition rooted in earliest eyewitness accounts",
        "The Gospels and Paul are literary forgeries created centuries later",
        "Resurrection accounts were gradually added to Christian tradition over time"
      ],
      correct_index: 1,
      reasoning: "The existence of early, independent, pre-gospel attestation to the resurrection in Paul (1 Cor 15:3-8) makes gradual legendary development implausible. The material is too early and too consistent."
    },
    {
      category: "philosophical",
      question: "The Anthropic Principle states: observers can only exist in universes fine-tuned for consciousness. But this doesn't explain *why* fine-tuning exists at all — it merely observes that we couldn't be here otherwise. Does this objection undermine design arguments?",
      options: [
        "Yes, anthropic reasoning fully explains fine-tuning without design",
        "No. The Anthropic Principle describes a tautology (we observe what's life-permitting) but doesn't explain the *existence* of fine-tuning or multiverse possibilities",
        "Fine-tuning has no explanation and doesn't require one",
        "Design is less probable than an infinite multiverse"
      ],
      correct_index: 1,
      reasoning: "Critics conflate observation selection with causation. AP explains why *we observe* fine-tuning but not why fine-tuning *exists*. Multiverse theory trades one mystery (a fine-tuned universe) for another (infinite universes)."
    },
    {
      category: "historical_coherence",
      question: "Why would Jewish disciples invent a messiah who was crucified (Deuteronomy 21:23 labels crucifixion a curse) and claim he rose from the dead — contradicting Jewish messianic expectations of a conquering king? What fabricator creates a failed messiah narrative?",
      options: [
        "They misunderstood Jesus and fabricated resurrection to cover his failure",
        "Eyewitness encounters with the risen Jesus forced them to reconceptualize messiahship despite its incoherence with Jewish expectation",
        "Resurrection was a gradual legendary development over decades",
        "Roman propaganda invented Christianity"
      ],
      correct_index: 1,
      reasoning: "The resurrection claim contradicts cultural expectations so severely that fabrication is implausible. Transformative eyewitness experiences better explain why disciples reinterpreted Jesus against their entire worldview."
    },
    {
      category: "philosophical_logic",
      question: "Alvin Plantinga argues: if God exists and is omniscient, He knows which truths would lead to genuine free choice. Can a world with libertarian free will *and* divine omniscience coherently coexist, or is divine foreknowledge logically incompatible with human freedom?",
      options: [
        "Omniscience and libertarian free will are logically incompatible",
        "God's foreknowledge operates outside time; God knows tenseless facts without determining outcomes — coherence is possible",
        "Free will is an illusion; omniscience is compatible only with determinism",
        "The question is meaningless because God doesn't exist"
      ],
      correct_index: 1,
      reasoning: "Contemporary philosophical theology (Ockham, Plantinga) resolves the paradox through tenseless logic and God's atemporal perspective. This is the consensus position among analytic philosophers."
    },
    {
      category: "manuscript_evidence",
      question: "The discovery of the Rylands Fragment (P52, John 18:31-33) dates to ~125 CE, within 35 years of authorship. Yet critics claim John's Gospel was composed late (150+ CE). How does extremely early attestation square with skepticism about dating?",
      options: [
        "P52 is a forgery or misidentified",
        "Early copies prove early composition; late dating claims are undermined by physical evidence",
        "The fragment could be a copy of an earlier copy from centuries later",
        "Dating is still uncertain regardless of manuscript evidence"
      ],
      correct_index: 1,
      reasoning: "P52's date narrows John's composition to early 2nd century at latest, contradicting theories of late 2nd-century authorship. Paleographic evidence is one of the most reliable dating methods."
    },
    {
      category: "logical_consistency",
      question: "Critics claim that because naturalism cannot account for consciousness/qualia, we should default to atheism (insufficient evidence for God). But if naturalism is *less* capable of explaining consciousness than theism, isn't rejecting theism on grounds of 'insufficient evidence' logically inconsistent?",
      options: [
        "Naturalism remains preferable despite explanatory gaps",
        "If theism explains more, demanding 'more evidence' for theism while accepting naturalism's gaps is epistemically inconsistent",
        "Both worldviews are equally inadequate",
        "Consciousness proves nothing about God's existence"
      ],
      correct_index: 1,
      reasoning: "The principle of inference to the best explanation suggests favoring theories that explain more phenomena. If theism explains consciousness better, preferring naturalism on evidential grounds is self-defeating."
    },
    {
      category: "historical_testimony",
      question: "The earliest non-Christian references to Jesus (Pliny, Tacitus, Josephus) confirm: (1) followers worshipped him as God, (2) he was crucified, (3) claims of resurrection circulated. Does extra-biblical attestation strengthen the case for Resurrection accounts being rooted in eyewitness reports?",
      options: [
        "No, pagan sources prove resurrection claims were fabricated legends",
        "Yes, independent confirmation that contemporaries took resurrection claims as literal/historical (not myth) strengthens eyewitness attestation",
        "Extra-biblical sources are too sparse to be meaningful",
        "Roman sources prove Christianity was invented by Rome"
      ],
      correct_index: 1,
      reasoning: "When hostile sources confirm your central claim emerged within decades of events (not centuries later), it corroborates eyewitness accounts over legendary development timelines."
    },
  ],
  easy: [
  {
    category: "historical_accuracy",
    question: "The Bible mentions 49 ancient cities that archaeologists couldn't initially find. All 49 have now been archaeologically confirmed. What's the probability a 2000-year-old text about obscure cities would be 100% accurate by chance?",
    options: [
      "Random luck—ancient texts get details right all the time",
      "Extremely improbable. Accuracy of this magnitude suggests deliberate documentation",
      "Cities were added to the Bible after archaeology found them",
      "Archaeological evidence is unreliable"
    ],
    correct_index: 1,
    reasoning: "Statistical probability suggests this level of precision indicates either eyewitness testimony or providential guidance, not fabrication."
  },
  {
    category: "logical_reasoning",
    question: "The Bible contains predictions about Jesus (written 400-1000 years before his birth). 300+ specific details match: his birthplace, method of death, pierced hands/feet, casting lots for clothing, etc. What's the mathematical probability one person fulfills all these by chance?",
    options: [
      "1 in 10^157 (odds of finding a specific grain of sand on all beaches combined)",
      "Possible, prophecies are vague enough to fit anyone",
      "The disciples fabricated the connection",
      "Biblical predictions aren't measurable"
    ],
    correct_index: 0,
    reasoning: "When calculated by probability experts, the odds are astronomically small. This suggests either design or evidence so overwhelming that coincidence becomes irrational."
  },
  {
    category: "philosophical",
    question: "If the universe has a beginning (confirmed by Big Bang cosmology), and everything that begins has a cause, then the universe must have a cause. What logical flaw, if any, exists in this argument?",
    options: [
      "No logical flaw—the chain of causality requires a first cause",
      "The universe might be eternal",
      "Quantum mechanics proves causality doesn't apply",
      "We can't know what caused the universe"
    ],
    correct_index: 0,
    reasoning: "This is the cosmological argument, considered logically sound by many philosophers. The burden shifts to explaining why causality wouldn't apply to universal origins."
  },
  {
    category: "historical_accuracy",
    question: "The Bible accurately names 10+ obscure Roman governors and officials in Luke's gospel. Skeptics claimed Luke invented details—but archaeological discoveries proved he was right about all of them, even those not mentioned in other sources. What does this suggest about Luke's reliability on other matters?",
    options: [
      "Luke got lucky guessing at names",
      "Demonstrates meticulous historical accuracy and reliable sourcing",
      "Names are too common to be meaningful verification",
      "Archaeological evidence can be faked"
    ],
    correct_index: 1,
    reasoning: "Precision in verifiable details suggests similar accuracy in non-verifiable theological claims. Historians consider this a hallmark of credible ancient sources."
  },
  {
    category: "logical_reasoning",
    question: "Consciousness, free will, and moral absolutes exist (you experience them). But materialism (the idea that only matter exists) cannot logically account for any of these. What does this logical gap suggest?",
    options: [
      "Our experience is an illusion",
      "Materialism is incomplete and consciousness requires explanation beyond physical laws",
      "Science will eventually explain it all through physics",
      "The question is meaningless"
    ],
    correct_index: 1,
    reasoning: "This is the 'hard problem of consciousness.' Many philosophers argue materialism alone cannot bridge this explanatory gap, pointing to something transcendent."
  },
  {
    category: "philosophical",
    question: "If atheism is true, then objective morality doesn't exist (it's just human preference). Yet we all act as if real injustice and cruelty truly matter. Aren't we contradicting ourselves by claiming both that morality is illusory AND that certain acts are genuinely wrong?",
    options: [
      "Yes, this reveals a fundamental inconsistency",
      "No, evolutionary impulses give us shared moral intuitions without objective truth",
      "Objective morality can exist without God",
      "Morality is purely subjective, we just feel strongly about preferences"
    ],
    correct_index: 0,
    reasoning: "This is the Moral Argument. It challenges whether purely naturalistic worldviews can justify the moral convictions we actually live by. The tension is logically real."
  },
  {
    category: "historical_accuracy",
    question: "For 200+ years, skeptics claimed the Pool of Bethesda (mentioned in John's gospel) didn't exist. In 1964, archaeologists found it—with the exact 5 porticoes John described. Why would a fabricator invent a pool with such specific architectural details that turn out to be accurate?",
    options: [
      "Lucky guess about a popular pool",
      "Details were added to the Bible after discovery",
      "Suggests eyewitness testimony from someone at the actual location",
      "Archaeological findings are often misinterpreted"
    ],
    correct_index: 2,
    reasoning: "Detailed, specific corroboration of obscure locales points to source material from actual witnesses who were there."
  },
  {
    category: "logical_reasoning",
    question: "The universe is finely tuned for life. Tiny changes in physical constants (gravity, electromagnetic force, expansion rate) would make life impossible. Is this evidence of design or chance?",
    options: [
      "Pure chance—infinite universes make it inevitable somewhere",
      "Fine-tuning points to intelligent design or purpose",
      "We can't assign probability to universe-creation",
      "Physics will eventually explain why constants must be as they are"
    ],
    correct_index: 1,
    reasoning: "Fine-tuning is considered legitimate evidence by many scientists and philosophers. The multiverse solution merely pushes the question back: where do universes come from?"
  },
  {
    category: "philosophical",
    question: "If God doesn't exist, human suffering is ultimately meaningless—part of a random, uncaring universe. If God exists and permits suffering, that seems to contradict His goodness. Which worldview better explains the human struggle with this question?",
    options: [
      "Atheism fully explains it—suffering just is, no answer needed",
      "Theism better explains why we expect suffering to be unjust (suggesting we recognize an objective standard)",
      "Both worldviews are equally satisfying",
      "The question has no meaning"
    ],
    correct_index: 1,
    reasoning: "The very fact that we rage against injustice suggests we know a standard of justice that 'just is' in atheism cannot ground. Theism explains why we have this intuition."
  },
  {
    category: "historical_accuracy",
    question: "The gospels describe details of Jewish customs, temple geography, and Aramaic phrases. If they were fabricated centuries later by non-witnesses, why would they include so much accurate insider knowledge that later scribes would have had to verify?",
    options: [
      "The authors were well-researched scholars",
      "Random accuracy from general knowledge",
      "The level and specificity of detail suggests firsthand eyewitness sources",
      "Inaccuracies exist but were later corrected"
    ],
    correct_index: 2,
    reasoning: "Early gospel documents show the hallmarks of eyewitness testimony: vivid, specific details, awkward phrasing, accurate cultural references—not polished fabrication."
  }
],
  intermediate: [
    {
      category: "historical_accuracy",
      question: "The Bible mentions 49 ancient cities that archaeologists couldn't initially find. All 49 have now been archaeologically confirmed. What's the probability a 2000-year-old text about obscure cities would be 100% accurate by chance?",
      options: [
        "Random luck—ancient texts get details right all the time",
        "Extremely improbable. Accuracy of this magnitude suggests deliberate documentation",
        "Cities were added to the Bible after archaeology found them",
        "Archaeological evidence is unreliable"
      ],
      correct_index: 1,
      reasoning: "Statistical probability suggests this level of precision indicates either eyewitness testimony or providential guidance, not fabrication."
    },
    {
      category: "logical_reasoning",
      question: "The Bible contains predictions about Jesus (written 400-1000 years before his birth). 300+ specific details match: his birthplace, method of death, pierced hands/feet, casting lots for clothing, etc. What's the mathematical probability one person fulfills all these by chance?",
      options: [
        "1 in 10^157 (odds of finding a specific grain of sand on all beaches combined)",
        "Possible, prophecies are vague enough to fit anyone",
        "The disciples fabricated the connection",
        "Biblical predictions aren't measurable"
      ],
      correct_index: 0,
      reasoning: "When calculated by probability experts, the odds are astronomically small. This suggests either design or evidence so overwhelming that coincidence becomes irrational."
    },
    {
      category: "philosophical",
      question: "If the universe has a beginning (confirmed by Big Bang cosmology), and everything that begins has a cause, then the universe must have a cause. What logical flaw, if any, exists in this argument?",
      options: [
        "No logical flaw—the chain of causality requires a first cause",
        "The universe might be eternal",
        "Quantum mechanics proves causality doesn't apply",
        "We can't know what caused the universe"
      ],
      correct_index: 0,
      reasoning: "This is the cosmological argument, considered logically sound by many philosophers. The burden shifts to explaining why causality wouldn't apply to universal origins."
    },
  ],
  advanced: [
    {
      category: "philosophical",
      question: "The Kalam Cosmological Argument: (1) Whatever begins to exist has a cause; (2) The universe began to exist; (3) Therefore, the universe has a cause. Which premise is most vulnerable to modern critiques, and how do defenders respond?",
      options: [
        "Premise 1 fails in quantum indeterminacy; defenders argue quantum events still require a substrate",
        "Premise 2 fails; the universe could be cyclic or eternal, but Big Bang evidence supports finite origin",
        "Premise 3 is logically invalid; causality may not apply to the universe itself",
        "All premises are equally strong; the argument has no vulnerabilities"
      ],
      correct_index: 0,
      reasoning: "Quantum mechanics raised questions about premise 1, but physicists note quantum indeterminacy still occurs within a causal framework governed by quantum fields and laws."
    },
    {
      category: "logical_reasoning",
      question: "Consider two hypotheses: (A) Jesus rose from the dead, explaining the disciples' experiences, (B) The disciples hallucinated or fabricated the resurrection. Which best explains: early disciples dying for a lie, Jewish conversion to Jesus worship, James the skeptic becoming a believer, the empty tomb attestation in all four gospels?",
      options: [
        "Hypothesis B better explains the evidence—mass psychology accounts for all phenomena",
        "Hypothesis A better explains the convergence of unusual historical facts",
        "Neither hypothesis adequately explains the data",
        "The question is unanswerable without more evidence"
      ],
      correct_index: 1,
      reasoning: "Historians note that B struggles to explain why skeptics would die for a known lie, why James would convert, or why the tomb story appears in all gospels if fabricated. A explains more data with fewer ad hoc assumptions."
    },
  ]
};

export default async function handler(req, res) {
  try {



    const body = req.body ?? {};
    const difficulty = body.difficulty || 'easy';
    const count = body.count || 5;

    const questionsPool = QUESTIONS_BY_DIFFICULTY[difficulty] || QUESTIONS_BY_DIFFICULTY.easy;
    const shuffled = questionsPool.sort(() => Math.random() - 0.5).slice(0, Math.min(count, questionsPool.length));
    
    return res.status(200).json({
      questions: shuffled.map((q) => ({
        category: q.category,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        reasoning: q.reasoning,
      })),
      total_available: questionsPool.length,
      difficulty_level: difficulty,
    });
  } catch (error) {
    console.error("Error generating belief questions:", error);
    return res.status(500).json({ error: error.message });
  }
}