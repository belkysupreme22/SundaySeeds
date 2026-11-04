import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import animation from '../../../assets/animations/unfolding-seed.json';
import { seedPaths, seedViewBox } from '../branding/seedMark';

type Props = {
  size: number;
  animate: boolean;
  playing: boolean;
  onReady: (canAnimate: boolean) => void;
  onFinished: () => void;
};

// Match the native contract using the bundled SVG player, without optional WASM peers.
export function UnfoldingSeedMark({ size, animate, playing, onReady, onFinished }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<AnimationItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback'>('loading');
  const started = useRef(false);
  const finished = useRef(false);
  const playbackFailure = useRef<(() => void) | null>(null);
  const callbacks = useRef({ onReady, onFinished });
  callbacks.current = { onReady, onFinished };

  useEffect(() => {
    let disposed = false;
    let failed = false;
    let settled = false;
    let instance: AnimationItem | undefined;
    const finish = () => {
      if (disposed || !started.current || finished.current) return;
      finished.current = true;
      callbacks.current.onFinished();
    };
    const fail = () => {
      if (disposed || failed) return;
      failed = true;
      setStatus('fallback');
      if (!settled) {
        settled = true;
        callbacks.current.onReady(false);
      }
      instance?.destroy();
      if (player.current === instance) player.current = null;
      finish();
    };
    const loaded = () => {
      if (disposed || failed || settled) return;
      settled = true;
      clearTimeout(deadline);
      setStatus('loaded');
      callbacks.current.onReady(true);
    };
    playbackFailure.current = fail;
    const deadline = setTimeout(() => {
      if (!settled) fail();
    }, 1200);
    // Import only after mount: lottie-web needs the real browser document.
    void import('lottie-web')
      .then(({ default: lottie }) => {
        if (disposed || failed || !host.current) return;
        instance = lottie.loadAnimation({
          container: host.current,
          renderer: 'svg',
          autoplay: false,
          loop: false,
          animationData: JSON.parse(JSON.stringify(animation)),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        player.current = instance;
        instance.setSpeed(1);
        instance.addEventListener('DOMLoaded', loaded);
        instance.addEventListener('complete', finish);
        instance.addEventListener('data_failed', fail);
        instance.addEventListener('error', fail);
        if (instance.isLoaded) loaded();
      })
      .catch(fail);
    return () => {
      disposed = true;
      playbackFailure.current = null;
      clearTimeout(deadline);
      instance?.destroy();
      if (player.current === instance) player.current = null;
    };
  }, []);

  useEffect(() => {
    if (!playing || status !== 'loaded' || !player.current) return;
    if (!started.current) {
      started.current = true;
      try {
        player.current.play();
      } catch {
        playbackFailure.current?.();
      }
    }
    return () => {
      player.current?.pause();
    };
  }, [playing, status]);

  const visible = animate && status === 'loaded';
  const waitingForMotion = animate && status === 'loading';
  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width: size, height: size, pointerEvents: 'none' }}
    >
      {!visible && (
        <svg width={size} height={size} viewBox={seedViewBox}>
          {seedPaths
            .filter(({ id }) => !waitingForMotion || id === 'seed')
            .map(({ id, d }) => (
              <path
                key={id}
                d={waitingForMotion ? `${d.split('ZM')[0]}Z` : d}
                fill="#173E32"
                fillRule="evenodd"
              />
            ))}
        </svg>
      )}
      <div
        ref={host}
        style={{ position: 'absolute', inset: 0, visibility: visible ? 'visible' : 'hidden' }}
      />
    </div>
  );
}
