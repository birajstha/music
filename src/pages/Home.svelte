<script lang="ts">
  import { onMount } from 'svelte';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import { getHomeSections } from '../lib/api/music';
  import { getWeather, type WeatherData } from '../lib/api/weather';
  import { player } from '../lib/stores/player';
  import type { Track } from '../lib/api/types';

  const { currentTrack } = player;

  export let onNavigate: (p: string) => void;
  let sections: { label: string; tracks: Track[] }[] = [];
  let loading = true;
  let weather: WeatherData | null = null;

  onMount(async () => {
    weather = await getWeather();
    sections = await getHomeSections().catch(() => []);
    loading = false;
  });
</script>

<div class="home">
  <!-- Hero -->
  <div class="hero">
    <div class="hero-text">
      <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h1>
      {#if weather}
        <p class="weather-suggestion">{weather.condition} in {weather.location} — try some {weather.songMood}</p>
      {:else}
        <p>Pick a mood. Any mood.</p>
      {/if}
    </div>
    <div class="hero-chips">
      <button class="chip" on:click={() => onNavigate('genres')}>Browse genres</button>
      <button class="chip secondary" on:click={() => onNavigate('radio')}>Live radio</button>
      <button class="chip secondary" on:click={() => onNavigate('podcasts')}>Podcasts</button>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else}
    {#each sections as section}
      <section class="section">
        <h2 class="section-title">{section.label}</h2>
        <div class="track-grid">
          {#each section.tracks as track}
            <TrackCard {track} queue={section.tracks} active={$currentTrack?.id === track.id} />
          {/each}
        </div>
      </section>
    {/each}
  {/if}
</div>

<style>
  .home { padding: 0 0 40px; }
  .hero {
    padding: 48px 40px 40px;
    background: linear-gradient(135deg, rgba(232,184,75,0.06) 0%, rgba(124,111,224,0.04) 50%, transparent 100%);
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .hero-text { margin-bottom: 20px; }
  .hero h1 { color: #F0EEF5; font-size: 36px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
  .weather-suggestion { color: #8B89A6; font-size: 14px; margin: 0; }
  .hero-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip {
    padding: 8px 20px; border-radius: 20px; border: none;
    font-size: 13px; font-weight: 500; cursor: pointer;
    background: rgba(232,184,75,0.12); color: #E8B84B;
    transition: background 0.15s;
  }
  .chip:hover { background: rgba(232,184,75,0.2); }
  .chip.secondary { background: rgba(255,255,255,0.04); color: #8B89A6; }
  .chip.secondary:hover { background: rgba(255,255,255,0.08); color: #F0EEF5; }

  .loading { display: flex; justify-content: center; padding: 80px; }
  .spinner { width: 36px; height: 36px; border: 3px solid rgba(232,184,75,0.1); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .section { padding: 32px 40px 8px; }
  .section-title { color: #F0EEF5; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }

  @media (max-width: 768px) {
    .hero { padding: 32px 16px 28px; }
    .hero h1 { font-size: 26px; }
    .section { padding: 24px 16px 8px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  }
</style>