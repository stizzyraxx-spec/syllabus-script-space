import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { count, difficulty, category, specificBook } = await req.json();

    const difficultyDescriptions = {
      easy: "well-known, beginner-friendly Bible facts (e.g. who baptized Jesus, where was Jesus born, how many disciples). Simple, clear answers.",
      medium: "intermediate-level questions covering parallel Bible verses across Old and New Testaments, partially or fully unfulfilled prophecies, and moral dilemmas faced by biblical figures. Require thoughtful Bible knowledge.",
      hard: "advanced questions covering deep typological parallels between Old and New Testaments (e.g. Adam/Christ, Isaac/Jesus), contested eschatological prophecies (Daniel 70 Weeks, Ezekiel 38-39, Isaiah 19), and nuanced moral theology (e.g. Romans 7, Rahab's lie, the Dishonest Manager). For serious Bible students.",
      super_hard: "extremely obscure Bible facts - exact numbers, rare names, specific locations, minor characters, precise verse details that even most pastors would not know.",
      theologian: "scholarly-level questions on textual criticism, manuscript history (Dead Sea Scrolls, P52, Codex Sinaiticus), the documentary hypothesis (JEDP), canon formation, gnostic texts (Nag Hammadi), atonement theories, and theological debates (Filioque, Pelagianism, Arianism). For seminarians and scholars."
    };

    const categoryDescriptions = {
      any: "any area of the Bible - Old Testament, New Testament, prophecy, people, geography, doctrine",
      old_testament: "the Old Testament - Torah, Historical Books, Psalms, Proverbs, the Prophets",
      new_testament: "the New Testament - the Gospels, Acts, the Epistles, Revelation",
      prophecy: "biblical prophecy - both fulfilled and unfulfilled, messianic prophecy, eschatology",
      people: "people of the Bible - their names, roles, relationships, and actions",
      geography: "biblical geography - places, cities, mountains, rivers, nations mentioned in Scripture"
    };

    const categoryLine = specificBook
      ? "The book of " + specificBook
      : (categoryDescriptions[category] || categoryDescriptions.any);

    const bookInstruction = specificBook
      ? "\n\nIMPORTANT: ALL questions must focus EXCLUSIVELY on the book of " + specificBook + ". Every question must be directly about content, events, people, or teachings found in " + specificBook + " only."
      : "";

    const diffDesc = difficultyDescriptions[difficulty] || difficultyDescriptions.easy;

    const prompt = "You are a Bible trivia question generator. Generate exactly " + count + " unique, high-quality multiple-choice trivia questions.\n\n" +
      "Difficulty: " + difficulty + " - " + diffDesc + "\n" +
      "Category: " + categoryLine + bookInstruction + "\n\n" +
      "Rules:\n" +
      "- Every question must be factually accurate and based strictly on Scripture or well-established biblical scholarship\n" +
      "- Each question must have EXACTLY 4 answer options\n" +
      "- Only ONE option is correct\n" +
      "- The correct answer index (0-3) must be correct\n" +
      "- Questions must be completely different from each other - no repeats or near-duplicates\n" +
      "- Make the wrong options plausible but clearly wrong upon reflection\n" +
      "- Include a concise explanation (1-2 sentences) explaining why the correct answer is right, with a Scripture reference if applicable\n" +
      "- Do NOT use phrases like 'According to the Bible' at the start of every question - vary your phrasing\n" +
      "- Vary the question style: some can be 'who', 'what', 'where', 'why', 'which', fill-in-the-blank, or quote-completion\n\n" +
      "Return ONLY a valid JSON array with this exact structure, no extra text:\n" +
      "[\n  {\n    \"question\": \"Question text here?\",\n    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n    \"correct_index\": 0,\n    \"explanation\": \"Brief explanation with scripture reference.\"\n  }\n]";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_index: { type: "number" },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    // The LLM returns { questions: [...] } due to schema wrapping
    let questions = result?.questions || result;
    
    // Validate and sanitize
    if (!Array.isArray(questions)) {
      console.error("Unexpected result shape:", JSON.stringify(result));
      return Response.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    questions = questions
      .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct_index === "number")
      .slice(0, count)
      .map(q => {
        // Shuffle options, keeping track of the correct answer
        const correctAnswer = q.options[q.correct_index];
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        const newCorrectIndex = shuffled.indexOf(correctAnswer);
        return { ...q, options: shuffled, correct_index: newCorrectIndex };
      });

    return Response.json({ questions });
  } catch (error) {
    console.error("Error generating trivia questions:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});