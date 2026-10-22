import { useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lessonTopics } from '../data/lessonTopics';
import { lessonFilters, useLessonResults, type LessonFilter } from '../hooks/useLessonResults';
import type { LessonCategory } from '../types';
import { colors } from '../../../shared/theme/tokens';
import { Text } from '../../../shared/ui/Text';
import { Icon } from '../../../shared/ui/Icon';
import { Button, IconButton } from '../../../shared/ui/Button';

type Selection = { topic?: LessonCategory; filter: LessonFilter };

export function LessonFilters({
  topic,
  filter,
  query = '',
  onApply,
}: Selection & { query?: string; onApply: (selection: Selection) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Selection>({ topic, filter });
  const matches = useLessonResults({ ...draft, query });
  const activeCount = Number(Boolean(topic)) + Number(filter !== 'all');
  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filter lessons, ${activeCount} active filters`}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        onPress={() => {
          Keyboard.dismiss();
          setDraft({ topic, filter });
          setOpen(true);
        }}
        style={[styles.trigger, activeCount > 0 && styles.active]}
      >
        <Icon name="sliders" size={18} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.panel} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.header}>
                <Text variant="title" accessibilityRole="header" style={styles.heading}>
                  Filter lessons
                </Text>
                <IconButton name="x" label="Cancel filter changes" onPress={close} />
              </View>
              <Text variant="small" muted>
                Choose a topic or learning status, or leave all filters off.
              </Text>
              <Text variant="label" accessibilityRole="header">
                Topic
              </Text>
              <View style={styles.options}>
                {lessonTopics.map((item) => (
                  <FilterChoice
                    key={item.name}
                    label={item.name}
                    selected={draft.topic === item.name}
                    onPress={() =>
                      setDraft({
                        ...draft,
                        topic: draft.topic === item.name ? undefined : item.name,
                      })
                    }
                  />
                ))}
              </View>
              <Text variant="label" accessibilityRole="header">
                Learning status
              </Text>
              <View style={styles.options}>
                {lessonFilters
                  .filter((item) => item.value !== 'all')
                  .map((item) => (
                    <FilterChoice
                      key={item.value}
                      label={item.label}
                      selected={draft.filter === item.value}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          filter: draft.filter === item.value ? 'all' : item.value,
                        })
                      }
                    />
                  ))}
              </View>
              <View style={styles.preview}>
                <Text variant="label" accessibilityLiveRegion="polite">
                  {matches.length} {matches.length === 1 ? 'lesson matches' : 'lessons match'}
                </Text>
                <Text variant="small">
                  {query.trim() ? 'Your search text stays applied.' : 'From the sample collection.'}
                  {matches.length === 0 ? ' Try another combination or clear the filters.' : ''}
                </Text>
              </View>
              <Button
                label="Clear filters"
                variant="outline"
                icon="x"
                onPress={() => setDraft({ filter: 'all' })}
              />
              <Button
                label="Apply filters"
                icon="check"
                onPress={() => {
                  onApply(draft);
                  close();
                }}
              />
              <Button label="Cancel" variant="outline" icon={false} onPress={close} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function FilterChoice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={[
        styles.choice,
        (width < 350 || fontScale >= 1.5) && styles.fullWidth,
        selected && styles.active,
      ]}
    >
      <Text variant="small" style={styles.heading}>
        {label}
      </Text>
      <Icon name={selected ? 'check-circle' : 'circle'} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 7,
    backgroundColor: colors.white,
  },
  active: { backgroundColor: colors.lavender },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 23, 29, 0.35)',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { flex: 1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    flexBasis: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 7,
    backgroundColor: colors.white,
  },
  preview: { padding: 12, backgroundColor: colors.mint, borderRadius: 7, gap: 4 },
  fullWidth: { flexBasis: '100%' },
});
