import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { IconButton } from './Button';

export function PageHeader({
  title,
  subtitle,
  back = false,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      {back && (
        <IconButton
          name="arrow-left"
          label="Go back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      )}
      <View style={styles.words}>
        <Text variant={back ? 'title' : 'heading'}>{title}</Text>
        {subtitle && (
          <Text variant="small" muted>
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  words: { flex: 1, gap: 2 },
});
