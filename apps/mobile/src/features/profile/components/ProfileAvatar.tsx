import { Image, StyleSheet, View } from 'react-native';
import { brandColors, colors } from '../../../shared/theme/tokens';
import { Icon } from '../../../shared/ui/Icon';
import { avatarIds, type AvatarId } from '../types/avatar';

const portraitSheet = require('../../../../assets/avatars/profile-portraits.jpg');
const columns = 4;
const rows = 3;

export function ProfileAvatar({
  avatarId,
  size = 76,
}: {
  avatarId: AvatarId | null;
  size?: number;
}) {
  const tileSize = size - 6;
  const tileIndex = avatarId ? avatarIds.indexOf(avatarId) : -1;

  return (
    <View
      style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <View
        style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize / 2 }]}
      >
        {tileIndex < 0 ? (
          <Icon name="user" size={tileSize / 2} color={brandColors.forest} />
        ) : (
          <Image
            source={portraitSheet}
            accessible={false}
            resizeMode="stretch"
            fadeDuration={0}
            style={{
              position: 'absolute',
              width: tileSize * columns,
              height: tileSize * rows,
              left: -(tileIndex % columns) * tileSize,
              top: -Math.floor(tileIndex / columns) * tileSize,
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: brandColors.canvas,
  },
  tile: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brandColors.surfaceStrong,
  },
});
