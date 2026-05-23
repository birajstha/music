import type { LearningChannel } from './types';

export const LEARNING_CHANNELS: LearningChannel[] = [
  { id: 'fcc', name: 'freeCodeCamp', icon: '💻', query: 'freecodecamp' },
  { id: '3b1b', name: '3Blue1Brown', icon: '🔢', query: '3blue1brown' },
  { id: 'fireship', name: 'Fireship', icon: '🔥', query: 'fireship' },
  { id: 'traversy', name: 'Traversy Media', icon: '🌐', query: 'traversy' },
  { id: 'ted_ed', name: 'TED-Ed', icon: '🎓', query: 'ted-ed' },
  { id: 'kurzgesagt', name: 'Kurzgesagt', icon: '🌍', query: 'kurzgesagt' },
  { id: 'mit', name: 'MIT OpenCourse', icon: '🏛️', query: 'mit' },
  { id: 'veritasium', name: 'Veritasium', icon: '⚛️', query: 'veritasium' },
];

export const GENRES = [
  { id: 'trending',  label: '🔥 Top Songs',       color: '#ff6b35' },
  { id: 'pop',       label: '🎤 Pop',              color: '#e040fb' },
  { id: 'hiphop',    label: '🎧 Hip-Hop',          color: '#ff9800' },
  { id: 'rnb',       label: '🎶 R&B',              color: '#ec407a' },
  { id: 'edm',       label: '⚡ Electronic',       color: '#00e5ff' },
  { id: 'rock',      label: '🎸 Rock',             color: '#f44336' },
  { id: 'country',   label: '🤠 Country',          color: '#a5d6a7' },
  { id: 'jazz',      label: '🎷 Jazz',             color: '#ffd740' },
  { id: 'classical', label: '🎻 Classical',        color: '#80cbc4' },
  { id: 'metal',     label: '🤘 Metal',            color: '#ef5350' },
  { id: 'indie',     label: '🌿 Indie',            color: '#80deea' },
];