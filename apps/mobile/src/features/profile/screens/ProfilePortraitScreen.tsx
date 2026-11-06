import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button, IconButton } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Screen } from '../../../shared/ui/Screen';
import { Text } from '../../../shared/ui/Text';
import { ProfileAvatarPicker } from '../components/ProfileAvatarPicker';
import { useProfileAvatar } from '../hooks/useProfileAvatar';
import type { AvatarId } from '../types/avatar';

export function ProfilePortraitScreen() {
  const { user } = useAuth();
  return <PortraitGallery key={user?.id ?? 'guest'} />;
}

function PortraitGallery() {
  const { t } = useTranslation();
  const { avatarId, status, reload, saveAvatar } = useProfileAvatar();
  const [draft, setDraft] = useState<AvatarId | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const pending = useRef(false);
  const focus = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const visit = ++focus.current;
      return () => {
        if (focus.current === visit) ++focus.current;
      };
    }, []),
  );

  const selected = draft ?? avatarId;
  const changed = selected !== avatarId;

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/edit-profile');
  }

  async function save() {
    if (selected === null || !changed || status !== 'ready' || pending.current) return;
    pending.current = true;
    setSaving(true);
    setSaveError(false);
    const visit = focus.current;
    try {
      const saved = await saveAvatar(selected);
      if (visit !== focus.current) return;
      if (saved) close();
      else setSaveError(true);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return (
    <Screen
      contentStyle={styles.content}
      loadingMessage={saving ? t('profile.avatar.saving') : undefined}
      footer={
        status === 'ready' ? (
          <View style={styles.footer}>
            {saveError && (
              <Text variant="small" accessibilityRole="alert">
                {t('profile.avatar.saveError')}
              </Text>
            )}
            <Button
              label={t(saving ? 'profile.avatar.saving' : 'profile.avatar.save')}
              icon="check"
              variant="dark"
              loading={saving}
              disabled={!changed}
              onPress={() => void save()}
            />
          </View>
        ) : undefined
      }
    >
      <View style={styles.header}>
        <IconButton name="arrow-left" label={t('common.back')} onPress={close} />
        <Text variant="title" accessibilityRole="header" style={styles.words}>
          {t('profile.avatar.title')}
        </Text>
      </View>
      {status === 'ready' ? (
        <ProfileAvatarPicker
          selectedId={selected}
          disabled={saving}
          onSelect={(id) => {
            setDraft(id);
            setSaveError(false);
          }}
        />
      ) : status === 'error' ? (
        <Card tone="peach" stroke="subtle" shadow={false} style={styles.recovery}>
          <Text variant="small" accessibilityRole="alert">
            {t('profile.avatar.loadError')}
          </Text>
          <Button label={t('common.retry')} variant="outline" icon="refresh-cw" onPress={reload} />
        </Card>
      ) : (
        <Text variant="small" accessibilityLiveRegion="polite">
          {t('profile.avatar.loading')}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, width: '100%', maxWidth: 460, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { gap: 10, width: '100%', maxWidth: 424, alignSelf: 'center', paddingHorizontal: 2 },
  words: { flex: 1, minWidth: 0 },
  recovery: { gap: 10 },
});
