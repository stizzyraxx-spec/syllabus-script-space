Deno.serve(async (req) => {
  try {
    const { book, chapter, verse, text } = await req.json();
    if (!text) {
      return Response.json({ error: 'Verse text is required' }, { status: 400 });
    }
    return Response.json({
      commentary: `Commentary for ${book} ${chapter}:${verse} is currently unavailable. For in-depth study, visit BibleGateway.com or BlueLetterBible.org for free commentaries from Matthew Henry, John Calvin, and other trusted scholars.`,
    });
  } catch (error) {
    console.error('getBibleCommentary error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
