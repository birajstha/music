export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  source: 'audius' | 'itunes';
  previewUrl?: string;
  _type?: 'track' | 'podcast' | 'radio';
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
  duration: number;
  showName: string;
  showIcon: string;
  thumbnail?: string;
}

export interface PodcastShow {
  id: string;
  name: string;
  host: string;
  icon: string;
  rss: string;
}

export interface RadioStation {
  id: string;
  name: string;
  slogan: string;
  streamUrl: string;
  icon: string;
  color: string;
  location: string;
}

export interface LearningChannel {
  id: string;
  name: string;
  query: string;
  icon: string;
}

export type PlayerItem = (Track | PodcastEpisode) & { _type: 'track' | 'podcast' | 'radio' };