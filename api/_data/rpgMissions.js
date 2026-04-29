// Expanded RPG mission pool — moral-decision scenarios drawn from biblical themes
// across many locations and time periods. Each mission has 3 decisions: one
// righteous (the highest XP), one neutral, one tempting/wrong.

export const RPG_MISSIONS = [
  {
    title: "A Test of Forgiveness", location: "Jerusalem",
    narrative: "A brother in your community has wronged you publicly and damaged your reputation. He has now come to ask forgiveness, but your heart is still wounded. Others are watching how you respond.",
    decisions: [
      { text: "Forgive him freely and immediately, just as Christ forgave you, without requiring him to earn it back.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 8, obedience_score: 8 }, consequence: "True forgiveness reflects the grace of God — unconditional and complete. (Colossians 3:13)", scripture: "Ephesians 4:32" },
      { text: "Tell him you forgive him, but keep your distance until you see real change in his behavior over time.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 5, wisdom_score: 6, obedience_score: 4 }, consequence: "Caution after betrayal can be wise, but conditional forgiveness withholds the grace Christ modeled.", scripture: "Matthew 18:21-22" },
      { text: "Confront him with your hurt first before extending forgiveness.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 3, wisdom_score: 7, obedience_score: 2 }, consequence: "Honesty is valuable, but using confrontation as a condition subtly places your satisfaction above obedience.", scripture: "Luke 17:3-4" },
    ],
  },
  {
    title: "The Widow's Need", location: "Capernaum",
    narrative: "A widow in your congregation has a genuine financial need. You have limited resources yourself, but God is prompting your heart to give. You pray and feel the nudge clearly.",
    decisions: [
      { text: "Give sacrificially in obedience to God's prompting, trusting Him to meet your own needs.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 7, obedience_score: 10 }, consequence: "The widow who gave her last two mites gave more than all the wealthy donors. Obedience to clear prompting honors God.", scripture: "2 Corinthians 9:7" },
      { text: "Give a portion that feels comfortable, keeping enough to cover your obligations first.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 4, wisdom_score: 6, obedience_score: 4 }, consequence: "Practical stewardship is wise, but giving what is comfortable rarely requires faith.", scripture: "Proverbs 11:24" },
      { text: "Pray for her needs instead of giving, trusting God will provide another way.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 3, wisdom_score: 4, integrity_score: -3 }, consequence: "Prayer without action when God has given you means is incomplete obedience (James 2:15-16).", scripture: "James 2:15-17" },
    ],
  },
  {
    title: "Speaking Truth in Love", location: "Antioch",
    narrative: "A close friend is living in a pattern of sin that is harming him and those around him. He seems unaware that others have noticed. You have a private opportunity to speak to him.",
    decisions: [
      { text: "Speak the truth gently but clearly, motivated by genuine love for his soul.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 8, wisdom_score: 10, obedience_score: 9 }, consequence: "Faithful are the wounds of a friend (Proverbs 27:6). Speaking truth in love is the highest form of friendship.", scripture: "Ephesians 4:15" },
      { text: "Stay silent to preserve the friendship.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 2, wisdom_score: 4, integrity_score: -4 }, consequence: "Ezekiel 3:18 warns that failing to warn those in sin makes us responsible.", scripture: "Galatians 6:1" },
      { text: "Bring the matter to the church elders first.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 7, obedience_score: 3 }, consequence: "Matthew 18 instructs going privately first before involving others.", scripture: "Matthew 18:15" },
    ],
  },
  {
    title: "The Tempting Compromise", location: "Babylon",
    narrative: "Like Daniel, you are offered the king's rich food — but it has been offered to idols. Eating it would secure your status; refusing could cost you privilege or worse.",
    decisions: [
      { text: "Refuse the food and ask for vegetables and water, trusting God to honor your faithfulness.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, integrity_score: 10, obedience_score: 9 }, consequence: "Daniel purposed in his heart not to defile himself — and God prospered him beyond all peers.", scripture: "Daniel 1:8" },
      { text: "Eat just a little to maintain favor, asking forgiveness later.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -2, integrity_score: -5 }, consequence: "Small compromises of conscience grow into large ones. The conscience hardens with each surrender.", scripture: "1 Corinthians 10:21" },
      { text: "Try to negotiate a quiet exception with the steward.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 8, integrity_score: 6 }, consequence: "Daniel did exactly this — courageous but wise (Daniel 1:11-14). A reasonable middle path.", scripture: "Daniel 1:11" },
    ],
  },
  {
    title: "The Anonymous Gift", location: "Galilee",
    narrative: "A family in your village has lost everything in a fire. You have the resources to help significantly. You can give publicly and earn honor, give anonymously, or give a smaller amount publicly.",
    decisions: [
      { text: "Give generously and anonymously through a third party.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, integrity_score: 10, wisdom_score: 8 }, consequence: "When you give, do not let your left hand know what your right hand is doing (Matthew 6:3).", scripture: "Matthew 6:3-4" },
      { text: "Give generously and openly so others are inspired to give.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 5, wisdom_score: 6, obedience_score: 5 }, consequence: "Public generosity can encourage others, but Christ's clear teaching favors hidden giving.", scripture: "1 Timothy 6:18" },
      { text: "Give a smaller amount publicly and use the rest privately for your family.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 2, wisdom_score: 3, integrity_score: -3 }, consequence: "This pattern resembles Ananias and Sapphira's measured pretense — appearing generous while hedging.", scripture: "Acts 5:1-4" },
    ],
  },
  {
    title: "The False Witness", location: "Jericho",
    narrative: "You are summoned to court to testify about a dispute. Telling the full truth will harm someone you love. Withholding part will protect them but mislead the judge.",
    decisions: [
      { text: "Tell the complete truth, even though it will cost your loved one.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, integrity_score: 10, obedience_score: 9 }, consequence: "Lying lips are an abomination to the Lord (Proverbs 12:22). Truth is never optional.", scripture: "Exodus 20:16" },
      { text: "Tell only what is asked, withholding context that would harm them.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 4, integrity_score: -3 }, consequence: "Selective truth can be a form of deception. The court relies on the whole picture.", scripture: "Ephesians 4:25" },
      { text: "Tell a small lie to protect your loved one entirely.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -3, integrity_score: -8 }, consequence: "Bearing false witness is forbidden in the Ten Commandments. There is no righteous lie.", scripture: "Proverbs 19:5" },
    ],
  },
  {
    title: "The Sabbath Decision", location: "Bethany",
    narrative: "It is the Sabbath. A critical opportunity arises that will only present itself today — but pursuing it means breaking your normal Sabbath rest. What do you do?",
    decisions: [
      { text: "Honor the Sabbath; trust God to provide other opportunities.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, obedience_score: 10, wisdom_score: 7 }, consequence: "The Sabbath was made for man (Mark 2:27). Honoring God's rhythm above urgent opportunity proves trust.", scripture: "Exodus 20:8" },
      { text: "Pursue the opportunity but try to make it a 'work of mercy' if asked.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: -2, integrity_score: -3, wisdom_score: 4 }, consequence: "Calling profit-driven work 'mercy' to justify breaking Sabbath is a form of self-deception.", scripture: "Isaiah 58:13" },
      { text: "Defer the opportunity until tomorrow but accept that it may be gone.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 6, wisdom_score: 6, obedience_score: 7 }, consequence: "A reasonable middle path — but ask whether 'defer' is just another word for 'partly disobey'.", scripture: "Hebrews 4:9-10" },
    ],
  },
  {
    title: "The Hostile Crowd", location: "Athens",
    narrative: "Like Paul on Mars Hill, you stand before a hostile crowd that mocks your message. You can soften the Gospel to win their favor, leave to preserve yourself, or speak boldly.",
    decisions: [
      { text: "Speak boldly, gently, and respectfully, naming Christ as Lord even though they mock.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, obedience_score: 10 }, consequence: "Paul's bold respect on Mars Hill won some — and that was enough (Acts 17:34). Faithfulness, not results, is your charge.", scripture: "Acts 17:22-31" },
      { text: "Soften the Gospel to focus only on what they will accept.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -3, integrity_score: -5 }, consequence: "If we preach any other Gospel, let us be accursed (Galatians 1:8). The offense of the cross cannot be softened.", scripture: "Galatians 1:8-9" },
      { text: "Leave to find a more receptive audience.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 4, wisdom_score: 5, obedience_score: 3 }, consequence: "Christ Himself sometimes withdrew from hostile crowds. But knowing when to stand and when to go requires the Spirit.", scripture: "Matthew 10:14" },
    ],
  },
  {
    title: "Wealth and Worship", location: "Corinth",
    narrative: "You have grown wealthy and your business flourishes. A prophet challenges you to consider whether your heart is divided between money and God.",
    decisions: [
      { text: "Examine your heart honestly, repent where needed, and increase your giving.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, obedience_score: 8 }, consequence: "You cannot serve God and mammon (Matthew 6:24). Self-examination is the path to undivided worship.", scripture: "Matthew 6:24" },
      { text: "Defend yourself; you have given much already.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -2, wisdom_score: -3, integrity_score: -3 }, consequence: "Defensiveness about wealth is often the first symptom of misplaced trust in it.", scripture: "1 Timothy 6:10" },
      { text: "Withdraw from the prophet and surround yourself with those who affirm your success.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, wisdom_score: -5, integrity_score: -5 }, consequence: "Itching ears gather teachers who tell them what they want to hear (2 Timothy 4:3). A dangerous path.", scripture: "Proverbs 27:6" },
    ],
  },
  {
    title: "The Prodigal Returns", location: "Bethsaida",
    narrative: "Your wayward sibling, who hurt your family deeply, returns penniless and broken. The household debates how to receive them.",
    decisions: [
      { text: "Run to embrace them, restore them fully, and celebrate their return.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 8, obedience_score: 10 }, consequence: "The father in Luke 15 ran to his prodigal — this is the heart of the Gospel itself.", scripture: "Luke 15:20-24" },
      { text: "Welcome them but require them to earn back trust slowly.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 6, obedience_score: 4 }, consequence: "Conditional welcome resembles the older brother more than the father in the parable.", scripture: "Luke 15:25-32" },
      { text: "Refuse to receive them; the family was harmed enough.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, integrity_score: -3, obedience_score: -5 }, consequence: "Withholding mercy after God has shown us infinite mercy invites the wicked-servant warning of Matthew 18.", scripture: "Matthew 18:32-35" },
    ],
  },
  {
    title: "Public vs. Private Faith", location: "Rome",
    narrative: "In a culture hostile to Christianity, you can practice your faith quietly without consequence — or visibly, accepting risk to your career and reputation.",
    decisions: [
      { text: "Live and worship visibly, gently and without aggression, as a witness to Christ.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, integrity_score: 10, obedience_score: 9 }, consequence: "Whoever is ashamed of me before men, I will be ashamed of before the Father (Mark 8:38). Public faith is the calling.", scripture: "Matthew 10:32-33" },
      { text: "Practice quietly, witnessing only when directly asked.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 6, obedience_score: 5 }, consequence: "1 Peter 3:15 commends being ready when asked — but reduces the call from witness to mere reactive defense.", scripture: "1 Peter 3:15" },
      { text: "Hide your faith entirely until it's safer to be open.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -3, integrity_score: -5 }, consequence: "A lamp under a basket gives no light. Faith hidden indefinitely is hard to distinguish from faith abandoned.", scripture: "Matthew 5:14-16" },
    ],
  },
  {
    title: "The Rumor", location: "Ephesus",
    narrative: "A juicy rumor about a respected leader has reached you. Sharing it would gain you social standing. Confronting the source would cost effort. Ignoring it leaves it spreading.",
    decisions: [
      { text: "Go directly to the leader privately and ask if there is truth, then refuse to spread the rumor.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, integrity_score: 10 }, consequence: "Where there is no wood, the fire goes out (Proverbs 26:20). A rumor stops with the one who refuses to spread it.", scripture: "Proverbs 18:8" },
      { text: "Stay neutral — don't spread it but don't intervene either.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 2, wisdom_score: 4, integrity_score: -2 }, consequence: "Silence in the face of slander is its own form of cooperation with evil.", scripture: "Leviticus 19:16" },
      { text: "Share it 'as a prayer request' to one or two trusted friends.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -3, wisdom_score: -3, integrity_score: -7 }, consequence: "Gossip spiritualized as a 'prayer request' is still gossip. The Spirit is not deceived.", scripture: "Proverbs 11:13" },
    ],
  },
  {
    title: "The Inconvenient Truth", location: "Damascus",
    narrative: "A close friend has built a ministry on a teaching you've come to believe is biblically wrong. To name it would cost the friendship and possibly the ministry.",
    decisions: [
      { text: "Privately share your concern with Scripture, gently and humbly.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, obedience_score: 9 }, consequence: "Iron sharpens iron (Proverbs 27:17). True love won't let a friend continue in error unchallenged.", scripture: "Galatians 2:11-14" },
      { text: "Stay silent; God will correct him in His own way.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 2, wisdom_score: 3, integrity_score: -4 }, consequence: "Sometimes God uses friends as His correction. Withholding makes you complicit.", scripture: "Ezekiel 33:8" },
      { text: "Confront publicly to protect those being misled.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 4, wisdom_score: 4, obedience_score: 3 }, consequence: "Matthew 18 calls for private confrontation first. Skipping that step often backfires.", scripture: "Matthew 18:15-17" },
    ],
  },
  {
    title: "The Thirsty Enemy", location: "Hebron",
    narrative: "Your enemy — the one who slandered you and worked against you — comes to your door, dehydrated and desperate. He doesn't ask you for help, but you can see his need clearly.",
    decisions: [
      { text: "Bring him water and a meal, treat him like a brother, no comment on past wrongs.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, integrity_score: 10, obedience_score: 10 }, consequence: "If your enemy is hungry, feed him; if thirsty, give him drink. In doing so you heap burning coals (Romans 12:20).", scripture: "Romans 12:20-21" },
      { text: "Offer water silently and send him away.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 5, obedience_score: 6 }, consequence: "Better than refusal, but lacks the warmth Christ commands toward enemies.", scripture: "Luke 6:27-28" },
      { text: "Refuse — you owe him nothing after what he did.", moralAlignment: "neutral", xp: 2, scoreChanges: { faith_score: -8, integrity_score: -5, obedience_score: -8 }, consequence: "The unforgiving servant was handed over to torturers (Matthew 18). The cost of refusing mercy is steep.", scripture: "Proverbs 24:17" },
    ],
  },
  {
    title: "The Long Wait", location: "Nazareth",
    narrative: "You have prayed faithfully for years for something that has not yet been answered. Doubt creeps in. A teacher offers an exotic spiritual technique to 'unlock' the answer faster.",
    decisions: [
      { text: "Continue in patient prayer, trust God's timing, and refuse the technique.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, obedience_score: 10 }, consequence: "Be patient and let endurance have its perfect work (James 1:4). God's delays are never denials.", scripture: "James 1:2-4" },
      { text: "Try the technique — it's not unbiblical, just unusual.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, wisdom_score: -3, integrity_score: -2 }, consequence: "Anything that promises spiritual results outside of Scripture's plain means deserves deep suspicion.", scripture: "Colossians 2:8" },
      { text: "Stop praying about it and accept that it isn't God's will.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 0, wisdom_score: 4, obedience_score: 3 }, consequence: "Sometimes ceasing in prayer is acceptance — sometimes it is unbelief. Discernment is required.", scripture: "Luke 18:1-8" },
    ],
  },
  {
    title: "The Persecuted Family", location: "Smyrna",
    narrative: "Believers down the road are being arrested. Hiding them in your home risks your family. Reporting them would gain you favor. Doing nothing leaves them to be found.",
    decisions: [
      { text: "Hide them, accept the risk, trust God for protection.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, integrity_score: 10, obedience_score: 10 }, consequence: "Whatever you did for one of the least of these brothers and sisters of mine, you did for Me (Matthew 25:40).", scripture: "Hebrews 13:3" },
      { text: "Send them with food to seek safety elsewhere.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 6, wisdom_score: 7, obedience_score: 6 }, consequence: "Practical compassion is real, but stops short of the costly hospitality the church often requires.", scripture: "Romans 12:13" },
      { text: "Report them to the authorities to protect your family.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -10, integrity_score: -10, obedience_score: -10 }, consequence: "This is the path of Judas. Self-preservation at the cost of the brethren is the deepest betrayal.", scripture: "Matthew 26:14-16" },
    ],
  },
  {
    title: "The Quiet Hour", location: "Wilderness near Jericho",
    narrative: "Your day is overflowing — work, family, ministry. The Spirit nudges you to set aside an hour to pray and read Scripture. Your day's tasks would suffer.",
    decisions: [
      { text: "Set aside the hour. Trust God with the day.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, obedience_score: 10 }, consequence: "Christ withdrew often to lonely places to pray (Luke 5:16). The busiest must pray most, not least.", scripture: "Luke 5:16" },
      { text: "Pray briefly while you work — God will understand.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 3, wisdom_score: 4, obedience_score: 4 }, consequence: "Constant prayer is biblical (1 Thessalonians 5:17), but it does not replace deliberate, undistracted communion.", scripture: "Mark 1:35" },
      { text: "Defer prayer until tomorrow when things settle.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -3, wisdom_score: -2 }, consequence: "Tomorrow rarely settles the way we hope. The 'when I have time' prayer life is the prayer life that withers.", scripture: "Psalm 5:3" },
    ],
  },
  {
    title: "The Difficult Marriage", location: "Bethel",
    narrative: "Your spouse has been distant and harsh for months. You feel justified in distancing yourself emotionally, or even contemplating separation.",
    decisions: [
      { text: "Pursue your spouse with love, prayer, gentle words, and patient service.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, obedience_score: 10 }, consequence: "Love bears all things, believes all things, hopes all things, endures all things (1 Corinthians 13:7).", scripture: "Ephesians 5:25" },
      { text: "Withdraw emotionally to protect yourself; offer minimum required care.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -2, wisdom_score: -2, integrity_score: -3 }, consequence: "Marriage is covenant, not contract. Self-protection often hardens what only sacrificial love can soften.", scripture: "Malachi 2:16" },
      { text: "Begin contemplating separation seriously.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -8, obedience_score: -8, integrity_score: -5 }, consequence: "What God has joined, let no one separate (Matthew 19:6). Fight for the marriage before considering its end.", scripture: "1 Corinthians 7:10-11" },
    ],
  },
  {
    title: "The Anxious Heart", location: "Bethlehem",
    narrative: "Your finances are uncertain, the news is dark, and worry keeps you awake. You can spiral in anxiety, distract yourself, or actively choose trust.",
    decisions: [
      { text: "Take every anxious thought to God in prayer with thanksgiving.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, obedience_score: 10 }, consequence: "Be careful for nothing; but in every thing by prayer and supplication... and the peace of God will guard your heart (Phil 4:6-7).", scripture: "Philippians 4:6-7" },
      { text: "Distract yourself with entertainment to numb the worry.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -3, wisdom_score: -2 }, consequence: "Distraction is a temporary anesthetic. The anxiety returns, often deeper, when the distraction ends.", scripture: "Psalm 55:22" },
      { text: "Spiral in worst-case scenarios; you must be prepared.", moralAlignment: "neutral", xp: 2, scoreChanges: { faith_score: -7, wisdom_score: -3, integrity_score: -2 }, consequence: "Tomorrow will worry about itself (Matthew 6:34). Worry is faith in a god of the worst case.", scripture: "Matthew 6:25-34" },
    ],
  },
  {
    title: "The Jealous Heart", location: "Hebron",
    narrative: "A peer has been promoted while you were passed over. You feel the bite of jealousy. Their success seems to come at your expense — at least it feels that way.",
    decisions: [
      { text: "Genuinely rejoice with them, congratulate them, and ask the Lord to root out the envy.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, integrity_score: 10 }, consequence: "Rejoice with them that rejoice (Romans 12:15). Envy rots the bones (Proverbs 14:30).", scripture: "Romans 12:15" },
      { text: "Avoid them so the envy doesn't consume you.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 2, wisdom_score: 3, integrity_score: -3 }, consequence: "Avoidance manages the symptom but leaves the root sin alive. Better to confess and conquer it.", scripture: "Galatians 5:26" },
      { text: "Subtly undermine them through hints to others about their flaws.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -10, integrity_score: -10, wisdom_score: -5 }, consequence: "Where envy is, there is confusion and every evil work (James 3:16). Fight envy in your own heart, not in their reputation.", scripture: "James 3:14-16" },
    ],
  },
  {
    title: "The Critical Voice", location: "Sychar",
    narrative: "A church member criticizes your work harshly and publicly. The criticism is partly fair, partly unfair, and stings deeply.",
    decisions: [
      { text: "Receive the criticism humbly, separate the truth from the unfairness, and apply the truth.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, integrity_score: 9 }, consequence: "Faithful are the wounds of a friend, even when delivered roughly. The wise grow through criticism.", scripture: "Proverbs 27:6" },
      { text: "Defend yourself publicly with full justification.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: -2, wisdom_score: -3, integrity_score: -2 }, consequence: "Public defense often escalates conflict. Christ Himself was silent before His accusers (Matthew 27:14).", scripture: "1 Peter 2:23" },
      { text: "Slander them in return through your network.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -10, integrity_score: -10, obedience_score: -10 }, consequence: "Returning evil for evil is forbidden. Bless those who curse you (Romans 12:14).", scripture: "Romans 12:17-19" },
    ],
  },
  {
    title: "The Open Door", location: "Tarsus",
    narrative: "An opportunity opens for missionary work in a difficult region. It would mean great personal cost but possibly great kingdom impact.",
    decisions: [
      { text: "Pray, fast, seek wise counsel, and if confirmed, accept the call.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, obedience_score: 10 }, consequence: "How shall they hear without a preacher? And how shall they preach unless they are sent? (Romans 10:14-15).", scripture: "Romans 10:14-15" },
      { text: "Decline; you have responsibilities here that need you.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 4, wisdom_score: 6, obedience_score: 4 }, consequence: "God values faithful service in current callings. But beware: 'I have responsibilities' is sometimes our refuge from costly obedience.", scripture: "Luke 9:62" },
      { text: "Defer indefinitely without a clear no, hoping the door closes on its own.", moralAlignment: "neutral", xp: 6, scoreChanges: { faith_score: -2, wisdom_score: -2, integrity_score: -3 }, consequence: "Indecision is decision. Doors do close — but rarely on schedule with our reluctance.", scripture: "James 4:17" },
    ],
  },
  {
    title: "The Unrepentant Brother", location: "Jerusalem",
    narrative: "A church member has been caught in serious, ongoing sin and refuses correction. The church must decide how to respond.",
    decisions: [
      { text: "Follow Matthew 18 carefully — private, then small witnesses, then the church — with grief and love.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, obedience_score: 10 }, consequence: "The goal is restoration, not punishment. The pattern Christ gave honors both holiness and love.", scripture: "Matthew 18:15-17" },
      { text: "Move directly to public removal without the gradual process.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 2, wisdom_score: -2, obedience_score: -3 }, consequence: "Skipping Christ's pattern often produces resentment instead of repentance.", scripture: "2 Corinthians 2:6-8" },
      { text: "Look the other way to preserve church harmony.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, integrity_score: -7, obedience_score: -5 }, consequence: "A little leaven leavens the whole lump (1 Corinthians 5:6). Tolerated sin spreads.", scripture: "1 Corinthians 5:6-8" },
    ],
  },
  {
    title: "The Praise Trap", location: "Caesarea",
    narrative: "After a notable success, others heap praise on you. You can humbly redirect glory, accept it modestly, or quietly enjoy it.",
    decisions: [
      { text: "Direct every word of praise upward to God; refuse personal credit.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, integrity_score: 10 }, consequence: "Herod accepted the praise of men as if he were a god — and was struck down (Acts 12:21-23). Glory belongs to One.", scripture: "Acts 12:23" },
      { text: "Accept the praise modestly, mentioning God only briefly.", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 2, wisdom_score: 4, integrity_score: -3 }, consequence: "Splitting glory is dangerous ground. We rarely take less than we are given.", scripture: "Galatians 6:14" },
      { text: "Privately savor the praise; you've worked hard for this.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -3, wisdom_score: -3, integrity_score: -5 }, consequence: "Pride goes before destruction (Proverbs 16:18). Even private indulgence in praise is a slow corrosion.", scripture: "Proverbs 27:21" },
    ],
  },
  {
    title: "The Difficult Parent", location: "Joppa",
    narrative: "Your aging parent — who was unkind to you in childhood — now needs your care. They have not apologized. Resentment lingers.",
    decisions: [
      { text: "Care for them sacrificially and patiently, choosing to forgive, whether or not they ever ask.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 9, obedience_score: 10 }, consequence: "Honor your father and your mother (Exodus 20:12) — the only commandment with a promise. Care given without conditions reflects Christ.", scripture: "Mark 7:10-13" },
      { text: "Provide for their basic needs but maintain emotional distance.", moralAlignment: "neutral", xp: 12, scoreChanges: { faith_score: 4, wisdom_score: 5, obedience_score: 4 }, consequence: "Providing care while withholding love is half the command. Honor includes the heart.", scripture: "1 Timothy 5:4" },
      { text: "Hire someone to care for them; you owe them no more.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -3, integrity_score: -5, obedience_score: -7 }, consequence: "Christ rebuked the Pharisees who used 'corban' to evade caring for parents (Mark 7:11). The command is personal.", scripture: "Mark 7:9-13" },
    ],
  },
  {
    title: "The Strong Drink", location: "Cana",
    narrative: "At a wedding, you are pressed to drink heavily. You believe moderate wine is permissible but drunkenness clearly wrong. The pressure is intense.",
    decisions: [
      { text: "Drink moderately or not at all; refuse cheerfully without judgment of others.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, obedience_score: 9 }, consequence: "Be not drunk with wine, wherein is excess; but be filled with the Spirit (Ephesians 5:18). Self-control is fruit of the Spirit.", scripture: "Ephesians 5:18" },
      { text: "Drink to social comfort but stop short of drunkenness.", moralAlignment: "neutral", xp: 14, scoreChanges: { faith_score: 5, wisdom_score: 6, integrity_score: 5 }, consequence: "Liberty in Christ is real, but liberty pressured by social fear isn't liberty — it's slavery in another guise.", scripture: "1 Corinthians 6:12" },
      { text: "Drink to drunkenness; it's a celebration after all.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -8, wisdom_score: -5, integrity_score: -7 }, consequence: "The fruit of drunkenness in Scripture is consistently disgrace and ruin (Genesis 9:21, Proverbs 23:29-35).", scripture: "Galatians 5:21" },
    ],
  },
  {
    title: "The Unequal Yoke", location: "Thessalonica",
    narrative: "Someone wonderful — but who does not share your faith — wants to pursue marriage with you. You feel real love, but you sense the warning of Scripture.",
    decisions: [
      { text: "Lovingly explain that you cannot pursue marriage; pray for them, and remain faithful to Christ.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, obedience_score: 10 }, consequence: "Be not unequally yoked with unbelievers (2 Corinthians 6:14). The command is for your protection and theirs.", scripture: "2 Corinthians 6:14-18" },
      { text: "Continue dating, hoping they will come to faith over time.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, wisdom_score: -7, integrity_score: -3 }, consequence: "'Missionary dating' overwhelmingly leads to the believer's drift, not the unbeliever's conversion. The data and Scripture agree.", scripture: "1 Corinthians 7:39" },
      { text: "Pursue the marriage; love conquers all.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -10, wisdom_score: -8, obedience_score: -10 }, consequence: "Solomon's foreign wives turned away his heart (1 Kings 11:4). Even the wisest man fell to this pattern.", scripture: "1 Kings 11:1-4" },
    ],
  },
  {
    title: "The Idle Word", location: "Berea",
    narrative: "In a tense meeting, you can choose words that calm or words that win. Cutting words would defeat your opponent quickly.",
    decisions: [
      { text: "Speak gently and slowly, remembering you will give account for every idle word.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 9, wisdom_score: 10, integrity_score: 10 }, consequence: "A soft answer turns away wrath (Proverbs 15:1). The tongue of the wise brings healing (Proverbs 12:18).", scripture: "Matthew 12:36" },
      { text: "Speak truth firmly, though not harshly.", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 6, wisdom_score: 7, obedience_score: 6 }, consequence: "Firm truth has its place. Watch the tone — even right words wrongly delivered wound rather than heal.", scripture: "Ephesians 4:29" },
      { text: "Use the cutting words; you will win the argument.", moralAlignment: "neutral", xp: 4, scoreChanges: { faith_score: -5, wisdom_score: -5, integrity_score: -5 }, consequence: "You may win the argument and lose the soul. Christ's example was meekness, not victory in debate.", scripture: "Proverbs 18:21" },
    ],
  },
  {
    title: "The Counterfeit Teacher", location: "Iconium",
    narrative: "A charismatic teacher in your church is teaching error mixed with truth. Many love him. Confronting him will create division.",
    decisions: [
      { text: "Address the error privately first, then with elders if needed; protect the flock with grace and resolve.", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 10, obedience_score: 10 }, consequence: "Earnestly contend for the faith once delivered to the saints (Jude 3). Shepherds must protect.", scripture: "Acts 20:28-31" },
      { text: "Tolerate the error privately but warn close friends quietly.", moralAlignment: "neutral", xp: 8, scoreChanges: { faith_score: 2, wisdom_score: 3, integrity_score: -3 }, consequence: "A little leaven leavens the whole lump. Tolerated error spreads.", scripture: "Galatians 5:9" },
      { text: "Embrace the new teaching; perhaps you've been too rigid.", moralAlignment: "neutral", xp: 0, scoreChanges: { faith_score: -10, wisdom_score: -8, obedience_score: -7 }, consequence: "Itching ears gather teachers who tickle them (2 Timothy 4:3). Test all things; hold fast what is good.", scripture: "1 Thessalonians 5:21" },
    ],
  },
];
