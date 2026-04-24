import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { count, difficulty } = await req.json();

    const prompt = `Generate ${count} Bible verse memorization prompts based on difficulty: ${difficulty}.

Difficulty guidelines:
- easy: First 5-10 words of very famous verses (John 3:16, Psalm 23, etc.)
- medium: First 15-30 words from well-known passages
- hard: Complete verse (40+ words) from memory

For each question, return:
- reference: Bible reference (e.g., "John 3:16")
- prompt: The opening words or partial verse (user completes this)
- answer: The exact completion text
- hint: A short hint about the verse meaning or context
- context: Brief historical/spiritual context

Return as JSON array with 'questions' key containing ${count} objects.`;

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
                prompt: { type: "string" },
                answer: { type: "string" },
                hint: { type: "string" },
                context: { type: "string" },
              },
            },
          },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("generateMemorizationQuestions error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});