import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../shared/theme/tokens';

type Mode = 'request' | 'verify' | 'reset' | 'reset-guidance';
const copy = {
  request: { title: 'Forgot password?', body: 'A little help getting back to your learning.' },
  verify: { title: 'Verify your email', body: 'One small step toward your learning journey.' },
  reset: { title: 'A fresh start', body: 'Choose a new password for your account.' },
  'reset-guidance': { title: 'A fresh start', body: 'Open your recovery email to continue.' },
};

// The references do not include recovery screens. These original vectors extend
// reference 03's pastel shapes, fine ink lines and right-edge composition.
export function AccountRecoveryHero({ mode }: { mode: Mode }) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2;
  const reset = mode === 'reset' || mode === 'reset-guidance';
  return (
    <View style={[styles.hero, stacked && styles.stacked]}>
      <View style={[styles.copy, stacked && styles.stackedCopy]}>
        <Text variant="heading" accessibilityRole="header">
          {copy[mode].title}
        </Text>
        <Text variant="small">{copy[mode].body}</Text>
      </View>
      <View
        style={styles.art}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width="100%" height="100%" viewBox="0 0 190 205" aria-hidden>
          <Path
            d="M190 202H91C46 202 25 177 25 143C25 111 44 91 71 77L80 91L82 62L112 55L119 73L139 48L162 63L158 81L190 73Z"
            fill={reset ? colors.yellow : colors.lavender}
            stroke={colors.ink}
            strokeWidth="1.2"
          />
          <G
            fill="none"
            stroke={colors.ink}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {reset ? (
              <G transform="rotate(10 112 129)">
                <Path d="M88 114V98C88 67 137 67 137 98V114" strokeWidth="7" stroke={colors.ink} />
                <Path
                  d="M88 114V98C88 67 137 67 137 98V114"
                  strokeWidth="4"
                  stroke={colors.white}
                />
                <Rect x="72" y="111" width="83" height="68" rx="11" fill={colors.white} />
                <Circle cx="113" cy="137" r="7" fill={colors.lavender} />
                <Path d="M113 144V155" strokeWidth="3" />
              </G>
            ) : (
              <G transform="rotate(-9 111 132)">
                <Path d="M57 116L112 72L166 116V174H57Z" fill={colors.yellow} />
                <Rect x="76" y="81" width="72" height="77" rx="5" fill={colors.white} />
                <Path d="M89 99H133M89 109H133M89 119H117" stroke="#AAA6B1" />
                <Path d="M57 116L112 150L166 116V174H57Z" fill={colors.white} />
                <Path d="M57 174L97 141M166 174L127 141" />
              </G>
            )}
            <Path d="M26 101L17 98M31 90L24 84M42 83L39 74M156 29L159 20M167 37L177 34" />
          </G>
          <Path
            d="M28 29L37 38M37 29L28 38"
            stroke="#BDA9EA"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 205,
    marginRight: -20,
    overflow: 'hidden',
  },
  copy: { flex: 1, minWidth: 0, paddingTop: 20, paddingBottom: 12, gap: 8 },
  art: { width: '48%', maxWidth: 190, height: 205, alignSelf: 'flex-end' },
  stacked: { flexDirection: 'column' },
  stackedCopy: { flex: 0, paddingTop: 4, paddingRight: 20 },
});
