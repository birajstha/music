import type { Genre, LearningChannel } from './types';

export const GENRES: Genre[] = [
  { id: 'trending',    label: 'Trending 🔥',    query: 'trending music 2024',              color: '#ff6b35' },
  { id: 'pop',         label: 'Pop 🎤',          query: 'pop hits 2024',                    color: '#e040fb' },
  { id: 'rock',        label: 'Rock 🎸',          query: 'rock music classics',              color: '#f44336' },
  { id: 'hiphop',      label: 'Hip-Hop 🎧',      query: 'hip hop rap 2024',                 color: '#ff9800' },
  { id: 'rnb',         label: 'R&B 🎶',           query: 'rnb soul music 2024',              color: '#ec407a' },
  { id: 'edm',         label: 'EDM ⚡',           query: 'edm electronic dance music',       color: '#00e5ff' },
  { id: 'lofi',        label: 'Lo-Fi 🌙',         query: 'lofi hip hop beats study chill',   color: '#7c4dff' },
  { id: 'jazz',        label: 'Jazz 🎷',           query: 'jazz music relaxing',              color: '#ffd740' },
  { id: 'classical',   label: 'Classical 🎻',     query: 'classical music orchestra',        color: '#80cbc4' },
  { id: 'country',     label: 'Country 🤠',       query: 'country music hits',               color: '#a5d6a7' },
  { id: 'indie',       label: 'Indie 🌿',          query: 'indie music 2024',                 color: '#80deea' },
  { id: 'metal',       label: 'Metal 🤘',          query: 'heavy metal music',                color: '#ef5350' },
  { id: 'ambient',     label: 'Ambient 🌊',       query: 'ambient music relaxing',           color: '#4db6ac' },
  { id: 'nepali_hot',  label: 'Nepali Hot 🇳🇵',  query: 'nepali music 2024 trending',       color: '#ff5722' },
  { id: 'lok_dohori',  label: 'Lok Dohori 🏔️',   query: 'lok dohori nepali folk music',     color: '#8d6e63' },
  { id: 'nepali_pop',  label: 'Nepali Pop 🎵',    query: 'nepali pop music modern',          color: '#ab47bc' },
  { id: 'nepali_rap',  label: 'Nepali Rap 🎤',    query: 'nepali rap hip hop',               color: '#546e7a' },
];

export const LEARNING_CHANNELS: LearningChannel[] = [
  { id: 'fcc',        name: 'freeCodeCamp',    query: 'freecodecamp programming tutorial', icon: '💻' },
  { id: '3b1b',       name: '3Blue1Brown',     query: '3blue1brown math',                 icon: '🔢' },
  { id: 'fireship',   name: 'Fireship',        query: 'fireship tech javascript',         icon: '🔥' },
  { id: 'traversy',   name: 'Traversy Media',  query: 'traversy media web development',   icon: '🌐' },
  { id: 'ted_ed',     name: 'TED-Ed',          query: 'ted-ed education animated lesson', icon: '🎓' },
  { id: 'kurzgesagt', name: 'Kurzgesagt',      query: 'kurzgesagt in a nutshell',         icon: '🌍' },
  { id: 'mit',        name: 'MIT OpenCourse',  query: 'mit opencourseware lecture',       icon: '🏛️' },
  { id: 'veritasium', name: 'Veritasium',      query: 'veritasium science',               icon: '⚛️' },
];
