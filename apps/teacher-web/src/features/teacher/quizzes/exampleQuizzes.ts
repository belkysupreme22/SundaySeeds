import type { QuizQuestion } from "./types";

export const exampleQuizzes: Record<string, QuizQuestion[]> = {
  "sample-course-neighbour": [
    {
      id: "neighbour-check-1",
      prompt: "What made the Samaritan a neighbour to the injured traveller?",
      options: [
        {
          id: "neighbour-1-a",
          text: "He noticed the need and offered practical care.",
        },
        { id: "neighbour-1-b", text: "He knew the traveller personally." },
        {
          id: "neighbour-1-c",
          text: "He left the responsibility to someone else.",
        },
      ],
      correctOptionId: "neighbour-1-a",
      explanation:
        "The Samaritan stopped, cared for the traveller and arranged further help. Compassion became a practical response to someone's need.",
    },
    {
      id: "neighbour-check-2",
      prompt:
        "Which action puts this lesson into practice during an ordinary week?",
      options: [
        {
          id: "neighbour-2-a",
          text: "Wait for a special occasion to show kindness.",
        },
        {
          id: "neighbour-2-b",
          text: "Make time to listen and offer useful help to someone in need.",
        },
        {
          id: "neighbour-2-c",
          text: "Assume another person will notice and help.",
        },
      ],
      correctOptionId: "neighbour-2-b",
      explanation:
        "Being a neighbour can begin with attention, listening and a small thoughtful action. The lesson invites care in everyday situations.",
    },
  ],
  "sample-course-forgiveness": [
    {
      id: "forgiveness-check-1",
      prompt: "What can a thoughtful step towards forgiveness include?",
      options: [
        {
          id: "forgiveness-1-a",
          text: "Ignoring harm and removing every boundary.",
        },
        {
          id: "forgiveness-1-b",
          text: "Responding with compassion while keeping wise boundaries.",
        },
        {
          id: "forgiveness-1-c",
          text: "Pretending difficult feelings never happened.",
        },
      ],
      correctOptionId: "forgiveness-1-b",
      explanation:
        "The reading connects patience and compassion with thoughtful action. Forgiveness may take time and does not require ignoring harm or abandoning wise boundaries.",
    },
  ],
  "sample-course-prayer": [
    {
      id: "prayer-check-1",
      prompt: "Which practice could help create a daily rhythm of prayer?",
      options: [
        {
          id: "prayer-1-a",
          text: "Choose a quiet moment for gratitude, concerns and remembering others.",
        },
        {
          id: "prayer-1-b",
          text: "Pray only when every concern has already been resolved.",
        },
        {
          id: "prayer-1-c",
          text: "Wait until there is enough time for a perfect routine.",
        },
      ],
      correctOptionId: "prayer-1-a",
      explanation:
        "A small regular moment makes room to bring gratitude and concerns to God and remember others. The lesson encourages a simple rhythm within ordinary days.",
    },
  ],
};
