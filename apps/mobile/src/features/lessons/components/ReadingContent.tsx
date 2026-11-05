import { StyleSheet, View } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Text } from '../../../shared/ui/Text';

export function ReadingContent({ body }: { body: string }) {
  return (
    <View style={styles.content}>
      {body
        .split('\n\n')
        .filter(Boolean)
        .map((paragraph, index) => {
          const reflection = /^(Reflect|Try this|Take it with you):\s*([\s\S]+)$/.exec(paragraph);
          if (reflection) {
            return (
              <Card key={index} tone="yellow" shadow={false} style={styles.reflection}>
                <View style={styles.heading}>
                  <Icon name="sun" size={22} />
                  <Text variant="title" accessibilityRole="header" style={styles.headingText}>
                    {reflection[1]}
                  </Text>
                </View>
                <Text variant="reading">{reflection[2]}</Text>
              </Card>
            );
          }
          return (
            <Text key={index} variant="reading">
              {paragraph}
            </Text>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  reflection: { gap: 10, borderRadius: 8 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingText: { flex: 1 },
});
