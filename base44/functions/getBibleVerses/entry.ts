Deno.serve(async (req) => {
  try {
    const body = await req.json();
    let { book, chapter } = body;

    if (!book || !chapter) {
      return Response.json({ error: 'Book and chapter are required' }, { status: 400 });
    }

    // Map book names to Bible passage format (e.g., John -> JHN, Genesis -> GEN)
    const bookMap = {
      "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU",
      "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
      "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR",
      "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
      "Ecclesiastes": "ECC", "Isaiah": "ISA", "Jeremiah": "JER", "Lamentations": "LAM",
      "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO",
      "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB",
      "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT",
      "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
      "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL", "Ephesians": "EPH",
      "Philippians": "PHP", "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
      "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
      "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
      "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
    };

    const bookCode = bookMap[book];
    if (!bookCode) {
      return Response.json({ verses: [], error: `Unknown book: ${book}` }, { status: 200 });
    }

    // Use bible-api.com with full book name
    const encodedBook = encodeURIComponent(book);
    const response = await fetch(
      `https://bible-api.com/${encodedBook}+${chapter}?translation=kjv`
    );

    if (!response.ok) {
      console.error(`Bible API error: ${response.status}`);
      return Response.json({ verses: [], book, chapter }, { status: 200 });
    }

    const data = await response.json();
    const verses = data.verses?.map(v => v.text.replace(/\n/g, ' ').trim()) || [];

    return Response.json({ verses, book, chapter });
  } catch (error) {
    console.error('Error fetching Bible verses:', error.message);
    return Response.json({ verses: [], error: error.message }, { status: 500 });
  }
});