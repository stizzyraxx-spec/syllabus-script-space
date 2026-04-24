import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { difficulty, book, count } = await req.json();

    const difficultyGuides = {
      normal: "well-known Bible verses that most Christians would recognize (e.g. John 3:16, Psalm 23, Romans 8:28). Use KJV translation.",
      theologian: "verses involving manuscript variants, textual criticism debates, or theologically significant passages scholars debate (e.g. Comma Johanneum, longer Mark ending, John 7:53-8:11). Include a scholarly context note for each."
    };

    const bookFilter = book && book !== "any" ? `Only use verses from the book of ${book}.` : "Use a wide variety of books from both Old and New Testament.";

    const prompt = `Generate ${count || 5} "Finish the Verse" Bible quiz questions.

Difficulty: ${difficultyGuides[difficulty] || difficultyGuides.normal}
${bookFilter}

For each question:
1. Pick a real, accurate Bible verse
2. Split it into a "start" (roughly the first 40-60% of the verse) and a "correct_ending" (the rest)
3. Generate 3 plausible but INCORRECT distractor endings from OTHER verses or invented variations
4. All 4 options should be shuffled (mark which index is correct)
5. Include the full verse reference (e.g. "John 3:16 KJV")
6. Include a brief context note (1 sentence about the verse's significance)

IMPORTANT: The verse text must be accurate to the KJV Bible. Do not invent verses.
${difficulty === "theologian" ? "For theologian mode: add a 'scholarly_note' field mentioning any manuscript variants, translation debates, or historical context." : ""}

Return an array of questions.`;

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
                reference: { type: "string" },
                verse_start: { type: "string" },
                correct_ending: { type: "string" },
                full_verse: { type: "string" },
                distractors: { type: "array", items: { type: "string" } },
                correct_index: { type: "number" },
                options: { type: "array", items: { type: "string" } },
                context: { type: "string" },
                scholarly_note: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Normalize: ensure options array is built and correct_index is set
    const questions = (result.questions || []).map(q => {
      if (q.options && q.options.length === 4 && typeof q.correct_index === "number") {
        return q;
      }
      // Build options from correct_ending + distractors, shuffle
      const pool = [q.correct_ending, ...(q.distractors || []).slice(0, 3)];
      // Shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const correctIndex = pool.indexOf(q.correct_ending);
      return { ...q, options: pool, correct_index: correctIndex };
    });

    return Response.json({ questions });
  } catch (error) {
    console.error("Error generating finish-the-verse questions:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});