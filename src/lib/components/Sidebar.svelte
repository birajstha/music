<script lang="ts">
  import { playlists, playlistCount, createPlaylist, deletePlaylist } from '../stores/playlists';

  export let page: string;
  export let onNavigate: (p: string) => void = () => {};

  const NAV = [
    { id: 'home',     icon: '🏠', label: 'Home' },
    { id: 'genres',   icon: '🎸', label: 'Genres' },
    { id: 'radio',    icon: '📻', label: 'Radio' },
    { id: 'podcasts', icon: '🎙️', label: 'Podcasts' },
    { id: 'learning', icon: '📚', label: 'Learn' },
    { id: 'search',   icon: '🔍', label: 'Search' },
  ];

  let showPlistMenu = '';
  let newPlistName = '';

  function createNew() {
    if (!newPlistName.trim()) return;
    createPlaylist(newPlistName.trim());
    newPlistName = '';
  }
</script>

<!-- Desktop sidebar -->
<nav class="sidebar">
  <div class="logo"><span class="logo-icon">💊</span> <span>ChillPill</span></div>

  {#each NAV as item}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="nav-item {page === item.id ? 'active' : ''}" on:click={() => onNavigate(item.id)}>
      <span class="nav-icon">{item.icon}</span>
      <span class="nav-label">{item.label}</span>
    </div>
  {/each}

  <!-- Playlists -->
  <div class="plist-header">
    <span class="plist-title">📚 Your Library</span>
    <span class="plist-count">{$playlistCount} tracks</span>
  </div>
  <div class="plist-list">
    {#each $playlists as pl}
      <div class="plist-item" on:click={() => { showPlistMenu = showPlistMenu === pl.id ? '' : pl.id; }}>
        <span>🎶 {pl.name}</span>
        <span class="plist-count">{pl.tracks.length}</span>
      </div>
      {#if showPlistMenu === pl.id}
        <div class="plist-menu">
          <button on:click|stopPropagation={() => { deletePlaylist(pl.id); showPlistMenu = ''; }}>🗑️ Delete</button>
        </div>
      {/if}
    {/each}
    <div class="plist-create">
      <input type="text" bind:value={newPlistName} placeholder="New playlist..."
        on:keydown={(e) => e.key === 'Enter' && createNew()} />
      <button on:click={createNew}>+</button>
    </div>
  </div>

  <div class="sidebar-foot">
    <p class="brand">Evanié Sound</p>
  </div>
</nav>

<!-- Mobile tabbar -->
<nav class="tabbar">
  {#each NAV as item}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="tab {page === item.id ? 'active' : ''}" on:click={() => onNavigate(item.id)}>
      <span class="tab-icon">{item.icon}</span>
      <span class="tab-label">{item.label}</span>
    </div>
  {/each}
</nav>

<style>
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 80px; width: 220px;
    background: #0b0b14; display: flex; flex-direction: column;
    padding: 16px 0; border-right: 1px solid #1a1a2e; z-index: 50;
  }
  .logo { color: #fff; font-size: 18px; font-weight: 700; padding: 4px 20px 20px; }
  .logo-icon { margin-right: 4px; }
  .logo span:last-child { background: linear-gradient(135deg, #7c5cbf, #9370d8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 20px; cursor: pointer; color: #aaa; transition: all 0.15s; }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,0.03); }
  .nav-item.active { color: #fff; background: rgba(124,92,191,0.12); border-right: 3px solid #7c5cbf; }
  .nav-icon { font-size: 16px; }
  .nav-label { font-size: 13px; font-weight: 500; }
  .plist-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 6px; color: #888; font-size: 11px; text-transform: uppercase; }
  .plist-count { font-size: 10px; color: #555; }
  .plist-list { flex: 1; overflow-y: auto; padding: 0 12px; }
  .plist-item { display: flex; justify-content: space-between; padding: 6px 8px; cursor: pointer; color: #aaa; font-size: 12px; border-radius: 4px; }
  .plist-item:hover { background: #1a1a2e; color: #fff; }
  .plist-menu { padding: 2px 8px 6px; }
  .plist-menu button { background: none; border: none; color: #e74c3c; font-size: 11px; cursor: pointer; padding: 2px 8px; }
  .plist-create { display: flex; gap: 4px; padding: 6px 8px; }
  .plist-create input { flex: 1; background: #0a0a0f; border: 1px solid #1a1a2e; border-radius: 4px; color: #fff; padding: 4px 8px; font-size: 11px; }
  .plist-create button { background: #7c5cbf; border: none; color: #fff; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
  .sidebar-foot { padding: 12px 20px 8px; }
  .brand { color: #3a3a5a; font-size: 10px; margin: 0; }

  .tabbar { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
    background: #0b0b14; border-top: 1px solid #1a1a2e;
    flex-direction: row; justify-content: space-around; align-items: center; z-index: 100; }
  .tab { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; padding: 6px 10px; color: #888; flex: 1; }
  .tab.active { color: #7c5cbf; }
  .tab-icon { font-size: 18px; }
  .tab-label { font-size: 9px; font-weight: 500; }

  @media (max-width: 768px) { .sidebar { display: none; } .tabbar { display: flex; } }
</style>