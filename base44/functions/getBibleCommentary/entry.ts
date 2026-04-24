import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { book, chapter, verse, text } = await req.json();
    
    if (!text) {
      return Response.json({ error: 'Verse text is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Provide theological commentary on this Bible verse from ${book} ${chapter}:${verse}: "${text}"

Include: 1) Brief historical context, 2) Spiritual meaning, 3) How it applies today, 4) Related passages. Keep it concise (100-150 words). Format without any asterisks, underscores, or markdown.`,
      model: 'gemini_3_flash'
    });

    // Clean output of markdown and special formatting
    let cleanCommentary = String(response)
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/#+\s/g, '')
      .trim();

    return Response.json({ 
      commentary: cleanCommentary
    });
  } catch (error) {
    console.error('Error getting commentary:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});