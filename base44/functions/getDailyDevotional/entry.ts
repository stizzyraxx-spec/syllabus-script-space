import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a daily Christian devotional for ${today}. 
Include:
- A short, inspiring title (3-5 words)
- A Bible verse (full text, KJV)
- The verse reference (book chapter:verse)
- A thoughtful 3-4 sentence reflection connecting the verse to modern daily life, with practical wisdom for living faithfully today.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          verse: { type: "string" },
          verse_reference: { type: "string" },
          reflection: { type: "string" },
        },
        required: ["title", "verse", "verse_reference", "reflection"],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("getDailyDevotional error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});