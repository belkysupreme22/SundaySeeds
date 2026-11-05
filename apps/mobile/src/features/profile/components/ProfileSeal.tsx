import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect, Svg as Inset } from 'react-native-svg';
import { seedPaths, seedViewBox } from '../../../shared/branding/seedMark';
import { accentColors, brandColors } from '../../../shared/theme/tokens';

export function ProfileSeal() {
  return (
    <View
      style={styles.seal}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Svg width={80} height={90} viewBox="0 0 80 90">
        <Rect x={9} y={7} width={64} height={75} rx={7} fill={accentColors.wheat} />
        <Rect x={5} y={3} width={64} height={75} rx={7} fill={brandColors.forest} />
        <Rect x={13} y={10} width={49} height={60} rx={3} fill={brandColors.canvas} />
        <Path
          d="M18 17h9m-9 0v9m39-9h-9m9 0v9m-39 37h9m-9 0v-9m39 9h-9m9 0v-9"
          fill="none"
          stroke={brandColors.controlBorder}
          strokeWidth={1}
        />
        <Inset x={18} y={19} width={40} height={40} viewBox={seedViewBox}>
          {seedPaths.map(({ id, d }) => (
            <Path key={id} d={d} fill={brandColors.forest} fillRule="evenodd" />
          ))}
        </Inset>
        <Path
          d="M43 73h12v14l-6-4-6 4z"
          fill={accentColors.wheat}
          stroke={brandColors.forest}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  seal: { width: 80, height: 90, flexShrink: 0 },
});
