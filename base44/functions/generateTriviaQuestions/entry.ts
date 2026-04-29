const TRIVIA_POOL = [
  { question: "How many days did God take to create the world according to Genesis?", options: ["5 days", "6 days", "7 days", "10 days"], correct_index: 1, explanation: "God created the world in six days and rested on the seventh. (Genesis 1-2)" },
  { question: "Who baptized Jesus in the Jordan River?", options: ["Peter", "John the Baptist", "Andrew", "Elijah"], correct_index: 1, explanation: "John the Baptist baptized Jesus, after which the Holy Spirit descended like a dove. (Matthew 3:13-17)" },
  { question: "In what city was Jesus born?", options: ["Jerusalem", "Nazareth", "Bethlehem", "Jericho"], correct_index: 2, explanation: "Jesus was born in Bethlehem of Judea, fulfilling the prophecy of Micah 5:2. (Luke 2:1-7)" },
  { question: "How many disciples did Jesus choose?", options: ["7", "10", "12", "70"], correct_index: 2, explanation: "Jesus chose twelve apostles, corresponding to the twelve tribes of Israel. (Mark 3:13-19)" },
  { question: "Who was the first king of Israel?", options: ["David", "Solomon", "Saul", "Samuel"], correct_index: 2, explanation: "Saul was anointed the first king of Israel by Samuel at the people's request. (1 Samuel 10)" },
  { question: "What is the shortest verse in the King James Bible?", options: ["\"Amen.\"", "\"Jesus wept.\"", "\"Pray always.\"", "\"Fear not.\""], correct_index: 1, explanation: "John 11:35 — 'Jesus wept.' — is the shortest verse in the Bible. It describes Jesus mourning at the tomb of Lazarus." },
  { question: "How many books are in the Old Testament?", options: ["27", "33", "39", "46"], correct_index: 2, explanation: "The Protestant Old Testament contains 39 books, from Genesis to Malachi." },
  { question: "Who wrote the most books of the New Testament?", options: ["John", "Paul", "Luke", "Peter"], correct_index: 1, explanation: "The Apostle Paul wrote 13 epistles in the New Testament, more than any other author." },
  { question: "In which book of the Bible is the story of Joseph and his coat of many colors?", options: ["Exodus", "Numbers", "Deuteronomy", "Genesis"], correct_index: 3, explanation: "The story of Joseph and his multicolored coat is found in Genesis 37-50." },
  { question: "What did God give Moses on Mount Sinai?", options: ["The Ark of the Covenant", "The Ten Commandments", "The Book of the Law", "The Tabernacle plans"], correct_index: 1, explanation: "God gave Moses the Ten Commandments (and additional laws) on Mount Sinai. (Exodus 20)" },
  { question: "How many days was Jonah in the belly of the great fish?", options: ["1 day", "2 days", "3 days", "7 days"], correct_index: 2, explanation: "Jonah spent three days and three nights in the belly of the fish — a sign Jesus cited as prophetic of his own burial. (Jonah 1:17, Matthew 12:40)" },
  { question: "Who was the mother of Jesus?", options: ["Elizabeth", "Anna", "Mary", "Martha"], correct_index: 2, explanation: "Mary was chosen by God to be the mother of Jesus. (Luke 1:26-38)" },
  { question: "What was the name of the garden where Jesus was arrested?", options: ["Garden of Eden", "Garden of Gethsemane", "Garden of Joseph", "Garden of the Tomb"], correct_index: 1, explanation: "Jesus prayed and was arrested in the Garden of Gethsemane. (Matthew 26:36-56)" },
  { question: "Who was thrown into the lions' den for praying to God?", options: ["Shadrach", "Daniel", "Ezra", "Nehemiah"], correct_index: 1, explanation: "Daniel was thrown into the lions' den for continuing to pray to God despite the king's decree. (Daniel 6)" },
  { question: "On what mount did Jesus deliver the Beatitudes?", options: ["Mount Sinai", "Mount Zion", "The Mount of Olives", "An unnamed mountain in Galilee"], correct_index: 3, explanation: "The Sermon on the Mount, including the Beatitudes, was delivered on a mountain in Galilee. (Matthew 5:1)" },
  { question: "Who was the father of John the Baptist?", options: ["Joseph", "Zacharias", "Simon", "Eli"], correct_index: 1, explanation: "Zacharias (Zechariah), a priest, was the father of John the Baptist. His wife was Elizabeth, a relative of Mary. (Luke 1:5-25)" },
  { question: "What is the last book of the Bible?", options: ["Jude", "3 John", "Revelation", "Acts"], correct_index: 2, explanation: "Revelation (or The Revelation of John) is the final book of the Bible, describing visions of the end times." },
  { question: "How many plagues did God send upon Egypt?", options: ["7", "10", "12", "14"], correct_index: 1, explanation: "God sent ten plagues upon Egypt to convince Pharaoh to release the Israelites. (Exodus 7-12)" },
  { question: "Who replaced Judas Iscariot as the twelfth apostle?", options: ["Paul", "Barnabas", "Matthias", "Stephen"], correct_index: 2, explanation: "Matthias was chosen by lot to replace Judas Iscariot after his death. (Acts 1:23-26)" },
  { question: "What miracle did Jesus perform at the wedding in Cana?", options: ["Healed a blind man", "Raised the dead", "Turned water into wine", "Multiplied bread and fish"], correct_index: 2, explanation: "Jesus turned water into wine at the wedding in Cana — his first recorded miracle. (John 2:1-11)" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req) => {
  try {
    const { count = 10 } = await req.json().catch(() => ({}));
    const raw = shuffle(TRIVIA_POOL).slice(0, Math.min(count, TRIVIA_POOL.length));
    const questions = raw.map(q => {
      const correctAnswer = q.options[q.correct_index];
      const shuffled = shuffle([...q.options]);
      return { ...q, options: shuffled, correct_index: shuffled.indexOf(correctAnswer) };
    });
    return Response.json({ questions });
  } catch (error) {
    console.error("generateTriviaQuestions error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
