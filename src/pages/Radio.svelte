<script lang="ts">
  import { RADIO_STATIONS } from '../lib/api/radio';
  import { player } from '../lib/stores/player';

  function playStation(s: typeof RADIO_STATIONS[0]) {
    const item = {
      id: s.id, title: s.name, artist: s.slogan,
      thumbnail: '', duration: 0, source: 'itunes' as const,
      _type: 'radio' as const,
      streamUrl: s.streamUrl,
      icon: s.icon,
    };
    player.play(item as any);
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>📻 Radio</h1>
    <p>Live stations from around the world</p>
  </div>

  <div class="radio-grid">
    {#each RADIO_STATIONS as station}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="radio-card" style="--accent: {station.color}" on:click={() => playStation(station)}>
        <div class="radio-icon">{station.icon}</div>
        <div class="radio-info">
          <h3>{station.name}</h3>
          <p class="radio-slogan">{station.slogan}</p>
          <p class="radio-location">{station.location}</p>
        </div>
        <div class="radio-live"><span class="live-dot"></span> LIVE</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .page { padding: 32px; max-width: 900px; margin: 0 auto; }
  .page-header { margin-bottom: 32px; }
  .page-header h1 { color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 4px; }
  .page-header p { color: #aaa; margin: 0; font-size: 14px; }
  .radio-grid { display: grid; gap: 12px; }
  .radio-card {
    display: flex; align-items: center; gap: 16px;
    background: #141420; border-radius: 12px; padding: 16px 20px;
    border-left: 4px solid var(--accent);
    cursor: pointer; transition: background 0.15s, transform 0.15s;
  }
  .radio-card:hover { background: #1e1e30; transform: translateX(4px); }
  .radio-icon { font-size: 36px; width: 56px; text-align: center; flex-shrink: 0; }
  .radio-info { flex: 1; }
  .radio-info h3 { color: #fff; font-size: 16px; font-weight: 600; margin: 0 0 2px; }
  .radio-slogan { color: #aaa; font-size: 13px; margin: 0 0 2px; }
  .radio-location { color: #666; font-size: 11px; margin: 0; }
  .radio-live { display: flex; align-items: center; gap: 6px; color: #e74c3c; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #e74c3c; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  @media (max-width: 768px) { .page { padding: 16px; } }
</style>