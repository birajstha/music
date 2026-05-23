import type { RadioStation } from './types';

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'bbc1', name: 'BBC Radio 1', slogan: 'The UK\'s biggest radio station',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', icon: '📻', color: '#bb1919', location: 'London, UK',
  },
  {
    id: 'npr', name: 'NPR 24/7', slogan: 'News, music, culture',
    streamUrl: 'https://npr-ice.streamguys1.com/live', icon: '🎙️', color: '#2c3e50', location: 'Washington, DC',
  },
  {
    id: 'sirius_xl', name: 'SiriusXM Chill', slogan: 'Ambient & chill electronica',
    streamUrl: 'https://icecast.siriusxm.com/chill', icon: '🧊', color: '#3498db', location: 'New York, NY',
  },
  {
    id: 'hits', name: 'iHeart 80s', slogan: 'Best of the 80s',
    streamUrl: 'https://stream.revma.ihrhls.com/zc1393', icon: '🎸', color: '#e74c3c', location: 'USA',
  },
  {
    id: 'classic_fm', name: 'Classic FM', slogan: 'The world\'s greatest music',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three', icon: '🎻', color: '#2d3436', location: 'London, UK',
  },
  {
    id: 'jazz_fm', name: 'Jazz FM', slogan: 'The smooth sound of jazz',
    streamUrl: 'https://streams.fluxfm.de/jazzfm/mp3-128', icon: '🎷', color: '#e67e22', location: 'Berlin, DE',
  },
  {
    id: 'lo_fi', name: 'Lo-Fi 24/7', slogan: 'Beats to relax/study to',
    streamUrl: 'https://streams.fluxfm.de/lofi/mp3-128', icon: '🌙', color: '#8e44ad', location: 'Global',
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
    id: 'latina', name: 'Latina Beats', slogan: 'Reggaeton, Latin pop, salsa',
    streamUrl: 'https://streams.fluxfm.de/latina/mp3-128', icon: '💃', color: '#ff6b35', location: 'Miami, FL',
  },
];