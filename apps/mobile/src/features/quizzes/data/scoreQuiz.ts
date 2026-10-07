import type { QuizQuestion } from '../../lessons/types';

export type QuizScore = { correct: number; total: number; percentage: number };

export function scoreQuiz(questions: QuizQuestion[], answers: (number | null)[]): QuizScore {
  if (questions.length === 0 || answers.length !== questions.length) {
    throw new Error('Answer every question before finishing the quiz.');
  }

  let correct = 0;
  questions.forEach((question, index) => {
    const answer = answers[index];
    if (
      typeof answer !== 'number' ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer >= question.options.length
    ) {
      throw new Error('Choose a valid answer for every question.');
    }
    if (answer === question.correctIndex) correct += 1;
  });

  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
  };
}
