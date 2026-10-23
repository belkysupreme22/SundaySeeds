export type QuizFeedback = {
  optionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
};

export type ConnectedQuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  checkedAnswer: QuizFeedback | null;
};

export type QuizReceipt = {
  attemptId: string;
  courseId: string;
  releaseId: string;
  lessonId: string;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
  finishedAt: string;
};

export type ConnectedQuizAttempt = {
  attemptId: string;
  courseId: string;
  releaseId: string;
  lessonId: string;
  assessmentId: string;
  questions: ConnectedQuizQuestion[];
  receipt: QuizReceipt | null;
};

export type QuizFinish = { receipt: QuizReceipt; bestScorePercent: number };

export type CourseQuizProgress = {
  courseId: string;
  releaseId: string;
  available: boolean;
  assessmentAvailable: boolean;
  requiredCount: number | null;
  completedCount: number | null;
  completed: boolean | null;
  lessons: { lessonId: string; completed: boolean; bestScorePercent: number | null }[] | null;
};
