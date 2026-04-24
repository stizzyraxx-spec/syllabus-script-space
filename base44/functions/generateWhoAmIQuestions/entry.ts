import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { count, difficulty } = await req.json();

    const prompt = `Generate ${count} "Who Am I?" Bible trivia questions based on difficulty: ${difficulty}.

Difficulty guidelines:
- easy: Famous biblical figures (Noah, Moses, Jesus, David, Solomon, etc.)
- medium: Well-known characters (Ruth, Esther, Peter, Paul, John the Baptist, etc.)
- hard: Obscure figures (Melchizedek, Boaz, Jethro, Priscilla, Philemon, etc.)

For each question:
- clues: Array of 3-4 descriptive clues about the figure
- options: Array of exactly 4 character names (mix of correct and decoys)
- correctIndex: The index (0-3) of the correct answer in the options array
- explanation: Brief explanation of who they are and key facts

Return as JSON with 'questions' array containing ${count} objects.`;

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
                clues: {
                  type: "array",
                  items: { type: "string" },
                },
                options: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 4,
                  maxItems: 4,
                },
                correctIndex: { type: "number" },
                explanation: { type: "string" },
              },
            },
          },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("generateWhoAmIQuestions error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});