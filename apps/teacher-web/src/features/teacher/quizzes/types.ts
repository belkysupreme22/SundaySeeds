export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string | null;
  explanation: string;
}

export const MAX_QUIZ_QUESTIONS = 10;

export function getQuizIssues(questions: QuizQuestion[]): string[] {
  const issues: string[] = [];
  if (questions.length > MAX_QUIZ_QUESTIONS)
    issues.push("Use up to ten questions for this knowledge check.");
  questions.forEach((question, index) => {
    const label = `Question ${index + 1}`;
    if (!question.prompt.trim()) issues.push(`${label}: add the question.`);
    if (question.options.length < 2 || question.options.length > 4)
      issues.push(`${label}: use two to four answer options.`);
    const answers = question.options.map((option) =>
      option.text.trim().toLowerCase(),
    );
    if (answers.some((answer) => !answer))
      issues.push(`${label}: fill in every answer option.`);
    else if (new Set(answers).size !== answers.length)
      issues.push(`${label}: make each answer option different.`);
    if (
      !question.options.some((option) => option.id === question.correctOptionId)
    )
      issues.push(`${label}: choose one correct answer.`);
    if (!question.explanation.trim())
      issues.push(`${label}: explain the correct answer.`);
  });
  return issues;
}
