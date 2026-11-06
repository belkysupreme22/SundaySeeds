import type { ImageSourcePropType } from 'react-native';
import { accentColors, brandColors } from '../../../shared/theme/tokens';
import type { IconName } from '../../../shared/ui/Icon';

export const welcomeAccentColors = {
  sage: brandColors.surfaceStrong,
  wheat: accentColors.wheat,
} as const;
type WelcomeAccent = keyof typeof welcomeAccentColors;

export type WelcomeSlide = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  icon: IconName;
  accent: WelcomeAccent;
  companionIcon: IconName;
  companionAccent: WelcomeAccent;
  featureTitle: string;
  featureDescription: string;
};

export const welcomeSlides: WelcomeSlide[] = [
  {
    title: 'Grow in faith.\nOne little step.',
    description:
      'Discover Bible stories, find a fresh perspective and make a little space for faith.',
    image: require('../../../../assets/onboarding/learn.jpg'),
    icon: 'book-open',
    accent: 'wheat',
    companionIcon: 'sun',
    companionAccent: 'sage',
    featureTitle: 'A little learning, anytime',
    featureDescription: 'Short lessons that fit into your day, at your own pace.',
  },
  {
    title: 'Carry Sunday\ninto your week.',
    description:
      'Read, reflect and practise. Take something meaningful from every lesson into everyday life.',
    image: require('../../../../assets/onboarding/live.jpg'),
    icon: 'heart',
    accent: 'sage',
    companionIcon: 'book-open',
    companionAccent: 'wheat',
    featureTitle: 'Small lessons. Everyday kindness.',
    featureDescription: 'Memory verses and gentle questions help the message stay with you.',
  },
  {
    title: 'See your little\nseeds grow.',
    description:
      'Save the lessons you love, revisit what you have learned and celebrate each step forward.',
    image: require('../../../../assets/onboarding/grow.jpg'),
    icon: 'sun',
    accent: 'sage',
    companionIcon: 'bookmark',
    companionAccent: 'wheat',
    featureTitle: 'Your own learning journey',
    featureDescription: 'Your reading progress and best quiz scores, all in one place.',
  },
];
