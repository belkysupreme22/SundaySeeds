import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccountLanguagePicker } from '../../auth/components/AccountLanguagePicker';
import { DISPLAY_NAME_LIMIT } from '../../profile/data/profileStorage';
import { useLearnerProfile } from '../../profile/hooks/useLearnerProfile';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { InputField } from '../../../shared/ui/InputField';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';

type Props = {
  finishing: boolean;
  finishError: string | null;
  onFinish: () => Promise<boolean>;
  onContinueForNow: () => void;
  onBack: () => void;
};

export function MinimalSetupScreen(props: Props) {
  const { t } = useTranslation();
  const profile = useLearnerProfile();
  if (!profile.hydrated || profile.loadError) {
    return (
      <SetupFrame
        busy={props.finishing}
        loadingMessage={profile.loadError ? undefined : t('accountEntry.setup.openingName')}
        onBack={props.onBack}
        onSkip={() => void props.onFinish()}
        footer={
          <Button
            label={t('accountEntry.skipForNow')}
            onPress={() => void props.onFinish()}
            disabled={props.finishing}
          />
        }
      >
        {profile.loadError && (
          <Card tone="peach" shadow={false}>
            <Text accessibilityLiveRegion="polite">{t('accountEntry.setup.nameLoadError')}</Text>
          </Card>
        )}
        {profile.loadError && (
          <Button
            label={t('common.retry')}
            icon="refresh-cw"
            variant="outline"
            onPress={profile.retryLoad}
            disabled={props.finishing}
          />
        )}
        <CompletionRecovery
          error={props.finishError}
          busy={props.finishing}
          onContinueForNow={props.onContinueForNow}
        />
      </SetupFrame>
    );
  }
  return <SetupNameForm {...props} initialName={profile.displayName} />;
}

function SetupNameForm({ initialName, ...props }: Props & { initialName: string }) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const { saveName, saving, saveError } = useLearnerProfile();
  const busy = saving || props.finishing;

  async function finish() {
    if (busy) return;
    if (name.trim() === initialName || (await saveName(name))) await props.onFinish();
  }

  return (
    <SetupFrame
      busy={busy}
      loadingMessage={busy ? t('accountEntry.setup.preparing') : undefined}
      onBack={props.onBack}
      onSkip={() => void props.onFinish()}
      footer={
        <View style={styles.actions}>
          <Button
            label={t(busy ? 'accountEntry.setup.wait' : 'accountEntry.setup.startLearning')}
            disabled={busy}
            loading={busy}
            onPress={() => void finish()}
          />
          <Button
            label={t('accountEntry.skipForNow')}
            variant="outline"
            icon={false}
            disabled={busy}
            onPress={() => void props.onFinish()}
          />
        </View>
      }
    >
      <View style={styles.portrait} accessible={false}>
        <View style={styles.avatar}>
          <Icon name="user" size={60} />
        </View>
        <View style={styles.sticker}>
          <Icon name="sun" size={24} />
        </View>
      </View>
      <View style={styles.field}>
        <Text variant="label">{t('accountEntry.setup.displayName')}</Text>
        <InputField
          icon="user"
          accessibilityLabel={t('accountEntry.setup.displayName')}
          placeholder={t('accountEntry.setup.namePlaceholder')}
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          maxLength={DISPLAY_NAME_LIMIT}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!busy}
          returnKeyType="done"
          onSubmitEditing={() => void finish()}
        />
        <Text variant="caption" muted>
          {t('accountEntry.setup.nameHint', { limit: DISPLAY_NAME_LIMIT })}
        </Text>
      </View>
      <Card tone="mint" shadow={false} style={styles.note}>
        <Icon name="smile" size={22} />
        <View style={styles.noteCopy}>
          <Text variant="label">{t('accountEntry.setup.noteTitle')}</Text>
          <Text variant="small">{t('accountEntry.setup.noteBody')}</Text>
        </View>
      </Card>
      {saveError && (
        <Card tone="peach" shadow={false}>
          <Text accessibilityRole="alert">{t('accountEntry.setup.nameSaveError')}</Text>
        </Card>
      )}
      <CompletionRecovery
        error={props.finishError}
        busy={busy}
        onContinueForNow={props.onContinueForNow}
      />
    </SetupFrame>
  );
}

function SetupFrame({
  busy,
  onBack,
  onSkip,
  footer,
  children,
  loadingMessage,
}: {
  busy: boolean;
  onBack: () => void;
  onSkip: () => void;
  footer: ReactNode;
  children: ReactNode;
  loadingMessage?: string;
}) {
  const { t } = useTranslation();
  return (
    <Screen footer={footer} loadingMessage={loadingMessage}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('accountEntry.setup.backToAccount')}
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Icon name="arrow-left" size={20} />
        </Pressable>
        <View style={styles.step}>
          <Text variant="accentMeta">{t('accountEntry.setup.stepLabel')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('accountEntry.setup.skipName')}
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={onSkip}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <Text variant="small" muted style={styles.skipLabel}>
            {t('common.skip')}
          </Text>
        </Pressable>
      </View>
      <AccountLanguagePicker />
      <View
        style={styles.progress}
        accessible
        accessibilityLabel={t('accountEntry.setup.stepAccessibility')}
      >
        <View style={styles.progressFill} />
      </View>
      <View style={styles.introduction}>
        <Text variant="authHeading" accessibilityRole="header">
          {t('accountEntry.setup.title')}
        </Text>
        <Text variant="small">{t('accountEntry.setup.description')}</Text>
      </View>
      {children}
    </Screen>
  );
}

function CompletionRecovery({
  error,
  busy,
  onContinueForNow,
}: {
  error: string | null;
  busy: boolean;
  onContinueForNow: () => void;
}) {
  const { t } = useTranslation();
  if (!error) return null;
  return (
    <Card tone="peach" shadow={false} style={styles.actions}>
      <Text accessibilityRole="alert">{t('accountEntry.welcomePreferenceError')}</Text>
      <Button
        label={t('accountEntry.continueForNow')}
        variant="outline"
        disabled={busy}
        onPress={onContinueForNow}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  back: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    backgroundColor: brandColors.surface,
    borderRadius: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexShrink: 1,
  },
  skip: {
    minWidth: 44,
    minHeight: 44,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: { textAlign: 'center' },
  progress: {
    height: 6,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { flex: 1, backgroundColor: brandColors.forest },
  introduction: { gap: 8 },
  portrait: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 4 },
  avatar: {
    width: 146,
    height: 146,
    borderWidth: 1.2,
    borderColor: colors.ink,
    borderRadius: 73,
    backgroundColor: brandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: colors.yellow,
    borderWidth: 1,
    borderColor: colors.ink,
    padding: 8,
    borderRadius: 8,
    transform: [{ rotate: '6deg' }],
    boxShadow: '2px 3px 0px #26212E',
  },
  field: { gap: 8 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  noteCopy: { flex: 1, gap: 5 },
  actions: { gap: 12 },
  pressed: { opacity: 0.72 },
});
