-- Explicit content import for sundayseeds-dev only. Run manually, never as a migration.
-- New edition-1 offerings for multi-course review. No learners or history are created.
-- The entire import fails on a duplicate slug. Teaching review is pending.
do $seed$
declare
  v_course jsonb;
  v_metadata jsonb;
  v_course_id uuid;
  v_release_id uuid;
  v_courses constant jsonb := $courses$
[
  {
    "metadata": {
      "slug": "read-scripture-with-attention",
      "title": "Read Scripture with attention",
      "summary": "Learn to slow down with a Gospel passage, notice what the writer emphasizes, and carry one clear insight into the week. Bring a Bible in whichever translation you normally read.",
      "topics": [
        "Scripture",
        "Reflection",
        "Daily life",
        "Faith"
      ],
      "outcomes": [
        "Separate observations about a passage from questions about its meaning.",
        "Use the surrounding verses to check an interpretation.",
        "Choose one response that follows from the passage."
      ],
      "audience": "Adults who want a simple way to begin reading Scripture on their own or in a small group.",
      "level": "Beginner",
      "learning_goals": [
        "understand_bible",
        "daily_practice"
      ],
      "language": "English",
      "is_development": true,
      "estimated_minutes": 7,
      "estimate_basis": "reading",
      "modules": [
        {
          "id": "a-slower-reading",
          "title": "Read, notice, respond",
          "lessons": [
            {
              "id": "notice-what-happens",
              "title": "Notice what happens",
              "scripture": "Luke 24:13–35",
              "estimatedMinutes": 4
            },
            {
              "id": "carry-it-into-the-day",
              "title": "Carry it into the day",
              "scripture": "James 1:19–27",
              "estimatedMinutes": 3
            }
          ]
        }
      ]
    },
    "joinsOpen": true,
    "readings": [
      {
        "id": "notice-what-happens",
        "title": "Notice what happens",
        "scripture": "Luke 24:13–35",
        "estimatedMinutes": 4,
        "subtitle": "Start with what the passage actually says.",
        "intro": "Two disciples are walking away from Jerusalem when a stranger joins them. Read their conversation once for the story, then read it again to notice where their understanding changes.",
        "outcomes": [
          {
            "title": "Observe the passage",
            "description": "Distinguish what the text says from questions it raises."
          }
        ],
        "memoryVerse": {
          "text": "Paraphrase: Jesus showed the travelers how the Scriptures pointed to him.",
          "reference": "Luke 24:27"
        },
        "sections": [
          {
            "id": "read-the-scene",
            "title": "Read the whole scene",
            "body": "Read Luke 24:13–35 before settling on a favorite line. Notice who is speaking at the beginning, what the two disciples are trying to make sense of, and how their journey ends. Read slowly enough to follow the change between their walk away from Jerusalem and their return."
          },
          {
            "id": "sort-your-notes",
            "title": "Separate a detail from a question",
            "body": "Try keeping two short lists. In the first, write details you can point to in the passage, such as the disciples returning to Jerusalem. In the second, write questions the details raise, such as why the disciples do not recognize Jesus immediately. A good question can stay open while you read again."
          },
          {
            "id": "take-it-with-you",
            "title": "Take it with you",
            "body": "What changes in the disciples between the beginning and the end of the scene?\n\nWhat detail would you bring up if you were reading this passage with a friend?"
          }
        ]
      },
      {
        "id": "carry-it-into-the-day",
        "title": "Carry it into the day",
        "scripture": "James 1:19–27",
        "estimatedMinutes": 3,
        "subtitle": "Choose a response grounded in the passage.",
        "intro": "James connects listening to God’s word with the way people speak and act. Read the paragraph as a whole, then choose one practice you can try in an ordinary moment.",
        "outcomes": [
          {
            "title": "Choose a response",
            "description": "Use the passage to plan one specific action."
          }
        ],
        "memoryVerse": {
          "text": "Paraphrase: Put the word into practice after hearing it.",
          "reference": "James 1:22"
        },
        "sections": [
          {
            "id": "follow-the-thread",
            "title": "Follow the thread",
            "body": "Read James 1:19–27 and look for the connections between listening, speech, and action. The picture of looking in a mirror and then walking away helps explain the gap between noticing something and doing anything about it. The later verses give concrete examples of how that gap shows up in everyday conduct."
          },
          {
            "id": "choose-one-response",
            "title": "Make the response specific",
            "body": "Choose an action you can remember at the right moment. If the instruction to listen is the one you want to practice, try letting someone finish a thought before you answer in your next conversation. Later, ask yourself when it helped and when it was difficult. A small practice gives you something specific to reflect on when you reread the passage."
          },
          {
            "id": "take-it-with-you",
            "title": "Take it with you",
            "body": "Which instruction in the passage would change an ordinary conversation for you?\n\nWhen can you try your response, and what will remind you?"
          }
        ]
      }
    ],
    "assessment": {
      "schemaVersion": 1,
      "lessons": [
        {
          "lessonId": "notice-what-happens",
          "assessmentId": "knowledge-check-notice-what-happens",
          "questions": [
            {
              "id": "question-1",
              "prompt": "Which note is an observation you can check in the passage?",
              "options": [
                {
                  "id": "option-1",
                  "text": "The disciples disliked the road they were walking."
                },
                {
                  "id": "option-2",
                  "text": "The disciples returned to Jerusalem."
                },
                {
                  "id": "option-3",
                  "text": "The disciples planned the conversation before they left."
                }
              ],
              "correctOptionId": "option-2",
              "explanation": "The disciples’ return to Jerusalem is part of the story. Claims about why they reacted a certain way would need further support."
            },
            {
              "id": "question-2",
              "prompt": "When a question about the story remains open, what is a useful first step?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Read the surrounding verses again and look for clues."
                },
                {
                  "id": "option-2",
                  "text": "Choose whichever explanation sounds most familiar."
                },
                {
                  "id": "option-3",
                  "text": "Treat your first impression as something the passage directly states."
                }
              ],
              "correctOptionId": "option-1",
              "explanation": "Reading the details around the question may clarify it. You can also keep the question open if the passage leaves it unanswered."
            }
          ]
        },
        {
          "lessonId": "carry-it-into-the-day",
          "assessmentId": "knowledge-check-carry-it-into-the-day",
          "questions": [
            {
              "id": "question-1",
              "prompt": "What is the purpose of the mirror image in this reading?",
              "options": [
                {
                  "id": "option-1",
                  "text": "It explains how to memorize a passage."
                },
                {
                  "id": "option-2",
                  "text": "It shows that other people should point out all our mistakes."
                },
                {
                  "id": "option-3",
                  "text": "It illustrates how easily a person can notice something and then do nothing with it."
                }
              ],
              "correctOptionId": "option-3",
              "explanation": "James compares hearing without acting to seeing your reflection and quickly forgetting what you saw."
            },
            {
              "id": "question-2",
              "prompt": "Which response makes the lesson easiest to practice and review?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Think generally about becoming a better listener."
                },
                {
                  "id": "option-2",
                  "text": "Let someone finish before replying in the next conversation."
                },
                {
                  "id": "option-3",
                  "text": "Wait until there are no distractions to practice listening."
                }
              ],
              "correctOptionId": "option-2",
              "explanation": "A specific action tied to a real situation gives you a clear chance to practice listening and consider how it went."
            }
          ]
        }
      ]
    }
  },
  {
    "metadata": {
      "slug": "mercy-in-practice",
      "title": "Mercy in practice",
      "summary": "Turn concern into practical care. Learn to ask what would genuinely help, offer something you can follow through on, and share responsibility when a need is bigger than one person can meet.",
      "topics": [
        "Mercy",
        "Service",
        "Community",
        "Kindness"
      ],
      "outcomes": [
        "Offer practical help in a way that respects a person's choices.",
        "Make a clear commitment and communicate if plans change.",
        "Recognize when a need calls for shared support."
      ],
      "audience": "Adults who want to practice everyday service at home, in church, or in their neighborhood.",
      "level": "Everyday practice",
      "learning_goals": [
        "daily_practice"
      ],
      "language": "English",
      "is_development": true,
      "estimated_minutes": 7,
      "estimate_basis": "reading",
      "modules": [
        {
          "id": "care-that-follows-through",
          "title": "Care that follows through",
          "lessons": [
            {
              "id": "ask-what-would-help",
              "title": "Ask what would help",
              "scripture": "James 2:14–18",
              "estimatedMinutes": 4
            },
            {
              "id": "share-the-load",
              "title": "Share the load",
              "scripture": "Galatians 6:1–5",
              "estimatedMinutes": 3
            }
          ]
        }
      ]
    },
    "joinsOpen": true,
    "readings": [
      {
        "id": "ask-what-would-help",
        "title": "Ask what would help",
        "scripture": "James 2:14–18",
        "estimatedMinutes": 4,
        "subtitle": "Pair kind words with something useful.",
        "intro": "James describes a person who needs food or clothing and is offered only good wishes. Read the passage, then consider how an offer of help can respond to a real need while respecting the person’s choices.",
        "outcomes": [
          {
            "title": "Make a respectful offer",
            "description": "Ask what would help and make a commitment you can keep."
          }
        ],
        "memoryVerse": {
          "text": "Paraphrase: Good wishes alone do not feed or clothe someone in need.",
          "reference": "James 2:15–16"
        },
        "sections": [
          {
            "id": "hear-the-need",
            "title": "Listen before making a plan",
            "body": "A neighbor mentions that a family member is ill. You might think they need a meal, a ride, or someone to cover a regular task. Ask which would be useful before you make arrangements. A specific offer makes it easier for the person to answer without having to organize the whole plan themselves."
          },
          {
            "id": "offer-a-real-choice",
            "title": "Offer something you can deliver",
            "body": "Try an offer that fits both the need and your capacity: “I can pick up groceries on Thursday. Would that help?” Let the person decline or suggest another option. If they accept, agree on the details and follow through. If your plans change, tell them early enough to make another arrangement."
          },
          {
            "id": "take-it-with-you",
            "title": "Take it with you",
            "body": "Think of a recent good wish you expressed. Was there a practical offer that would have been welcome?\n\nWhat useful commitment could you make this week and reliably keep?"
          }
        ]
      },
      {
        "id": "share-the-load",
        "title": "Share the load",
        "scripture": "Galatians 6:1–5",
        "estimatedMinutes": 3,
        "subtitle": "Give steady help without taking over.",
        "intro": "Paul puts mutual care alongside personal responsibility. Read the two ideas together as you consider how to support someone whose needs will take more than one afternoon.",
        "outcomes": [
          {
            "title": "Share responsibility",
            "description": "Plan dependable support with the person receiving it."
          }
        ],
        "memoryVerse": {
          "text": "Paraphrase: Help carry one another’s burdens as a way of living out Christ’s teaching.",
          "reference": "Galatians 6:2"
        },
        "sections": [
          {
            "id": "carry-it-together",
            "title": "Recognize what can be shared",
            "body": "Suppose someone needs a weekly ride while they recover from surgery. One ride may be within your reach. Providing every ride for two months may be difficult. With the person's agreement, ask whether a small group could divide the dates. Give each helper a clear task and make sure the person receiving help knows whom to expect."
          },
          {
            "id": "keep-the-person-involved",
            "title": "Review the plan together",
            "body": "A plan that worked last week may need to change as a person recovers or their schedule shifts. Check in before extending the arrangement. Share only the details the person has agreed to share. Let them decide what help they still want, and be honest about which commitments the group can continue."
          },
          {
            "id": "take-it-with-you",
            "title": "Take it with you",
            "body": "Where could a shared commitment be steadier than trying to do everything yourself?\n\nWhat would you ask before involving another person in a plan to help?"
          }
        ]
      }
    ],
    "assessment": {
      "schemaVersion": 1,
      "lessons": [
        {
          "lessonId": "ask-what-would-help",
          "assessmentId": "knowledge-check-ask-what-would-help",
          "questions": [
            {
              "id": "question-1",
              "prompt": "A neighbor has a difficult week ahead. Which offer leaves them room to choose?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Tell them you’ll organize meals for the whole week before asking."
                },
                {
                  "id": "option-2",
                  "text": "Say you’ll be available at any time, even though your week is already full."
                },
                {
                  "id": "option-3",
                  "text": "Offer to bring dinner on Tuesday and ask whether that would be helpful."
                }
              ],
              "correctOptionId": "option-3",
              "explanation": "A clear, manageable offer gives the neighbor enough information to say yes, decline, or suggest a different arrangement."
            },
            {
              "id": "question-2",
              "prompt": "You can no longer deliver the groceries you promised. What should you do?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Tell them promptly and offer another arrangement you can keep."
                },
                {
                  "id": "option-2",
                  "text": "Wait until the next time you see them to explain."
                },
                {
                  "id": "option-3",
                  "text": "Ask someone else to take over without telling the neighbor."
                }
              ],
              "correctOptionId": "option-1",
              "explanation": "Early, honest communication respects the person who was counting on you and gives them time to plan."
            }
          ]
        },
        {
          "lessonId": "share-the-load",
          "assessmentId": "knowledge-check-share-the-load",
          "questions": [
            {
              "id": "question-1",
              "prompt": "What should you do before asking others to help with a recurring need?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Post the details in the church group chat to find volunteers."
                },
                {
                  "id": "option-2",
                  "text": "Ask the person for agreement and clarify which details you may share."
                },
                {
                  "id": "option-3",
                  "text": "Promise that the group can handle every date before checking."
                }
              ],
              "correctOptionId": "option-2",
              "explanation": "The person can decide whether they want more people involved and what information they are comfortable sharing."
            },
            {
              "id": "question-2",
              "prompt": "What makes a shared plan reliable over time?",
              "options": [
                {
                  "id": "option-1",
                  "text": "Let each helper assume someone else will cover missed dates."
                },
                {
                  "id": "option-2",
                  "text": "Keep the original plan indefinitely, even when the person's needs change."
                },
                {
                  "id": "option-3",
                  "text": "Agree on manageable tasks, communicate changes, and check in with the person."
                }
              ],
              "correctOptionId": "option-3",
              "explanation": "Clear responsibilities, manageable commitments, and a check-in make it easier to keep offering care as needs change."
            }
          ]
        }
      ]
    }
  },
  {
    "metadata": {
      "slug": "a-rhythm-of-gratitude",
      "title": "A rhythm of gratitude",
      "summary": "Explore ways to make thanksgiving part of an ordinary week, from noticing what sustains you to praying honestly when gratitude feels difficult.",
      "topics": [
        "Prayer",
        "Gratitude"
      ],
      "learning_goals": [
        "prayer_habit",
        "daily_practice"
      ],
      "outcomes": [
        "Recognise ordinary moments that can become occasions for thanksgiving.",
        "Plan a brief prayer practice that makes room for both gratitude and difficulty."
      ],
      "audience": "Adults who want to build a simple rhythm of prayer.",
      "language": "English",
      "level": "Beginner",
      "is_development": true,
      "estimated_minutes": null,
      "estimate_basis": null,
      "modules": [
        {
          "id": "notice-and-remember",
          "title": "Notice and remember",
          "lessons": [
            {
              "id": "remember-the-good",
              "title": "Remember the good",
              "scripture": "Psalm 103:1–5"
            },
            {
              "id": "give-thanks-in-prayer",
              "title": "Give thanks in prayer",
              "scripture": "Philippians 4:4–7"
            }
          ]
        },
        {
          "id": "build-a-rhythm",
          "title": "Build a rhythm",
          "lessons": [
            {
              "id": "make-room-for-thanks",
              "title": "Make room for thanks",
              "scripture": "1 Thessalonians 5:16–18"
            }
          ]
        }
      ]
    },
    "joinsOpen": false
  }
]
$courses$::jsonb;
begin
  if not exists (select 1 from public.course_offerings
      where slug = 'faith-for-everyday-life' and is_development) then
    raise exception 'expected_development_catalog_not_found';
  end if;

  for v_course in select value from jsonb_array_elements(v_courses) loop
    v_metadata := v_course->'metadata';
    v_course_id := gen_random_uuid();
    v_release_id := gen_random_uuid();

    insert into course_library_private.courses(course_id) values (v_course_id);
    insert into course_library_private.course_releases
      (release_id, course_id, edition_number, snapshot, is_available)
      values (v_release_id, v_course_id, 1, v_metadata, true);

    if (v_course->>'joinsOpen')::boolean then
      insert into course_library_private.course_lesson_readings (release_id, course_id, lesson_id, body)
        select v_release_id, v_course_id, reading->>'id', reading
        from jsonb_array_elements(v_course->'readings') as readings(reading);
      insert into course_library_private.course_assessment_sets (release_id, course_id, snapshot)
        values (v_release_id, v_course_id, v_course->'assessment');
    end if;

    -- Admission validates full reading coverage. Public metadata contains only the outline.
    insert into public.course_offerings
      select * from jsonb_populate_record(null::public.course_offerings,
        v_metadata || jsonb_build_object(
          'course_id', v_course_id, 'release_id', v_release_id, 'offering_revision', 1,
          'is_listed', true, 'joins_open', v_course->'joinsOpen', 'is_available', true));
  end loop;
end;
$seed$;
