<script lang="ts">
  import { GENRES } from '../api/constants';
  export let activeGenre = 'trending';
  export let onSelect: (id: string) => void = () => {};
</script>

<div class="genre-grid">
  {#each GENRES as genre}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="genre-tile {activeGenre === genre.id ? 'active' : ''}"
      style="--c: {genre.color}"
      on:click={() => onSelect(genre.id)}
    >
      <span class="genre-label">{genre.label}</span>
    </div>
  {/each}
</div>

<style>
  .genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  .genre-tile {
    background: color-mix(in srgb, var(--c) 20%, #141420);
    border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
    border-radius: 10px; padding: 20px 12px;
    cursor: pointer; text-align: center;
    transition: background 0.15s, transform 0.15s;
  }
  .genre-tile:hover { background: color-mix(in srgb, var(--c) 35%, #141420); transform: translateY(-2px); }
  .genre-tile.active { background: color-mix(in srgb, var(--c) 45%, #141420); border-color: var(--c); }
  .genre-label { color: #fff; font-size: 13px; font-weight: 600; }
</style>
