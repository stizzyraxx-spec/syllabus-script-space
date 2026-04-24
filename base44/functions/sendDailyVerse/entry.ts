import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
  { book: "Psalms", chapter: 27, verse: 10, text: "When my father and my mother forsake me, then the LORD will take me up." },
  { book: "1 John", chapter: 4, verse: 7, text: "Beloved, let us love one another: for love is of God; and every one that loveth is born of God, and knoweth God." },
  { book: "Joshua", chapter: 1, verse: 9, text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
  { book: "Psalms", chapter: 46, verse: 5, text: "God is in the midst of her; she shall not be moved: God shall help her, and that right early." },
  { book: "Proverbs", chapter: 22, verse: 17, text: "Bow down thine ear, and hear the words of the wise, and apply thine heart unto my knowledge." }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with daily verse enabled
    const users = await base44.asServiceRole.entities.UserProfile.filter({ daily_verse_enabled: true });
    
    if (users.length === 0) {
      return Response.json({ message: "No users subscribed" }, { status: 200 });
    }

    const randomVerse = VERSES[Math.floor(Math.random() * VERSES.length)];
    let successCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.user_email,
          subject: `Daily Encouragement: ${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse}`,
          body: `Good morning,\n\nHere's today's encouraging verse for you:\n\n"${randomVerse.text}"\n\n— ${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse} (KJV)\n\nMay this verse bless and strengthen you today!\n\nBest regards,\nThe Condition of Man`,
          from_name: "The Condition of Man"
        });
        successCount++;
      } catch (err) {
        errors.push({ email: user.user_email, error: err.message });
        console.error(`Failed to send verse to ${user.user_email}:`, err.message);
      }
    }

    return Response.json({ 
      message: `Sent ${successCount} daily verses`,
      total: users.length,
      errors: errors.length > 0 ? errors : null
    }, { status: 200 });
  } catch (error) {
    console.error("Error in sendDailyVerse:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});