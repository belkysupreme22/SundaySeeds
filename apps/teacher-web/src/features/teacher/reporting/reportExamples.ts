export type LearningState = "not-started" | "reading" | "completed";
export interface ReportLesson {
  id: string;
  title: string;
}
export interface ReportCourse {
  id: string;
  title: string;
  lessons: ReportLesson[];
}
export interface ReportLearner {
  id: string;
  name: string;
}
export interface ReportClass {
  id: string;
  title: string;
  courseIds: string[];
  learners: ReportLearner[];
}
export interface ProgressRecord {
  learnerId: string;
  lessonId: string;
  state: LearningState;
  bestScore: number | null;
}

export const reportCourses: ReportCourse[] = [
  {
    id: "faith",
    title: "Faith in Everyday Life",
    lessons: [
      { id: "kindness", title: "The Good Samaritan" },
      { id: "forgiveness", title: "Practising forgiveness" },
      { id: "prayer", title: "A daily rhythm of prayer" },
    ],
  },
  {
    id: "hope",
    title: "Growing in hope",
    lessons: [
      { id: "hope-reading", title: "Finding hope in scripture" },
      { id: "hope-practice", title: "Practising encouragement" },
    ],
  },
];
export const reportClasses: ReportClass[] = [
  {
    id: "sunday",
    title: "Sunday discussion",
    courseIds: ["faith"],
    learners: [
      { id: "a", name: "Example learner A" },
      { id: "b", name: "Example learner B" },
      { id: "c", name: "Example learner C" },
      { id: "d", name: "Example learner D" },
    ],
  },
  {
    id: "new-group",
    title: "New group · recorded zero",
    courseIds: ["hope"],
    learners: [
      { id: "e", name: "Example learner E" },
      { id: "f", name: "Example learner F" },
    ],
  },
  {
    id: "unavailable",
    title: "Evening group · missing data",
    courseIds: ["faith", "hope"],
    learners: [
      { id: "g", name: "Example learner G" },
      { id: "h", name: "Example learner H" },
    ],
  },
];
export const progressRecords: ProgressRecord[] = [
  { learnerId: "a", lessonId: "kindness", state: "completed", bestScore: 100 },
  {
    learnerId: "a",
    lessonId: "forgiveness",
    state: "completed",
    bestScore: 50,
  },
  { learnerId: "a", lessonId: "prayer", state: "completed", bestScore: 100 },
  { learnerId: "b", lessonId: "kindness", state: "completed", bestScore: 0 },
  {
    learnerId: "b",
    lessonId: "forgiveness",
    state: "reading",
    bestScore: null,
  },
  { learnerId: "b", lessonId: "prayer", state: "not-started", bestScore: null },
  { learnerId: "c", lessonId: "kindness", state: "reading", bestScore: null },
  {
    learnerId: "c",
    lessonId: "forgiveness",
    state: "not-started",
    bestScore: null,
  },
  { learnerId: "c", lessonId: "prayer", state: "not-started", bestScore: null },
  { learnerId: "d", lessonId: "kindness", state: "completed", bestScore: null },
  // D's other two states are deliberately unavailable, rather than not started.
  {
    learnerId: "e",
    lessonId: "hope-reading",
    state: "not-started",
    bestScore: null,
  },
  {
    learnerId: "e",
    lessonId: "hope-practice",
    state: "not-started",
    bestScore: null,
  },
  {
    learnerId: "f",
    lessonId: "hope-reading",
    state: "not-started",
    bestScore: null,
  },
  {
    learnerId: "f",
    lessonId: "hope-practice",
    state: "not-started",
    bestScore: null,
  },
];

export const stateLabels: Record<LearningState, string> = {
  "not-started": "Not started",
  reading: "Reading",
  completed: "Finished check",
};
export function findRecord(learnerId: string, lessonId: string) {
  return progressRecords.find(
    (record) => record.learnerId === learnerId && record.lessonId === lessonId,
  );
}
export function summarize(learners: ReportLearner[], lessons: ReportLesson[]) {
  const records = learners.flatMap((learner) =>
    lessons.flatMap((lesson) => {
      const record = findRecord(learner.id, lesson.id);
      return record ? [record] : [];
    }),
  );
  const assigned = learners.length * lessons.length;
  const completed = records.filter(
    (record) => record.state === "completed",
  ).length;
  return {
    assigned,
    known: records.length,
    missing: assigned - records.length,
    completed,
    reading: records.filter((record) => record.state === "reading").length,
    notStarted: records.filter((record) => record.state === "not-started")
      .length,
    rate: records.length
      ? Math.round((completed / records.length) * 100)
      : null,
  };
}
