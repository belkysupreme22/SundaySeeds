import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, fonts } from '../theme/tokens';

// SundaySeeds design system tokens
const SEED_PALETTE = [
  colors.yellow,
  colors.mint,
  colors.lavender,
  colors.peach,
  colors.pink,
  colors.yellow,
  colors.mint,
  colors.lavender,
];

const SEED_COUNT = 8;
const ORBIT_RADIUS = 78;
const SEED_DIAMETER = 14;

// Floating light particles
const PARTICLE_COUNT = 14;

type Props = { onComplete: () => void };

export function AnimatedSplash({ onComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Background motion (Ken Burns slow zoom & gentle pan)
  const bgScale = useRef(new Animated.Value(1)).current;
  const bgTranslateY = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  // 2. Halo pulse rings
  const haloScale1 = useRef(new Animated.Value(0.7)).current;
  const haloOpacity1 = useRef(new Animated.Value(0)).current;
  const haloScale2 = useRef(new Animated.Value(0.7)).current;
  const haloOpacity2 = useRef(new Animated.Value(0)).current;

  // 3. Central emblem
  const emblemScale = useRef(new Animated.Value(0)).current;
  const emblemRotate = useRef(new Animated.Value(0)).current;
  const emblemFloat = useRef(new Animated.Value(0)).current;

  // 4. Orbiting seeds ring
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  // 5. Typography
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(16)).current;
  const dividerScaleX = useRef(new Animated.Value(0)).current;
  const geezOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;

  // 6. Floating ambient particles
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      startX: (i / PARTICLE_COUNT) * 0.85 + 0.08,
      startY: 0.35 + ((i * 37) % 55) / 100,
      size: 4 + (i % 4) * 2,
      color: SEED_PALETTE[i % SEED_PALETTE.length],
      driftSpeed: 2400 + (i % 5) * 400,
    })),
  ).current;

  // 7. Exit transition
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const didRun = useRef(false);

  const startAnimation = useCallback(
    (skipMotion: boolean) => {
      if (didRun.current) return;
      didRun.current = true;

      if (skipMotion) {
        onComplete();
        return;
      }

      // --- PHASE 1: Dawn awakens (0ms - 500ms) ---
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1.12,
          duration: 3800,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bgTranslateY, {
          toValue: -14,
          duration: 3800,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start();

      // Ambient particle drifts
      particleAnims.forEach((p, idx) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(idx * 120),
            Animated.parallel([
              Animated.timing(p.opacity, {
                toValue: 0.85,
                duration: p.driftSpeed * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(p.translateY, {
                toValue: -90,
                duration: p.driftSpeed,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(p.translateX, {
                  toValue: idx % 2 === 0 ? 12 : -12,
                  duration: p.driftSpeed * 0.5,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(p.translateX, {
                  toValue: 0,
                  duration: p.driftSpeed * 0.5,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ]),
            ]),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(p.translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });

      // --- PHASE 2: Emblem Entrance with Spring (200ms - 900ms) ---
      const emblemEntrance = Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(emblemScale, {
            toValue: 1,
            damping: 11,
            stiffness: 130,
            mass: 0.8,
            useNativeDriver: true,
          }),
          Animated.timing(emblemRotate, {
            toValue: 1,
            duration: 650,
            easing: Easing.out(Easing.back(1.4)),
            useNativeDriver: true,
          }),
        ]),
      ]);

      // Halo pulse waves
      const haloAnimation = Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(haloOpacity1, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale1, {
            toValue: 1.5,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(haloOpacity2, {
                toValue: 0.5,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(haloScale2, {
                toValue: 1.7,
                duration: 900,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(haloOpacity1, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity2, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]);

      // Seed ring burst + celestial rotation
      const seedRingEntrance = Animated.sequence([
        Animated.delay(450),
        Animated.spring(ringScale, {
          toValue: 1,
          damping: 10,
          stiffness: 140,
          useNativeDriver: true,
        }),
      ]);

      // Subtle celestial rotation of the seed ring
      Animated.loop(
        Animated.timing(ringRotate, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Subtle breathing float on emblem
      Animated.loop(
        Animated.sequence([
          Animated.timing(emblemFloat, {
            toValue: -6,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(emblemFloat, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // --- PHASE 3: Typography Emergence (650ms - 1300ms) ---
      const typographyEntrance = Animated.sequence([
        Animated.delay(650),
        Animated.parallel([
          // Brand title
          Animated.parallel([
            Animated.timing(brandOpacity, {
              toValue: 1,
              duration: 450,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(brandTranslateY, {
              toValue: 0,
              duration: 450,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // Ornamental knotwork divider line
          Animated.sequence([
            Animated.delay(180),
            Animated.timing(dividerScaleX, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          // Ge'ez scripture subtitle
          Animated.sequence([
            Animated.delay(260),
            Animated.timing(geezOpacity, {
              toValue: 0.9,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          // Tagline
          Animated.sequence([
            Animated.delay(320),
            Animated.parallel([
              Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(taglineTranslateY, {
                toValue: 0,
                duration: 450,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]);

      // --- PHASE 4: Hold & Cinematic Exit ---
      const exitSequence = Animated.sequence([
        Animated.delay(2200), // Hold for viewer appreciation
        Animated.parallel([
          Animated.timing(exitOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(exitScale, {
            toValue: 1.06,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

      Animated.parallel([
        emblemEntrance,
        haloAnimation,
        seedRingEntrance,
        typographyEntrance,
        exitSequence,
      ]).start(() => {
        onComplete();
      });
    },
    [
      onComplete,
      bgOpacity,
      bgScale,
      bgTranslateY,
      emblemScale,
      emblemRotate,
      emblemFloat,
      haloScale1,
      haloOpacity1,
      haloScale2,
      haloOpacity2,
      ringScale,
      ringRotate,
      brandOpacity,
      brandTranslateY,
      dividerScaleX,
      geezOpacity,
      taglineOpacity,
      taglineTranslateY,
      exitOpacity,
      exitScale,
      particleAnims,
    ],
  );

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (!mounted) return;
        setReducedMotion(enabled);
        startAnimation(enabled);
      },
      () => {
        if (mounted) startAnimation(false);
      },
    );

    const fallback = setTimeout(() => {
      if (mounted && !didRun.current) startAnimation(false);
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(fallback);
    };
  }, [startAnimation]);

  const rotateInterpolate = emblemRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-24deg', '0deg'],
  });

  const celestialOrbit = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents="none"
      accessible
      accessibilityLabel="SundaySeeds"
      accessibilityRole="image"
    >
      {/* 1. Atmospheric Highland Dawn Background */}
      <Animated.View
        style={[
          styles.fullCover,
          {
            opacity: bgOpacity,
            transform: [{ scale: bgScale }, { translateY: bgTranslateY }],
          },
        ]}
      >
        <Image
          source={require('../../../../assets/orthodox/splash_bg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Soft morning mist gradient scrim so typography & emblem stay vivid */}
        <View style={styles.scrim} />
      </Animated.View>

      {/* 2. Ambient Floating Morning Dew & Light Particles */}
      <View style={styles.fullCover} pointerEvents="none">
        {particleAnims.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${p.startX * 100}%`,
                top: `${p.startY * 100}%`,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateY: p.translateY },
                  { translateX: p.translateX },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* 3. Central Stage: Halos, Orbiting Seeds & Sacred Cross Medallion */}
      <View style={styles.centerStage}>
        {/* Halo Glow Ring 1 */}
        <Animated.View
          style={[
            styles.haloRing,
            {
              width: 140,
              height: 140,
              borderRadius: 70,
              borderColor: colors.yellow,
              opacity: haloOpacity1,
              transform: [{ scale: haloScale1 }],
            },
          ]}
        />

        {/* Halo Glow Ring 2 */}
        <Animated.View
          style={[
            styles.haloRing,
            {
              width: 170,
              height: 170,
              borderRadius: 85,
              borderColor: colors.lavender,
              opacity: haloOpacity2,
              transform: [{ scale: haloScale2 }],
            },
          ]}
        />

        {/* Orbiting Pastel Seed Pearls */}
        <Animated.View
          style={[
            styles.orbitContainer,
            {
              transform: [{ scale: ringScale }, { rotate: celestialOrbit }],
            },
          ]}
        >
          {Array.from({ length: SEED_COUNT }).map((_, i) => {
            const angle = (i / SEED_COUNT) * Math.PI * 2;
            const x = Math.cos(angle) * ORBIT_RADIUS;
            const y = Math.sin(angle) * ORBIT_RADIUS;
            return (
              <View
                key={i}
                style={[
                  styles.orbitSeed,
                  {
                    backgroundColor: SEED_PALETTE[i],
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              >
                <View style={styles.seedCore} />
              </View>
            );
          })}
        </Animated.View>

        {/* Sacred Ethiopian Cross Emblem Card */}
        <Animated.View
          style={[
            styles.emblemCard,
            {
              transform: [
                { scale: emblemScale },
                { rotate: rotateInterpolate },
                { translateY: emblemFloat },
              ],
            },
          ]}
        >
          {/* Subtle warm sun backdrop inside card */}
          <View style={styles.emblemBackdrop} />

          {/* Authentic Ethiopian Meskel Cross artwork */}
          <Image
            source={require('../../../../assets/orthodox/splash_cross.jpg')}
            style={styles.crossImage}
            resizeMode="contain"
          />

          {/* Little decorative seal corner notches */}
          <View style={[styles.cornerDot, styles.dotTL]} />
          <View style={[styles.cornerDot, styles.dotTR]} />
          <View style={[styles.cornerDot, styles.dotBL]} />
          <View style={[styles.cornerDot, styles.dotBR]} />
        </Animated.View>
      </View>

      {/* 4. Brand Typography & Decorative Ethiopian Harag Ribbon */}
      <View style={styles.brandBlock}>
        {/* Main Wordmark */}
        <Animated.View
          style={{
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }],
          }}
        >
          <Animated.Text style={styles.brandTitle}>SundaySeeds</Animated.Text>
        </Animated.View>

        {/* Traditional Ethiopian Harag Knotwork Divider */}
        <Animated.View
          style={[
            styles.haragDivider,
            {
              transform: [{ scaleX: dividerScaleX }],
            },
          ]}
        >
          <View style={styles.haragLine} />
          <View style={styles.haragKnot}>
            <View style={styles.haragDiamond} />
          </View>
          <View style={styles.haragLine} />
        </Animated.View>

        {/* Ge'ez Ethos Subtitle: ሰናይ ዘርዕ (Good Seed) */}
        <Animated.Text style={[styles.geezSubtitle, { opacity: geezOpacity }]}>
          ሰናይ ዘርዕ
        </Animated.Text>

        {/* English Ethos Tagline */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
        >
          <Animated.Text style={styles.tagline}>
            Grow in faith. One little step.
          </Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fullCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Soft morning mist overlay preserving watercolor while boosting contrast
    backgroundColor: 'rgba(252, 250, 255, 0.42)',
  },
  particle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(25, 23, 29, 0.25)',
    ...Platform.select({
      web: { boxShadow: '0 0 6px rgba(255, 237, 141, 0.6)' },
      default: {},
    }),
  },
  centerStage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  haloRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  orbitContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitSeed: {
    position: 'absolute',
    width: SEED_DIAMETER,
    height: SEED_DIAMETER,
    borderRadius: SEED_DIAMETER / 2,
    borderWidth: 1.2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '1.5px 2px 0px #26212E' },
      default: {
        shadowColor: '#26212E',
        shadowOffset: { width: 1.5, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 0,
      },
    }),
  },
  seedCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    opacity: 0.8,
  },
  emblemCard: {
    width: 104,
    height: 104,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.8,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: { boxShadow: '3px 5px 0px #26212E' },
      default: {
        shadowColor: '#26212E',
        shadowOffset: { width: 3, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
      },
    }),
  },
  emblemBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.yellow,
    opacity: 0.22,
  },
  crossImage: {
    width: 78,
    height: 78,
  },
  cornerDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.ink,
    opacity: 0.4,
  },
  dotTL: { top: 6, left: 6 },
  dotTR: { top: 6, right: 6 },
  dotBL: { bottom: 6, left: 6 },
  dotBR: { bottom: 6, right: 6 },
  brandBlock: {
    alignItems: 'center',
    marginTop: 26,
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.bold,
    color: colors.ink,
    letterSpacing: -0.9,
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' },
      default: {},
    }),
  },
  haragDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    marginVertical: 10,
  },
  haragLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.ink,
    opacity: 0.4,
  },
  haragKnot: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haragDiamond: {
    width: 7,
    height: 7,
    backgroundColor: colors.yellow,
    borderWidth: 1.2,
    borderColor: colors.ink,
    transform: [{ rotate: '45deg' }],
  },
  geezSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.ink,
    opacity: 0.75,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
