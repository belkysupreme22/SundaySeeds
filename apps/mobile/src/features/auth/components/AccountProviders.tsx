import { useState } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../shared/theme/tokens';

export function AccountProviders() {
  const [provider, setProvider] = useState<string | null>(null);
  const { width, fontScale } = useWindowDimensions();
  return (
    <View style={styles.group}>
      <View style={styles.divider}>
        <View style={styles.rule} />
        <Text variant="caption" muted>
          or continue with
        </Text>
        <View style={styles.rule} />
      </View>
      <View style={[styles.row, (width < 350 || fontScale >= 1.5) && styles.stacked]}>
        {(['Google', 'Apple'] as const).map((name) => (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={`Continue with ${name}`}
            onPress={() => setProvider(name)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            {name === 'Google' ? (
              <Image
                source={require('../../../../assets/auth/google-g.png')}
                style={styles.google}
                resizeMode="contain"
                accessible={false}
              />
            ) : (
              <FontAwesome name="apple" size={21} color={colors.ink} />
            )}
            <Text variant="label">{name}</Text>
          </Pressable>
        ))}
      </View>
      {provider && (
        <Text variant="small" accessibilityLiveRegion="polite">
          {provider} sign-in is not connected yet. No account has been accessed.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  google: { width: 20, height: 20 },
  group: { gap: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  row: { flexDirection: 'row', gap: 12 },
  stacked: { flexDirection: 'column' },
  button: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
  },
  pressed: { backgroundColor: colors.soft },
});
