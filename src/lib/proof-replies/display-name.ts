const replyAdjectives = [
  "Helpful",
  "Nearby",
  "Quick",
  "Kind",
  "Curious",
  "Calm",
  "Sharp",
  "Local",
  "Honest",
  "Clever",
  "Friendly",
  "Watchful",
] as const;

const replyNouns = [
  "Owl",
  "Fox",
  "Robin",
  "Otter",
  "Heron",
  "Finch",
  "Badger",
  "Sparrow",
  "Moose",
  "Koala",
  "Lynx",
  "Crane",
] as const;

const posterAdjectives = [
  "Asking",
  "Checking",
  "Curious",
  "Careful",
  "Verifying",
  "Wondering",
  "Searching",
  "Seeking",
  "Thoughtful",
  "Cautious",
  "Looking",
  "Hoping",
] as const;

const posterNouns = [
  "Traveler",
  "Scout",
  "Visitor",
  "Seeker",
  "Ranger",
  "Pilgrim",
  "Guest",
  "Wanderer",
  "Explorer",
  "Finder",
  "Watcher",
  "Planner",
] as const;

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function generateDisplayName(
  seed: string,
  adjectives: readonly string[],
  nouns: readonly string[],
) {
  const hash = hashString(seed);
  const adjective = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >>> 8) % nouns.length];
  const number = 10 + (hash % 90);

  return `${adjective}${noun}${number}`;
}

export function generateReplyDisplayName(replyId: string) {
  return generateDisplayName(replyId, replyAdjectives, replyNouns);
}

export function generatePosterDisplayName(requestId: string) {
  return generateDisplayName(requestId, posterAdjectives, posterNouns);
}

export function getReplyDisplayName(replyId: string, helperName: string | null) {
  const trimmedName = helperName?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return generateReplyDisplayName(replyId);
}
