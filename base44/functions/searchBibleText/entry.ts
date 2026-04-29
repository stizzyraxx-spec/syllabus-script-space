Deno.serve(async (req) => {
  try {
    const { query } = await req.json();
    if (!query || query.trim().length === 0) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }
    return Response.json({
      results: `Bible search for "${query}" is currently unavailable. Please visit BibleGateway.com or BlueLetterBible.org to search for verses.`,
    });
  } catch (error) {
    console.error('searchBibleText error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
