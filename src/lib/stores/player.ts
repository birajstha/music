import { writable, derived, get } from 'svelte/store';
import type { PlayerItem } from '../api/types';

export type RepeatMode = 'none' | 'one' | 'all';

let ytPlayer: any = null;
let ytReady = false;
let pendingVideoId = '';
let progressInterval: any = null;

declare global {
  interface Window { onYouTubeIframeAPIReady: () => void; YT: any; }
}

function initYouTubeAPI() {
  if (typeof window === 'undefined' || document.querySelector('#yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  const first = document.getElementsByTagName('script')[0];
  first.parentNode!.insertBefore(tag, first);

  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new window.YT.Player('yt-hidden-player', {
      height: '0', width: '0',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
      events: {
        onReady: () => { ytReady = true; if (pendingVideoId) loadAndPlay(pendingVideoId); },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            playing.set(true); loading.set(false);
            startProgressTracker();
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            playing.set(false);
          } else if (e.data === window.YT.PlayerState.ENDED) {
            const r = get(repeat);
            if (r === 'one') { ytPlayer.seekTo(0); ytPlayer.playVideo(); }
            else next();
          } else if (e.data === window.YT.PlayerState.BUFFERING) {
            loading.set(true);
          } else if (e.data === window.YT.PlayerState.CUED) {
            loading.set(false);
          }
        },
        onError: () => { error.set('YouTube playback error'); loading.set(false); next(); },
      },
    });
  };
}

function startProgressTracker() {
  if (progressInterval) clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime && get(playing)) {
      const current = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || 1;
      progress.set(current / dur);
      duration.set(dur);
    }
  }, 250);
}

function loadAndPlay(videoId: string) {
  if (!ytReady || !ytPlayer) { pendingVideoId = videoId; return; }
  pendingVideoId = '';
  loading.set(true);
  ytPlayer.loadVideoById(videoId);
}

function createPlayerStore() {
  const queue = writable<PlayerItem[]>([]);
  const currentIndex = writable<number>(-1);
  const playing = writable(false);
  const loading = writable(false);
  const progress = writable(0);
  const duration = writable(0);
  const volume = writable(1);
  const muted = writable(false);
  const shuffle = writable(false);
  const repeat = writable<RepeatMode>('none');
  const error = writable('');

  const currentTrack = derived(
    [queue, currentIndex],
    ([$q, $i]) => ($i >= 0 && $i < $q.length ? $q[$i] : null)
  );

  // Combined store so $player works in Svelte templates
  const state = derived(
    [queue, currentIndex, playing, loading, progress, duration, volume, muted, shuffle, repeat, error, currentTrack],
    ([$queue, $currentIndex, $playing, $loading, $progress, $duration, $volume, $muted, $shuffle, $repeat, $error, $currentTrack]) => ({
      queue: $queue, currentIndex: $currentIndex, playing: $playing, loading: $loading,
      progress: $progress, duration: $duration, volume: $volume, muted: $muted,
      shuffle: $shuffle, repeat: $repeat, error: $error, currentTrack: $currentTrack,
    })
  );

  let initialized = false;
  let radioAudio: HTMLAudioElement | null = null;

  async function play(item?: PlayerItem, newQueue?: PlayerItem[]) {
    error.set('');
    if (newQueue) queue.set(newQueue);
    if (item) {
      const q = get(queue);
      const idx = q.findIndex(t => t.id === item.id);
      currentIndex.set(idx >= 0 ? idx : 0);
    }

    const cur = get(currentTrack);
    if (!cur) return;

    if (!initialized) { initialized = true; initYouTubeAPI(); }

    // Handle radio/podcast via audio element
    if (cur._type === 'radio' || cur._type === 'podcast') {
      const audioUrl = (cur as any).streamUrl || (cur as any).audioUrl;
      if (!audioUrl) { loading.set(false); error.set('No stream URL'); return; }
      loading.set(true);
      if (!radioAudio) {
        radioAudio = new Audio();
        radioAudio.onended = () => next();
        radioAudio.onplay = () => { playing.set(true); loading.set(false); };
        radioAudio.onpause = () => playing.set(false);
        radioAudio.onerror = () => { error.set('Stream error'); loading.set(false); };
      }
      if (ytPlayer?.stopVideo) ytPlayer.stopVideo();
      radioAudio.src = audioUrl;
      radioAudio.play().then(() => {
        playing.set(true);
        loading.set(false);
        startRadioProgress();
      }).catch(() => {
        error.set('Cannot play stream');
        loading.set(false);
      });
      updateMediaSession(cur);
      return;
    }

    // YouTube video playback
    if (ytPlayer?.stopVideo) ytPlayer.stopVideo();
    const videoId = cur.id;
    loadAndPlay(videoId);
    updateMediaSession(cur);
  }

  let radioInterval: any = null;
  function startRadioProgress() {
    if (radioInterval) clearInterval(radioInterval);
    radioInterval = setInterval(() => {
      if (radioAudio && get(playing)) {
        progress.set(radioAudio.currentTime / (radioAudio.duration || 600));
        duration.set(radioAudio.duration || 0);
      }
    }, 1000);
  }

  function pause() {
    if (radioAudio && !radioAudio.paused) { radioAudio.pause(); playing.set(false); }
    else if (ytPlayer?.pauseVideo) ytPlayer.pauseVideo();
    playing.set(false);
  }

  function resume() {
    if (get(currentTrack)?._type === 'radio' && radioAudio) { radioAudio.play(); playing.set(true); }
    else if (ytPlayer?.playVideo) ytPlayer.playVideo();
    playing.set(true);
  }

  function togglePlay() { if (get(playing)) pause(); else resume(); }

  function stop() {
    if (ytPlayer?.stopVideo) ytPlayer.stopVideo();
    if (radioAudio) { radioAudio.pause(); radioAudio.src = ''; }
    playing.set(false); progress.set(0);
  }

  function seek(ratio: number) {
    if (radioAudio && radioAudio.duration) {
      radioAudio.currentTime = ratio * radioAudio.duration;
      progress.set(ratio);
    } else if (ytPlayer?.seekTo && ytPlayer.getDuration()) {
      ytPlayer.seekTo(ratio * ytPlayer.getDuration(), true);
      progress.set(ratio);
    }
  }

  function setVolume(v: number) {
    volume.set(v);
    if (radioAudio) radioAudio.volume = v;
    if (ytPlayer?.setVolume) ytPlayer.setVolume(v * 100);
    if (v > 0) muted.set(false);
  }

  function toggleMute() {
    const m = !get(muted);
    muted.set(m);
    if (radioAudio) radioAudio.muted = m;
    if (ytPlayer) { if (m) ytPlayer.mute(); else ytPlayer.unMute(); }
  }

  function next() {
    const q = get(queue);
    const idx = get(currentIndex);
    const s = get(shuffle);
    const r = get(repeat);

    if (r === 'one') {
      if (ytPlayer?.seekTo) { ytPlayer.seekTo(0); ytPlayer.playVideo(); }
      else if (radioAudio) { radioAudio.currentTime = 0; radioAudio.play(); }
      return;
    }

    let nextIdx: number;
    if (s) nextIdx = Math.floor(Math.random() * q.length);
    else {
      nextIdx = idx + 1;
      if (nextIdx >= q.length) {
        if (r === 'all') nextIdx = 0;
        else { playing.set(false); return; }
      }
    }
    currentIndex.set(nextIdx);
    play();
  }

  function prev() {
    const idx = get(currentIndex);
    if (ytPlayer?.getCurrentTime && ytPlayer.getCurrentTime() > 3) {
      ytPlayer.seekTo(0, true); return;
    }
    if (radioAudio && radioAudio.currentTime > 3) {
      radioAudio.currentTime = 0; return;
    }
    currentIndex.set(Math.max(0, idx - 1));
    play();
  }

  function updateMediaSession(item: PlayerItem) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: (item as any).artist || '',
        artwork: [{ src: (item as any).thumbnail || '', sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', next);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
    } catch {}
  }

  function getQueue() { return get(queue); }

  return {
    subscribe: state.subscribe,
    queue, currentIndex, playing, loading, progress, duration,
    volume, muted, shuffle, repeat, error, currentTrack,
    play, pause, resume, togglePlay, seek, setVolume,
    toggleMute, next, prev, getQueue, stop,
  };
}

export const player = createPlayerStore();