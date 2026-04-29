const DEVOTIONALS = [
  { title: "Walk in His Light", verse: "Thy word is a lamp unto my feet, and a light unto my path.", verse_reference: "Psalm 119:105", reflection: "God's Word guides every step we take. In a world of uncertainty, Scripture offers clear direction for daily decisions. When we commit to reading it consistently, we find that God's wisdom becomes our instinct. Let His Word be the first thing you turn to each morning." },
  { title: "Cast Your Burdens", verse: "Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.", verse_reference: "Psalm 55:22", reflection: "Many of us carry weights we were never designed to bear alone. God invites you to release your anxieties and fears into His capable hands. This is not weakness — it is faith in action. Today, identify one burden you've been carrying and deliberately give it to God in prayer." },
  { title: "Strength in Stillness", verse: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", verse_reference: "Psalm 46:10", reflection: "In a world that rewards busyness, stillness can feel unproductive. Yet it is in the quiet moments that we truly encounter God's presence and hear His voice. Set aside time today to simply be still before Him — no agenda, no requests, just presence." },
  { title: "Hope That Does Not Fail", verse: "And hope maketh not ashamed; because the love of God is shed abroad in our hearts by the Holy Ghost which is given unto us.", verse_reference: "Romans 5:5", reflection: "The hope the world offers often disappoints — it is conditional and temporary. But God's hope is anchored in His unchanging love and proven faithfulness. No matter what you are facing today, His love toward you has not wavered. Let that truth be the foundation that holds you firm." },
  { title: "Renewed Every Morning", verse: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.", verse_reference: "Lamentations 3:22-23", reflection: "Every morning God's mercy is freshly available — yesterday's failures do not define today. His faithfulness is not dependent on our performance but on His character. Whatever mistakes or regrets you carry, release them at His throne. His compassions meet you exactly where you are." },
  { title: "Seek First His Kingdom", verse: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", verse_reference: "Matthew 6:33", reflection: "Jesus gives us a radical reordering of priorities: when we pursue God first, everything we truly need follows. This requires trust — believing that God knows what we need better than we do. Today, reorient your first hours, your first thoughts, and your first decisions toward Him." },
  { title: "He Who Began Will Complete", verse: "Being confident of this very thing, that he which hath begun a good work in you will perform it until the day of Jesus Christ.", verse_reference: "Philippians 1:6", reflection: "God is not a God who starts things and abandons them. The work He began in you — the transformation, the healing, the growth — He is actively continuing. On the days you feel stagnant or far from who you want to be, remember: your sanctification is His project, and He does not fail." },
];

Deno.serve(async () => {
  try {
    const dayIndex = new Date().getDay();
    return Response.json(DEVOTIONALS[dayIndex]);
  } catch (error) {
    console.error("getDailyDevotional error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
