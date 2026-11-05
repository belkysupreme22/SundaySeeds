// Keep the IDs in the sprite sheet's row order. Saved choices use these IDs.
export const avatarIds = [
  'curls',
  'glasses',
  'headwrap',
  'braids',
  'cropped',
  'silver',
  'twists',
  'puff',
  'waves',
  'shawl',
  'bun',
  'beard',
] as const;

export type AvatarId = (typeof avatarIds)[number];
