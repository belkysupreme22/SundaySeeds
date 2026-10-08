import type { LessonCategory } from '../types';
import type { IconName } from '../../../shared/ui/Icon';
import type { Pastel } from '../../../shared/theme/tokens';

type LessonTopic = {
  name: LessonCategory;
  icon: IconName;
  tone: Pastel;
  description: string;
};

export const lessonTopics: readonly LessonTopic[] = [
  {
    name: 'Faith',
    icon: 'sun',
    tone: 'lavender',
    description: 'Small steps in trusting God and growing in faith.',
  },
  {
    name: 'Kindness',
    icon: 'heart',
    tone: 'yellow',
    description: 'Discover everyday ways to love your neighbour.',
  },
  {
    name: 'Courage',
    icon: 'shield',
    tone: 'mint',
    description: 'Find courage to take your next faithful step.',
  },
  {
    name: 'Prayer',
    icon: 'message-circle',
    tone: 'peach',
    description: 'Make space to talk with God and listen.',
  },
];

export function getLessonTopic(name?: string) {
  return lessonTopics.find((topic) => topic.name === name);
}
