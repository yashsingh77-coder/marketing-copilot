-- Seed: Marketing School lessons + badges.
-- Lesson content is an ordered array of cards. Card types:
--   concept  { type, title, body, mascot }             mascot: happy|thinking|pointing|celebrating
--   example  { type, title, good, bad, why }
--   quiz     { type, question, options[], answer, explain }
--   task     { type, title, instruction, action, params }   action = generator to run
--   done     { type, title, body }

insert into public.lessons (slug, module, title, summary, duration_min, xp_reward, sort_order, content) values

-- ─── Marketing 101 ────────────────────────────────────────────────────────
('m101-why-post', 'marketing_101', 'Why post at all?', 'Social media is your shop window that never closes.', 2, 50, 1, '[
  {"type":"concept","mascot":"happy","title":"Your window, open 24/7","body":"People walk past your shop maybe once. They scroll past your Instagram every day. Every post is a chance to say hi — and remind them you exist."},
  {"type":"concept","mascot":"pointing","title":"Consistency beats perfection","body":"3 okay posts a week beat 1 perfect post a month. Your audience remembers rhythm, not polish."},
  {"type":"quiz","question":"What matters most when you start?","options":["Perfect photos","Posting regularly","Going viral"],"answer":1,"explain":"Rhythm builds trust. Polish comes later."},
  {"type":"task","title":"Set your rhythm","instruction":"Based on your weekly hours, we suggest a posting rhythm. Confirm it to fill your first week.","action":"autofill_week","params":{}},
  {"type":"done","title":"Rhythm set! 🎉","body":"Your first week has a plan. That already puts you ahead of most local businesses."}
]'::jsonb),

('m101-pillars', 'marketing_101', 'What are content pillars?', 'The 4–6 themes that make your feed feel like YOU.', 3, 50, 2, '[
  {"type":"concept","mascot":"thinking","title":"Pillars = your recurring themes","body":"Instead of asking \"what do I post today?\" you ask \"which pillar is today?\". Behind-the-scenes, menu spotlight, customer love — pick a lane, post, repeat."},
  {"type":"example","title":"Spot the pillar","good":"\"Meet Raju, who has made our filter coffee for 12 years ☕\"","bad":"\"Good morning everyone!\"","why":"The first belongs to a Team pillar and tells a story. The second belongs nowhere and says nothing."},
  {"type":"quiz","question":"How many pillars is a good start?","options":["1–2","4–6","10+"],"answer":1,"explain":"Enough variety to stay interesting, few enough to stay recognisable."},
  {"type":"task","title":"Review your pillars","instruction":"Look at the pillars we generated. Swap out one that doesn''t feel like you.","action":"review_pillars","params":{}},
  {"type":"done","title":"Pillars locked in","body":"Every idea from now on will come from one of these. No more blank-screen panic."}
]'::jsonb),

('m101-formats', 'marketing_101', 'Static, carousel, reel, story', 'Which format for which job.', 2, 50, 3, '[
  {"type":"concept","mascot":"pointing","title":"Four formats, four jobs","body":"Static = one strong image. Carousel = a mini story or list (great for saves). Reel = reach new people. Story = talk to people who already follow you."},
  {"type":"quiz","question":"You want NEW people to discover you. Best format?","options":["Story","Reel","Static"],"answer":1,"explain":"Reels are pushed to non-followers far more than any other format."},
  {"type":"task","title":"Make your first reel brief","instruction":"Pick a pillar and generate a reel brief. We''ll describe exactly what to film.","action":"generate_brief","params":{"format":"reel"}},
  {"type":"done","title":"Reel brief ready","body":"Film it on your phone. 15 seconds is plenty."}
]'::jsonb),

-- ─── Captions 101 ─────────────────────────────────────────────────────────
('c101-hook', 'captions_101', 'The first line is everything', 'Only the first ~8 words show before \"...more\".', 2, 50, 1, '[
  {"type":"concept","mascot":"pointing","title":"Hook, then story","body":"Instagram hides everything after the first line. If line one is boring, nobody taps \"more\". Start with a question, a number, or a surprise."},
  {"type":"example","title":"Same post, two hooks","good":"\"We threw away 4kg of coffee this morning. Here''s why.\"","bad":"\"Hello friends, today we want to share something about our coffee.\"","why":"Curiosity. The good hook makes you NEED the next line."},
  {"type":"quiz","question":"Which hook is stronger?","options":["\"New menu alert!!\"","\"The dish 9 out of 10 regulars order\"","\"We have a new menu, check it out\""],"answer":1,"explain":"Specific number + social proof + curiosity."},
  {"type":"task","title":"Rewrite a hook","instruction":"Pick any brief on your calendar. We''ll generate 3 alternative first lines — choose the one you''d tap.","action":"regenerate_hooks","params":{"count":3}},
  {"type":"done","title":"Hooked! 🎣","body":"You just learned the single most important caption skill."}
]'::jsonb),

('c101-voice', 'captions_101', 'Write like you talk', 'Hinglish is a superpower, not a mistake.', 2, 50, 2, '[
  {"type":"concept","mascot":"happy","title":"Your customers hear your voice","body":"If you greet customers with \"Aao, chai piyo\", your captions can too. Mixing languages feels warm and local — that''s exactly what chains can''t copy."},
  {"type":"example","title":"Corporate vs. you","good":"\"Barish + adrak chai = no notes 🌧️☕\"","bad":"\"Enjoy our premium ginger tea during the monsoon season.\"","why":"One sounds like a friend. The other sounds like a billboard."},
  {"type":"task","title":"Set your tone","instruction":"Try the same caption in English and Hinglish. Pick the one that sounds like you — we''ll remember it.","action":"compare_tones","params":{"languages":["en","hinglish"]}},
  {"type":"done","title":"Found your voice","body":"Every caption from now on will match it."}
]'::jsonb),

('c101-cta', 'captions_101', 'Always ask for something', 'Every caption ends with one small ask.', 2, 50, 3, '[
  {"type":"concept","mascot":"pointing","title":"One post, one ask","body":"Save this. Tag a friend. Tell us your order. Come by before 11 for the offer. Comments and saves tell Instagram your post is worth showing to more people."},
  {"type":"quiz","question":"How many asks per caption?","options":["One","Two or three","As many as possible"],"answer":0,"explain":"More than one ask and people do none."},
  {"type":"task","title":"Add a CTA","instruction":"We''ll suggest 3 CTAs for your next scheduled post. Pick one.","action":"suggest_cta","params":{}},
  {"type":"done","title":"CTA added","body":"Watch your comments section wake up."}
]'::jsonb),

-- ─── Hashtags 101 ─────────────────────────────────────────────────────────
('h101-three-tiers', 'hashtags_101', 'Local, niche, broad', 'Three tiers, not thirty random tags.', 2, 50, 1, '[
  {"type":"concept","mascot":"thinking","title":"Hashtags are search terms","body":"#bandracafe finds neighbours. #specialtycoffeeindia finds coffee nerds. #cafe finds… everyone and no one. You want a mix: mostly local + niche, a couple broad."},
  {"type":"quiz","question":"Which tag will most likely bring a walk-in customer?","options":["#coffee","#mumbaicafes","#love"],"answer":1,"explain":"Local tags reach people who can actually visit."},
  {"type":"task","title":"Build your tag sets","instruction":"We''ll generate a local / niche / broad set for each pillar. Save them — you''ll reuse these for months.","action":"generate_hashtag_sets","params":{}},
  {"type":"done","title":"Tag sets saved","body":"No more typing #food #yummy #instagood ever again."}
]'::jsonb),

('h101-how-many', 'hashtags_101', 'How many is too many?', 'Quality over quantity — 5 to 12 is the sweet spot.', 2, 50, 2, '[
  {"type":"concept","mascot":"pointing","title":"5–12 relevant tags","body":"30 tags used to be the advice. Today, Instagram reads your caption and image too. Use 5–12 tags that actually describe the post; skip the rest."},
  {"type":"quiz","question":"Best place for hashtags?","options":["In the caption","In the first comment","Doesn''t matter"],"answer":2,"explain":"Both work. Put them wherever it looks cleaner to you."},
  {"type":"task","title":"Trim a tag set","instruction":"Open your next post''s hashtags and remove any that don''t describe THIS post.","action":"review_hashtags","params":{}},
  {"type":"done","title":"Clean tags","body":"Focused tags = better matches."}
]'::jsonb),

-- ─── Analytics 101 (unlocks after connecting Instagram) ───────────────────
('a101-reach-vs-engagement', 'analytics_101', 'Reach vs. engagement', 'Two numbers that tell two different stories.', 2, 50, 1, '[
  {"type":"concept","mascot":"thinking","title":"Reach = how many saw it","body":"Engagement = how many cared (liked, commented, saved, shared). High reach + low engagement = interesting thumbnail, weak content. Low reach + high engagement = great content, bad timing or format."},
  {"type":"quiz","question":"A post with 2,000 reach and 10 likes has…","options":["Great engagement","Weak engagement","Can''t tell"],"answer":1,"explain":"0.5% engagement — the content didn''t land, even though people saw it."},
  {"type":"task","title":"Read your top post","instruction":"We''ll show your best post this month and explain why it worked.","action":"explain_top_post","params":{}},
  {"type":"done","title":"You read the numbers","body":"Most owners never look. You just did."}
]'::jsonb),

('a101-double-down', 'analytics_101', 'Double down on what works', 'Let the data pick your next post.', 2, 75, 2, '[
  {"type":"concept","mascot":"celebrating","title":"Data is just your customers voting","body":"If carousels get 2× the saves, make more carousels. If 7 PM beats 11 AM, post at 7. Every month, look once, adjust once."},
  {"type":"task","title":"Apply an insight","instruction":"Pick one insight from your Performance tab and let it shape next week''s plan.","action":"apply_insight","params":{}},
  {"type":"done","title":"Data-driven 📈","body":"You''re now doing what agencies charge ₹20k/month for."}
]'::jsonb);

-- ─── Badges ───────────────────────────────────────────────────────────────
insert into public.badges (slug, name, description, emoji, criteria, sort_order) values
('first-post-brief', 'First Brief', 'Generated your very first post brief.', '📝', '{"type":"briefs_created","value":1}', 1),
('rookie-graduate', 'Rookie Graduate', 'Completed Marketing 101.', '🎓', '{"type":"module_completed","module":"marketing_101"}', 2),
('caption-crafter', 'Caption Crafter', 'Completed Captions 101.', '✍️', '{"type":"module_completed","module":"captions_101"}', 3),
('tag-master', 'Tag Master', 'Completed Hashtags 101.', '#️⃣', '{"type":"module_completed","module":"hashtags_101"}', 4),
('data-whisperer', 'Data Whisperer', 'Completed Analytics 101.', '📊', '{"type":"module_completed","module":"analytics_101"}', 5),
('week-planner', 'Week Planner', 'Filled a full week of posts.', '📅', '{"type":"briefs_scheduled_week","value":1}', 6),
('voice-of-the-shop', 'Voice of the Shop', 'Turned a voice note into a post.', '🎙️', '{"type":"voice_briefs","value":1}', 7),
('streak-7', 'On Fire', '7-day streak.', '🔥', '{"type":"streak","value":7}', 8),
('connected', 'Plugged In', 'Connected your Instagram.', '🔌', '{"type":"accounts_connected","value":1}', 9),
('ten-posts', 'Consistent', 'Published 10 posts.', '💪', '{"type":"posts_published","value":10}', 10);
