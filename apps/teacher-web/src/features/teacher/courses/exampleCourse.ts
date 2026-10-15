import type { LessonDraft } from "../DraftEditor";
import type { CourseOutline } from "./useCourseOutlines";

export const exampleCourseLessons: LessonDraft[] = [
  {
    id: "sample-course-neighbour",
    example: true,
    title: "The Good Samaritan",
    scripture: "Luke 10:25–37",
    body: "Jesus describes a traveller who receives help from an unexpected neighbour. The Samaritan notices his need, stops and offers practical care.\n\nBeing a neighbour begins with attention. This week, consider who needs your time, your listening or your help.",
    reflection: "Who could you make time for this week?",
  },
  {
    id: "sample-course-forgiveness",
    example: true,
    title: "Practising forgiveness",
    scripture: "Colossians 3:12–14",
    body: "Compassion, kindness and patience shape how we live together. Forgiveness invites us to respond thoughtfully when relationships are difficult.\n\nReflect on a small step towards peace. Forgiveness can take time and does not mean ignoring harm or abandoning wise boundaries.",
    reflection: "What could a patient and compassionate response look like?",
  },
  {
    id: "sample-course-prayer",
    example: true,
    title: "A daily rhythm of prayer",
    scripture: "Philippians 4:6–7",
    body: "Prayer gives us space to bring our concerns and gratitude to God. It can become a simple rhythm woven into ordinary days.\n\nChoose a quiet moment. Name something you are thankful for, something that concerns you and someone you want to remember in prayer.",
    reflection: "When could you make a little space for prayer each day?",
  },
];

export function createExampleCourse(): CourseOutline {
  return {
    id: "sample-faith-course",
    example: true,
    title: "Faith in Everyday Life",
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
