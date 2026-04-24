import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Featured verses by day of year
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get featured verse for today
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const featuredVerse = FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];
    
    if (!featuredVerse) {
      console.error("No featured verse found");
      return Response.json({ error: "No featured verse" }, { status: 400 });
    }

    // Fetch users who have daily verses enabled
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list();
    const enabledUsers = allProfiles.filter(p => p.daily_verse_enabled === true && p.user_email);

    if (enabledUsers.length === 0) {
      console.log("No users with daily verses enabled");
      return Response.json({ notified: 0, message: "No enabled users" });
    }

    console.log(`Sending daily verse to ${enabledUsers.length} users`);

    // Send notifications to each user
    const notificationPromises = enabledUsers.map(async (profile) => {
      try {
        const verseRef = `${featuredVerse.book} ${featuredVerse.chapter}:${featuredVerse.verse}`;
        const message = `📖 Daily Verse: "${featuredVerse.preview}" — ${verseRef}`;
        
        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          user_email: profile.user_email,
          type: "daily_verse",
          title: "Daily Featured Verse",
          message: message,
          related_book: featuredVerse.book,
          related_chapter: featuredVerse.chapter,
          is_read: false,
        });

        // Send email notification if preferred time matches current time
        const userPreferredTime = profile.daily_verse_time || "09:00";
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        // Allow 5-minute window for delivery
        if (userPreferredTime.substring(0, 2) === currentHour && Math.abs(parseInt(currentMinute) - parseInt(userPreferredTime.substring(3, 5))) < 5) {
          await base44.integrations.Core.SendEmail({
            to: profile.user_email,
            subject: `Daily Verse: ${verseRef}`,
            body: `
Hi ${profile.display_name || 'Friend'},

Your Daily Featured Verse:

"${featuredVerse.preview}"
— ${verseRef}

Read the full chapter and more context at The Condition of Man.

Keep growing in the Word!
            `.trim(),
          });
        }

        return { success: true, email: profile.user_email };
      } catch (error) {
        console.error(`Failed to notify ${profile.user_email}:`, error);
        return { success: false, email: profile.user_email, error: error.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter(r => r.status === "fulfilled" && r.value.success).length;
    const failed = results.filter(r => r.status === "rejected" || !r.value?.success).length;

    console.log(`Daily verse notifications: ${successful} sent, ${failed} failed`);

    return Response.json({ 
      notified: successful,
      failed: failed,
      verse: featuredVerse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Daily verse notification error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});