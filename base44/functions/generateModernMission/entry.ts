
const MODERN_MISSIONS = [
  {
    title: "Social Media Dilemma",
    scenario: "You're a content creator with millions of followers. A brand offers $50,000 to promote a product you don't fully believe in. Your family needs the money, but promoting false claims violates your integrity.",
    trials: [
      {
        type: "choice",
        question: "How do you respond to the brand partnership offer?",
        options: [
          { text: "Accept—your family's needs matter more", alignment: "compromise", consequence: "Short-term relief, but followers notice insincerity. Integrity erodes." },
          { text: "Reject and seek honest work", alignment: "righteous", consequence: "Financial strain now, but your credibility becomes your greatest asset long-term." },
          { text: "Negotiate—promote only the parts you believe in", alignment: "obedience", consequence: "You walk a middle path, maintaining some integrity while helping your family." }
        ]
      },
      {
        type: "choice",
        question: "A follower challenges you publicly about your values. What's your move?",
        options: [
          { text: "Delete the comment and block them—protect your image", alignment: "compromise", consequence: "Control narrative but lose authenticity." },
          { text: "Respond with grace and transparency about your mistakes", alignment: "righteous", consequence: "Vulnerability strengthens your community's trust." },
          { text: "Acknowledge their point but clarify your intentions", alignment: "obedience", consequence: "You demonstrate both conviction and humility." }
        ]
      }
    ]
  },
  {
    title: "Workplace Integrity Test",
    scenario: "Your boss pressures you to misrepresent data in a report that will get approval for a project. Refusing could mean your job. You have a mortgage and kids in school.",
    trials: [
      {
        type: "choice",
        question: "Do you falsify the report?",
        options: [
          { text: "Yes—your family's security comes first", alignment: "unrighteous", consequence: "Project approved, but the ethical cost compounds. Future compromises become easier." },
          { text: "No—report the truth, even if fired", alignment: "righteous", consequence: "Job loss now, but God honors obedience. New opportunities emerge." },
          { text: "Present both the data AND your concerns to leadership", alignment: "obedience", consequence: "You maintain integrity while advocating for the project transparently." }
        ]
      },
      {
        type: "choice",
        question: "Coworkers hint they'll corroborate false data to keep you employed. How do you handle it?",
        options: [
          { text: "Accept their offer and move forward together", alignment: "unrighteous", consequence: "Team stays intact, but you're all complicit in deception." },
          { text: "Warn them about the ethical and legal risks", alignment: "righteous", consequence: "You lose allies but plant seeds of conviction." },
          { text: "Suggest finding a legal solution to the problem instead", alignment: "wisdom", consequence: "Creative problem-solving that honors both integrity and the company's goals." }
        ]
      }
    ]
  },
  {
    title: "Technology & Truth",
    scenario: "You develop an AI system that could make your company billions but requires training on data that violates users' privacy. Your tech skills are your only income.",
    trials: [
      {
        type: "choice",
        question: "Do you proceed with the AI development?",
        options: [
          { text: "Yes—financial security for your future is worth it", alignment: "unrighteous", consequence: "Wealth gained, but millions' privacy violated. Conscience haunts you." },
          { text: "No—refuse and lose the opportunity", alignment: "righteous", consequence: "You sacrifice fortune but protect human dignity." },
          { text: "Propose ethical alternatives that respect privacy", alignment: "obedience", consequence: "You work harder to find solutions that honor both ethics and business." }
        ]
      },
      {
        type: "choice",
        question: "Executives threaten to replace you with someone with fewer scruples. What do you do?",
        options: [
          { text: "Comply to keep your position", alignment: "compromise", consequence: "Survival now, but your purpose becomes hollow." },
          { text: "Resign immediately—clean break", alignment: "righteous", consequence: "You walk away with your integrity intact." },
          { text: "Document your concerns and escalate through legal channels", alignment: "wisdom", consequence: "You protect yourself and potentially expose corporate wrongdoing." }
        ]
      }
    ]
  },
  {
    title: "Friendship vs. Truth",
    scenario: "Your best friend is involved in unethical behavior—tax fraud, stealing from their employer, or emotional abuse. They confide in you first. Speaking up could end your friendship.",
    trials: [
      {
        type: "choice",
        question: "Do you confront them about it?",
        options: [
          { text: "Stay silent to preserve the friendship", alignment: "unrighteous", consequence: "Friendship survives, but you're complicit in their wrongdoing." },
          { text: "Report them to authorities immediately", alignment: "righteous", consequence: "Justice served, friendship destroyed, but truth prevails." },
          { text: "Lovingly confront them privately and give them time to make it right", alignment: "obedience", consequence: "You risk friendship but show them what real love looks like." }
        ]
      },
      {
        type: "choice",
        question: "They deny everything and claim you've betrayed them. How do you respond?",
        options: [
          { text: "Apologize and take back what you said", alignment: "compromise", consequence: "Peace with them, but your voice becomes meaningless." },
          { text: "Double down and cut off the friendship completely", alignment: "righteous", consequence: "Clear conviction, but potential future reconciliation is lost." },
          { text: "Maintain your boundaries while leaving the door open for repentance", alignment: "wisdom", consequence: "You hold firm while honoring the possibility of restoration." }
        ]
      }
    ]
  },
  {
    title: "Generational Divide",
    scenario: "Your aging parents hold beliefs you've outgrown—religious views, political stances, or lifestyle choices. Family gatherings are becoming battlegrounds.",
    trials: [
      {
        type: "choice",
        question: "How do you handle family discussions about values?",
        options: [
          { text: "Argue to change their minds—they're wrong", alignment: "unrighteous", consequence: "Family relationships fracture. No one learns." },
          { text: "Avoid the topic completely to keep peace", alignment: "compromise", consequence: "Surface harmony, but resentment builds beneath." },
          { text: "Listen with respect, share your perspective humbly, and agree to disagree", alignment: "obedience", consequence: "Relationships strengthen despite differences. Wisdom grows on both sides." }
        ]
      },
      {
        type: "choice",
        question: "Your parents ask you to raise their grandchildren in their faith tradition. You want freedom to choose. What do you say?",
        options: [
          { text: "Comply even though you don't believe it yourself", alignment: "compromise", consequence: "They're happy, but you're teaching what you don't practice." },
          { text: "Refuse and establish complete independence", alignment: "righteous", consequence: "You're true to yourself, but family relations become strained." },
          { text: "Honor their faith while teaching your children to think critically", alignment: "wisdom", consequence: "You balance respect with authenticity and empower the next generation." }
        ]
      }
    ]
  },
  {
    title: "Suffering & Doubt",
    scenario: "A loved one faces terminal illness. You've prayed. Nothing changes. Friends suggest God is testing your faith, but it feels hollow. You're angry at God.",
    trials: [
      {
        type: "choice",
        question: "How do you process this crisis of faith?",
        options: [
          { text: "Suppress doubt and maintain false faith for others' comfort", alignment: "compromise", consequence: "You become a shell, pretending while drowning inside." },
          { text: "Abandon faith entirely—God doesn't exist", alignment: "unrighteous", consequence: "You're free from disappointment but lose transcendent meaning." },
          { text: "Wrestle with God honestly—doubt and faith can coexist", alignment: "obedience", consequence: "Your faith becomes deeper, rooted in reality rather than comfort." }
        ]
      },
      {
        type: "choice",
        question: "A grieving period follows. Do you return to community?",
        options: [
          { text: "Isolate—you're too broken for others to handle", alignment: "unrighteous", consequence: "Grief consumes you. You miss comfort from community." },
          { text: "Pretend you're fine and move on quickly", alignment: "compromise", consequence: "Unprocessed grief erupts later in unhealthy ways." },
          { text: "Show up vulnerable—let community grieve with you", alignment: "wisdom", consequence: "You discover that shared suffering deepens relationships and faith." }
        ]
      }
    ]
  },
  {
    title: "Systemic Injustice",
    scenario: "You witness discrimination in your workplace, school, or community. Speaking up could make you a target. Staying silent means harm continues.",
    trials: [
      {
        type: "choice",
        question: "Do you speak up about the injustice?",
        options: [
          { text: "Stay silent—it's not your responsibility", alignment: "unrighteous", consequence: "You're safe, but the marginalized are left undefended." },
          { text: "Loudly call out every instance aggressively", alignment: "righteous", consequence: "You disrupt systems, but your message gets lost in conflict." },
          { text: "Document evidence and work with allies to address it strategically", alignment: "wisdom", consequence: "Your advocacy becomes effective because it's thoughtful and coordinated." }
        ]
      },
      {
        type: "choice",
        question: "Powerful people pressure you to drop it. What do you do?",
        options: [
          { text: "Back down—your career/safety is more important", alignment: "unrighteous", consequence: "You're safe, but injustice wins." },
          { text: "Fight harder publicly—demand accountability now", alignment: "righteous", consequence: "You're principled but possibly ineffective or isolated." },
          { text: "Shift tactics—build coalitions and use institutional channels", alignment: "wisdom", consequence: "You become a force multiplier for real, systemic change." }
        ]
      }
    ]
  }
];

Deno.serve(async (req) => {
  try {

    const body = await req.json();
    
    const missionIndex = body.missionCount % MODERN_MISSIONS.length;
    const mission = MODERN_MISSIONS[missionIndex];
    
    // Shuffle trials to randomize order
    const shuffledTrials = mission.trials
      .map(t => ({
        ...t,
        options: t.options.sort(() => Math.random() - 0.5)
      }))
      .sort(() => Math.random() - 0.5);

    return Response.json({
      title: mission.title,
      scenario: mission.scenario,
      trials: shuffledTrials,
    });
  } catch (error) {
    console.error("Error generating modern mission:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});