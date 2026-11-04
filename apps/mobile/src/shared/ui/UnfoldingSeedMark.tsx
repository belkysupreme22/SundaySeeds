import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Svg, { Path } from 'react-native-svg';
import { seedPaths, seedViewBox } from '../branding/seedMark';

type Props = {
  size: number;
  animate: boolean;
  playing: boolean;
  onReady: (canAnimate: boolean) => void;
  onFinished: () => void;
};

export function UnfoldingSeedMark({ size, animate, playing, onReady, onFinished }: Props) {
  const player = useRef<LottieView>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback'>('loading');
  const mounted = useRef(true);
  const settled = useRef(false);
  const started = useRef(false);
  const finished = useRef(false);
  const callbacks = useRef({ onReady, onFinished });
  callbacks.current = { onReady, onFinished };

  const finish = useCallback(() => {
    if (!mounted.current || finished.current) return;
    finished.current = true;
    callbacks.current.onFinished();
  }, []);
  const fail = useCallback(() => {
    if (!mounted.current) return;
    setStatus('fallback');
    if (!settled.current) {
      settled.current = true;
      callbacks.current.onReady(false);
    }
    if (started.current) finish();
  }, [finish]);
  const loaded = useCallback(() => {
    if (!mounted.current || settled.current) return;
    settled.current = true;
    setStatus('loaded');
    callbacks.current.onReady(true);
  }, []);
  const animationFinished = useCallback(
    (cancelled: boolean) => {
      if (!cancelled) finish();
    },
    [finish],
  );

  useEffect(() => {
    mounted.current = true;
    const deadline = setTimeout(() => {
      if (!settled.current) fail();
    }, 1200);
    return () => {
      mounted.current = false;
      clearTimeout(deadline);
      player.current?.pause();
    };
  }, [fail]);

  useEffect(() => {
    if (!playing || status !== 'loaded') return;
    if (!started.current) {
      started.current = true;
      try {
        player.current?.play();
      } catch {
        fail();
      }
    }
    return () => {
      player.current?.pause();
    };
  }, [fail, playing, status]);

  const visible = animate && status === 'loaded';
  const waitingForMotion = animate && status === 'loading';
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      {!visible && (
        <Svg width={size} height={size} viewBox={seedViewBox}>
          {seedPaths
            .filter(({ id }) => !waitingForMotion || id === 'seed')
            .map(({ id, d }) => (
              <Path
                key={id}
                d={waitingForMotion ? `${d.split('ZM')[0]}Z` : d}
                fill="#173E32"
                fillRule="evenodd"
              />
            ))}
        </Svg>
      )}
      {status !== 'fallback' && (
        <View style={[styles.animation, { width: size, height: size, opacity: visible ? 1 : 0 }]}>
          <LottieView
            ref={player}
            source={require('../../../assets/animations/unfolding-seed.json')}
            style={{ width: size, height: size }}
            webStyle={{ width: size, height: size }}
            autoPlay={false}
            loop={false}
            speed={1}
            resizeMode="contain"
            onAnimationLoaded={loaded}
            onAnimationFailure={fail}
            onAnimationFinish={animationFinished}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ animation: { position: 'absolute', top: 0, left: 0 } });
