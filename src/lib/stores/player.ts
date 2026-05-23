import { writable, derived, get } from 'svelte/store';
import type { PlayerItem } from '../api/types';
import { getStreamUrl } from '../api/piped';

export type RepeatMode = 'none' | 'one' | 'all';

function createPlayerStore() {
  const queue = writable<PlayerItem[]>([]);
  const currentIndex = writable<number>(-1);
  const playing = writable(false);
  const loading = writable(false);
  const progress = writable(0); // 0-1
  const duration = writable(0);
  const volume = writable(1);
  const muted = writable(false);
  const shuffle = writable(false);
  const repeat = writable<RepeatMode>('none');
  const dataSaver = writable(false);
  const streamUrl = writable('');
  const error = writable('');

  const currentTrack = derived(
    [queue, currentIndex],
    ([$queue, $idx]) => ($idx >= 0 && $idx < $queue.length ? $queue[$idx] : null)
  );

  let audio: HTMLAudioElement | null = null;

  function getAudio(): HTMLAudioElement {
    if (!audio) {
      audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('timeupdate', () => {
        if (audio!.duration) {
          progress.set(audio!.currentTime / audio!.duration);
          duration.set(audio!.duration);
        }
      });
      audio.addEventListener('ended', () => {
        const $repeat = get(repeat);
        if ($repeat === 'one') {
          audio!.currentTime = 0;
          audio!.play();
        } else {
          next();
        }
      });
      audio.addEventListener('error', () => {
        error.set('Stream failed — trying next...');
        loading.set(false);
        next();
      });
    }
    return audio;
  }

  async function play(item?: PlayerItem, newQueue?: PlayerItem[]) {
    error.set('');
    if (newQueue) queue.set(newQueue);
    if (item) {
      const $queue = get(queue);
      const idx = $queue.findIndex(t => t.id === item.id);
      currentIndex.set(idx >= 0 ? idx : 0);
    }

    const $current = get(currentTrack);
    if (!$current) return;

    loading.set(true);
    const a = getAudio();
    a.pause();

    try {
      let url = '';
      if ($current._type === 'track') {
        const stream = await getStreamUrl($current.id, get(dataSaver));
        url = stream.url;
      } else {
        // podcast — direct audio URL
        url = ($current as any).audioUrl;
      }
      streamUrl.set(url);
      a.src = url;
      a.volume = get(muted) ? 0 : get(volume);
      await a.play();
      playing.set(true);
      updateMediaSession($current);
    } catch (e) {
      error.set('Playback error');
    } finally {
      loading.set(false);
    }
  }

  function pause() {
    getAudio().pause();
    playing.set(false);
  }

  function resume() {
    getAudio().play();
    playing.set(true);
  }

  function togglePlay() {
    if (get(playing)) pause(); else resume();
  }

  function seek(ratio: number) {
    const a = getAudio();
    if (a.duration) {
      a.currentTime = ratio * a.duration;
      progress.set(ratio);
    }
  }

  function setVolume(v: number) {
    volume.set(v);
    const a = getAudio();
    a.volume = v;
    if (v > 0) muted.set(false);
  }

  function toggleMute() {
    const m = !get(muted);
    muted.set(m);
    getAudio().volume = m ? 0 : get(volume);
  }

  function next() {
    const $queue = get(queue);
    const $idx = get(currentIndex);
    const $shuffle = get(shuffle);
    const $repeat = get(repeat);

    if ($repeat === 'one') { seek(0); resume(); return; }

    let nextIdx: number;
    if ($shuffle) {
      nextIdx = Math.floor(Math.random() * $queue.length);
    } else {
      nextIdx = $idx + 1;
      if (nextIdx >= $queue.length) {
        if ($repeat === 'all') nextIdx = 0;
        else { playing.set(false); return; }
      }
    }
    currentIndex.set(nextIdx);
    play();
  }

  function prev() {
    const $idx = get(currentIndex);
    const a = getAudio();
    if (a.currentTime > 3) { seek(0); return; }
    currentIndex.set(Math.max(0, $idx - 1));
    play();
  }

  function updateMediaSession(item: PlayerItem) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title,
      artist: item._type === 'track' ? (item as any).artist : (item as any).showName,
      artwork: [{ src: (item as any).thumbnail || (item as any).thumbnailUrl || '', sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', resume);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  }

  return {
    queue, currentIndex, playing, loading, progress, duration,
    volume, muted, shuffle, repeat, dataSaver, streamUrl, error,
    currentTrack, play, pause, resume, togglePlay, seek, setVolume,
    toggleMute, next, prev,
  };
}

export const player = createPlayerStore();
