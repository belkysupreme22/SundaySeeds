import type { Lesson } from '../types';

export type { Lesson } from '../types';

// Original sample teaching material. Memory verses are brief KJV excerpts.
// A church teacher should review and adapt these lessons before real class use.
export const lessons: Lesson[] = [
  {
    id: 'good-samaritan',
    title: 'Love your neighbour',
    subtitle: 'Small acts. A big difference.',
    category: 'Kindness',
    scripture: 'Luke 10:25–37',
    durationMinutes: 8,
    color: 'lavender',
    intro:
      'Sample lesson · Explore the Good Samaritan and discover how everyday kindness can become love in action.',
    memoryVerse: {
      text: 'Thou shalt love thy neighbour as thyself.',
      reference: 'Matthew 22:39 · KJV excerpt',
    },
    sections: [
      {
        id: 'notice',
        title: 'Notice the person',
        body: 'Jesus told a story about a traveller who was attacked and left beside the road. Some people saw him and passed by. A Samaritan stopped. Compassion begins when we notice a person rather than treating their need as an interruption.\n\nReflect: Who might feel overlooked in your school, workplace or neighbourhood?',
      },
      {
        id: 'care',
        title: 'Put kindness into action',
        body: 'The Samaritan cared for the traveller’s wounds, brought him to a place of rest and arranged further help. His kindness involved practical steps. We cannot meet every need alone, but we can offer what we have and ask a trusted person to help.\n\nTry this: Think of one safe, practical way to support someone this week.',
      },
      {
        id: 'neighbour',
        title: 'Become a neighbour',
        body: 'Jesus turned the question from who counts as a neighbour to who acts like one. The Samaritan crossed a social boundary to show mercy. Love is not reserved for people who are already like us.\n\nTake it with you: Listen before judging. Offer help respectfully. Let the other person tell you what they need.',
      },
    ],
    questions: [
      {
        id: 'kindness-1',
        prompt: 'Who stopped to care for the injured traveller?',
        options: ['A passing merchant', 'The Samaritan', 'A soldier', 'An innkeeper on the road'],
        correctIndex: 1,
        explanation: 'The Samaritan stopped, cared for the traveller and arranged further help.',
      },
      {
        id: 'kindness-2',
        prompt: 'What made the Samaritan’s compassion visible?',
        options: [
          'He gave a long speech',
          'He waited for someone else',
          'He offered practical care',
          'He asked for a reward',
        ],
        correctIndex: 2,
        explanation: 'His compassion became action through care, transport and support.',
      },
      {
        id: 'kindness-3',
        prompt: 'Which action best reflects this lesson?',
        options: [
          'Helping only close friends',
          'Ignoring a person outside your group',
          'Sharing someone’s difficulty as gossip',
          'Listening and offering respectful help',
        ],
        correctIndex: 3,
        explanation:
          'Being a neighbour means showing mercy across boundaries, with respect for the person receiving help.',
      },
    ],
  },
  {
    id: 'david-and-goliath',
    title: 'Courage over fear',
    subtitle: 'Take the next faithful step.',
    category: 'Courage',
    scripture: '1 Samuel 17',
    durationMinutes: 7,
    color: 'yellow',
    intro:
      'Sample lesson · Meet David and reflect on courage, trust and using the gifts you already have.',
    memoryVerse: {
      text: 'What time I am afraid, I will trust in thee.',
      reference: 'Psalm 56:3 · KJV',
    },
    sections: [
      {
        id: 'fear',
        title: 'Name the challenge',
        body: 'Goliath frightened the army of Israel. David saw the same challenge, yet trusted that God had not abandoned them. Courage does not require pretending that a difficult situation is easy.\n\nReflect: What challenge feels bigger than your ability right now? Naming it can be the first step toward seeking help.',
      },
      {
        id: 'gifts',
        title: 'Use what you have',
        body: 'David remembered caring for his father’s sheep. He did not fight in armour that did not fit him. He went with skills he had practised and trust in God.\n\nReflect: Which gifts, habits or experiences could help you take a wise next step? You do not need to copy someone else’s strengths.',
      },
      {
        id: 'step',
        title: 'Choose wise courage',
        body: 'Everyday courage can mean telling the truth, apologising or asking for help. This story is not an invitation to take reckless risks or face danger alone. Faithful courage can include trusting a responsible adult or seeking support.\n\nTry this: Choose one honest, safe step toward a challenge you have been avoiding.',
      },
    ],
    questions: [
      {
        id: 'courage-1',
        prompt: 'What experience had helped prepare David?',
        options: ['Caring for sheep', 'Building ships', 'Leading a large army', 'Serving as king'],
        correctIndex: 0,
        explanation: 'David remembered his experience protecting his father’s sheep.',
      },
      {
        id: 'courage-2',
        prompt: 'Why is the detail about unfamiliar armour meaningful?',
        options: [
          'Preparation does not matter',
          'Everyone needs identical tools',
          'David used skills and tools familiar to him',
          'Help from others is always wrong',
        ],
        correctIndex: 2,
        explanation:
          'David chose tools he could use. We can develop and use our own gifts rather than imitate someone else.',
      },
      {
        id: 'courage-3',
        prompt: 'What is an example of wise courage today?',
        options: [
          'Taking a dangerous dare',
          'Asking for help with a difficult situation',
          'Pretending you never feel afraid',
          'Hiding every mistake',
        ],
        correctIndex: 1,
        explanation: 'Asking for help can be a courageous and responsible next step.',
      },
    ],
  },
  {
    id: 'a-life-of-prayer',
    title: 'A moment with God',
    subtitle: 'Make room for a little stillness.',
    category: 'Prayer',
    scripture: 'Matthew 6:5–13',
    durationMinutes: 6,
    color: 'mint',
    intro:
      'Sample lesson · Discover prayer as an honest conversation with God, starting with a quiet moment today.',
    memoryVerse: { text: 'Pray without ceasing.', reference: '1 Thessalonians 5:17 · KJV' },
    sections: [
      {
        id: 'honest',
        title: 'Start honestly',
        body: 'Jesus taught that prayer does not need to impress an audience. We can come to God with ordinary words and our real concerns. A quiet moment can help us pay attention, but there is no perfect place or polished speech required.\n\nReflect: What would you like to thank God for or ask about today?',
      },
      {
        id: 'pattern',
        title: 'Learn a helpful pattern',
        body: 'In the Lord’s Prayer, Jesus taught his followers to honour God, ask for daily needs, seek forgiveness and ask for guidance. This gives us a pattern without turning prayer into a performance.\n\nTry this: Name one thing you are thankful for, one need and one person you want to remember.',
      },
      {
        id: 'daily',
        title: 'Return through the day',
        body: 'Prayer can become part of daily life: before a decision, during a worry or after receiving kindness. We can also pause to listen and reflect. Prayer does not guarantee that events unfold exactly as we ask. It is a way to bring our lives before God.\n\nTake it with you: Choose one regular moment for a short, honest prayer this week.',
      },
    ],
    questions: [
      {
        id: 'prayer-1',
        prompt: 'What did Jesus teach about prayer?',
        options: [
          'It must impress other people',
          'Only long prayers count',
          'It can be sincere rather than a performance',
          'It requires special public words',
        ],
        correctIndex: 2,
        explanation: 'Jesus encouraged sincere prayer rather than praying to gain attention.',
      },
      {
        id: 'prayer-2',
        prompt: 'Which belongs in the pattern of the Lord’s Prayer?',
        options: [
          'Competing with others',
          'Asking for daily needs and forgiveness',
          'Demanding praise from others',
          'Avoiding every concern',
        ],
        correctIndex: 1,
        explanation:
          'Jesus included daily needs, forgiveness and guidance in the prayer he taught.',
      },
      {
        id: 'prayer-3',
        prompt: 'What is a practical way to begin a prayer habit?',
        options: [
          'Wait until life is perfect',
          'Use words you do not understand',
          'Compare your prayers with everyone else',
          'Choose a regular moment for an honest prayer',
        ],
        correctIndex: 3,
        explanation: 'A small, repeatable moment can help prayer become part of everyday life.',
      },
    ],
  },
  {
    id: 'faith-like-a-seed',
    title: 'Small seeds of faith',
    subtitle: 'Good things take time to grow.',
    category: 'Faith',
    scripture: 'Mark 4:30–32',
    durationMinutes: 5,
    color: 'peach',
    intro:
      'Sample lesson · Explore Jesus’ mustard seed picture and the value of small, faithful beginnings.',
    memoryVerse: {
      text: 'For we walk by faith, not by sight.',
      reference: '2 Corinthians 5:7 · KJV',
    },
    sections: [
      {
        id: 'small',
        title: 'Begin with something small',
        body: 'Jesus compared God’s kingdom to a mustard seed: something small that grows far beyond its beginning. His picture helps us notice that a modest beginning can still matter.\n\nReflect: Have you ever seen one small act of care lead to something bigger?',
      },
      {
        id: 'grow',
        title: 'Give growth time',
        body: 'A seed does not become a plant in a single afternoon. Learning and practising faith also take patience. Reading, asking honest questions, praying and learning alongside others can become steady habits.\n\nTry this: Choose one small practice you can return to this week, without comparing yourself with someone else.',
      },
      {
        id: 'shelter',
        title: 'Grow toward others',
        body: 'In Jesus’ picture, birds can find shelter in the branches. Growth is not only about becoming impressive; it can make room for others. A growing community can welcome people and offer care.\n\nTake it with you: Look for a simple way to make someone feel included this week.',
      },
    ],
    questions: [
      {
        id: 'faith-1',
        prompt: 'What did Jesus compare to a mustard seed in this passage?',
        options: ['God’s kingdom', 'A fishing boat', 'A temple gate', 'A treasure chest'],
        correctIndex: 0,
        explanation: 'In Mark 4, Jesus uses the mustard seed as a picture of God’s kingdom.',
      },
      {
        id: 'faith-2',
        prompt: 'What can the seed picture teach us about beginnings?',
        options: [
          'Only impressive starts matter',
          'Growth should happen instantly',
          'Small beginnings can matter',
          'Questions always prevent growth',
        ],
        correctIndex: 2,
        explanation:
          'The seed begins small yet grows. Faithful beginnings do not have to look impressive.',
      },
      {
        id: 'faith-3',
        prompt: 'Which action reflects growth that makes room for others?',
        options: [
          'Keeping newcomers outside your group',
          'Welcoming someone who feels left out',
          'Competing to look most important',
          'Refusing to listen',
        ],
        correctIndex: 1,
        explanation: 'Welcoming others reflects the image of branches offering shelter.',
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
