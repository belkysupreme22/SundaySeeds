import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../../shared/ui/Button';
import { Text } from '../../../shared/ui/Text';
import { brandColors } from '../../../shared/theme/tokens';
import { AccountLanguagePicker } from './AccountLanguagePicker';

export function AccountTopBar({ label, onBack }: { label: string; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <IconButton name="arrow-left" label={t('common.back')} onPress={onBack} />
        <View style={styles.badge}>
          <Text variant="meta">{label}</Text>
        </View>
      </View>
      <AccountLanguagePicker />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  badge: {
    backgroundColor: brandColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    flexShrink: 1,
  },
});
