import type { RadioStation } from './types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'groovesalad', name: 'Groove Salad', slogan: 'A nicely chilled plate of ambient beats and grooves',
    streamUrl: 'https://ice3.somafm.com/groovesalad-128-mp3', icon: '🥗', color: '#27ae60', location: 'San Francisco, CA',
  },
  {
    id: 'lush', name: 'Lush', slogan: 'Vocals & chill electronica',
    streamUrl: 'https://ice3.somafm.com/lush-128-mp3', icon: '🌸', color: '#e91e63', location: 'San Francisco, CA',
  },
  {
    id: 'dronezone', name: 'Drone Zone', slogan: 'Atmospheric ambient minimalism',
    streamUrl: 'https://ice3.somafm.com/dronezone-128-mp3', icon: '🌌', color: '#8e44ad', location: 'San Francisco, CA',
  },
  {
    id: 'defcon', name: 'DEF CON Radio', slogan: 'The DEF CON hacking conference radio',
    streamUrl: 'https://ice3.somafm.com/defcon-128-mp3', icon: '🛡️', color: '#e74c3c', location: 'Las Vegas, NV',
  },
  {
    id: 'bassdrive', name: 'Bassdrive', slogan: 'Drum & Bass — 24/7 worldwide',
    streamUrl: 'https://bassdrive.com/bassdrive.mp3', icon: '🎧', color: '#3498db', location: 'Global',
  },
  {
    id: 'lofi', name: 'Lo-Fi 24/7', slogan: 'Beats to relax/study to',
    streamUrl: 'https://streams.fluxfm.de/lofi/mp3-128', icon: '🌙', color: '#8e44ad', location: 'Berlin, DE',
  },
  {
    id: 'jazzfm', name: 'Jazz FM', slogan: 'The smooth sound of jazz',
    streamUrl: 'https://streams.fluxfm.de/jazzfm/mp3-128', icon: '🎷', color: '#e67e22', location: 'Berlin, DE',
  },
  {
    id: 'kpop', name: 'K-Pop Hits', slogan: 'The biggest K-Pop anthems',
    streamUrl: 'https://streams.fluxfm.de/k-pop/mp3-128', icon: '🇰🇷', color: '#e91e63', location: 'Seoul, KR',
  },
  {
    id: 'reggae', name: 'Reggae Vibes', slogan: 'Roots, rock, reggae',
    streamUrl: 'https://streams.fluxfm.de/reggae/mp3-128', icon: '🌴', color: '#27ae60', location: 'Kingston, JM',
  },
  {
    id: 'classical', name: 'Classical', slogan: 'The best classical music',
    streamUrl: 'https://ice3.somafm.com/classical-128-mp3', icon: '🎻', color: '#2d3436', location: 'San Francisco, CA',
  },
];