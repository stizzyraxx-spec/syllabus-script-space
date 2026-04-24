import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { word } = await req.json();
    
    if (!word || word.trim().length === 0) {
      return Response.json({ error: 'Word is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Biblical Greek/Hebrew scholar. Provide a concise definition for the word "${word}" in Biblical context. Include: 1) Modern English definition, 2) Original Greek/Hebrew word if applicable, 3) Usage in scripture, 4) Spiritual significance. Format cleanly without any asterisks, underscores, or markdown. Keep it under 150 words.`,
      model: 'gemini_3_flash'
    });

    // Clean output of markdown and special formatting
    let cleanDef = String(response)
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/#+\s/g, '')
      .trim();

    return Response.json({ 
      definition: cleanDef
    });
  } catch (error) {
    console.error('Error getting word definition:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});