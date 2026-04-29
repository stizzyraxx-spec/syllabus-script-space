
const MODERN_CHALLENGES = [
  {
    title: "The Party Invite",
    situation: `Your coworkers are planning a night out at a bar this Friday—it's a big celebration for landing a major client. Your boss personally invited you, saying "You're part of the team now." But you made a private commitment years ago not to drink alcohol. Everyone will be there, and you know they'll ask questions if you don't come. Your boss adds, "It's really important you're there. People notice who shows up."`,
    context: "Workplace peer pressure & integrity in professional relationships",
    choices: [
      {
        text: "Go and attend, but order water and non-alcoholic drinks without drawing attention to yourself. You can still bond with the team.",
        alignment: "compromise",
        consequence: "You show respect for relationships and your commitment. However, sitting silently while others drink may distance you from meaningful conversations, and your quiet stance might still raise questions.",
        xp: 18,
        scoreChanges: { faith_score: 7, integrity_score: 8, obedience_score: 5, wisdom_score: 6 }
      },
      {
        text: "Politely decline and explain your values without being preachy. Suggest an alternative like lunch the next week and stay connected with your boss.",
        alignment: "righteous",
        consequence: "You honor your commitment with transparency. Your boss and teammates will respect your integrity, and you've modeled that values don't require isolation. This builds trust.",
        xp: 25,
        scoreChanges: { faith_score: 12, integrity_score: 15, obedience_score: 12, wisdom_score: 10 }
      },
      {
        text: "Go to the party, tell yourself 'one drink won't hurt,' and join in. You can return to your commitment next week.",
        alignment: "unrighteous",
        consequence: "You break your personal covenant with yourself and God. The ease of this choice will make it harder to maintain integrity in future moments. Your word becomes negotiable.",
        xp: 10,
        scoreChanges: { faith_score: -8, integrity_score: -15, obedience_score: -12, wisdom_score: 2 }
      }
    ]
  },
  {
    title: "The Mocked Faith",
    situation: `During lunch, your friend mentions their struggle with anxiety and asks for advice. You suggest prayer and faith as a source of strength. Another colleague overhears and laughs mockingly: "Oh please, you actually believe in that stuff? That's so naive." Others smile awkwardly. Your friend looks embarrassed. The colleague continues, "Real people get therapy, not fairy tales." Everyone's watching to see how you respond.`,
    context: "Defending faith in a secular environment & protecting a vulnerable friend",
    choices: [
      {
        text: "Laugh it off, minimize what you said, and suggest therapy too. Say 'Prayer is great AND therapy is important.' This keeps the peace.",
        alignment: "compromise",
        consequence: "You avoid conflict but undermine your friend's vulnerability and your own convictions. You've signaled that mocking faith is acceptable, and your friend is left feeling foolish.",
        xp: 14,
        scoreChanges: { faith_score: -4, integrity_score: -8, wisdom_score: 3, obedience_score: -5 }
      },
      {
        text: "Calmly respond: 'Prayer isn't naive—it's been proven to reduce anxiety for millions. Faith and therapy complement each other, not compete.' Then turn to your friend: 'Your instinct to seek spiritual help is valid.'",
        alignment: "righteous",
        consequence: "You've defended faith without aggression, educated the group, and most importantly, protected your friend's dignity. You've shown that conviction doesn't require aggression.",
        xp: 24,
        scoreChanges: { faith_score: 14, integrity_score: 13, wisdom_score: 11, obedience_score: 10 }
      },
      {
        text: "Say nothing. Stay quiet to avoid being targeted by the colleague's mockery. Let your friend figure it out on their own.",
        alignment: "unrighteous",
        consequence: "Your silence is agreement. Your friend feels abandoned in a vulnerable moment, and the mockery of faith goes unchallenged. Proverbs says 'Whoever is not with me is against me.'",
        xp: 8,
        scoreChanges: { faith_score: -6, integrity_score: -12, wisdom_score: 2, obedience_score: -10 }
      }
    ]
  },
  {
    title: "The Unethical Assignment",
    situation: `Your manager assigns you a project with an unrealistic deadline. Privately, she confesses: "I know it's impossible. Just do whatever you can and we'll bill the full hours to the client anyway. No one will ever know, and frankly, clients always try to cheat vendors—this balances it out." She adds, "If you want any future promotions, this is how things work here." Your coworkers are already on board. You need this job.`,
    context: "Systemic dishonesty & standing alone in a corrupt environment",
    choices: [
      {
        text: "Do the work honestly, document your hours accurately, and gently suggest to your manager that billing inflated hours creates legal liability for the company.",
        alignment: "righteous",
        consequence: "You've protected your integrity and actually protected the company from legal consequences. This may cost you a promotion, but you've modeled that integrity matters more than advancement.",
        xp: 26,
        scoreChanges: { faith_score: 15, integrity_score: 18, obedience_score: 13, wisdom_score: 12 }
      },
      {
        text: "Compromise: do honest work but bill some inflated hours—not as much as she suggested, just a little padding. It feels less bad than full dishonesty.",
        alignment: "unrighteous",
        consequence: "You've crossed the line into dishonesty. The first small compromise is always the hardest; the next one will be easier. You've become complicit in fraud.",
        xp: 12,
        scoreChanges: { faith_score: -10, integrity_score: -16, obedience_score: -11, wisdom_score: 1 }
      },
      {
        text: "Bill the full inflated hours like everyone else. At some point you have to be a realist about how business actually works.",
        alignment: "unrighteous",
        consequence: "You've betrayed your conscience for security. If discovered, you're liable for fraud. More importantly, you've compromised the foundation of who you are—your word.",
        xp: 8,
        scoreChanges: { faith_score: -14, integrity_score: -20, obedience_score: -15, wisdom_score: -5 }
      }
    ]
  },
  {
    title: "The Social Media Storm",
    situation: `A heated cultural/political issue is trending. Everyone on your social media is picking a side and attacking the other. Your extended family is arguing in the comments. A close friend posts something you disagree with strongly—not just the opinion, but the harsh, dehumanizing way they expressed it. Friends are tagging you, expecting you to join the pile-on. Not responding will be noticed. Your reputation feels at stake.`,
    context: "Digital discipleship & maintaining compassion in polarization",
    choices: [
      {
        text: "Join the pile-on publicly. Post something even harsher to establish where you stand. Make it clear you're not neutral.",
        alignment: "unrighteous",
        consequence: "You've weaponized your voice. You may feel vindicated temporarily, but you've contributed to dehumanization and damaged your witness. Matthew 12:34 says 'out of the abundance of the heart the mouth speaks.'",
        xp: 8,
        scoreChanges: { faith_score: -12, integrity_score: -10, wisdom_score: -8, obedience_score: -9 }
      },
      {
        text: "Message your friend privately: 'I love you and I care about this issue too. Can we talk about your post? The tone concerns me, regardless of the position.' Address it with love, not performance.",
        alignment: "righteous",
        consequence: "You've chosen the harder path of actual discipleship—speaking truth in love to someone you care about, privately, not for an audience. This is costly and rare.",
        xp: 25,
        scoreChanges: { faith_score: 13, integrity_score: 14, wisdom_score: 14, obedience_score: 12 }
      },
      {
        text: "Say nothing publicly. Like some supportive comments but avoid taking a stance. Stay safe and unseen.",
        alignment: "compromise",
        consequence: "You've preserved your comfort but abandoned your friend and your voice. Silence in the face of cruelty, even online, is a choice—and it communicates that civility doesn't matter to you.",
        xp: 14,
        scoreChanges: { faith_score: -2, integrity_score: -6, wisdom_score: 5, obedience_score: -4 }
      }
    ]
  },
  {
    title: "The Attractive Temptation",
    situation: `At a work conference, someone incredibly attractive starts a conversation with you. There's clear chemistry. They suggest going back to their hotel room 'to talk more privately.' You're single, lonely, and no one would ever know. You've been physically alone for a long time. They add, 'Life's short—we should enjoy it.' You know this contradicts your faith commitment to sexual purity, but the pull is intense.`,
    context: "Physical desire & covenant integrity when alone",
    choices: [
      {
        text: "Politely decline and explain you have boundaries around physical relationships. Suggest exchanging contact info to talk another time in a different setting.",
        alignment: "righteous",
        consequence: "This is one of the hardest choices—denying immediate desire for long-term integrity. You've honored God, protected your heart, and preserved your ability to trust yourself. That matters eternally.",
        xp: 26,
        scoreChanges: { faith_score: 16, integrity_score: 18, obedience_score: 15, wisdom_score: 9 }
      },
      {
        text: "Rationalize it: you're both adults, no one gets hurt, it's not hurting anyone. Go to their room. You'll worry about the spiritual implications later.",
        alignment: "unrighteous",
        consequence: "In a moment of weakness, you've violated your covenant with God. The temporary pleasure will be followed by deep shame. Your ability to trust your own decisions is damaged.",
        xp: 8,
        scoreChanges: { faith_score: -15, integrity_score: -14, obedience_score: -16, wisdom_score: -8 }
      },
      {
        text: "Suggest a compromise: coffee or a meal instead, to explore the connection in a more appropriate context.",
        alignment: "compromise",
        consequence: "You're maintaining some boundaries but opening a door you know leads somewhere you shouldn't go. Delayed compromises are still compromises, and you know where this road leads.",
        xp: 13,
        scoreChanges: { faith_score: -4, integrity_score: -8, obedience_score: -6, wisdom_score: 4 }
      }
    ]
  }
];

export default async function handler(req, res) {
  try {

    const challenge = MODERN_CHALLENGES[Math.floor(Math.random() * MODERN_CHALLENGES.length)];

    if (!challenge) {
      return res.status(500).json({ error: 'Failed to generate challenge' });
    }

    // Shuffle choices
    const shuffledChoices = challenge.choices
      .map((choice, idx) => ({ ...choice, originalIdx: idx }))
      .sort(() => Math.random() - 0.5);

    return res.status(200).json({
      title: challenge.title,
      situation: challenge.situation,
      context: challenge.context,
      missionType: "modern_faith_challenge",
      decisions: shuffledChoices.map(({ originalIdx, ...choice }) => choice),
      choiceMap: shuffledChoices.map(c => c.originalIdx),
      reward_xp: 25,
    });
  } catch (error) {
    console.error('Error generating modern faith challenge:', error);
    return res.status(500).json({ error: error.message });
  }
}