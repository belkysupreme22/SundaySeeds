-- Explicit one-time DEVELOPMENT import approved in decision0016.
-- Source: apps/mobile/src/features/lessons/data/lessons.ts, copied as literals.
-- Stable option-a/b/c/d IDs preserve source option order; keys follow correctIndex.
-- This inserts the first sealed assessment set for edition 1 only. Re-run fails.
-- No reading/order/offering, enrollment, attempt, score or learner-history writes.
-- Production teaching and Scripture-rights review remain pending.
do $seed$
declare
  v_course uuid;
  v_release uuid;
  v_current_release uuid;
  v_snapshot jsonb;
  v_edition integer;
  v_available boolean;
  v_order text[];
  v_expected_order text[] := array[
    'a-life-of-prayer', 'faith-like-a-seed', 'david-and-goliath', 'good-samaritan'
  ];
  v_expected_snapshot jsonb := $metadata${
  "slug": "faith-for-everyday-life",
  "title": "Faith for everyday life",
  "summary": "Build a thoughtful rhythm of prayer, trust and compassion through four short Bible studies, with reflection and a knowledge check in every lesson.",
  "topics": [
    "Prayer",
    "Faith",
    "Courage",
    "Kindness"
  ],
  "learning_goals": [
    "prayer_habit",
    "daily_practice"
  ],
  "outcomes": [
    "Describe the Lord’s Prayer as a pattern for sincere prayer.",
    "Explain the mustard-seed image of God’s kingdom.",
    "Distinguish responsible courage from ignoring risk.",
    "Explain the Samaritan’s practical care for a neighbour."
  ],
  "audience": "Adults beginning or renewing a Christian study practice.",
  "language": "English",
  "level": null,
  "estimated_minutes": 26,
  "estimate_basis": "reading",
  "is_development": true,
  "modules": [
    {
      "id": "roots",
      "title": "Put down roots",
      "lessons": [
        {
          "id": "a-life-of-prayer",
          "title": "A moment with God",
          "scripture": "Matthew 6:5–13",
          "estimatedMinutes": 6
        },
        {
          "id": "faith-like-a-seed",
          "title": "Small seeds of faith",
          "scripture": "Mark 4:30–32",
          "estimatedMinutes": 5
        }
      ]
    },
    {
      "id": "practice",
      "title": "Live your faith",
      "lessons": [
        {
          "id": "david-and-goliath",
          "title": "Courage over fear",
          "scripture": "1 Samuel 17",
          "estimatedMinutes": 7
        },
        {
          "id": "good-samaritan",
          "title": "Love your neighbour",
          "scripture": "Luke 10:25–37",
          "estimatedMinutes": 8
        }
      ]
    }
  ]
}$metadata$::jsonb;
  v_assessments jsonb := $assessment${
  "schemaVersion": 1,
  "lessons": [
    {
      "lessonId": "a-life-of-prayer",
      "assessmentId": "knowledge-check-a-life-of-prayer",
      "questions": [
        {
          "id": "prayer-1",
          "prompt": "What did Jesus teach about prayer?",
          "options": [
            {
              "id": "option-a",
              "text": "It must impress other people"
            },
            {
              "id": "option-b",
              "text": "Only long prayers count"
            },
            {
              "id": "option-c",
              "text": "It can be sincere rather than a performance"
            },
            {
              "id": "option-d",
              "text": "It requires special public words"
            }
          ],
          "correctOptionId": "option-c",
          "explanation": "Jesus encouraged sincere prayer rather than praying to gain attention."
        },
        {
          "id": "prayer-2",
          "prompt": "Which belongs in the pattern of the Lord’s Prayer?",
          "options": [
            {
              "id": "option-a",
              "text": "Competing with others"
            },
            {
              "id": "option-b",
              "text": "Asking for daily needs and forgiveness"
            },
            {
              "id": "option-c",
              "text": "Demanding praise from others"
            },
            {
              "id": "option-d",
              "text": "Avoiding every concern"
            }
          ],
          "correctOptionId": "option-b",
          "explanation": "Jesus included daily needs, forgiveness and guidance in the prayer he taught."
        },
        {
          "id": "prayer-3",
          "prompt": "What is a practical way to begin a prayer habit?",
          "options": [
            {
              "id": "option-a",
              "text": "Wait until life is perfect"
            },
            {
              "id": "option-b",
              "text": "Use words you do not understand"
            },
            {
              "id": "option-c",
              "text": "Compare your prayers with everyone else"
            },
            {
              "id": "option-d",
              "text": "Choose a regular moment for an honest prayer"
            }
          ],
          "correctOptionId": "option-d",
          "explanation": "A small, repeatable moment can help prayer become part of everyday life."
        }
      ]
    },
    {
      "lessonId": "faith-like-a-seed",
      "assessmentId": "knowledge-check-faith-like-a-seed",
      "questions": [
        {
          "id": "faith-1",
          "prompt": "What did Jesus compare to a mustard seed in this passage?",
          "options": [
            {
              "id": "option-a",
              "text": "God’s kingdom"
            },
            {
              "id": "option-b",
              "text": "A fishing boat"
            },
            {
              "id": "option-c",
              "text": "A temple gate"
            },
            {
              "id": "option-d",
              "text": "A treasure chest"
            }
          ],
          "correctOptionId": "option-a",
          "explanation": "In Mark 4, Jesus uses the mustard seed as a picture of God’s kingdom."
        },
        {
          "id": "faith-2",
          "prompt": "What can the seed picture teach us about beginnings?",
          "options": [
            {
              "id": "option-a",
              "text": "Only impressive starts matter"
            },
            {
              "id": "option-b",
              "text": "Growth should happen instantly"
            },
            {
              "id": "option-c",
              "text": "Small beginnings can matter"
            },
            {
              "id": "option-d",
              "text": "Questions always prevent growth"
            }
          ],
          "correctOptionId": "option-c",
          "explanation": "The seed begins small yet grows. Faithful beginnings do not have to look impressive."
        },
        {
          "id": "faith-3",
          "prompt": "Which action reflects growth that makes room for others?",
          "options": [
            {
              "id": "option-a",
              "text": "Keeping newcomers outside your group"
            },
            {
              "id": "option-b",
              "text": "Welcoming someone who feels left out"
            },
            {
              "id": "option-c",
              "text": "Competing to look most important"
            },
            {
              "id": "option-d",
              "text": "Refusing to listen"
            }
          ],
          "correctOptionId": "option-b",
          "explanation": "Welcoming others reflects the image of branches offering shelter."
        }
      ]
    },
    {
      "lessonId": "david-and-goliath",
      "assessmentId": "knowledge-check-david-and-goliath",
      "questions": [
        {
          "id": "courage-1",
          "prompt": "What experience had helped prepare David?",
          "options": [
            {
              "id": "option-a",
              "text": "Caring for sheep"
            },
            {
              "id": "option-b",
              "text": "Building ships"
            },
            {
              "id": "option-c",
              "text": "Leading a large army"
            },
            {
              "id": "option-d",
              "text": "Serving as king"
            }
          ],
          "correctOptionId": "option-a",
          "explanation": "David remembered his experience protecting his father’s sheep."
        },
        {
          "id": "courage-2",
          "prompt": "Why is the detail about unfamiliar armour meaningful?",
          "options": [
            {
              "id": "option-a",
              "text": "Preparation does not matter"
            },
            {
              "id": "option-b",
              "text": "Everyone needs identical tools"
            },
            {
              "id": "option-c",
              "text": "David used skills and tools familiar to him"
            },
            {
              "id": "option-d",
              "text": "Help from others is always wrong"
            }
          ],
          "correctOptionId": "option-c",
          "explanation": "David chose tools he could use. We can develop and use our own gifts rather than imitate someone else."
        },
        {
          "id": "courage-3",
          "prompt": "What is an example of wise courage today?",
          "options": [
            {
              "id": "option-a",
              "text": "Taking a dangerous dare"
            },
            {
              "id": "option-b",
              "text": "Asking for help with a difficult situation"
            },
            {
              "id": "option-c",
              "text": "Pretending you never feel afraid"
            },
            {
              "id": "option-d",
              "text": "Hiding every mistake"
            }
          ],
          "correctOptionId": "option-b",
          "explanation": "Asking for help can be a courageous and responsible next step."
        }
      ]
    },
    {
      "lessonId": "good-samaritan",
      "assessmentId": "knowledge-check-good-samaritan",
      "questions": [
        {
          "id": "kindness-1",
          "prompt": "Who stopped to care for the injured traveller?",
          "options": [
            {
              "id": "option-a",
              "text": "A passing merchant"
            },
            {
              "id": "option-b",
              "text": "The Samaritan"
            },
            {
              "id": "option-c",
              "text": "A soldier"
            },
            {
              "id": "option-d",
              "text": "An innkeeper on the road"
            }
          ],
          "correctOptionId": "option-b",
          "explanation": "The Samaritan stopped, cared for the traveller and arranged further help."
        },
        {
          "id": "kindness-2",
          "prompt": "What made the Samaritan’s compassion visible?",
          "options": [
            {
              "id": "option-a",
              "text": "He gave a long speech"
            },
            {
              "id": "option-b",
              "text": "He waited for someone else"
            },
            {
              "id": "option-c",
              "text": "He offered practical care"
            },
            {
              "id": "option-d",
              "text": "He asked for a reward"
            }
          ],
          "correctOptionId": "option-c",
          "explanation": "His compassion became action through care, transport and support."
        },
        {
          "id": "kindness-3",
          "prompt": "Which action best reflects this lesson?",
          "options": [
            {
              "id": "option-a",
              "text": "Helping only close friends"
            },
            {
              "id": "option-b",
              "text": "Ignoring a person outside your group"
            },
            {
              "id": "option-c",
              "text": "Sharing someone’s difficulty as gossip"
            },
            {
              "id": "option-d",
              "text": "Listening and offering respectful help"
            }
          ],
          "correctOptionId": "option-d",
          "explanation": "Being a neighbour means showing mercy across boundaries, with respect for the person receiving help."
        }
      ]
    }
  ]
}$assessment$::jsonb;
begin
  select course_id, release_id into v_course, v_release
    from public.course_offerings
    where slug = 'faith-for-everyday-life' and is_development;
  if not found then raise exception 'development_course_not_found'; end if;

  -- Lock release before offering, matching the other privileged content imports.
  select snapshot, edition_number, is_available
    into v_snapshot, v_edition, v_available
    from course_library_private.course_releases
    where release_id = v_release and course_id = v_course for update;
  if not found or v_edition <> 1 or not v_available
    or v_snapshot is distinct from v_expected_snapshot then
    raise exception 'development_edition_changed_or_unavailable';
  end if;
  select release_id into v_current_release from public.course_offerings
    where course_id = v_course and slug = 'faith-for-everyday-life'
      and is_development and is_available for update;
  if not found or v_current_release is distinct from v_release then
    raise exception 'development_course_changed_or_unavailable';
  end if;

  select array_agg(l.value->>'id' order by m.position, l.position)
    into v_order
    from jsonb_array_elements(v_snapshot->'modules') with ordinality m(value, position),
      lateral jsonb_array_elements(m.value->'lessons') with ordinality l(value, position);
  if v_order is distinct from v_expected_order then
    raise exception 'development_lesson_order_changed';
  end if;
  if (select count(*) from course_library_private.course_lesson_readings
      where release_id = v_release and course_id = v_course) <> 4
    or exists (select 1 from unnest(v_expected_order) expected(lesson_id)
      where not exists (select 1 from course_library_private.course_lesson_readings r
        where r.release_id = v_release and r.course_id = v_course
          and r.lesson_id = expected.lesson_id and r.body->>'id' = expected.lesson_id)) then
    raise exception 'development_readings_incomplete';
  end if;
  if exists (select 1 from course_library_private.course_assessment_sets
    where release_id = v_release) then
    raise exception 'development_assessments_already_exist';
  end if;
  if not course_library_private.valid_assessment_snapshot(v_assessments)
    or jsonb_array_length(v_assessments->'lessons') <> 4
    or exists (select 1 from jsonb_array_elements(v_assessments->'lessons') a
      where jsonb_array_length(a->'questions') <> 3) then
    raise exception 'development_assessments_incomplete';
  end if;
  insert into course_library_private.course_assessment_sets(release_id, course_id, snapshot)
    values (v_release, v_course, v_assessments);
end;
$seed$;
