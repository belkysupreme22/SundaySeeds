import { useState } from 'react';
import LottieView from 'lottie-react-native';
import animation from '../../../assets/animations/loading-dots.json';
import { StaticLoadingDots } from './StaticLoadingDots';
import { LOADER_PLAYBACK_SPEED } from './loadingMotion';

export type LoaderAnimationProps = { animate: boolean; small?: boolean };

export function LoaderAnimation({ animate, small }: LoaderAnimationProps) {
  const [failed, setFailed] = useState(false);
  if (!animate || failed) return <StaticLoadingDots small={small} />;
  return (
    <LottieView
      source={animation}
      autoPlay
      loop
      speed={LOADER_PLAYBACK_SPEED}
      resizeMode="contain"
      style={{ width: '100%', height: '100%' }}
      onAnimationFailure={() => setFailed(true)}
    />
  );
}
