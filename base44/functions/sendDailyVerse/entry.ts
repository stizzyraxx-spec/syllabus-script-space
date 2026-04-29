import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const VERSES = [
  { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { book: "Psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
  { book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Christ which strengtheneth me." },
  { book: "Romans", chapter: 8, verse: 28, text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { book: "Proverbs", chapter: 31, verse: 25, text: "Strength and honour are her clothing; and she shall rejoice in time to come." },
  { book: "Deuteronomy", chapter: 31, verse: 8, text: "And the LORD, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not, neither be dismayed." },
  { book: "1 Peter", chapter: 5, verse: 7, text: "Casting all your care upon him; for he careth for you." },
  { book: "Jeremiah", chapter: 29, verse: 11, text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
  { book: "Matthew", chapter: 11, verse: 28, text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
];

Deno.serve(async (_req) => {
  try {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('daily_verse_enabled', true);

    if (!users || users.length === 0) {
      return Response.json({ message: "No users subscribed" }, { status: 200 });
    }

    const randomVerse = VERSES[Math.floor(Math.random() * VERSES.length)];
    const verseRef = `${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse}`;

    const notifications = users.map((u) => ({
      recipient_email: u.user_email,
      type: "daily_verse",
      message: `Daily Verse: "${randomVerse.text}" — ${verseRef}`,
      link_path: "/bible",
      read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    console.log(`Sent daily verse notifications to ${notifications.length} users`);
    return Response.json({
      message: `Sent ${notifications.length} daily verses`,
      total: users.length,
    }, { status: 200 });
  } catch (error) {
    console.error("Error in sendDailyVerse:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
