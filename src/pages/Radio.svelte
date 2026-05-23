<script lang="ts">
  import { RADIO_STATIONS } from '../lib/api/radio';
  import { player } from '../lib/stores/player';

  function playStation(s: typeof RADIO_STATIONS[0]) {
    const item = {
      id: s.id, title: s.name, artist: s.slogan,
      thumbnail: '', duration: 0, source: 'youtube' as const,
      _type: 'radio' as const,
      streamUrl: s.streamUrl,
    };
    player.play(item as any);
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Radio</h1>
    <p>Live stations from around the world</p>
  </div>

  <div class="radio-grid">
    {#each RADIO_STATIONS as station}
      <button class="radio-card" style="--accent: {station.color}" on:click={() => playStation(station)}>
        <div class="radio-icon">{station.icon}</div>
        <div class="radio-info">
          <strong class="radio-name">{station.name}</strong>
          <span class="radio-slogan">{station.slogan}</span>
          <span class="radio-location">{station.location}</span>
        </div>
        <div class="radio-live">
          <span class="live-dot"></span>
          LIVE
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .page { padding: 32px; max-width: 900px; margin: 0 auto; }
  .page-header { margin-bottom: 32px; }
  .page-header h1 { color: #F0EEF5; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #8B89A6; margin: 0; font-size: 14px; }
  .radio-grid { display: flex; flex-direction: column; gap: 8px; }
  .radio-card {
    display: flex; align-items: center; gap: 16px;
    width: 100%; padding: 16px 20px; border: none;
    background: rgba(255,255,255,0.02); border-radius: 12px;
    border-left: 4px solid var(--accent);
    color: #F0EEF5; cursor: pointer; text-align: left;
    transition: background 0.15s;
  }
  .radio-card:hover { background: rgba(255,255,255,0.04); }
  .radio-icon { font-size: 32px; width: 48px; text-align: center; flex-shrink: 0; }
  .radio-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .radio-name { font-size: 15px; font-weight: 600; }
  .radio-slogan { font-size: 12px; color: #8B89A6; }
  .radio-location { font-size: 11px; color: #5a5878; }
  .radio-live { display: flex; align-items: center; gap: 6px; color: #e74c3c; font-size: 11px; font-weight: 700; text-transform: uppercase; flex-shrink: 0; }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #e74c3c; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  @media (max-width: 768px) { .page { padding: 16px; } .radio-icon { width: 36px; font-size: 24px; } }
</style>