import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import authMessages from '../../../i18n/authResults.en.json';
import { DISPLAY_NAME_LIMIT } from '../data/profileStorage';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { ProfileSeal } from '../components/ProfileSeal';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { InputField } from '../../../shared/ui/InputField';

export function EditProfileScreen() {
  const { user } = useAuth();
  return <ProfileNameForm key={user?.id ?? 'guest'} signedIn={Boolean(user)} />;
}

function ProfileNameForm({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation();
  const { displayName, hydrated, loadError, retryLoad, saveName, saving, saveError } =
    useLearnerProfile();
  const { width, fontScale } = useWindowDimensions();
  const stackedActions = width < 350 || fontScale >= 1.5;
  const [name, setName] = useState<string | null>(hydrated && !loadError ? displayName : null);
  const [submitting, setSubmitting] = useState(false);
  const focused = useRef(false);
  const saveAttempt = useRef(0);
  const saveInFlight = useRef(false);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        ++saveAttempt.current;
      };
    }, []),
  );
  useEffect(() => {
    if (name === null && hydrated && !loadError) setName(displayName);
  }, [name, displayName, hydrated, loadError]);

  function describeError(message: string, kind: 'load' | 'save') {
    if (!signedIn) {
      return t(
        kind === 'load' ? 'accountEntry.setup.nameLoadError' : 'accountEntry.setup.nameSaveError',
      );
    }
    // The profile hook exposes the existing English result. Use its catalog entry when known.
    const match = Object.entries(authMessages).find(([, text]) => text === message);
    return match ? t(`authResults.${match[0]}`, { defaultValue: message }) : message;
  }

  function closeEditor() {
    if (!focused.current) return;
    focused.current = false;
    ++saveAttempt.current;
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  }

  async function save() {
    if (
      name === null ||
      !hydrated ||
      loadError ||
      saving ||
      saveInFlight.current ||
      !focused.current
    )
      return;
    saveInFlight.current = true;
    setSubmitting(true);
    const attempt = ++saveAttempt.current;
    try {
      const saved = await saveName(name);
      if (saved && focused.current && attempt === saveAttempt.current) closeEditor();
    } finally {
      saveInFlight.current = false;
      setSubmitting(false);
    }
  }

  const loading = submitting || saving || !hydrated || (name === null && !loadError);
  const displayNameLabel = t('accountEntry.setup.displayName');
  const issue = name === null ? loadError : saveError || loadError;

  return (
    <Screen
      loadingMessage={
        submitting
          ? t('profile.edit.saving')
          : loading
            ? t('accountEntry.setup.openingName')
            : undefined
      }
      footer={
        <View style={[styles.actions, stackedActions && styles.stackedActions]}>
          <Button
            label={t('common.cancel')}
            variant="outline"
            icon={false}
            disabled={saving || submitting}
            onPress={closeEditor}
            style={stackedActions ? undefined : styles.action}
          />
          {name !== null && (
            <Button
              label={t(submitting ? 'profile.edit.saving' : 'profile.edit.save')}
              variant="dark"
              icon="check"
              loading={submitting}
              disabled={loading || !!loadError}
              onPress={() => void save()}
              style={stackedActions ? undefined : styles.action}
            />
          )}
        </View>
      }
    >
      <View style={styles.header}>
        <IconButton name="arrow-left" label={t('common.back')} onPress={closeEditor} />
        <Text variant="title" accessibilityRole="header" style={styles.headerTitle}>
          {t('profile.edit.title')}
        </Text>
      </View>
      {name !== null && (
        <>
          <Card tone="mint" stroke="soft" shadow={false} style={styles.introduction}>
            <ProfileSeal />
            <Text variant="heading" style={styles.center}>
              {t('profile.edit.introTitle')}
            </Text>
            <Text variant="small" muted style={styles.center}>
              {t('profile.edit.introBody')}
            </Text>
          </Card>
          <ContentGroup>
            <Text variant="label">{displayNameLabel}</Text>
            <InputField
              icon="user"
              appearance="account"
              accessibilityLabel={displayNameLabel}
              placeholder={t('accountEntry.setup.namePlaceholder')}
              value={name}
              onChangeText={setName}
              maxLength={DISPLAY_NAME_LIMIT}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading && !loadError}
              returnKeyType="done"
              onSubmitEditing={() => void save()}
            />
            <Text variant="small" muted>
              {t('profile.edit.nameHint', { limit: DISPLAY_NAME_LIMIT })}
            </Text>
          </ContentGroup>
        </>
      )}
      {issue && (
        <Card tone="peach" stroke="subtle" shadow={false} style={styles.note}>
          <Text accessibilityRole="alert" variant="small">
            {describeError(issue, issue === loadError ? 'load' : 'save')}
          </Text>
          <Button
            label={t(name === null ? 'common.retry' : 'profile.edit.reload')}
            variant="outline"
            icon="refresh-cw"
            disabled={loading}
            onPress={retryLoad}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { flex: 1 },
  introduction: { alignItems: 'center', gap: 8, padding: 14, borderRadius: 9 },
  center: { textAlign: 'center' },
  note: { gap: 10 },
  actions: { flexDirection: 'row', gap: 8 },
  stackedActions: { flexDirection: 'column' },
  action: { flex: 1, minWidth: 0 },
});
