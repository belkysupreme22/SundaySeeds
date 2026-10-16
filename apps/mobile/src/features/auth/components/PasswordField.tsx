import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { InputField } from '../../../shared/ui/InputField';
import { Icon } from '../../../shared/ui/Icon';

export function PasswordField({
  label,
  value,
  onChangeText,
  newPassword = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  newPassword?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <InputField
      icon="lock"
      label={label}
      accessibilityLabel={label}
      placeholder={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={newPassword ? 'new-password' : 'current-password'}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          onPress={() => setVisible(!visible)}
          style={({ pressed }) => [styles.reveal, pressed && styles.pressed]}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  reveal: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
