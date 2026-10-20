import { StyleSheet, View } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { familiarities, intentions } from '../data/questions';
import type { LearningPreferencesDraft } from '../types';

export function LearningPreferencesSummary({
  preferences,
}: {
  preferences: LearningPreferencesDraft;
}) {
  const rows = [
    {
      label: 'Learning intention',
      value:
        intentions.find((choice) => choice.value === preferences.intention)?.label ?? 'Not set',
    },
    {
      label: 'Topics to explore',
      value: preferences.interests.length ? preferences.interests.join(', ') : 'Not set',
    },
    {
      label: 'Bible-study familiarity',
      value:
        familiarities.find((choice) => choice.value === preferences.familiarity)?.label ??
        'Not set',
    },
    {
      label: 'Time for a session',
      value:
        preferences.sessionMinutes === null
          ? 'No fixed time'
          : `About ${preferences.sessionMinutes} minutes`,
    },
  ];
  return (
    <Card tone="mint" shadow={false} stroke="soft" style={styles.summary}>
      <Text variant="title" accessibilityRole="header">
        Your saved preferences
      </Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text variant="small" muted>
            {row.label}
          </Text>
          <Text variant="label">{row.value}</Text>
        </View>
      ))}
      <Text variant="small">
        These are your preferences, and you can change them at any time in Settings.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 14 },
  row: { gap: 3 },
});
