import { useState } from 'react';
import { InputField } from '../../../shared/ui/InputField';
import { IconButton } from '../../../shared/ui/Button';

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
      accessibilityLabel={label}
      placeholder={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={newPassword ? 'new-password' : 'current-password'}
      trailing={
        <IconButton
          name={visible ? 'eye-off' : 'eye'}
          label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
          onPress={() => setVisible(!visible)}
        />
      }
    />
  );
}
