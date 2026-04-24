import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { character, sessionId, missionCount, completedThemes = [], theologianMode = false, locationName = "Jerusalem", locationContext = "", locationRegion = "" } = await req.json();

    const locationCtx = locationContext
      ? `\nLocation: ${locationName} (${locationRegion})\nSetting: ${locationContext}\nIMPORTANT: Set this mission specifically in ${locationName}, using its biblical events, culture, and themes.`
      : "";

    // Always use moral_choice — multiple choice decisions only
    const missionType = "moral_choice";

    const uniqueSeed = `[Session: ${sessionId}, Mission #${missionCount}, Timestamp: ${Date.now()}]`;
    const avoidThemes = completedThemes.length > 0 ? `Avoid these already-used themes: ${completedThemes.join(", ")}.` : "";

    let prompt = "";

    if (missionType === "moral_choice") {
      prompt = `You are generating a unique mission for a faith-based biblical RPG. ${uniqueSeed}

Player Character: ${character}
Mission #: ${missionCount}
${locationCtx}
${avoidThemes}

MISSION DESIGN REQUIREMENTS — READ CAREFULLY:

Create a morally complex biblical scenario with exactly 3 multiple-choice answers. The defining challenge: ALL THREE choices must sound almost equally righteous, godly, and biblically grounded on the surface. Every option must be something a sincere, mature Christian could plausibly defend using Scripture.

The player must use ADVANCED LOGICAL REASONING and deep theological understanding to identify the ONE truly correct answer. This is NOT about spotting obvious sin — it is about discerning subtle distinctions between:
- Partial truth vs. full truth
- Good intentions with flawed theology vs. right action from right understanding
- Prioritizing one virtue while neglecting another
- Applying a verse correctly vs. applying it out of covenantal context

RULES FOR EACH OPTION:
1. Every option must cite or allude to a real biblical principle
2. Every option must sound like something a devout, scripture-reading believer would say
3. The WRONG options must contain a subtle theological flaw — not a moral failing, but a reasoning error, a misapplied verse, or a misunderstanding of God's character/covenant
4. The CORRECT option must align with: the full counsel of Scripture, the character of God, the specific context of the scenario, and sound theological reasoning

${theologianMode
  ? `THEOLOGIAN DIFFICULTY EXTRAS:
- Build the scenario around an obscure or contested theological tension (e.g. the interplay of grace and obedience in Galatians, the nature of imputed righteousness in Romans 4, Daniel's prayer while God's decree was already set)
- The incorrect options must each reflect a recognizable heretical tendency (e.g. semi-Pelagianism, antinomianism, moralism, cessationism misapplied)
- The consequence reveal must explain the precise theological error of each wrong answer
- Scoring: CORRECT (15 xp, +7 faith, +6 wisdom, +4 obedience) | CLOSE (5 xp, +2 faith, +2 wisdom) | WRONG (0 xp, -5 obedience, -3 integrity)`
  : `STANDARD DIFFICULTY EXTRAS:
- Each wrong answer should appeal to a real virtue (e.g. humility, compassion, boldness) but apply it in a way that misses a deeper principle
- The consequence reveal must explain WHY the correct answer is superior, with theological depth — not just "this was better"
- Scoring: CORRECT (25 xp, +10 faith, +10 wisdom, +8 obedience) | CLOSE (16 xp, +6 faith, +5 wisdom, +3 obedience) | WRONG (8 xp, +2 faith, -4 integrity, +1 wisdom)`}

Generate exactly 3 options. For each: text (a compelling, godly-sounding choice — 1-2 sentences), moralAlignment (righteous/neutral/fallen), xp, scoreChanges (object with stat keys), consequence (a rich theological explanation of why this was right or where it went wrong, 2-3 sentences), scripture (a specific Bible verse that supports OR complicates this choice).`;

    } else if (missionType === "fetch_quest") {
      prompt = `You are generating a unique fetch quest for a faith-based biblical RPG. ${uniqueSeed}

Player Character: ${character}
Mission #: ${missionCount}
${locationCtx}
${avoidThemes}

Invent a COMPLETELY ORIGINAL quest where the player must retrieve something spiritually significant. Choose a fresh theme and scripture reference.

The quest should:
1. Feature a unique sacred item (scroll, relic, offering, artifact, key, etc.) tied to scripture
2. Be set in a specific biblical location with vivid atmosphere
3. Have 3-4 distinct waypoints/locations to visit
4. Be written in second-person, immersive and engaging
5. Include a meaningful completion message tied to the scripture lesson

Provide: title, location, narrative (2-3 paragraphs), scripture (the verse), objective (what to fetch), locations (array of 3-4 place names), reward_xp (40-60), scoreChanges (faith_score, wisdom_score, obedience_score, integrity_score), completionMessage.`;

    } else {
      prompt = `You are generating a unique timed challenge for a faith-based biblical RPG. ${uniqueSeed}

Player Character: ${character}
Mission #: ${missionCount}
${locationCtx}
${avoidThemes}

Invent a COMPLETELY ORIGINAL timed puzzle or riddle based on biblical knowledge. Choose a fresh theme and scripture.

The challenge should:
1. Require the player to answer a biblical riddle, sequence verses, or identify a scripture passage
2. Be solvable in 60-90 seconds with effort
3. Include 3 progressive hints that give away more each time
4. Have a specific correct answer (a word, name, number, or short phrase)
5. Be tied to a meaningful scripture lesson

Provide: title, location, narrative (1-2 paragraphs), scripture (the verse), challenge (the actual puzzle text), timeLimit (60-90), hints (array of 3), correctAnswer, reward_xp (50-70), scoreChanges (faith_score, wisdom_score, obedience_score, integrity_score), successMessage, failureMessage.`;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          location: { type: "string" },
          narrative: { type: "string" },
          decisions: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                text: { type: "string" },
                moralAlignment: { type: "string" },
                xp: { type: "number" },
                scoreChanges: { type: "object" },
                consequence: { type: "string" },
                scripture: { type: "string" }
              }
            }
          },
          objective: { type: "string" },
          locations: { type: "array", items: { type: "string" } },
          challenge: { type: "string" },
          timeLimit: { type: "number" },
          hints: { type: "array", items: { type: "string" } },
          correctAnswer: { type: "string" },
          reward_xp: { type: "number" },
          scoreChanges: { type: "object" },
          successMessage: { type: "string" },
          failureMessage: { type: "string" },
          completionMessage: { type: "string" }
        }
      }
    });

    let missionData = {
      title: result.title || `A Trial of Faith`,
      location: result.location || "Unseen Realm",
      scripture: result.scripture || "Scripture Reference",
      narrative: result.narrative,
      missionType: missionType,
      reward_xp: theologianMode ? Math.floor((result.reward_xp || 15) * 0.4) : (result.reward_xp || (missionType === "moral_choice" ? 25 : 50))
    };

    if (missionType === "moral_choice") {
      const decisions = result.decisions || [
        { text: "Seek God in prayer and wait for His clear direction before acting", moralAlignment: "righteous", xp: 25, scoreChanges: { faith_score: 10, wisdom_score: 8, obedience_score: 8 }, consequence: "You trusted God's timing and sought His will above your own understanding.", scripture: "Proverbs 3:5-6" },
        { text: "Act boldly on what Scripture already commands, trusting God to honor obedience", moralAlignment: "neutral", xp: 16, scoreChanges: { faith_score: 6, wisdom_score: 4, obedience_score: 6 }, consequence: "Your boldness was admirable but you moved ahead of God's specific leading in this moment.", scripture: "Isaiah 28:16" },
        { text: "Counsel with trusted elders and submit to their spiritual wisdom", moralAlignment: "neutral", xp: 10, scoreChanges: { faith_score: 4, wisdom_score: 7, obedience_score: 3 }, consequence: "Seeking counsel is wise, but in this case it substituted human wisdom for direct communion with God.", scripture: "Proverbs 11:14" }
      ];
      const shuffled = decisions.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.findIndex(d => d.moralAlignment === "righteous");
      missionData = { ...missionData, decisions: shuffled, correctIndex };
    } else if (missionType === "fetch_quest") {
      missionData = { 
        ...missionData, 
        objective: result.objective,
        locations: result.locations || [],
        scoreChanges: result.scoreChanges,
        completionMessage: result.completionMessage
      };
    } else if (missionType === "timed_challenge") {
      missionData = {
        ...missionData,
        challenge: result.challenge,
        timeLimit: result.timeLimit || 75,
        hints: result.hints || [],
        correctAnswer: result.correctAnswer,
        scoreChanges: result.scoreChanges,
        successMessage: result.successMessage,
        failureMessage: result.failureMessage
      };
    }

    return Response.json(missionData);
  } catch (error) {
    console.error("Error generating mission:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});