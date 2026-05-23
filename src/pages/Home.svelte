<script lang="ts">
  import { onMount } from 'svelte';
  import TrackCard from '../lib/components/TrackCard.svelte';
  import { getHomeSections } from '../lib/api/music';
  import { player } from '../lib/stores/player';
  import type { Track } from '../lib/api/types';

  let sections: { label: string; tracks: Track[] }[] = [];
  let loading = true;
  const { currentTrack } = player;

  onMount(async () => {
    loading = true;
    sections = await getHomeSections().catch(() => []);
    loading = false;
  });

  export let onNavigate: (p: string) => void = () => {};
</script>

<div class="home">
  <div class="hero">
    <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} 🎵</h1>
    <p>Free music, podcasts & learning — no account needed</p>
    <div class="hero-actions">
      <button class="cta" on:click={() => onNavigate('genres')}>Browse Genres 🎸</button>
      <button class="cta secondary" on:click={() => onNavigate('podcasts')}>Podcasts 🎙️</button>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading music...</p>
    </div>
  {:else}
    {#each sections as section}
      <section class="track-section">
        <h2>{section.label}</h2>
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
  .home { padding: 0 0 20px; }
  .hero { background: linear-gradient(135deg, #1a0533 0%, #0a0a1f 60%, #001a0a 100%); padding: 48px 32px 40px; margin-bottom: 32px; }
  .hero h1 { color: #fff; font-size: 32px; font-weight: 700; margin: 0 0 8px; }
  .hero p { color: #b3b3b3; font-size: 16px; margin: 0 0 24px; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .cta { padding: 12px 24px; border-radius: 24px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; background: #1db954; color: #000; transition: transform 0.15s; }
  .cta:hover { transform: scale(1.03); }
  .cta.secondary { background: transparent; color: #fff; border: 1px solid #555; }
  .cta.secondary:hover { border-color: #fff; }
  .loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px; color: #b3b3b3; }
  .spinner { width: 40px; height: 40px; border: 3px solid #2a2a3a; border-top-color: #7c5cbf; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .track-section { padding: 0 32px 32px; }
  .track-section h2 { color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
  .track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  @media (max-width: 768px) {
    .hero { padding: 32px 16px 28px; }
    .hero h1 { font-size: 24px; }
    .track-section { padding: 0 16px 24px; }
    .track-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
  }
</style>