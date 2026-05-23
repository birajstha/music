import { writable, derived, get } from 'svelte/store';
import type { PlayerItem } from '../api/types';
import { getStreamUrl } from '../api/music';
import { RADIO_STATIONS } from '../api/radio';

export type RepeatMode = 'none' | 'one' | 'all';

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

  let audio: HTMLAudioElement | null = null;

  function getAudio(): HTMLAudioElement {
    if (!audio) {
      audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('timeupdate', () => {
        if (audio!.duration && isFinite(audio!.duration)) {
          progress.set(audio!.currentTime / audio!.duration);
          duration.set(audio!.duration);
        }
      });
      audio.addEventListener('ended', () => {
        const r = get(repeat);
        if (r === 'one') { audio!.currentTime = 0; audio!.play(); }
        else next();
      });
      audio.addEventListener('error', () => {
        error.set('Stream unavailable');
        loading.set(false);
      });
    }
    return audio;
  }

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

    loading.set(true);
    const a = getAudio();
    a.pause();

    try {
      let url = '';

      if (cur._type === 'radio') {
        // Radio station — direct stream URL
        url = (cur as any).streamUrl as string;
        // Radio streams are continuous — mark duration as infinite
        duration.set(NaN);
      } else if (cur._type === 'podcast') {
        url = `/api/proxy?url=${encodeURIComponent((cur as any).audioUrl)}`;
      } else {
        // Track — try Audius then iTunes preview
        const stream = await getStreamUrl(cur.id, cur as any);
        url = stream.url;
      }

      a.src = url;
      a.volume = get(muted) ? 0 : get(volume);
      await a.play();
      playing.set(true);
      updateMediaSession(cur);
    } catch (e) {
      error.set('Could not play this track');
    } finally {
      loading.set(false);
    }
  }

  function pause() { getAudio().pause(); playing.set(false); }
  function resume() { getAudio().play(); playing.set(true); }
  function togglePlay() { if (get(playing)) pause(); else resume(); }

  function seek(ratio: number) {
    const a = getAudio();
    if (a.duration && isFinite(a.duration)) {
      a.currentTime = ratio * a.duration;
      progress.set(ratio);
    }
  }

  function setVolume(v: number) {
    volume.set(v);
    getAudio().volume = v;
    if (v > 0) muted.set(false);
  }

  function toggleMute() {
    const m = !get(muted);
    muted.set(m);
    getAudio().volume = m ? 0 : get(volume);
  }

  function next() {
    const q = get(queue);
    const idx = get(currentIndex);
    const s = get(shuffle);
    const r = get(repeat);

    if (r === 'one') { seek(0); resume(); return; }

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
    const a = getAudio();
    if (a.currentTime > 3) { seek(0); return; }
    currentIndex.set(Math.max(0, idx - 1));
    play();
  }

  function updateMediaSession(item: PlayerItem) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title,
      artist: (item as any).artist || (item as any).showName || '',
      artwork: [{ src: (item as any).thumbnail || '', sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', resume);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  }

  function getQueue() { return get(queue); }

  return {
    queue, currentIndex, playing, loading, progress, duration,
    volume, muted, shuffle, repeat, error,
    currentTrack, play, pause, resume, togglePlay, seek, setVolume,
    toggleMute, next, prev, getAudio, getQueue,
  };
}

export const player = createPlayerStore();