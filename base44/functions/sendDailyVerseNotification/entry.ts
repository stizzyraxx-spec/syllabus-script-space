import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const FEATURED_VERSES = [
  { book: "John", chapter: 3, verse: 16, preview: "For God so loved the world..." },
  { book: "Psalm", chapter: 23, verse: 1, preview: "The Lord is my shepherd..." },
  { book: "Romans", chapter: 8, verse: 28, preview: "And we know that all things work together for good..." },
  { book: "Proverbs", chapter: 3, verse: 5, preview: "Trust in the Lord with all your heart..." },
  { book: "1 John", chapter: 4, verse: 7, preview: "Beloved, let us love one another..." },
  { book: "Matthew", chapter: 5, verse: 8, preview: "Blessed are the pure in heart..." },
  { book: "Philippians", chapter: 4, verse: 8, preview: "Finally, brethren, whatsoever things are true..." },
  { book: "2 Timothy", chapter: 1, verse: 7, preview: "For God hath not given us the spirit of fear..." },
  { book: "Jeremiah", chapter: 29, verse: 11, preview: "For I know the thoughts that I think toward you..." },
  { book: "Isaiah", chapter: 40, verse: 31, preview: "But they that wait upon the Lord shall renew their strength..." },
];

Deno.serve(async (_req) => {
  try {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const featuredVerse = FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];

    if (!featuredVerse) {
      return Response.json({ error: "No featured verse" }, { status: 400 });
    }

    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('daily_verse_enabled', true);

    const enabledUsers = (allProfiles || []).filter(p => p.user_email);

    if (enabledUsers.length === 0) {
      return Response.json({ notified: 0, message: "No enabled users" });
    }

    const verseRef = `${featuredVerse.book} ${featuredVerse.chapter}:${featuredVerse.verse}`;
    const message = `Daily Verse: "${featuredVerse.preview}" — ${verseRef}`;

    const notifications = enabledUsers.map((profile) => ({
      user_email: profile.user_email,
      type: "daily_verse",
      title: "Daily Featured Verse",
      message,
      related_book: featuredVerse.book,
      related_chapter: featuredVerse.chapter,
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    console.log(`Daily verse notifications sent to ${notifications.length} users`);
    return Response.json({
      notified: notifications.length,
      verse: featuredVerse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Daily verse notification error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
