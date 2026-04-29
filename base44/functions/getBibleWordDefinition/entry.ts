Deno.serve(async (req) => {
  try {
    const { word } = await req.json();
    if (!word || word.trim().length === 0) {
      return Response.json({ error: 'Word is required' }, { status: 400 });
    }
    return Response.json({
      definition: `Word definition for "${word}" is currently unavailable. For Hebrew and Greek word studies, visit BlueLetterBible.org — enter the verse, click on the word, and access Strong's Concordance entries with original language definitions.`,
    });
  } catch (error) {
    console.error('getBibleWordDefinition error:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
