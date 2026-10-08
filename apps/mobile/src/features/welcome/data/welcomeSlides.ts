import type { ImageSourcePropType } from 'react-native';
import type { Pastel } from '../../../shared/theme/tokens';
import type { IconName } from '../../../shared/ui/Icon';

type WelcomeSlide = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  icon: IconName;
  accent: Pastel;
  featureTitle: string;
  featureDescription: string;
};

export const welcomeSlides: WelcomeSlide[] = [
  {
    title: 'Grow in faith.\nOne little step.',
    description:
      'Discover Bible stories, find a fresh perspective and make a little space for faith.',
    image: require('../../../../assets/legacy/onboarding_learn.png'),
    icon: 'book-open',
    accent: 'yellow',
    featureTitle: 'A little learning, anytime',
    featureDescription: 'Short lessons that fit into your day, at your own pace.',
  },
  {
    title: 'Carry Sunday\ninto your week.',
    description:
      'Read, reflect and practise. Take something meaningful from every lesson into everyday life.',
    image: require('../../../../assets/legacy/onboarding_experts.png'),
    icon: 'heart',
    accent: 'mint',
    featureTitle: 'Small lessons. Everyday kindness.',
    featureDescription: 'Memory verses and gentle questions help the message stay with you.',
  },
  {
    title: 'See your little\nseeds grow.',
    description:
      'Save the lessons you love, revisit what you have learned and celebrate each step forward.',
    image: require('../../../../assets/legacy/home_banner_user.png'),
    icon: 'sun',
    accent: 'pink',
    featureTitle: 'Your own learning journey',
    featureDescription: 'Your reading progress and best quiz scores, all in one place.',
  },
];
