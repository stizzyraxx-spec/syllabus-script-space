import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get("BIBLE_API_KEY");
const BASE_URL = "https://rest.api.bible/v1";

// Map common book names to api.bible book IDs (OSIS-based)
const BOOK_ID_MAP = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
  "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
  "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP",
  "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
  "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
  "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS",
  "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
  "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
};

// Hardcoded English audio bible ID (World English Bible 2013 Drama NT)
const AUDIO_BIBLE_ID = "105a06b6146d11e7-01";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { book, chapter, debug } = body;

    // Debug mode: list available audio bibles
    if (debug) {
      const r = await fetch(`${BASE_URL}/audio-bibles`, { headers: { "api-key": API_KEY } });
      const d = await r.json();
      const english = d.data?.filter(b => b.language?.name?.toLowerCase().includes("english") || b.language?.id === "eng");
      return Response.json({ total: d.data?.length, english: english?.map(b => ({ id: b.id, name: b.name })) });
    }

    if (!book || !chapter) {
      return Response.json({ error: "Missing book or chapter" }, { status: 400 });
    }

    const bookId = BOOK_ID_MAP[book];
    if (!bookId) {
      return Response.json({ error: `Unknown book: ${book}` }, { status: 400 });
    }

    // NT-only books list
    const NT_BOOKS = ["MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"];
    if (!NT_BOOKS.includes(bookId)) {
      return Response.json({ error: "Audio is only available for New Testament books (Matthew–Revelation) with this Bible edition." }, { status: 404 });
    }

    const audioBibleId = AUDIO_BIBLE_ID;
    const chapterId = `${bookId}.${chapter}`;

    console.log(`Fetching audio for ${chapterId} from bible ${audioBibleId}`);

    const res = await fetch(`${BASE_URL}/audio-bibles/${audioBibleId}/chapters/${chapterId}`, {
      headers: { "api-key": API_KEY }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("API error fetching chapter:", res.status, err, "chapterId:", chapterId, "audioBibleId:", audioBibleId);
      return Response.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const audioUrl = data.data?.resourceUrl || data.data?.url;

    if (!audioUrl) {
      console.error("No audio URL in response:", JSON.stringify(data));
      return Response.json({ error: "No audio URL returned" }, { status: 404 });
    }

    return Response.json({ audioUrl, chapterId, audioBibleId });
  } catch (error) {
    console.error("getBibleAudio error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});