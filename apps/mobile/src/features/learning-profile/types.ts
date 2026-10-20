export type LearningIntention =
  | 'explore_faith'
  | 'understand_bible'
  | 'prayer_habit'
  | 'daily_practice'
  | 'deeper_study'
  | 'browsing';
export type LearningInterest = 'Faith' | 'Prayer' | 'Kindness' | 'Courage';
export type BibleFamiliarity = 'new' | 'some' | 'regular' | 'unsure';
export type SessionMinutes = 5 | 10 | 15 | 20;

export type LearningPreferencesDraft = {
  intention: LearningIntention | null;
  interests: LearningInterest[];
  familiarity: BibleFamiliarity | null;
  sessionMinutes: SessionMinutes | null;
};

export type LearningPreferences = LearningPreferencesDraft & {
  userId: string;
  setupStatus: 'completed' | 'dismissed';
  revision: number;
  updatedAt: string;
};

export const emptyLearningPreferences: LearningPreferencesDraft = {
  intention: null,
  interests: [],
  familiarity: null,
  sessionMinutes: null,
};
