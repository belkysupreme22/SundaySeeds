import type { IconName } from '../../../shared/ui/Icon';
import type { Pastel } from '../../../shared/theme/tokens';
import type {
  BibleFamiliarity,
  LearningIntention,
  LearningInterest,
  SessionMinutes,
} from '../types';

export type LearningChoice<Value extends string | number = string | number> = {
  value: Value;
  label: string;
  description?: string;
  icon: IconName;
  tone: Pastel;
};

export const intentions: LearningChoice<LearningIntention>[] = [
  { value: 'explore_faith', label: 'Explore Christian faith', icon: 'compass', tone: 'lavender' },
  { value: 'understand_bible', label: 'Understand the Bible', icon: 'book-open', tone: 'mint' },
  { value: 'prayer_habit', label: 'Build a prayer habit', icon: 'sun', tone: 'yellow' },
  {
    value: 'daily_practice',
    label: 'Put faith into everyday practice',
    icon: 'heart',
    tone: 'peach',
  },
  { value: 'deeper_study', label: 'Deepen my Bible study', icon: 'search', tone: 'pink' },
  { value: 'browsing', label: 'Just browsing', icon: 'grid', tone: 'lavender' },
];

export const interests: LearningChoice<LearningInterest>[] = [
  {
    value: 'Faith',
    label: 'Faith',
    description: 'Trust and growth',
    icon: 'feather',
    tone: 'lavender',
  },
  { value: 'Prayer', label: 'Prayer', description: 'Make room for God', icon: 'sun', tone: 'mint' },
  {
    value: 'Kindness',
    label: 'Kindness',
    description: 'Compassion in action',
    icon: 'heart',
    tone: 'yellow',
  },
  {
    value: 'Courage',
    label: 'Courage',
    description: 'Meet challenges with faith',
    icon: 'shield',
    tone: 'peach',
  },
];

export const familiarities: LearningChoice<BibleFamiliarity>[] = [
  {
    value: 'new',
    label: "I'm new to it",
    description: 'A gentle place to begin',
    icon: 'feather',
    tone: 'mint',
  },
  {
    value: 'some',
    label: 'I know some stories and ideas',
    description: 'Build on familiar foundations',
    icon: 'book-open',
    tone: 'lavender',
  },
  {
    value: 'regular',
    label: 'I study it regularly',
    description: 'Keep exploring and reflecting',
    icon: 'search',
    tone: 'yellow',
  },
  {
    value: 'unsure',
    label: "I'm not sure",
    description: 'Explore at your own pace',
    icon: 'compass',
    tone: 'peach',
  },
];

export const sessionTimes: LearningChoice<SessionMinutes | 'flexible'>[] = [
  { value: 5, label: 'About 5 minutes', icon: 'clock', tone: 'mint' },
  { value: 10, label: 'About 10 minutes', icon: 'clock', tone: 'lavender' },
  { value: 15, label: 'About 15 minutes', icon: 'clock', tone: 'yellow' },
  { value: 20, label: 'About 20 minutes', icon: 'clock', tone: 'peach' },
  {
    value: 'flexible',
    label: 'It varies',
    description: 'No fixed session preference',
    icon: 'sun',
    tone: 'pink',
  },
];

export const questionPages = [
  {
    title: 'What would you like help with first?',
    subtitle: 'Start with what matters to you. Choose one, or keep exploring.',
    icon: 'compass',
    tone: 'lavender',
    note: 'You can revisit your learning intention in Settings.',
  },
  {
    title: 'What would you like to explore?',
    subtitle: 'Choose up to three topics that spark your curiosity.',
    icon: 'book-open',
    tone: 'mint',
    note: 'These topics are represented in the current sample course.',
  },
  {
    title: 'Where would you like to begin?',
    subtitle: 'How familiar are you with studying the Bible?',
    icon: 'feather',
    tone: 'yellow',
    note: 'There is no test here. Choose what feels closest to you.',
  },
  {
    title: 'What fits your day?',
    subtitle: 'How much time feels comfortable for one study session?',
    icon: 'clock',
    tone: 'peach',
    note: 'A session can be one lesson. Take any course at your own pace.',
  },
] satisfies { title: string; subtitle: string; icon: IconName; tone: Pastel; note: string }[];
