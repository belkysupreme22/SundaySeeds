export type LessonCategory = 'Faith' | 'Kindness' | 'Courage' | 'Prayer';
export type LessonColor = 'lavender' | 'mint' | 'peach' | 'yellow';

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  category: LessonCategory;
  scripture: string;
  durationMinutes: number;
  color: LessonColor;
  intro: string;
  memoryVerse: { text: string; reference: string };
  sections: { id: string; title: string; body: string }[];
  questions: QuizQuestion[];
};
