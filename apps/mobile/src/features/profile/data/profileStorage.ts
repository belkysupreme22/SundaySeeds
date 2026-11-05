import AsyncStorage from '@react-native-async-storage/async-storage';
import { avatarIds, type AvatarId } from '../types/avatar';

const PROFILE_KEY = 'sundayseeds.profile.v1';
export const DISPLAY_NAME_LIMIT = 40;
const AVATAR_KEY = 'sundayseeds.profile.avatar.v1';

export const avatarStorage = {
  async read(scope: string): Promise<AvatarId | null> {
    const stored = await AsyncStorage.getItem(`${AVATAR_KEY}.${scope}`);
    return avatarIds.find((id) => id === stored) ?? null;
  },
  async write(scope: string, avatarId: AvatarId | null) {
    const key = `${AVATAR_KEY}.${scope}`;
    if (avatarId) await AsyncStorage.setItem(key, avatarId);
    else await AsyncStorage.removeItem(key);
  },
};

export function normalizeDisplayName(value: string): string {
  const name = value.replace(/\s+/g, ' ').trim();
  if (name.length > DISPLAY_NAME_LIMIT) {
    throw new Error(`Use ${DISPLAY_NAME_LIMIT} characters or fewer.`);
  }
  return name;
}

export const profileStorage = {
  async readName(): Promise<string> {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw === null) return '';
    const profile: unknown = JSON.parse(raw);
    if (
      !profile ||
      typeof profile !== 'object' ||
      !('displayName' in profile) ||
      typeof profile.displayName !== 'string'
    ) {
      throw new Error('The saved profile could not be read.');
    }
    return normalizeDisplayName(profile.displayName);
  },
  async writeName(value: string): Promise<string> {
    const displayName = normalizeDisplayName(value);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ displayName }));
    return displayName;
  },
};
