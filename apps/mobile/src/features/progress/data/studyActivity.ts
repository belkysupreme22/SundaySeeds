const millisecondsPerDay = 86_400_000;
const daysPerWeek = 7;

export const weeklyStudyGoal = 2;

export const studyBadgeThresholds = {
  weekly: [1, 3, 6],
  streak: [3, 7, 14],
  days: [3, 7, 14, 30],
  review: [1, 3, 5],
} as const;

export type PersonalBest = {
  lessonId: string;
  previousScore: number;
  score: number;
};

export type StudyActivity = {
  days: number[];
  firstDayByLesson: Record<string, number>;
  reviewedLessonIds: string[];
  improvedLessonIds: string[];
  personalBest: PersonalBest | null;
};

export function emptyStudyActivity(): StudyActivity {
  return {
    days: [],
    firstDayByLesson: {},
    reviewedLessonIds: [],
    improvedLessonIds: [],
    personalBest: null,
  };
}

function localDay(date: Date): number {
  // Map the local calendar date to an integer. Consecutive dates stay one apart
  // even when the actual time between local midnights is 23 or 25 hours.
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / millisecondsPerDay;
}

function monday(day: number): number {
  // The first UTC calendar day of 1970 was a Thursday.
  const weekday = (((day + 3) % daysPerWeek) + daysPerWeek) % daysPerWeek;
  return day - weekday;
}

export function recordStudyCompletion(
  activity: StudyActivity,
  lessonId: string,
  previousScore: number | null,
  score: number,
  now = new Date(),
): StudyActivity {
  const day = localDay(now);
  const firstDay = activity.firstDayByLesson[lessonId];
  const review = firstDay !== undefined && day > firstDay;
  const improved = previousScore !== null && score > previousScore;

  return {
    days: activity.days.includes(day) ? activity.days : [...activity.days, day],
    firstDayByLesson:
      firstDay === undefined
        ? { ...activity.firstDayByLesson, [lessonId]: day }
        : activity.firstDayByLesson,
    reviewedLessonIds:
      review && !activity.reviewedLessonIds.includes(lessonId)
        ? [...activity.reviewedLessonIds, lessonId]
        : activity.reviewedLessonIds,
    improvedLessonIds:
      improved && !activity.improvedLessonIds.includes(lessonId)
        ? [...activity.improvedLessonIds, lessonId]
        : activity.improvedLessonIds,
    personalBest: improved ? { lessonId, previousScore, score } : activity.personalBest,
  };
}

function summarizeRuns(
  periods: number[],
  interval: number,
  activeThrough: number,
  countActivePeriod = true,
) {
  let previous: number | undefined;
  let run = 0;
  let current = 0;
  let longest = 0;
  for (const period of periods) {
    run = previous === period - interval ? run + 1 : 1;
    longest = Math.max(longest, run);
    if (period === activeThrough - interval || (countActivePeriod && period === activeThrough)) {
      current = run;
    }
    previous = period;
  }
  return { current, longest };
}

export function getStudyBadgeProgress(activity: StudyActivity, now = new Date()) {
  const today = localDay(now);
  const thisWeek = monday(today);
  const days = [...activity.days].sort((a, b) => a - b);
  const weeks = new Map<number, number>();
  let daysThisWeek = 0;

  for (const day of days) {
    const week = monday(day);
    weeks.set(week, (weeks.get(week) ?? 0) + 1);
    if (week === thisWeek && day <= today) ++daysThisWeek;
  }

  const qualifyingWeeks = [...weeks]
    .filter(([, count]) => count >= weeklyStudyGoal)
    .map(([week]) => week);
  // A current run can still be extended today or during this unfinished week.
  const daily = summarizeRuns(days, 1, today);
  const weekly = summarizeRuns(
    qualifyingWeeks,
    daysPerWeek,
    thisWeek,
    daysThisWeek >= weeklyStudyGoal,
  );

  return {
    studyDays: days.length,
    daysThisWeek,
    currentStreak: daily.current,
    longestStreak: daily.longest,
    currentWeeklyStreak: weekly.current,
    longestWeeklyStreak: weekly.longest,
    reviewedLessons: activity.reviewedLessonIds.length,
    improvedLessons: activity.improvedLessonIds.length,
    personalBest: activity.personalBest,
  };
}
