export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
  source: 'piped';
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

export interface Genre {
  id: string;
  label: string;
  query: string;
  color: string;
}

export interface LearningChannel {
  id: string;
  name: string;
  query: string;
  icon: string;
}

export type PlayerItem = (Track | PodcastEpisode) & { _type: 'track' | 'podcast' };
