import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, MapPin, Scroll, Landmark, FlaskConical, BookOpen, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const encyclopedia = [
  // MANUSCRIPTS
  {
    category: "Manuscripts & Texts",
    icon: "📜",
    color: "amber",
    img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    entries: [
      {
        title: "The Dead Sea Scrolls",
        year: "Discovered 1947",
        location: "Qumran Caves, Israel",
        tag: "Manuscript",
        summary: "Over 900 manuscripts discovered in 11 caves near the Dead Sea, dating from 250 BC to 70 AD — the oldest known biblical manuscripts ever found.",
        detail: "Before the Dead Sea Scrolls, the oldest Hebrew Old Testament manuscript was the Masoretic Text from ~1000 AD. The Scrolls pushed that back 1,000 years. When scholars compared the Isaiah Scroll (dated ~150 BC) to modern translations, they found it was 95% identical — proving the Bible has been faithfully preserved for over two millennia. The remaining 5% were minor spelling variants with zero doctrinal impact. This is one of the most powerful pieces of evidence for biblical reliability ever discovered.",
        verse: "Isaiah 40:8 — 'The grass withers and the flowers fall, but the word of our God endures forever.'",
      },
      {
        title: "The Codex Sinaiticus",
        year: "c. 330–360 AD",
        location: "Sinai Peninsula, Egypt",
        tag: "Manuscript",
        summary: "One of the oldest and most complete manuscripts of the Christian Bible, containing virtually the entire Old and New Testament in Greek.",
        detail: "Discovered at St. Catherine's Monastery in 1844 by Tischendorf, the Codex Sinaiticus is a handwritten 4th century Greek Bible. It contains 346.5 folios of the Old Testament and the complete New Testament. Its existence confirms the early dating and consistent transmission of the New Testament. Currently held at the British Library, it can be viewed online in full.",
        verse: "2 Timothy 3:16 — 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.'",
      },
      {
        title: "The Nash Papyrus",
        year: "c. 150–100 BC",
        location: "Egypt",
        tag: "Manuscript",
        summary: "One of the oldest surviving pieces of Hebrew scripture outside the Dead Sea Scrolls, containing the Ten Commandments and the Shema.",
        detail: "Acquired in Egypt in 1898, the Nash Papyrus contains Exodus 20:2-17 (the Ten Commandments) and Deuteronomy 6:4-9 (the Shema). Initially believed to be from the 2nd century AD, William Foxwell Albright's analysis in 1937 re-dated it to between 165-37 BC, making it the oldest known Hebrew text at the time. Its text matches the later Masoretic Text almost perfectly, validating centuries of careful transmission.",
        verse: "Deuteronomy 6:4 — 'Hear O Israel: The Lord our God, the Lord is one.'",
      },
      {
        title: "The John Rylands Papyrus (P52)",
        year: "c. 117–138 AD",
        location: "Egypt",
        tag: "Manuscript",
        summary: "The oldest known fragment of the New Testament, containing verses from the Gospel of John — dated within decades of the original writing.",
        detail: "This tiny papyrus fragment, barely the size of a credit card, contains John 18:31-33 on one side and 18:37-38 on the other. It is dated to the reign of Emperor Hadrian (117–138 AD), placing it within 40–60 years of when John's Gospel was originally written. It was found in Egypt — far from the original location in Ephesus — proving the Gospel had already spread widely at an extremely early date. This destroys the myth that the New Testament was written long after the events occurred.",
        verse: "John 18:37 — 'You are a king, then!' said Pilate. Jesus answered, 'You say that I am a king.'",
      },
    ],
  },

  // ARCHAEOLOGY
  {
    category: "Archaeological Discoveries",
    icon: "⛏️",
    color: "stone",
    img: "https://images.unsplash.com/photo-1568209865332-a15790aed756?w=800&q=80",
    entries: [
      {
        title: "The Tel Dan Stele",
        year: "Discovered 1993",
        location: "Tel Dan, Northern Israel",
        tag: "Inscription",
        summary: "A 9th century BC Aramaic inscription that explicitly mentions 'the House of David' — the first extra-biblical reference to King David ever found.",
        detail: "Discovered in fragments at Tel Dan, this basalt stele commemorates an Aramean king's victory over Israel and Judah. The phrase 'bytdwd' (House of David) appears clearly in the text. Before this find, critics claimed David was a mythological figure. The Tel Dan Stele silenced that argument entirely. It confirmed that David's dynasty was well-known to neighboring nations within 150 years of his death. It is now housed in the Israel Museum in Jerusalem.",
        verse: "2 Samuel 7:16 — 'Your house and your kingdom will endure forever before me; your throne will be established forever.'",
      },
      {
        title: "The Pilate Stone",
        year: "Discovered 1961",
        location: "Caesarea Maritima, Israel",
        tag: "Inscription",
        summary: "A limestone block bearing the name 'Pontius Pilatus, Prefect of Judea' — directly confirming the New Testament figure who sentenced Jesus to death.",
        detail: "Found during excavations at the ancient Roman theater at Caesarea Maritima, this inscription reads: 'To the Divine Augusti [this] Tiberieum...Pontius Pilatus...Prefect of Judea...has dedicated [this].' Before this 1961 discovery, some critics argued Pilate was a literary invention. The stone permanently ended that argument. Pilate is now one of the most archaeologically verified figures in the New Testament. The original is in the Israel Museum; a replica stands at the discovery site.",
        verse: "John 19:19 — 'Pilate had a notice prepared and fastened to the cross. It read: JESUS OF NAZARETH, THE KING OF THE JEWS.'",
      },
      {
        title: "The Ossuary of James",
        year: "c. 63 AD / disclosed 2002",
        location: "Jerusalem",
        tag: "Artifact",
        summary: "A 1st century limestone bone box inscribed 'James, son of Joseph, brother of Jesus' — potentially the oldest artifact directly referencing Jesus of Nazareth.",
        detail: "This limestone ossuary bears the Aramaic inscription: 'Ya'akov bar Yosef akhui di Yeshua' — 'James, son of Joseph, brother of Jesus.' André Lemaire of the Sorbonne called it 'the most important inscription ever found in Israel.' Paleographic analysis dated the inscription to around 63 AD. While debates over authenticity continue, multiple scholars have affirmed the inscription's genuine origin. If authentic, it provides a direct physical link to the family of Jesus Christ.",
        verse: "Galatians 1:19 — 'I saw none of the other apostles—only James, the Lord's brother.'",
      },
      {
        title: "The Pool of Siloam",
        year: "Discovered 2004",
        location: "Jerusalem, Israel",
        tag: "Structure",
        summary: "A 1st century Jewish ritual pool in Jerusalem, exactly matching the location described in John 9 where Jesus healed a blind man.",
        detail: "In 2004, city workers repairing a sewage pipe in Jerusalem's City of David accidentally exposed stone steps. Archaeologists Ronny Reich and Eli Shukron excavated what turned out to be the Pool of Siloam — a large, stepped, 1st century ritual bath. This is precisely the pool described in John 9:7 where Jesus sent the blind man to wash. Coins found in the plaster dated the pool to the late 1st century BC through 70 AD — perfectly matching the Gospel timeline. It confirms the Gospel of John's detailed geographical knowledge of Jerusalem.",
        verse: "John 9:7 — ''Go,' he told him, 'wash in the Pool of Siloam.' So the man went and washed, and came home seeing.'",
      },
      {
        title: "The Ketef Hinnom Silver Scrolls",
        year: "Discovered 1979",
        location: "Jerusalem, Israel",
        tag: "Artifact",
        summary: "Two tiny silver scrolls containing the Priestly Blessing from Numbers 6:24-26 — the oldest surviving texts from the Hebrew Bible, dating to 600 BC.",
        detail: "Discovered by archaeologist Gabriel Barkay in a burial cave southwest of Jerusalem's Old City, these two silver amulets were rolled tightly and worn as jewelry. When unrolled (a process that took years of careful work), they revealed the Priestly Blessing in ancient Hebrew script. Dated to approximately 600 BC — before the Babylonian exile — they are the oldest known biblical texts, predating the Dead Sea Scrolls by 400 years. They proved that the books of Numbers and Deuteronomy existed in their current form during the period of the First Temple.",
        verse: "Numbers 6:24-26 — 'The Lord bless you and keep you; the Lord make his face shine on you...'",
      },
      {
        title: "Jericho's Collapsed Walls",
        year: "Excavated 1930s–1990s",
        location: "Jericho (Tell es-Sultan), West Bank",
        tag: "Structure",
        summary: "Archaeological evidence shows Jericho's walls collapsed suddenly and the city was burned — matching the biblical account in Joshua 6 with remarkable precision.",
        detail: "Kathleen Kenyon's 1950s excavations found that Jericho's Bronze Age walls had indeed collapsed outward and fallen down flat — exactly as Joshua 6:20 describes. Bryant Wood's 1990 analysis found: (1) the city was strongly fortified, (2) it fell suddenly, (3) the walls collapsed outward, (4) the city was burned with fire, (5) it happened at harvest time (spring), and (6) grain storage jars were full — matching Joshua's account that Israel didn't plunder the food. The destruction dates to approximately 1400 BC, aligning with biblical chronology.",
        verse: "Joshua 6:20 — 'When the trumpets sounded, the army shouted...the wall collapsed; so everyone charged straight in, and they took the city.'",
      },
      {
        title: "The Hezekiah Tunnel",
        year: "c. 701 BC",
        location: "Jerusalem, Israel",
        tag: "Structure",
        summary: "A 533-meter tunnel carved through bedrock beneath Jerusalem, built exactly as described in 2 Kings 20:20, still accessible today.",
        detail: "Also called the Siloam Tunnel, this engineering marvel was carved to redirect water from the Gihon Spring to within Jerusalem's walls before the Assyrian siege under Sennacherib. At the midpoint of the tunnel, the Siloam Inscription was found in 1880 — a 6-line Hebrew inscription describing the dramatic moment when two teams of workers carving from opposite ends heard each other's pickaxes and broke through. It precisely matches 2 Kings 20:20 and 2 Chronicles 32:30. You can wade through the tunnel today in the City of David archaeological park.",
        verse: "2 Kings 20:20 — 'He made the pool and the tunnel by which he brought water into the city.'",
      },
      {
        title: "The Megiddo Seal",
        year: "c. 8th century BC",
        location: "Megiddo, Israel",
        tag: "Artifact",
        summary: "An ancient jasper seal inscribed 'belonging to Shema, servant of Jeroboam' — directly confirming the biblical king Jeroboam II.",
        detail: "Discovered at Megiddo, this beautifully carved jasper seal depicts a roaring lion and bears the Hebrew inscription 'belonging to Shema, servant of Jeroboam.' Jeroboam II reigned over Israel from approximately 786–746 BC and is mentioned extensively in 2 Kings 13–14. This seal is one of the earliest personal seals to confirm a biblical monarch through a named servant. It is considered one of the most important seals ever found in biblical archaeology and is now in the Istanbul Archaeological Museum.",
        verse: "2 Kings 14:27 — 'The Lord had not said he would blot out the name of Israel from under heaven; so he saved them by the hand of Jeroboam.'",
      },
    ],
  },

  // HISTORICAL CONFIRMATIONS
  {
    category: "Historical Confirmations",
    icon: "🏛️",
    color: "blue",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    entries: [
      {
        title: "Josephus on Jesus",
        year: "c. 93 AD",
        location: "Roman Empire",
        tag: "Historical Record",
        summary: "Jewish historian Flavius Josephus references Jesus, James his brother, and John the Baptist in his Antiquities of the Jews — written just 60 years after the crucifixion.",
        detail: "In 'Antiquities of the Jews' (93 AD), Josephus writes: 'At this time there was a wise man called Jesus...Pilate condemned him to be crucified and to die. And those who had become his disciples did not abandon his discipleship. They reported that he had appeared to them three days after his crucifixion.' He also mentions 'James the brother of Jesus who was called Christ' (Ant. 20.9.1). Josephus was not a Christian — he was a Jewish historian employed by Rome. His references to Jesus are among the most important non-Christian attestations of the historical Jesus.",
        verse: "Acts 1:3 — 'After his suffering, he presented himself to them and gave many convincing proofs that he was alive.'",
      },
      {
        title: "Tacitus on the Crucifixion",
        year: "c. 116 AD",
        location: "Rome",
        tag: "Historical Record",
        summary: "Roman historian Tacitus explicitly names 'Christus,' his execution by Pontius Pilate, and the spread of Christianity — in a clearly non-sympathetic Roman account.",
        detail: "In his 'Annals' (c. 116 AD), Tacitus writes about Christians being blamed for the fire of Rome: 'Christus, from whom the name had its origin, suffered the extreme penalty during the reign of Tiberius at the hands of one of our procurators, Pontius Pilatus.' Tacitus despised Christians and had no motive to invent or confirm this account. As a high-ranking Roman senator and historian known for his accuracy, his statement independently confirms: (1) the historical existence of Christ, (2) his execution under Pilate, (3) his death, and (4) the early spread of Christianity.",
        verse: "Luke 23:24 — 'So Pilate decided to grant their demand.'",
      },
      {
        title: "Pliny the Younger on Early Christians",
        year: "c. 112 AD",
        location: "Bithynia-Pontus (modern Turkey)",
        tag: "Historical Record",
        summary: "A Roman governor's letter to Emperor Trajan describes early Christians worshipping Christ 'as a god' — confirming early high Christology within decades of the resurrection.",
        detail: "In his famous Letter 10.96 to Emperor Trajan (c. 112 AD), Pliny the Younger describes persecuting Christians and writes: 'They were in the habit of meeting on a certain fixed day before it was light, when they sang in alternate verses a hymn to Christ, as to a god.' This confirms that within 80 years of the crucifixion, Christians were already meeting regularly, worshipping Jesus as divine, observing ethical codes, and meeting before sunrise (to avoid persecution). This destroys the myth that Jesus was only later elevated to divine status — the veneration was extremely early.",
        verse: "Philippians 2:10-11 — 'At the name of Jesus every knee should bow...and every tongue acknowledge that Jesus Christ is Lord.'",
      },
      {
        title: "The Cyrus Cylinder",
        year: "c. 539 BC",
        location: "Babylon (modern Iraq)",
        tag: "Historical Record",
        summary: "A clay cylinder recording Cyrus the Great's policy of returning exiled peoples to their homelands — directly confirming his decree in Ezra 1:1-4 that allowed Jews to return to Israel.",
        detail: "Discovered in 1879 in the ruins of ancient Babylon, the Cyrus Cylinder records the Persian king Cyrus II's capture of Babylon and his policy of allowing deported peoples to return to their homelands and restore their temples. The Bible records this in Ezra 1:1-4 and Isaiah 44:28 (where Isaiah names Cyrus by name 150 years before his birth — a remarkable prophecy). The Cylinder is now in the British Museum and is considered the world's first declaration of human rights. It directly validates the biblical account of the Jewish return from Babylonian exile.",
        verse: "Ezra 1:2 — 'This is what Cyrus king of Persia says: The Lord, the God of heaven, has given me all the kingdoms of the earth and he has appointed me to build a temple for him at Jerusalem.'",
      },
      {
        title: "The Moabite Stone (Mesha Stele)",
        year: "c. 840 BC",
        location: "Dhiban, Jordan",
        tag: "Inscription",
        summary: "A black basalt stone inscribed by King Mesha of Moab mentioning Israel, the Israelite God (YHWH), the tribe of Gad, and specific biblical locations.",
        detail: "Discovered in 1868 near Dhiban (biblical Dibon) in modern Jordan, the Mesha Stele is a 34-line inscription celebrating Moabite king Mesha's victories. It mentions: the Israelite God YHWH by name, the tribe of Gad, King Omri of Israel, and several cities that appear in the Bible. The Stone confirms that the Israelite kingdom under the Omride dynasty was a recognized regional power in the 9th century BC — exactly as the Bible describes. It is now in the Louvre in Paris.",
        verse: "2 Kings 3:4 — 'Now Mesha king of Moab raised sheep, and he had to pay the king of Israel a tribute.'",
      },
    ],
  },

  // PROPHECY FULFILLED
  {
    category: "Fulfilled Prophecies",
    icon: "🔮",
    color: "purple",
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    entries: [
      {
        title: "The Destruction of Tyre",
        year: "Prophecy ~590 BC / Fulfilled 332 BC",
        location: "Tyre, Lebanon",
        tag: "Prophecy",
        summary: "Ezekiel predicted in detail that Tyre would be destroyed, its stones thrown into the sea, and it would become a bare rock — all fulfilled by Alexander the Great 250 years later.",
        detail: "In Ezekiel 26 (written ~590 BC), the prophet gave seven specific prophecies about Tyre: (1) Nebuchadnezzar would destroy it; (2) many nations would come against it; (3) it would become a bare rock; (4) its stones and timbers would be thrown into the sea; (5) it would become a place for spreading fishing nets; (6) it would never be rebuilt; (7) it would never be found again. Nebuchadnezzar destroyed the mainland city in 573 BC. Alexander the Great in 332 BC then took the rubble — the stones, timbers, and dust — and threw it into the sea to build a causeway to attack the island fortress. The area remains bare and sparsely populated today.",
        verse: "Ezekiel 26:12 — 'They will plunder your wealth and loot your merchandise; they will break down your walls and demolish your fine houses and throw your stones, timber and rubble into the sea.'",
      },
      {
        title: "The Birth of Jesus in Bethlehem",
        year: "Prophecy ~700 BC / Fulfilled ~5 BC",
        location: "Bethlehem, Israel",
        tag: "Prophecy",
        summary: "Micah 5:2 named Bethlehem specifically as the birthplace of the Messiah — written 700 years before Jesus was born there.",
        detail: "The prophet Micah, writing around 700 BC, predicted: 'But you, Bethlehem Ephrathah, though you are small among the clans of Judah, out of you will come for me one who will be ruler over Israel, whose origins are from of old, from ancient times.' Bethlehem was a tiny, insignificant village. There was no logical reason to single it out. Yet Matthew 2:1 records that Jesus was born there, and the Magi and Herod's scribes both identified Bethlehem as the expected birthplace (Matthew 2:4-6). This prophecy is considered one of the most remarkable messianic predictions in the Old Testament.",
        verse: "Micah 5:2 — 'But you, Bethlehem Ephrathah...out of you will come for me one who will be ruler over Israel.'",
      },
      {
        title: "Isaiah's Suffering Servant",
        year: "Prophecy ~700 BC / Fulfilled ~30 AD",
        location: "Jerusalem, Israel",
        tag: "Prophecy",
        summary: "Isaiah 53 describes the Messiah being rejected, pierced, bearing our sins, dying with the wicked, and buried with the rich — written 700 years before Jesus's crucifixion.",
        detail: "Isaiah 53, written approximately 700 BC, contains at least 8 specific predictions about the Messiah: (1) rejected and despised by men; (2) a man of sorrows; (3) bore our infirmities; (4) pierced for our transgressions; (5) led like a lamb to slaughter; (6) cut off from the land of the living; (7) assigned a grave with the wicked (crucified between criminals); (8) with the rich in his death (Joseph of Arimathea's tomb). Every single detail was fulfilled in Jesus's arrest, trial, crucifixion, and burial. The Dead Sea Scrolls confirmed this text dates to at least 100 BC — 130 years before Jesus.",
        verse: "Isaiah 53:5 — 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.'",
      },
      {
        title: "The Destruction of Jerusalem",
        year: "Prophecy ~30 AD / Fulfilled 70 AD",
        location: "Jerusalem, Israel",
        tag: "Prophecy",
        summary: "Jesus predicted the Temple's complete destruction — 'not one stone left on another' — fulfilled exactly 40 years later by the Roman general Titus.",
        detail: "In Matthew 24:1-2 (c. 30 AD), Jesus looked at the magnificent Herodian Temple and said: 'Do you see all these things?...Truly I tell you, not one stone here will be left on another; every one will be thrown down.' In 70 AD, Roman general Titus besieged and destroyed Jerusalem. The Temple was burned. According to historian Josephus, soldiers tore apart the walls looking for gold that had melted between the stones from the fire. The Western Wall (Wailing Wall) — all that remains — is actually part of the retaining wall around the Temple Mount, not the Temple itself. The prediction was fulfilled with literal precision.",
        verse: "Matthew 24:2 — 'Do you see all these things?...Truly I tell you, not one stone here will be left on another; every one will be thrown down.'",
      },
    ],
  },

  // SCIENCE & NATURE
  {
    category: "Science Affirms Scripture",
    icon: "🔬",
    color: "green",
    img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80",
    entries: [
      {
        title: "The Bible Described a Round Earth",
        year: "Written ~700 BC",
        location: "Biblical Text",
        tag: "Science",
        summary: "Isaiah 40:22 references 'the circle of the earth' — written centuries before Greek philosophers popularized the idea of a spherical earth.",
        detail: "Isaiah 40:22 (c. 700 BC) reads: 'He sits enthroned above the circle of the earth.' The Hebrew word 'chug' can mean circle, sphere, or vault. While Greeks like Pythagoras (c. 570–495 BC) theorized a spherical earth, and Eratosthenes calculated its circumference around 240 BC, the biblical reference predates Greek scientific consensus on the matter. Job 26:10 also says God 'has inscribed a circle on the face of the waters at the boundary between light and darkness' — a poetic description of the day-night terminator line only visible from space.",
        verse: "Isaiah 40:22 — 'He sits enthroned above the circle of the earth, and its people are like grasshoppers.'",
      },
      {
        title: "The Bible Described the Hydrological Cycle",
        year: "Written ~930 BC",
        location: "Biblical Text",
        tag: "Science",
        summary: "Ecclesiastes 1:7 and Amos 9:6 accurately describe the complete water cycle — evaporation, cloud formation, and precipitation — thousands of years before scientists formalized it.",
        detail: "Ecclesiastes 1:7 (c. 930 BC): 'All the rivers run into the sea; yet the sea is not full; unto the place from whence the rivers come, thither they return again.' Amos 9:6 (c. 760 BC): 'He who...calls for the waters of the sea, and pours them out over the face of the earth.' The complete scientific understanding of the hydrological cycle (evaporation → condensation → precipitation → runoff → repeat) wasn't formalized until the 16th-17th centuries by Pierre Perrault and Edmund Halley. The Bible described it accurately over 2,500 years earlier.",
        verse: "Ecclesiastes 1:7 — 'All streams flow into the sea, yet the sea is never full. To the place the streams come from, there they return again.'",
      },
      {
        title: "Quarantine Laws Preceded Modern Medicine",
        year: "Written ~1400 BC",
        location: "Biblical Text",
        tag: "Science",
        summary: "Leviticus 13-14 prescribed detailed quarantine protocols for infectious disease — 3,000 years before germ theory was discovered.",
        detail: "The Mosaic Law in Leviticus 13-14 described isolating people with infectious skin diseases for 7-day periods, inspecting them, washing clothes, and decontaminating homes. These practices directly parallel modern infectious disease protocols. During the Black Death (1347–1351 AD), Jewish communities that followed Mosaic Law's quarantine and hygiene regulations had significantly lower mortality rates — which tragically led to accusations that they caused the plague. The germ theory of disease wasn't established until Louis Pasteur's work in the 1860s, yet the Bible's infection-control procedures were scientifically sound 3,000 years earlier.",
        verse: "Leviticus 13:46 — 'As long as they have the disease they remain unclean. They must live alone; they must live outside the camp.'",
      },
    ],
  },
];

const tagColors = {
  Manuscript: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Inscription: "bg-stone-100 text-stone-700 dark:bg-stone-800/40 dark:text-stone-300",
  Artifact: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Structure: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Historical Record": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Prophecy: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Science: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

function EntryCard({ entry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagColors[entry.tag] || "bg-secondary text-muted-foreground"}`}>
                {entry.tag}
              </span>
              <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {entry.location}
              </span>
              <span className="font-body text-[10px] text-muted-foreground">{entry.year}</span>
            </div>
            <h4 className="font-display font-bold text-base text-foreground mb-1">{entry.title}</h4>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{entry.summary}</p>
          </div>
          <div className="flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border/60 pt-4 space-y-3">
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{entry.detail}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <BookOpen className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-accent/90 italic leading-relaxed">{entry.verse}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategorySection({ section }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full relative rounded-xl border border-border overflow-hidden mb-3 hover:border-accent/40 transition-colors group"
      >
        {section.img && (
          <div className="h-24 w-full overflow-hidden">
            <img src={section.img} alt={section.category} className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity group-hover:scale-105 duration-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{section.icon}</span>
            <div className="text-left">
              <h3 className="font-display font-bold text-base text-primary-foreground">{section.category}</h3>
              <p className="font-body text-xs text-primary-foreground/60">{section.entries.length} entries</p>
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-primary-foreground/70" /> : <ChevronDown className="w-4 h-4 text-primary-foreground/70" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {section.entries.map((entry, i) => (
                <EntryCard key={i} entry={entry} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DidYouKnow() {
  const [search, setSearch] = useState("");

  const allEntries = encyclopedia.flatMap((s) =>
    s.entries.map((e) => ({ ...e, category: s.category, icon: s.icon }))
  );

  const filtered = search.trim()
    ? allEntries.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.summary.toLowerCase().includes(search.toLowerCase()) ||
          e.tag.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const stats = [
    { label: "Archaeological Finds", value: "7", icon: "⛏️", sectionIndex: 1, img: "https://images.unsplash.com/photo-1568209865332-a15790aed756?w=400&q=80" },
    { label: "Historical Records", value: "5", icon: "🏛️", sectionIndex: 2, img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80" },
    { label: "Fulfilled Prophecies", value: "4", icon: "🔮", sectionIndex: 3, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80" },
    { label: "Ancient Manuscripts", value: "4", icon: "📜", sectionIndex: 0, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80" },
  ];

  const scrollToSection = (index) => {
    setSearch("");
    setTimeout(() => {
      const el = document.getElementById(`did-you-know-section-${index}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Star className="w-5 h-5 text-accent" />
        <h2 className="font-display text-xl font-bold text-foreground">Did You Know?</h2>
      </div>
      <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
        An encyclopedia of archaeological discoveries, historical records, fulfilled prophecies, and scientific confirmations that validate the authenticity and truth of the Bible.
      </p>

      {/* Stats — clickable */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(s.sectionIndex)}
            className="group relative rounded-xl border border-border bg-card overflow-hidden text-center hover:border-accent/50 hover:shadow-md transition-all"
          >
            <div className="h-16 overflow-hidden">
              <img src={s.img} alt={s.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
            </div>
            <div className="p-2 relative z-10">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className="font-display font-bold text-lg text-accent">{s.value}+</div>
              <div className="font-body text-[10px] text-muted-foreground leading-tight">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search artifacts, prophecies, discoveries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-body text-sm"
        />
      </div>

      {/* Results */}
      {filtered ? (
        <div>
          <p className="font-body text-xs text-muted-foreground mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-body text-muted-foreground text-sm">No entries found. Try a different search term.</p>
              </div>
            ) : (
              filtered.map((entry, i) => <EntryCard key={i} entry={entry} />)
            )}
          </div>
        </div>
      ) : (
        <div>
          {encyclopedia.map((section, i) => (
            <div key={i} id={`did-you-know-section-${i}`}>
              <CategorySection section={section} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}