import type { LessonDraft } from "../DraftEditor";
import type { CourseOutline } from "./useCourseOutlines";
import { exampleQuizzes } from "../quizzes/exampleQuizzes";

export const exampleCourseLessons: LessonDraft[] = [
  {
    id: "sample-course-neighbour",
    quiz: exampleQuizzes["sample-course-neighbour"],
    example: true,
    title: "The Good Samaritan",
    scripture: "Luke 10:25–37",
    outcomes: [
      "Recognise compassion through the Samaritan's actions",
      "Plan one practical way to care for a neighbour",
    ],
    sections: [
      {
        id: "neighbour-reading",
        title: "Compassion that notices",
        body: "Jesus describes a traveller who receives help from an unexpected neighbour. The Samaritan notices his need, stops and offers practical care.",
      },
      {
        id: "neighbour-practice",
        title: "Respond in everyday life",
        body: "Being a neighbour begins with attention. This week, consider who needs your time, your listening or your help.",
      },
    ],
    reflection: "Who could you make time for this week?",
  },
  {
    id: "sample-course-forgiveness",
    quiz: exampleQuizzes["sample-course-forgiveness"],
    example: true,
    title: "Practising forgiveness",
    scripture: "Colossians 3:12–14",
    outcomes: [
      "Describe a compassionate response to conflict",
      "Reflect on a thoughtful step towards peace",
    ],
    sections: [
      {
        id: "forgiveness-reading",
        title: "Respond with compassion",
        body: "Compassion, kindness and patience shape how we live together. Forgiveness invites us to respond thoughtfully when relationships are difficult.",
      },
      {
        id: "forgiveness-practice",
        title: "Take a thoughtful step",
        body: "Reflect on a small step towards peace. Forgiveness can take time and does not mean ignoring harm or abandoning wise boundaries.",
      },
    ],
    reflection: "What could a patient and compassionate response look like?",
  },
  {
    id: "sample-course-prayer",
    quiz: exampleQuizzes["sample-course-prayer"],
    example: true,
    title: "A daily rhythm of prayer",
    scripture: "Philippians 4:6–7",
    outcomes: [
      "Connect prayer with gratitude and everyday concerns",
      "Choose a regular moment for prayer",
    ],
    sections: [
      {
        id: "prayer-reading",
        title: "Make space for prayer",
        body: "Prayer gives us space to bring our concerns and gratitude to God. It can become a simple rhythm woven into ordinary days.",
      },
      {
        id: "prayer-practice",
        title: "Begin a daily rhythm",
        body: "Choose a quiet moment. Name something you are thankful for, something that concerns you and someone you want to remember in prayer.",
      },
    ],
    reflection: "When could you make a little space for prayer each day?",
  },
];

export function createExampleCourse(): CourseOutline {
  return {
    id: "sample-faith-course",
    example: true,
    title: "Faith in Everyday Life",
    audience: "Adult learners exploring faith in everyday situations",
    outcomes: [
      "Practise compassion and forgiveness in daily relationships",
      "Build a thoughtful daily rhythm of prayer",
    ],
    summary:
      "Explore practical ways to love others and build a daily rhythm of faith. This example has two modules and three editable lesson drafts.",
    modules: [
      {
        id: "sample-module-love",
        title: "Loving Others",
        lessonIds: ["sample-course-neighbour", "sample-course-forgiveness"],
      },
      {
        id: "sample-module-faith",
        title: "Growing in Faith",
        lessonIds: ["sample-course-prayer"],
      },
    ],
  };
}
