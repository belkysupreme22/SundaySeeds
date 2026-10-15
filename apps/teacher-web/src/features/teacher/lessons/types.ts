import type { QuizQuestion } from "../quizzes/types";

export interface LessonSection {
  id: string;
  title: string;
  body: string;
}

export interface LessonImage {
  src: string;
  alt: string;
  name: string;
}

export interface LessonContent {
  title: string;
  scripture: string;
  outcomes: string[];
  sections: LessonSection[];
  reflection: string;
  image?: LessonImage;
  quiz?: QuizQuestion[];
}

export interface LessonDraft extends LessonContent {
  id: string;
  example?: boolean;
}
