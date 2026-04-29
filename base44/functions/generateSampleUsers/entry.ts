import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FIRST_NAMES = [
  "James", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Christopher",
  "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
  "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob",
  "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin",
  "Samuel", "Frank", "Gregory", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler",
  "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
  "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia",
  "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela", "Emma", "Nicole", "Helen",
  "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Peterson", "Phillips", "Campbell", "Parker",
  "Evans", "Edwards", "Collins", "Reeves", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers",
  "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Howard", "Graham", "Brennan", "Saunders", "Ford",
  "Hanson", "Hunt", "Holmes", "Howell", "Hubbard", "Hudson", "Hughes", "Hugo", "Hunt", "Huff",
  "Huffman", "Huges", "Hull", "Hulsey", "Hultin", "Human", "Hummel", "Hummer", "Humphrey", "Humphreys"
];

const BIBLE_VERSES = [
  { book: "John", chapter: 3, verse: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { book: "Romans", chapter: 3, verse: 23, text: "For all have sinned and fall short of the glory of God" },
  { book: "Philippians", chapter: 4, verse: 13, text: "I can do all this through him who gives me strength." },
  { book: "Proverbs", chapter: 3, verse: 5, text: "Trust in the LORD with all your heart and lean not on your own understanding" },
  { book: "Psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd, I lack nothing." },
  { book: "Matthew", chapter: 6, verse: 34, text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself." },
  { book: "Ephesians", chapter: 4, verse: 2, text: "Be completely humble and gentle; be patient, bearing with one another in love." },
  { book: "1 John", chapter: 4, verse: 7, text: "Dear friends, let us love one another, for love comes from God." },
  { book: "Jeremiah", chapter: 29, verse: 11, text: "For I know the plans I have for you, plans to prosper you and not to harm you." },
  { book: "Colossians", chapter: 3, verse: 17, text: "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus." },
  { book: "1 Thessalonians", chapter: 5, verse: 17, text: "Pray without ceasing." },
  { book: "Proverbs", chapter: 27, verse: 12, text: "The prudent see danger and take refuge, but the simple keep going and pay the penalty." },
  { book: "Matthew", chapter: 11, verse: 28, text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { book: "Psalm", chapter: 37, verse: 4, text: "Take delight in the LORD, and he will give you the desires of your heart." },
  { book: "2 Timothy", chapter: 1, verse: 7, text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." },
  { book: "Deuteronomy", chapter: 31, verse: 8, text: "The LORD himself goes before you and will be with you." },
  { book: "Proverbs", chapter: 22, verse: 6, text: "Start children off on the way they should go." },
  { book: "Hebrews", chapter: 12, verse: 2, text: "Let us fix our eyes on Jesus, the author and perfecter of our faith." },
  { book: "Romans", chapter: 8, verse: 28, text: "And we know that in all things God works for the good of those who love him." },
  { book: "James", chapter: 1, verse: 2, text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds." }
];

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate 400 realistic profiles with posts
    const profiles = [];
    const posts = [];

    for (let i = 0; i < 400; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 10000)}@testapp.com`;
      const displayName = `${firstName} ${lastName}`;

      // Create profile
      profiles.push({
        user_email: email,
        display_name: displayName,
        username: `@${firstName.toLowerCase()}${i}`,
        bio: `📖 Bible enthusiast | Faith seeker | Living out Proverbs 3:5-6`,
        avatar_url: null,
        post_count: 2,
        daily_verse_enabled: Math.random() > 0.5,
        interest_tags: ["Bible Study", "Prayer", "Faith", "Worship"],
        total_points: Math.floor(Math.random() * 1000),
      });

      // Create 2 posts per user with Bible verses
      for (let j = 0; j < 2; j++) {
        const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
        posts.push({
          author_email: email,
          author_name: displayName,
          author_avatar: null,
          caption: `🙏 "${verse.text}"\n\n— ${verse.book} ${verse.chapter}:${verse.verse}\n\nThis verse speaks to my heart today. How does it speak to you?`,
          media_url: null,
          media_type: "text",
          likes: Math.floor(Math.random() * 50),
          liked_by: [],
          comment_count: Math.floor(Math.random() * 10),
        });
      }
    }

    console.log(`Creating ${profiles.length} UserProfile records...`);
    await supabase.from('user_profiles').insert(profiles);

    console.log(`Creating ${posts.length} CommunityPost records...`);
    await supabase.from('community_posts').insert(posts);

    return Response.json({
      success: true,
      profilesCreated: profiles.length,
      postsCreated: posts.length,
      message: "Sample data generated successfully"
    });
  } catch (error) {
    console.error("Error generating sample users:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});