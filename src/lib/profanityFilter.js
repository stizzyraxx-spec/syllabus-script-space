// Basic profanity filter — replaces bad words with asterisks
const BAD_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "damn", "crap", "piss",
  "cock", "dick", "pussy", "ass", "cunt", "whore", "slut", "nigger", "nigga",
  "faggot", "fag", "retard", "motherfucker", "fucker", "bullshit", "jackass",
  "dipshit", "dumbass", "shithead", "douchebag", "wanker", "prick",
];

/**
 * Returns true if the text contains profanity.
 */
export function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BAD_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
}

/**
 * Replaces profane words with asterisks.
 */
export function filterProfanity(text) {
  if (!text) return text;
  let filtered = text;
  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}