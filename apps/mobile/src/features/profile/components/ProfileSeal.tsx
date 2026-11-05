import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { seedPaths, seedViewBox } from '../../../shared/branding/seedMark';
import { accentColors, brandColors, colors } from '../../../shared/theme/tokens';

export function ProfileSeal() {
  return (
    <View
      style={styles.seal}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <View style={styles.field}>
        <Svg width={50} height={50} viewBox={seedViewBox}>
          {seedPaths.map(({ id, d }) => (
            <Path key={id} d={d} fill={brandColors.forest} fillRule="evenodd" />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seal: {
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: brandColors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: accentColors.wheat,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
