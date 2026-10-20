import { Pressable, StyleSheet, View } from 'react-native';
import { AccountHero } from '../../auth/components/AccountHero';
import { AccountTopBar } from '../../auth/components/AccountTopBar';
import { colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';

type Props = {
  saving: boolean;
  error: string | null;
  onBack: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  onSkip: () => void;
  onSetupName: () => void;
  onContinueForNow: () => void;
};

export function AccountChoiceScreen({
  saving,
  error,
  onBack,
  onSignUp,
  onSignIn,
  onSkip,
  onSetupName,
  onContinueForNow,
}: Props) {
  return (
    <Screen
      backgroundColor="#F8F5FC"
      contentStyle={styles.content}
      loadingMessage={saving ? 'Opening your lessons…' : undefined}
    >
      <View
        pointerEvents={saving ? 'none' : 'auto'}
        accessibilityState={{ disabled: saving }}
        style={saving ? styles.disabled : undefined}
      >
        <AccountTopBar
          label="Your learning journey"
          onBack={() => {
            if (!saving) onBack();
          }}
        />
      </View>
      <AccountHero
        mode="sign-up"
        title="Grow at your pace."
        description="Choose how to begin. Make a little room for faith today."
      />
      <Card tone="mint" shadow={false} style={styles.note}>
        <View style={styles.noteIcon}>
          <Icon name="book-open" size={21} />
        </View>
        <View style={styles.noteCopy}>
          <Text variant="label">Read. Reflect. Put faith into practice.</Text>
          <Text variant="small">A thoughtful lesson is a good place to start.</Text>
        </View>
      </Card>
      <View style={styles.actions}>
        <Button label="Create account" onPress={onSignUp} disabled={saving} />
        <Button label="Sign in" variant="outline" onPress={onSignIn} disabled={saving} />
        <Text variant="caption" muted style={styles.center}>
          Account services are not available yet. You can still start learning.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: saving, busy: saving }}
        disabled={saving}
        onPress={onSkip}
        style={({ pressed }) => [styles.skip, saving && styles.disabled, pressed && styles.pressed]}
      >
        <Text variant="label" style={styles.skipLabel}>
          {saving ? 'Opening your lessons…' : 'Skip for now'}
        </Text>
        <Icon name="arrow-right" size={18} />
      </Pressable>
      {error && (
        <Card tone="peach" shadow={false} stroke="soft" style={styles.actions}>
          <Text variant="small" accessibilityRole="alert">
            {error}
          </Text>
          <Button
            label="Try again"
            icon="refresh-cw"
            variant="outline"
            onPress={onSkip}
            disabled={saving}
          />
          <Button
            label="Continue for now"
            variant="outline"
            onPress={onContinueForNow}
            disabled={saving}
          />
        </Card>
      )}
      <View style={styles.personalize}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
          disabled={saving}
          onPress={onSetupName}
          style={({ pressed }) => [
            styles.nameLink,
            saving && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text variant="small" style={styles.nameCopy}>
            Add a name for your profile
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCopy: { flex: 1, gap: 4 },
  actions: { gap: 12 },
  center: { textAlign: 'center' },
  skip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  skipLabel: { flexShrink: 1, textAlign: 'center' },
  personalize: { borderTopWidth: 1, borderColor: colors.line, paddingTop: 6 },
  nameLink: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nameCopy: { color: '#75619D', textAlign: 'center' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72 },
});
