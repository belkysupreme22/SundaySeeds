import { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import animation from '../../../assets/animations/loading-dots.json';
import { StaticLoadingDots } from './StaticLoadingDots';

// Same contract as the native player, without importing native/web optional peers.
export function LoaderAnimation({ animate, small }: { animate: boolean; small?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    let player: AnimationItem | undefined;
    setReady(false);
    if (animate) {
      // Import after mount: SVG playback needs a browser, not an SSR document shim.
      void import('lottie-web')
        .then(({ default: lottie }) => {
          if (disposed || !host.current) return;
          player = lottie.loadAnimation({
            container: host.current,
            renderer: 'svg',
            autoplay: false,
            loop: true,
            // The player mutates animation data; each instance owns its own copy.
            animationData: JSON.parse(JSON.stringify(animation)),
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
          });
          const start = () => {
            if (disposed || !player) return;
            player.setSpeed(0.85);
            setReady(true);
            player.play();
          };
          player.addEventListener('DOMLoaded', start);
          player.addEventListener('data_failed', () => {
            if (!disposed) setReady(false);
          });
          player.addEventListener('error', () => {
            if (!disposed) setReady(false);
          });
          if (player.isLoaded) start();
        })
        .catch(() => {
          // The still dots and accessible status remain if playback is unavailable.
          if (!disposed) setReady(false);
          player?.destroy();
          player = undefined;
        });
    }
    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [animate]);
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {(!animate || !ready) && <StaticLoadingDots small={small} />}
      <div
        ref={host}
        style={{
          position: 'absolute',
          inset: 0,
          visibility: animate && ready ? 'visible' : 'hidden',
        }}
      />
    </div>
  );
}
