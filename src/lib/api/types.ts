export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  source: 'youtube';
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
  channelId: string;
  query: string;
  icon: string;
}

export type PlayerItem = Track & { _type: 'track' | 'podcast' | 'radio' };

export interface Playlist {
  id: string;
  name: string;
  tracks: TrackItem[];
  createdAt: number;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  source: 'youtube';
  addedAt: number;
}