import type { LearningChannel } from './types';

export const GENRES = [
  { id: 'trending', label: 'Trending', query: 'top music 2025' },
  { id: 'pop', label: 'Pop', query: 'pop music 2025' },
  { id: 'hiphop', label: 'Hip Hop', query: 'hip hop rap 2025' },
  { id: 'rnb', label: 'R&B', query: 'rnb soul 2025' },
  { id: 'edm', label: 'Electronic', query: 'edm electronic 2025' },
  { id: 'rock', label: 'Rock', query: 'rock music 2025' },
  { id: 'indie', label: 'Indie', query: 'indie alternative 2025' },
  { id: 'jazz', label: 'Jazz', query: 'jazz music' },
  { id: 'classical', label: 'Classical', query: 'classical music' },
  { id: 'lofi', label: 'Lo-Fi', query: 'lofi beats chill' },
  { id: 'metal', label: 'Metal', query: 'metal music 2025' },
  { id: 'country', label: 'Country', query: 'country hits 2025' },
];

export const LEARNING_CHANNELS: LearningChannel[] = [
  { id: 'fcc', name: 'freeCodeCamp', channelId: 'UC8butISFwT-Wl7EV0hUK0BQ', icon: '💻' },
  { id: '3b1b', name: '3Blue1Brown', channelId: 'UCYO_jab_esuFRV4b17AJtAw', icon: '📐' },
  { id: 'fireship', name: 'Fireship', channelId: 'UCsBjURrPoezykLs9EqgamOA', icon: '🔥' },
  { id: 'traversy', name: 'Traversy Media', channelId: 'UC29ju8bIPH5as8OGnQzwJyA', icon: '🌐' },
  { id: 'ted_ed', name: 'TED-Ed', channelId: 'UCsooa4yRKGN_zEE8iknghZA', icon: '💡' },
  { id: 'kurzgesagt', name: 'Kurzgesagt', channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', icon: '🌍' },
  { id: 'mit', name: 'MIT OpenCourseWare', channelId: 'UCEBb1b_L6zDS3xTUrIALZOw', icon: '🎓' },
  { id: 'veritasium', name: 'Veritasium', channelId: 'UCkyfHZ6bY2TjqbCwmJxWj4A', icon: '🔬' },
];