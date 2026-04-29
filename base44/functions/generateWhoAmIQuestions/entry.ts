const WHO_AM_I_POOL = [
  { clues: ["I built an ark and saved my family from a great flood.", "God established his covenant with me after the waters receded.", "I released a dove to find dry land.", "I planted a vineyard after leaving the ark."], options: ["Abraham", "Noah", "Moses", "Elijah"], correctIndex: 1, explanation: "Noah built the ark at God's command and preserved all animal life through the flood. (Genesis 6-9)" },
  { clues: ["I was sold into slavery by my brothers.", "I interpreted Pharaoh's dream about seven fat cows and seven thin cows.", "I became second-in-command of Egypt.", "I revealed myself to my brothers and wept."], options: ["Joseph", "Daniel", "Moses", "Jeremiah"], correctIndex: 0, explanation: "Joseph was sold by his brothers, rose to power in Egypt, and saved the nation — and his family — from famine. (Genesis 37-50)" },
  { clues: ["I was hidden in a basket in the river as a baby.", "I received God's law on a mountain.", "I led my people out of slavery through miraculous plagues.", "I saw a burning bush that was not consumed."], options: ["Aaron", "Joshua", "Moses", "Samuel"], correctIndex: 2, explanation: "Moses led Israel out of Egypt, received the Ten Commandments, and spoke with God face to face. (Exodus)" },
  { clues: ["I killed a giant with a stone and a sling.", "I was a shepherd boy and a musician.", "I wrote many of the Psalms.", "God called me a man after his own heart."], options: ["Saul", "Solomon", "Jonathan", "David"], correctIndex: 3, explanation: "David defeated Goliath, became king of Israel, and authored most of the Psalms. (1-2 Samuel)" },
  { clues: ["I was swallowed by a great fish for three days.", "God sent me to preach to a wicked city.", "I was angry when my enemies repented.", "I sat under a shade plant that withered."], options: ["Jonah", "Elijah", "Amos", "Micah"], correctIndex: 0, explanation: "Jonah fled from God's call, was swallowed by a great fish, and finally preached to Nineveh. (Jonah)" },
  { clues: ["I was the first woman, formed from a rib.", "I was deceived by a serpent in a garden.", "My name means 'mother of all living.'", "I ate fruit from the forbidden tree."], options: ["Sarah", "Ruth", "Miriam", "Eve"], correctIndex: 3, explanation: "Eve was the first woman, created in the Garden of Eden, and was deceived into disobeying God. (Genesis 2-3)" },
  { clues: ["I was a Gentile woman who stayed with my mother-in-law after being widowed.", "I gleaned grain in a field and found favor.", "I said 'Where you go I will go.'", "I became an ancestor of King David."], options: ["Naomi", "Esther", "Ruth", "Deborah"], correctIndex: 2, explanation: "Ruth's loyalty to Naomi and to God led to her marriage to Boaz and a place in the lineage of Christ. (Ruth)" },
  { clues: ["I was a tax collector who climbed a tree to see Jesus.", "Jesus invited himself to my house for dinner.", "I gave half my goods to the poor after meeting Jesus.", "My name means 'pure' in Hebrew."], options: ["Matthew", "Zacchaeus", "Nicodemus", "Levi"], correctIndex: 1, explanation: "Zacchaeus was a chief tax collector in Jericho who encountered Jesus and was transformed. (Luke 19)" },
  { clues: ["I denied Jesus three times before a rooster crowed.", "I walked on water briefly before sinking.", "I was the first to declare Jesus the Christ.", "Jesus gave me the keys of the kingdom."], options: ["John", "James", "Andrew", "Peter"], correctIndex: 3, explanation: "Peter was the disciple who declared Jesus the Christ, denied him, and then became a pillar of the early church. (Matthew 16, John 18)" },
  { clues: ["I was a queen who risked my life to save my people.", "My Hebrew name was Hadassah.", "I was chosen as queen through a royal beauty contest.", "My uncle Mordecai warned me about a plot to kill all my people."], options: ["Deborah", "Miriam", "Judith", "Esther"], correctIndex: 3, explanation: "Esther risked death to approach the king uninvited and saved the Jewish people from Haman's genocidal plot. (Esther)" },
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
    const { count = 5 } = await req.json().catch(() => ({}));
    const questions = shuffle(WHO_AM_I_POOL).slice(0, Math.min(count, WHO_AM_I_POOL.length));
    return Response.json({ questions });
  } catch (error) {
    console.error("generateWhoAmIQuestions error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
