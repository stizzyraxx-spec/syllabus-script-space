import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query } = await req.json();
    
    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const prompt = `The user has asked the following question or topic: "${query}"

Your task is to:
1. Understand the deeper spiritual meaning and context of their question
2. Find the most relevant Bible verses from the King James Bible that directly address their question
3. Explain how each verse relates to their question

Return the results in this format:
Book Chapter:Verse - [full verse text]
Relevance: [one sentence explaining how this verse answers their question]

Provide 5-7 of the most relevant verses. Be thorough and insightful. Only include actual Bible verses.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash'
    });

    const cleanedResults = typeof response === 'string' 
      ? response.replace(/[*_#`]/g, '') 
      : JSON.stringify(response).replace(/[*_#`]/g, '');

    return Response.json({ 
      results: cleanedResults || 'No results found. Please try a different query.'
    });
  } catch (error) {
    console.error('Error searching Bible:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});