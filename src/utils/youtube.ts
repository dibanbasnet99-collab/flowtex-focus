/**
 * YouTube integration helper functions and curated presets.
 */

export interface YouTubePreset {
  id: string;
  title: string;
  category: string;
  videoId: string;
}

export const YOUTUBE_PRESETS: YouTubePreset[] = [
  {
    id: 'lofi_girl',
    title: 'Lofi Girl - Chill Beats to Relax & Study',
    category: 'Lofi & Chill',
    videoId: 'jfKfPfyJRdk',
  },
  {
    id: 'cozy_coffee',
    title: 'Cozy Rain Coffee Shop Ambience',
    category: 'Ambient & Rain',
    videoId: 'lTRiuFIWV54',
  },
  {
    id: 'deep_space',
    title: 'Deep Focus Ambient & Cosmic Drone',
    category: 'Space & Focus',
    videoId: '4xDzrJKXOOY',
  },
  {
    id: 'tokyo_rain',
    title: 'Tokyo Rainy Night Walk 4K Ambience',
    category: 'City & Rain',
    videoId: 'ETbddPskp_k',
  },
  {
    id: 'synthwave_chill',
    title: 'Synthwave Chill / Cyberpunk Focus',
    category: 'Synthwave',
    videoId: 'MVPTGNGiI-4',
  },
];

export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtube URLs: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/live/ID
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}
