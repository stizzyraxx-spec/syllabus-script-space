import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mode, difficulty, category, usedTopics = [] } = await req.json();

    const uniqueSeed = `[Session seed: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}]`;
    const avoidTopics = usedTopics.length > 0 ? `\nIMPORTANT: Do NOT repeat these already-used topics: ${usedTopics.join(", ")}.` : "";

    let prompt = "";

    if (mode === "theologian") {
      prompt = `Generate one "Spot the False Statement" round for an advanced theology quiz. ${uniqueSeed}${avoidTopics}

Create 4 statements about one of these topics (pick randomly):
- Textual criticism & manuscript variants
- Early church councils & canon formation
- Atonement theology models
- Early heresies (Arianism, Gnosticism, Pelagianism, Marcionism)
- Trinitarian theology & the Filioque
- Soteriology & free will debates
- Gospel source criticism (Q source, Synoptic problem)
- Reformation hermeneutics & sola scriptura
- Biblical authorship debates

Rules:
- Exactly 3 statements must be TRUE (accurate according to mainstream biblical scholarship)
- Exactly 1 statement must be SUBTLY FALSE (plausible-sounding but historically or theologically incorrect)
- The false statement should be something a non-expert might believe is true
- All 4 statements should sound equally scholarly and credible in tone
- Include a topic label and a clear explanation of WHY the false statement is wrong`;
    } else {
      const categoryGuides = {
        salvation: "salvation, grace, justification by faith, and works",
        prosperity: "prosperity gospel, health-and-wealth teachings, and material blessing",
        trinity: "the Trinity, the nature of God, and the three persons",
        scripture: "the authority, sufficiency, and inspiration of Scripture",
        jesus: "the person of Christ, his divinity, humanity, and resurrection",
        mixed: "a random mix of Christian doctrine topics"
      };

      const difficultyGuides = {
        beginner: "well-known, obvious false teachings that most Christians would recognize (e.g. prosperity gospel, works salvation)",
        intermediate: "subtler doctrinal errors that require some biblical knowledge to identify",
        advanced: "nuanced theological deceptions that could fool many churchgoers"
      };

      prompt = `Generate one "Spot the False Teaching" round for a Bible knowledge game. ${uniqueSeed}${avoidTopics}

Topic area: ${categoryGuides[category] || categoryGuides.mixed}
Difficulty: ${difficultyGuides[difficulty] || difficultyGuides.beginner}

Rules:
- Exactly 3 statements must be TRUE orthodox Christian teachings (backed by clear Scripture)
- Exactly 1 statement must be a FALSE TEACHING or heresy
- At difficulty "${difficulty}", the false teaching should be: ${difficultyGuides[difficulty]}
- Each true statement should cite a specific Bible verse reference
- The false teaching should sound plausible but contradict Scripture
- Include a topic label and a clear, biblically-grounded explanation of why the false statement is wrong`;
    }

    prompt += `

Return JSON with:
- topic: short label for the round (e.g. "Atonement Theology", "Salvation & Grace")
- statements: array of exactly 4 objects, each with: text (the statement), is_false (boolean — true for the ONE false statement)
- correct_index: the index (0-3) of the false statement in the array
- explanation: 1-2 sentences explaining why the false statement is wrong
- false_teaching_name: short name for the false teaching (e.g. "Universalism", "Arianism", "Prosperity Gospel")`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          topic: { type: "string" },
          statements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                is_false: { type: "boolean" }
              }
            }
          },
          correct_index: { type: "number" },
          explanation: { type: "string" },
          false_teaching_name: { type: "string" }
        }
      }
    });

    // Validate we have exactly one false statement
    if (!result.statements || result.statements.length !== 4) {
      return Response.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error generating spot-false round:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});