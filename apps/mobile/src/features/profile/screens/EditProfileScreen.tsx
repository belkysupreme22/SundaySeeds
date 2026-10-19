import { useAuth } from '../../auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { DISPLAY_NAME_LIMIT } from '../data/profileStorage';
import { useLearnerProfile } from '../hooks/useLearnerProfile';
import { Screen, ContentGroup } from '../../../shared/ui/Screen';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { colors } from '../../../shared/theme/tokens';
import { InputField } from '../../../shared/ui/InputField';

export function EditProfileScreen() {
  const { user } = useAuth();
  return <ProfileNameForm key={user?.id ?? 'guest'} />;
}

function ProfileNameForm() {
  const { displayName, hydrated, loadError, retryLoad, saveName, saving, saveError } =
    useLearnerProfile();
  const [name, setName] = useState<string | null>(hydrated && !loadError ? displayName : null);
  useEffect(() => {
    if (name === null && hydrated && !loadError) setName(displayName);
  }, [name, displayName, hydrated, loadError]);
  if (name === null) {
    return (
      <Screen>
        <PageHeader title="Make it yours" back />
        <Card tone={loadError ? 'peach' : 'lavender'} shadow={false}>
          <Text accessibilityLiveRegion="polite">{loadError ?? 'Opening your profile…'}</Text>
        </Card>
        {loadError && <Button label="Try again" icon="refresh-cw" onPress={retryLoad} />}
      </Screen>
    );
  }
  async function save() {
    if (name !== null && hydrated && !loadError && (await saveName(name))) closeEditor();
  }

  return (
    <Screen
      footer={
        <Button
          label={saving ? 'Saving…' : 'Save profile'}
          icon="check"
          disabled={saving || !hydrated || !!loadError}
          onPress={() => void save()}
        />
      }
    >
      <PageHeader title="Make it yours" subtitle="A little introduction goes a long way." back />
      <View style={styles.introduction}>
        <View style={styles.avatar}>
          <Icon name="user" size={48} />
        </View>
        <Text variant="heading" style={styles.center}>
          What should we call you?
        </Text>
        <Text variant="small" muted style={styles.center}>
          A first name or nickname is perfect.
        </Text>
      </View>
      <ContentGroup>
        <Text variant="label">Display name (optional)</Text>
        <InputField
          icon="user"
          accessibilityLabel="Display name, optional"
          placeholder="Your name or nickname"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          maxLength={DISPLAY_NAME_LIMIT}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!saving && hydrated && !loadError}
          returnKeyType="done"
          onSubmitEditing={() => void save()}
        />
        <Text variant="caption" muted>
          Up to {DISPLAY_NAME_LIMIT} characters. Leave blank to use “learner”.
        </Text>
      </ContentGroup>
      <Card tone="mint" shadow={false} style={styles.note}>
        <Icon name="smartphone" />
        <Text variant="label">A familiar hello</Text>
        <Text variant="small">Your name appears on Home and Profile.</Text>
      </Card>
      {(saveError || loadError) && (
        <Card tone="peach" shadow={false}>
          <Text accessibilityRole="alert">{saveError || loadError}</Text>
          <Button
            label="Reload saved profile"
            variant="outline"
            disabled={saving}
            onPress={retryLoad}
          />
        </Card>
      )}
      <Button
        label="Cancel"
        variant="outline"
        icon={false}
        disabled={saving}
        onPress={closeEditor}
      />
    </Screen>
  );
}

function closeEditor() {
  if (router.canGoBack()) router.back();
  else router.replace('/profile');
}

const styles = StyleSheet.create({
  introduction: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1.2,
    borderColor: colors.ink,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  note: { gap: 10 },
});
