-- Intended SundaySeeds DEVELOPMENT project only. Explicit owner-approved metadata import.
-- No lesson bodies, questions, answer keys, enrollments, staff or learner history.
-- Joins stay closed. Production teaching/Scripture-rights approval remains pending.
do $seed$
declare
  v_course uuid := gen_random_uuid();
  v_release uuid := gen_random_uuid();
  v_metadata jsonb := $metadata${
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
begin
  if exists (select 1 from public.course_offerings where slug = 'faith-for-everyday-life') then
    raise exception 'development_course_already_exists';
  end if;
  insert into course_library_private.courses(course_id) values (v_course);
  insert into course_library_private.course_releases
    (release_id, course_id, edition_number, snapshot, is_available)
    values (v_release, v_course, 1, v_metadata, true);
  insert into public.course_offerings
    select * from jsonb_populate_record(null::public.course_offerings,
      v_metadata || jsonb_build_object(
        'course_id', v_course, 'release_id', v_release, 'offering_revision', 1,
        'is_listed', true, 'joins_open', false, 'is_available', true));
end;
$seed$;
