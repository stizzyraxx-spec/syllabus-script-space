-- Demo data seed for The Condition of Man
-- Run AFTER supabase-schema.sql has been applied.
-- Idempotent: safe to re-run; deletes prior demo rows by email convention.

-- ============================================================
-- 0) CLEAR PRIOR DEMO ROWS
-- ============================================================
delete from public.community_posts where author_email like '%@demo.theconditionofman%';
delete from public.forum_posts where author_email like '%@demo.theconditionofman%';
delete from public.forum_replies where author_email like '%@demo.theconditionofman%';
delete from public.prayer_requests where user_email like '%@demo.theconditionofman%';
delete from public.game_scores where player_email like '%@demo.theconditionofman%';
delete from public.user_profiles where user_email like '%@demo.theconditionofman%';
delete from public.bible_plans where title like '[Template]%';

-- ============================================================
-- 1) DEMO USER PROFILES (12 fictitious community members)
-- ============================================================
insert into public.user_profiles (user_email, display_name, username, bio, avatar_url) values
  ('grace@demo.theconditionofman.com',   'Grace Whitfield',  'grace_w',     'Wife, mom of 3, leading a women''s study on Romans.', null),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',    'elias_b',     'Pastor in training. Coffee, Greek, and the Gospels.', null),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',     'miriam_h',    'Worship leader. Loves the Psalms.', null),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',     'caleb_r',     'College student wrestling with the big questions.', null),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',     'hannah_o',    'Nurse, intercessor, recovering perfectionist.', null),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',   'isaac_t',     'Reading through the Bible in a year — currently in Isaiah.', null),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',       'rachel_k',    'Missionary kid. Three languages, one Savior.', null),
  ('joel@demo.theconditionofman.com',    'Joel Marston',     'joel_m',      'Carpenter who likes apologetics in his spare time.', null),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair', 'priscilla_a', 'Bible teacher. Hebrews is my favorite letter.', null),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',      'asa_d',       'Father of four, chasing godly contentment.', null),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',       'lydia_p',     'Counselor, prayer warrior, Acts 16 namesake.', null),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',     'nathan_e',    'Engineer who finds God in math and order.', null);

-- ============================================================
-- 2) FEED POSTS (community_posts) — verses, reflections, questions
-- ============================================================
insert into public.community_posts (author_email, author_name, caption, media_type, likes, liked_by, comment_count) values
  ('grace@demo.theconditionofman.com',   'Grace Whitfield',  '📖 Romans 5:8 — "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." This verse undid me this morning. We were not even close to deserving — and that is precisely the point.',                                       'text', 47, '{}', 8),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',    '📖 John 1:14 — "And the Word was made flesh, and dwelt among us." Studying the Greek today: "tabernacled" among us. The God who once dwelt in a tent of cloth chose to dwell in a tent of skin.',                                                'text', 62, '{}', 11),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',     'How do you keep your heart soft toward the Word when life is busy? I find myself reading without really reading.',                                                                                                              'text', 23, '{}', 14),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',     '📖 Psalm 19:1 — "The heavens declare the glory of God." Walked outside last night. The sky was loud.',                                                                                                                          'text', 88, '{}', 9),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',     'Asking for prayer — I have a hard conversation tomorrow with someone I love. Pray for grace and truth in equal measure.',                                                                                                       'text', 134, '{}', 27),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',   '📖 Isaiah 40:31 — "But they that wait upon the Lord shall renew their strength..." I always thought "wait" meant idle. Hebrew "qavah" actually means to twist or bind together — like a rope. Strength comes from being bound to him.', 'text', 71, '{}', 6),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',       'Three years on the mission field. Three things I have learned: 1) The Gospel translates. 2) The Spirit moves before us. 3) Suffering produces a certain joy that bypasses the mind.',                                          'text', 156, '{}', 22),
  ('joel@demo.theconditionofman.com',    'Joel Marston',     'Question for the apologetics-minded: what is the strongest historical argument for the resurrection in your view? I have been making a list to walk through with my brother.',                                                  'text', 38, '{}', 19),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair', '📖 Hebrews 4:12 — "For the word of God is quick, and powerful, and sharper than any twoedged sword." It is not a museum piece. It is a scalpel. He uses it to heal.',                                                            'text', 92, '{}', 7),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',      'Daughter (8) asked me last night: "How do we know the Bible is real?" I gave her an answer about manuscripts and prophecy. She said: "Ok but how do YOU know?" Out of the mouths of babes.',                                  'text', 211, '{}', 33),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',       '📖 Philippians 4:6-7 — "Be careful for nothing... and the peace of God, which passeth all understanding, shall keep your hearts and minds." Note the order: pray FIRST, peace SECOND. I keep getting it backwards.',           'text', 104, '{}', 12),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',     'Did you know? The probability of one person fulfilling just 8 specific Old Testament messianic prophecies is roughly 1 in 10^17. Jesus fulfilled over 300. The math alone is staggering.',                                       'text', 187, '{}', 24),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield',  'Started a women''s study on Romans this week. We covered Romans 1:16-17. Already convicted that I am too easily ashamed.',                                                                                                       'text', 41, '{}', 5),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',    'A thought experiment: if Jesus appeared in your living room tonight and asked, "What did you do with what I gave you?" — what would you say?',                                                                                  'text', 76, '{}', 18),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',     '📖 Psalm 51:10 — "Create in me a clean heart, O God; and renew a right spirit within me." Singing this over my mornings. The verb is "bara" — the same word used in Genesis 1:1. Only God creates from nothing.',              'text', 119, '{}', 9),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',     'Hot take: Ecclesiastes is the most under-appreciated book in the Bible. Solomon dropped Stoic philosophy 700 years before the Stoics existed.',                                                                                  'text', 64, '{}', 26),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',     'Update on the hard conversation from yesterday — God showed up. He always does. Thank you for praying.',                                                                                                                          'text', 178, '{}', 14),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',   '📖 Daniel 3:17-18 — "Our God whom we serve is able to deliver us from the burning fiery furnace... But if not, be it known unto thee, O king, that we will not serve thy gods." The "but if not" theology is the one that sustains me.', 'text', 142, '{}', 11),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',       'Translating John 1 with a Buddhist friend yesterday. She paused at "the light shineth in darkness; and the darkness comprehended it not." Said: "That is the saddest sentence I have ever heard." I told her there is more.',  'text', 203, '{}', 31),
  ('joel@demo.theconditionofman.com',    'Joel Marston',     'Built a bookshelf today. Read Proverbs 24:3-4 while I worked: "Through wisdom is an house builded; and by understanding it is established: And by knowledge shall the chambers be filled with all precious and pleasant riches." Wisdom is structural.', 'text', 58, '{}', 4),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair', 'Asking for honest reflection: what is one passage of Scripture you have wrestled with for years and still do not fully understand?',                                                                                              'text', 94, '{}', 38),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',      '📖 Matthew 11:28-30 — "Come unto me, all ye that labour and are heavy laden, and I will give you rest." Three years of burnout taught me this verse is not poetry. It is a job offer.',                                          'text', 167, '{}', 19),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',       'Praying for everyone in this community tonight. Drop a name in the comments and I will pray for them by name.',                                                                                                                  'text', 312, '{}', 89),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',     'Engineer brain moment: Genesis 1 lists six creative days. The scientific evidence supports an old Earth. I think the chronology is theological, not chronological — emphasizing order over time. Curious what others think.', 'text', 87, '{}', 42),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield',  '📖 Ephesians 2:10 — "For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them." The Greek word is "poiema" — poem. You are God''s poem.',               'text', 145, '{}', 8),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',    'Sermon prep this week: the Prodigal Son. Realized the older brother is the harder character to love. He never left. He never sinned. He never celebrated. He is the church without grace.',                                     'text', 198, '{}', 25),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',     'Worship night last night. We sang "It Is Well" five times in a row because no one wanted to stop. There is a place where the Spirit moves and the clock stops.',                                                                'text', 124, '{}', 13),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',     'College apologetics question: a friend says "the Gospels contradict each other." Which apparent contradiction would you tackle first?',                                                                                          'text', 51, '{}', 28),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',     '📖 1 Peter 5:7 — "Casting all your care upon him; for he careth for you." Reading the Greek: the verb is participial — "having cast." It is something we do once and live in continually.',                                       'text', 113, '{}', 7),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',   'Reading Isaiah 53 in the Dead Sea Scroll version (1QIsaa) tonight. Identical to my modern Bible. 2,200 years of preservation, zero doctrinal drift. The Bible has been kept.',                                                  'text', 156, '{}', 11),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',       'A villager handed me a Bible today and asked "is this true?" I said "test it." She is reading John this week. Pray.',                                                                                                            'text', 234, '{}', 17),
  ('joel@demo.theconditionofman.com',    'Joel Marston',     'Life observation: my impatience usually shows up about 20 seconds before I would have seen God''s answer. Note to self: hold the line.',                                                                                          'text', 89, '{}', 6),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair', '📖 2 Corinthians 4:17 — "For our light affliction, which is but for a moment, worketh for us a far more exceeding and eternal weight of glory." When you grasp the math here, the suffering looks different.',                  'text', 132, '{}', 10),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',      'Family question: how do you teach your kids to love Scripture and not just memorize it?',                                                                                                                                          'text', 67, '{}', 31),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',       'Counselor moment: most of the people I sit with are not mentally ill. They are exhausted and unloved. The Gospel speaks to both.',                                                                                                'text', 218, '{}', 22),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',     'Did you know? The Bible references the hydrological cycle (Ecclesiastes 1:7) about 2,500 years before scientists formalized it. There is more.',                                                                                  'text', 105, '{}', 9);

-- ============================================================
-- 3) FORUM POSTS — longer-form discussions
-- ============================================================
insert into public.forum_posts (author_email, author_name, title, body, category, replies_count, likes) values
  ('elias@demo.theconditionofman.com',   'Elias Brennan',    'Discussion: Romans 9 — election and human responsibility',           'Trying to lead a small group through Romans 9 next month. The passage on Pharaoh''s hardened heart is going to come up. How do you teach divine sovereignty and human responsibility together without flattening either?', 'theology', 24, 47),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair', 'Hebrews 6 — what does it mean to "fall away"?',                       'I have read 5 commentaries on Hebrews 6:4-6 and I''m still wrestling. Loss of salvation? Hypothetical warning? Apostasy distinct from believers? What has been most helpful for you?',                                  'theology', 38, 52),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',     'Apologetics: what convinced you Christianity is true?',              'For those who came to faith through evidence (not feeling) — what was the tipping point for you intellectually? For me it was the resurrection arguments by N.T. Wright.',                                              'apologetics', 56, 89),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',       'Cross-cultural Gospel: how do you contextualize without compromising?', 'Working in an honor/shame culture, the Western "guilt/forgiveness" framing of the Gospel doesn''t land. Christ as the one who restores honor lands powerfully. Anyone else navigating this?',                          'missions', 19, 33),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',     'Practical: how do you have daily devotions when life is chaos?',     'Three kids under five. My quiet time is 4:45am or it doesn''t happen. What works in your season?',                                                                                                                       'practical', 71, 58),
  ('joel@demo.theconditionofman.com',    'Joel Marston',     'Faith and work: integrating, not compartmentalizing',                'Carpenter here. I want my work to be worship not just income. How are you connecting your daily job to the Kingdom?',                                                                                                    'practical', 22, 41),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',     'Genesis and science — where does the conversation actually live?',  'I am tired of the false binary (literal six-day OR pure metaphor). The honest scholarship in this space is more interesting than either camp. Recommendations?',                                                          'apologetics', 47, 69),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield',  'Recommendation: best women''s Bible study books?',                   'Looking for studies that take women seriously theologically. Beth Moore, Jen Wilkin, Kelly Minter — all good. What else?',                                                                                                'practical', 33, 28),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',   'Through-the-Bible plans: Chronological vs Canonical?',               'Doing the Bible-in-a-year. Started with chronological. Felt great in the OT, lost the thread in the NT. Switching to canonical for round two. Anyone done both?',                                                          'practical', 14, 22),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',     'Worship: hymns, modern, both?',                                       'Our church is debating the worship music balance. I see fruit in both. How is your church handling it?',                                                                                                                'community', 41, 36);

-- ============================================================
-- 4) FORUM REPLIES — a few per top post
-- ============================================================
insert into public.forum_replies (post_id, author_email, author_name, body, likes)
select p.id, 'priscilla@demo.theconditionofman.com', 'Priscilla Adair', 'Sproul''s "Chosen by God" was the book that helped me hold both. He doesn''t resolve the tension — he insists we don''t have to.', 18
from public.forum_posts p where p.title = 'Discussion: Romans 9 — election and human responsibility';

insert into public.forum_replies (post_id, author_email, author_name, body, likes)
select p.id, 'caleb@demo.theconditionofman.com', 'Caleb Rivera', 'Came at it through a class on the historicity of the resurrection. The minimal facts approach (Habermas/Licona) was the door for me.', 14
from public.forum_posts p where p.title = 'Apologetics: what convinced you Christianity is true?';

insert into public.forum_replies (post_id, author_email, author_name, body, likes)
select p.id, 'lydia@demo.theconditionofman.com', 'Lydia Park', 'Have you tried voice-memo prayer journaling on the morning commute? Counts as time with God in this season.', 22
from public.forum_posts p where p.title = 'Practical: how do you have daily devotions when life is chaos?';

-- ============================================================
-- 5) PRAYER REQUESTS
-- ============================================================
insert into public.prayer_requests (user_email, user_name, title, body, category, is_anonymous, prayer_count) values
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',    'For wisdom in caring for an aging parent',                      'My mother is in early-stage dementia. Pray for grace, patience, and that I would steward her remaining lucid years well.',                                                                                                                'family',    false, 47),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'Final exams and a tough decision about grad school',            'I have an offer from a secular program and a smaller offer from a Christian one. Pray for clarity.',                                                                                                                                       'guidance',  false, 23),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',     'Job loss after 14 years at the company',                        'Laid off last week. Trying to trust God''s provision while updating my resume. Pray for an open door.',                                                                                                                                     'finances',  false, 89),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield', 'For my prodigal brother',                                        'My brother walked away from the faith years ago. Pray that the Spirit would draw him back.',                                                                                                                                              'salvation', false, 134),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',      'Safe travel and visa renewal for our team',                     'Our team of 5 is heading to a sensitive region next week. Pray for safety, language, and favor with officials.',                                                                                                                            'guidance',  false, 56),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',  'Healing from chronic back pain',                                'Two years of pain, multiple specialists. Pray for healing and patience while I wait.',                                                                                                                                                     'health',    false, 41),
  ('joel@demo.theconditionofman.com',    'Joel Marston',    'Marriage that needs rebuilding',                                'After a hard season my wife and I are starting counseling. Pray for soft hearts and gospel grace.',                                                                                                                                       'family',    false, 78),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',      'Counseling clients walking through deep darkness',              'Three of my clients this month are in dark places. Pray for the Spirit to give them hope and for me to offer wise words.',                                                                                                               'other',     false, 65),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','Speaking opportunity on Sunday',                                 'Asked to teach the women''s ministry on contentment from Philippians 4. Pray for clarity, conviction, and humility.',                                                                                                                     'guidance',  false, 28),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',    'Gratitude — answered prayer',                                    'Sharing as encouragement: the job I prayed about for 6 months came through. God is good even in the waiting.',                                                                                                                            'gratitude', false, 102);

-- ============================================================
-- 6) GAME SCORES (leaderboards) — across all game types & difficulties
-- ============================================================
insert into public.game_scores (player_email, player_name, game_type, score, difficulty) values
  -- Bible Trivia
  ('elias@demo.theconditionofman.com',   'Elias Brennan',   'trivia', 10, 'medium'),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','trivia', 10, 'hard'),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',  'trivia',  9, 'medium'),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'trivia',  8, 'easy'),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield', 'trivia',  9, 'easy'),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',    'trivia',  8, 'medium'),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',      'trivia',  9, 'hard'),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',    'trivia',  7, 'medium'),
  ('joel@demo.theconditionofman.com',    'Joel Marston',    'trivia',  8, 'medium'),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',      'trivia',  7, 'easy'),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',     'trivia',  6, 'easy'),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',    'trivia',  7, 'medium'),

  -- Finish the Verse
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','finish_verse', 7, 'normal'),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',   'finish_verse', 7, 'theologian'),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',  'finish_verse', 6, 'normal'),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield', 'finish_verse', 6, 'normal'),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'finish_verse', 5, 'normal'),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',      'finish_verse', 7, 'theologian'),
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',    'finish_verse', 5, 'normal'),
  ('joel@demo.theconditionofman.com',    'Joel Marston',    'finish_verse', 4, 'normal'),

  -- Spot the False Teaching
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','spot_false', 12, 'advanced'),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',   'spot_false', 11, 'advanced'),
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',    'spot_false', 10, 'intermediate'),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',      'spot_false', 12, 'intermediate'),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',  'spot_false',  9, 'beginner'),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'spot_false',  7, 'beginner'),
  ('lydia@demo.theconditionofman.com',   'Lydia Park',      'spot_false',  8, 'beginner'),
  ('joel@demo.theconditionofman.com',    'Joel Marston',    'spot_false',  6, 'beginner'),

  -- Verse Memorization
  ('miriam@demo.theconditionofman.com',  'Miriam Hayes',    'memorization', 10, 'normal'),
  ('grace@demo.theconditionofman.com',   'Grace Whitfield', 'memorization',  9, 'normal'),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','memorization', 10, 'normal'),
  ('hannah@demo.theconditionofman.com',  'Hannah Olsen',    'memorization',  8, 'normal'),
  ('isaac@demo.theconditionofman.com',   'Isaac Thornton',  'memorization',  9, 'normal'),

  -- Who Am I
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'who_am_i', 9, 'normal'),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',   'who_am_i', 10, 'normal'),
  ('rachel@demo.theconditionofman.com',  'Rachel Kim',      'who_am_i', 8, 'normal'),
  ('asa@demo.theconditionofman.com',     'Asa Donovan',     'who_am_i', 7, 'normal'),

  -- Do You Believe
  ('nathan@demo.theconditionofman.com',  'Nathan Ellis',    'do_you_believe', 5, 'theologian'),
  ('priscilla@demo.theconditionofman.com','Priscilla Adair','do_you_believe', 5, 'theologian'),
  ('elias@demo.theconditionofman.com',   'Elias Brennan',   'do_you_believe', 4, 'hard'),
  ('caleb@demo.theconditionofman.com',   'Caleb Rivera',    'do_you_believe', 3, 'medium');

-- ============================================================
-- 7) BIBLE PLAN TEMPLATES — discoverable on the Plans page
-- ============================================================
insert into public.bible_plans (title, description, type, duration_days, is_public, enrolled_count) values
  ('[Template] Bible in a Year — Chronological',           'Read through the entire Bible in 365 days, in the order events historically occurred. Pace: ~3 chapters/day.',                          'selfpaced', 365, true, 124),
  ('[Template] New Testament in 90 Days',                  'A focused 90-day reading plan through the entire New Testament — Gospels through Revelation. ~3 chapters/day.',                       'selfpaced',  90, true,  78),
  ('[Template] Psalms & Proverbs — 60 Day Devotional',      'A 60-day daily devotional pairing one psalm and one chapter of Proverbs each morning. Excellent for new readers.',                    'selfpaced',  60, true,  92),
  ('[Template] Gospel of John in 21 Days',                 'Slow, deep meditation on the Gospel of John, one chapter per day with reflection prompts.',                                            'selfpaced',  21, true,  56),
  ('[Template] The Letters of Paul — 30 Days',             'Read through all 13 of Paul''s epistles in 30 days, with historical context for each letter.',                                          'selfpaced',  30, true,  48),
  ('[Template] Genesis: Origins — 14 Days',                'A two-week plunge into Genesis 1-50 — creation, the patriarchs, and the foundation of redemption history.',                            'selfpaced',  14, true,  37),
  ('[Template] Wisdom Books — 40 Days',                    'Job, Ecclesiastes, and Song of Solomon over 40 days. Wrestles with the hard questions: suffering, meaning, love.',                     'selfpaced',  40, true,  29),
  ('[Template] The Prophets — 60 Days',                    'A guided journey through the Major and Minor Prophets, with notes on the historical setting of each.',                                 'selfpaced',  60, true,  21),
  ('[Template] Sermon on the Mount — 7 Days',              'One week of slow reading through Matthew 5-7. Christ''s ethics for the kingdom, in his own words.',                                   'selfpaced',   7, true,  84),
  ('[Template] Romans: The Gospel Explained — 16 Days',    'Sixteen days walking through Paul''s magnum opus on sin, justification, sanctification, and election.',                                'selfpaced',  16, true,  53),
  ('[Template] Hebrews & the New Covenant — 13 Days',      'A 13-day plan through the book of Hebrews — Christ as superior priest, sacrifice, and mediator.',                                       'selfpaced',  13, true,  31),
  ('[Template] Revelation Decoded — 22 Days',              'Twenty-two days through the book of Revelation, one chapter per day with historical and symbolic context.',                              'selfpaced',  22, true,  62);

-- ============================================================
-- 8) PLAYER COINS — give demo users some currency
-- ============================================================
insert into public.player_coins (player_email, balance, lifetime_earned)
select user_email, 100 + (random()*1000)::int, 200 + (random()*2000)::int
from public.user_profiles where user_email like '%@demo.theconditionofman%'
on conflict (player_email) do nothing;

-- ============================================================
-- DONE
-- ============================================================
select 'Seeded ' || count(*) || ' user profiles' from public.user_profiles where user_email like '%@demo%';
select 'Seeded ' || count(*) || ' community posts' from public.community_posts where author_email like '%@demo%';
select 'Seeded ' || count(*) || ' forum posts' from public.forum_posts where author_email like '%@demo%';
select 'Seeded ' || count(*) || ' prayer requests' from public.prayer_requests where user_email like '%@demo%';
select 'Seeded ' || count(*) || ' game scores' from public.game_scores where player_email like '%@demo%';
