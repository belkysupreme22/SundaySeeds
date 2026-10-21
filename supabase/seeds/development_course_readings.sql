-- Explicit development-only import of the approved existing course teaching text.
-- Source: apps/mobile/src/features/lessons/data/lessons.ts, copied as literals.
-- Excludes quiz questions/answers, sample progress, bookmarks and account history.
-- Production teaching/Scripture-rights review remains pending. Re-run fails closed.
do $seed$
declare
  v_course uuid;
  v_release uuid;
  v_current_release uuid;
  v_reading jsonb;
  v_readings jsonb := $readings$[
  {
    "id": "good-samaritan",
    "title": "Love your neighbour",
    "subtitle": "Put compassion into practice.",
    "scripture": "Luke 10:25–37",
    "estimatedMinutes": 8,
    "intro": "What does it mean to be a neighbour? Explore the Good Samaritan and consider how compassion shapes the way we respond to people around us.",
    "outcomes": [
      {
        "title": "Pay attention",
        "description": "Recognise needs that are easy to overlook."
      },
      {
        "title": "Respond with care",
        "description": "Connect compassion with practical help."
      },
      {
        "title": "Cross boundaries",
        "description": "Extend kindness beyond familiar circles."
      },
      {
        "title": "Make it practical",
        "description": "Choose one thoughtful action for this week."
      }
    ],
    "memoryVerse": {
      "text": "Thou shalt love thy neighbour as thyself.",
      "reference": "Matthew 22:39 · KJV excerpt"
    },
    "sections": [
      {
        "id": "notice",
        "title": "Notice the person",
        "body": "Jesus told a story about a traveller who was attacked and left beside the road. Others saw him and passed by, but a Samaritan stopped. The difference began with attention: he allowed another person’s need to interrupt his journey.\n\nReflect: Who might be easy to overlook in your workplace, neighbourhood or church? What could help you notice them this week?"
      },
      {
        "id": "care",
        "title": "Put kindness into action",
        "body": "The Samaritan treated the traveller’s wounds, brought him to an inn and arranged continued care. His compassion became a series of practical decisions. We cannot meet every need ourselves, but we can listen, offer appropriate help and involve someone better placed to support the person.\n\nTry this: Think of someone facing a difficult week. Ask what would help before deciding what to offer."
      },
      {
        "id": "neighbour",
        "title": "Become a neighbour",
        "body": "Jesus shifted the question from who qualifies as a neighbour to who acts as one. The Samaritan crossed a social boundary to show mercy. Being a neighbour asks us to look beyond familiarity and treat another person’s dignity as seriously as our own.\n\nTake it with you: Listen before making assumptions. Choose one respectful, practical act of kindness beyond your usual circle."
      }
    ]
  },
  {
    "id": "david-and-goliath",
    "title": "Courage over fear",
    "subtitle": "Take the next faithful step.",
    "scripture": "1 Samuel 17",
    "estimatedMinutes": 7,
    "intro": "Explore David’s response to Goliath and reflect on the relationship between trust, preparation and courage in everyday decisions.",
    "outcomes": [
      {
        "title": "Name your fear",
        "description": "Identify a challenge you are facing."
      },
      {
        "title": "Recognise your gifts",
        "description": "Consider the experience you can draw on."
      },
      {
        "title": "Trust God",
        "description": "Reflect on what gave David courage."
      },
      {
        "title": "Choose wisely",
        "description": "Plan a responsible step with support."
      }
    ],
    "memoryVerse": {
      "text": "What time I am afraid, I will trust in thee.",
      "reference": "Psalm 56:3 · KJV"
    },
    "sections": [
      {
        "id": "fear",
        "title": "Name the challenge",
        "body": "Goliath’s challenge left the army of Israel afraid. David faced the same circumstances, yet trusted that God had not abandoned them. Courage begins with an honest view of a difficult situation; it does not require us to deny fear or minimise what is at stake.\n\nReflect: What conversation, responsibility or decision are you avoiding? Name the challenge and consider what support you need."
      },
      {
        "id": "gifts",
        "title": "Use what you have",
        "body": "David drew on his experience caring for his father’s sheep. He set aside unfamiliar armour and used tools he knew. His trust in God did not erase his preparation; the skills formed in ordinary responsibilities mattered.\n\nReflect: Which experience or strength could help you respond wisely? You do not need to approach a challenge exactly as someone else would."
      },
      {
        "id": "step",
        "title": "Choose wise courage",
        "body": "In everyday life, courage may mean telling the truth, offering an apology or asking for help. Trust and good judgement belong together. Seeking advice, setting a boundary or involving someone with the right experience can be a faithful response.\n\nTry this: Choose one honest, responsible step toward the challenge you named. Decide who could support you as you take it."
      }
    ]
  },
  {
    "id": "a-life-of-prayer",
    "title": "A moment with God",
    "subtitle": "Make space for honest prayer.",
    "scripture": "Matthew 6:5–13",
    "estimatedMinutes": 6,
    "intro": "Begin with the prayer Jesus taught. Explore a simple rhythm of gratitude, daily needs and forgiveness that you can bring into everyday life.",
    "outcomes": [
      {
        "title": "Speak honestly",
        "description": "Bring your real concerns to God."
      },
      {
        "title": "Learn a pattern",
        "description": "Explore the prayer Jesus taught."
      },
      {
        "title": "Pause and reflect",
        "description": "Make room for thanks and listening."
      },
      {
        "title": "Build a habit",
        "description": "Choose a regular moment to pray."
      }
    ],
    "memoryVerse": {
      "text": "Pray without ceasing.",
      "reference": "1 Thessalonians 5:17 · KJV"
    },
    "sections": [
      {
        "id": "honest",
        "title": "Start honestly",
        "body": "Jesus taught his followers to pray sincerely rather than to impress an audience. Prayer makes room for ordinary words and real concerns. A quiet moment may help us pay attention, but we do not have to find perfect words before we begin.\n\nReflect: What are you grateful for today? What concern have you found difficult to put into words?"
      },
      {
        "id": "pattern",
        "title": "Learn a helpful pattern",
        "body": "The Lord’s Prayer begins by honouring God and turns toward daily needs, forgiveness and guidance. It gives us a pattern to return to when we are unsure where to start. We can use these themes to bring the ordinary details of our lives before God.\n\nTry this: Pause over one phrase of the Lord’s Prayer. Connect it with a need, relationship or decision in your life today."
      },
      {
        "id": "daily",
        "title": "Return through the day",
        "body": "Prayer can become part of an ordinary day: before a decision, in a moment of worry or after receiving kindness. We can speak, pause and reflect. Bringing a concern to God does not guarantee the outcome we want; it invites us to keep bringing our lives before him.\n\nTake it with you: Choose an existing daily rhythm, such as breakfast or your journey home, as a reminder to pause for a short, honest prayer."
      }
    ]
  },
  {
    "id": "faith-like-a-seed",
    "title": "Small seeds of faith",
    "subtitle": "Nurture a steady, everyday faith.",
    "scripture": "Mark 4:30–32",
    "estimatedMinutes": 5,
    "intro": "Jesus compared God’s kingdom to a mustard seed. Consider what this picture reveals about small beginnings, patient growth and making room for others.",
    "outcomes": [
      {
        "title": "Explore the parable",
        "description": "Understand the mustard seed picture."
      },
      {
        "title": "Be patient",
        "description": "Give steady growth time to happen."
      },
      {
        "title": "Practise faith",
        "description": "Choose a small habit for this week."
      },
      {
        "title": "Welcome others",
        "description": "Make room for someone to belong."
      }
    ],
    "memoryVerse": {
      "text": "For we walk by faith, not by sight.",
      "reference": "2 Corinthians 5:7 · KJV"
    },
    "sections": [
      {
        "id": "small",
        "title": "Begin with something small",
        "body": "Jesus compared God’s kingdom to a mustard seed: a small beginning that grows far beyond what someone might expect. The image invites us to pay attention to what is easily overlooked. A modest start is still worth nurturing.\n\nReflect: Think of a relationship, habit or act of care that began quietly. What helped it grow?"
      },
      {
        "id": "grow",
        "title": "Give growth time",
        "body": "A seed grows over time. In our own lives, reading Scripture, asking honest questions, praying and learning with others can become steady practices. Growth may be difficult to see from one day to the next, and comparison can distract us from the next faithful step.\n\nTry this: Choose one practice you can return to this week. Keep it small enough to fit your daily responsibilities."
      },
      {
        "id": "shelter",
        "title": "Grow toward others",
        "body": "In Jesus’ picture, birds find shelter in the branches. The image turns our attention outward: growth can create room for others to find welcome and care. As we nurture faith, we can also ask who benefits from the way we live.\n\nTake it with you: Make space for someone this week. Invite them into a conversation, listen to their experience or offer a thoughtful welcome."
      }
    ]
  }
]$readings$::jsonb;
begin
  select course_id, release_id into v_course, v_release from public.course_offerings
    where slug = 'faith-for-everyday-life' and is_development;
  if not found then raise exception 'development_course_not_found'; end if;
  -- Consistent release-before-offering lock order for this privileged import.
  perform 1 from course_library_private.course_releases
    where release_id = v_release and course_id = v_course for update;
  select release_id into v_current_release from public.course_offerings
    where course_id = v_course and is_development and not joins_open for update;
  if not found or v_current_release is distinct from v_release then
    raise exception 'development_course_changed_or_already_open';
  end if;
  if exists (select 1 from course_library_private.course_lesson_readings
    where release_id = v_release) then raise exception 'development_readings_already_exist'; end if;
  for v_reading in select value from jsonb_array_elements(v_readings) loop
    insert into course_library_private.course_lesson_readings
      (release_id, course_id, lesson_id, body)
      values (v_release, v_course, v_reading->>'id', v_reading);
  end loop;
  if (select count(*) from course_library_private.course_lesson_readings
    where release_id = v_release and course_id = v_course) <> 4 then
    raise exception 'development_readings_incomplete';
  end if;
  update public.course_offerings set joins_open = true where course_id = v_course;
end;
$seed$;
