<script lang="ts">
  import { get } from 'svelte/store';
  import { player } from '../stores/player';
  import { playlists, createPlaylist, deletePlaylist, renamePlaylist, playPlaylist, parseYouTubeUrl, addYouTubeLinkToPlaylist } from '../stores/playlists';

  export let onNavigate: (p: string) => void;
  export let page: string;
  export let onShowPlaylist: (id: string) => void;

  let showNewInput = false;
  let newName = '';
  let showRename = '';
  let renameName = '';
  let showAddLink = '';
  let addLinkUrl = '';
  let addLinkError = '';
  let addLinkLoading = false;

  const NAV = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'genres', label: 'Genres', icon: 'compass' },
    { id: 'radio', label: 'Radio', icon: 'radio' },
    { id: 'podcasts', label: 'Podcasts', icon: 'headphones' },
    { id: 'learning', label: 'Learning', icon: 'book' },
  ];

  function createNew() {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    newName = '';
    showNewInput = false;
  }

  function doRename(id: string) {
    if (!renameName.trim()) return;
    renamePlaylist(id, renameName.trim());
    showRename = '';
  }

  async function doAddLink(plId: string) {
    if (!addLinkUrl.trim()) return;
    addLinkLoading = true;
    addLinkError = '';
    const err = await addYouTubeLinkToPlaylist(plId, addLinkUrl.trim());
    if (err) {
      addLinkError = err;
    } else {
      addLinkUrl = '';
      showAddLink = '';
    }
    addLinkLoading = false;
  }
</script>

<nav class="sidebar">
  <div class="nav-section">
    <div class="nav-label">Browse</div>
    {#each NAV as item}
      <button
        class="nav-item {page === item.id ? 'active' : ''}"
        on:click={() => onNavigate(item.id)}
      >
        {#if item.icon === 'home'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1"/></svg>
        {:else if item.icon === 'compass'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>
        {:else if item.icon === 'radio'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 010 20"/><path d="M12 6a6 6 0 010 12"/><circle cx="12" cy="12" r="2"/></svg>
        {:else if item.icon === 'headphones'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
        {:else if item.icon === 'book'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/></svg>
        {/if}
        <span>{item.label}</span>
      </button>
    {/each}
  </div>

  <div class="nav-section plist-section">
    <div class="nav-label library-header">
      <span>Your Library</span>
      <button class="add-btn" on:click={() => { showNewInput = !showNewInput; newName = ''; }} title="New playlist">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>

    <div class="plist-list">
      {#each $playlists as pl}
        <div class="plist-item-wrap">
          <button class="plist-item {page === 'playlist' && 'active'}" on:click={() => onShowPlaylist(pl.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="plist-icon"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span class="plist-name">{pl.name}</span>
            <span class="plist-count">{pl.tracks.length}</span>
          </button>
          <div class="plist-actions">
            <button class="plist-action" on:click={() => { showAddLink = pl.id; addLinkUrl = ''; addLinkError = ''; }} title="Add YouTube link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            </button>
            <button class="plist-action" on:click={() => { showRename = pl.id; renameName = pl.name; }} title="Rename">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="plist-action danger" on:click={() => deletePlaylist(pl.id)} title="Delete">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      {/each}

      {#if showNewInput}
        <div class="inline-form">
          <input type="text" bind:value={newName} placeholder="Playlist name"
            on:keydown={(e) => e.key === 'Enter' && createNew()}
            on:blur={() => { if (!newName.trim()) showNewInput = false; }}
            autofocus />
          <button on:click={createNew}>Create</button>
        </div>
      {/if}

      {#if $playlists.length === 0 && !showNewInput}
        <div class="empty-plists">
          <p>No playlists yet</p>
          <button class="create-link" on:click={() => showNewInput = true}>Create one</button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Add link modal -->
  {#if showAddLink}
    <div class="modal-overlay" on:click={() => showAddLink = ''}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Add YouTube Link</h3>
          <button class="modal-close" on:click={() => showAddLink = ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="modal-desc">Paste a YouTube video URL to add it to your playlist</p>
        <input type="text" class="modal-input" bind:value={addLinkUrl}
          placeholder="https://youtube.com/watch?v=..."
          on:keydown={(e) => e.key === 'Enter' && doAddLink(showAddLink)}
          autofocus />
        {#if addLinkError}
          <p class="modal-error">{addLinkError}</p>
        {/if}
        <div class="modal-actions">
          <button class="modal-btn ghost" on:click={() => showAddLink = ''}>Cancel</button>
          <button class="modal-btn primary" on:click={() => doAddLink(showAddLink)} disabled={addLinkLoading || !addLinkUrl.trim()}>
            {addLinkLoading ? 'Adding...' : 'Add to playlist'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Rename modal -->
  {#if showRename}
    <div class="modal-overlay" on:click={() => showRename = ''}>
      <div class="modal" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Rename Playlist</h3>
          <button class="modal-close" on:click={() => showRename = ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <input type="text" class="modal-input" bind:value={renameName}
          placeholder="New name"
          on:keydown={(e) => e.key === 'Enter' && doRename(showRename)}
          autofocus />
        <div class="modal-actions">
          <button class="modal-btn ghost" on:click={() => showRename = ''}>Cancel</button>
          <button class="modal-btn primary" on:click={() => doRename(showRename)} disabled={!renameName.trim()}>Rename</button>
        </div>
      </div>
    </div>
  {/if}

  <div class="sidebar-bottom">
    <div class="version">ChillPill · 2025</div>
  </div>
</nav>

<style>
  .sidebar {
    position: fixed; top: 64px; left: 0; bottom: 0; width: 240px;
    background: rgba(10, 10, 22, 0.6);
    border-right: 1px solid rgba(255,255,255,0.03);
    display: flex; flex-direction: column; z-index: 100;
    overflow-y: auto;
  }
  .nav-section { padding: 12px 8px 4px; }
  .nav-label {
    padding: 4px 12px 8px; font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1px; color: #5a5878;
  }
  .library-header { display: flex; justify-content: space-between; align-items: center; }
  .add-btn {
    background: none; border: none; color: #5a5878; cursor: pointer;
    padding: 2px; border-radius: 4px; display: flex;
    transition: all 0.15s;
  }
  .add-btn:hover { color: #E8B84B; background: rgba(232,184,75,0.08); }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 8px 12px;
    background: none; border: none; color: #8B89A6; font-size: 13px;
    cursor: pointer; border-radius: 8px; text-align: left;
    transition: all 0.12s;
  }
  .nav-item:hover { color: #F0EEF5; background: rgba(255,255,255,0.03); }
  .nav-item.active { color: #E8B84B; background: rgba(232,184,75,0.08); }
  .nav-item svg { flex-shrink: 0; }

  /* Playlists */
  .plist-section { flex: 1; overflow-y: auto; }
  .plist-list { padding: 0 4px; }
  .plist-item-wrap {
    padding: 1px 0;
  }
  .plist-item {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 6px 8px;
    background: none; border: none; color: #8B89A6; font-size: 12px;
    cursor: pointer; border-radius: 6px; text-align: left;
    transition: all 0.12s;
  }
  .plist-item:hover, .plist-item-wrap:hover .plist-item { color: #F0EEF5; background: rgba(255,255,255,0.02); }
  .plist-icon { flex-shrink: 0; opacity: 0.6; }
  .plist-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plist-count { font-size: 10px; color: #5a5878; }
  .plist-actions {
    display: none; gap: 2px; padding: 2px 8px 4px 28px;
  }
  .plist-item-wrap:hover .plist-actions { display: flex; }
  .plist-action {
    background: none; border: none; color: #5a5878; cursor: pointer;
    padding: 3px; border-radius: 4px;
    transition: all 0.1s;
  }
  .plist-action:hover { color: #E8B84B; background: rgba(232,184,75,0.1); }
  .plist-action.danger:hover { color: #e74c3c; background: rgba(231,76,60,0.1); }

  .inline-form { display: flex; gap: 4px; padding: 4px 8px; }
  .inline-form input {
    flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; color: #F0EEF5; padding: 6px 8px; font-size: 12px; outline: none;
  }
  .inline-form input:focus { border-color: rgba(232,184,75,0.3); }
  .inline-form button {
    padding: 6px 10px; background: rgba(232,184,75,0.12); border: none;
    border-radius: 6px; color: #E8B84B; font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .inline-form button:hover { background: rgba(232,184,75,0.2); }

  .empty-plists { padding: 12px 8px; text-align: center; }
  .empty-plists p { color: #5a5878; font-size: 11px; margin: 0 0 4px; }
  .create-link { background: none; border: none; color: #E8B84B; font-size: 11px; cursor: pointer; }
  .create-link:hover { text-decoration: underline; }

  /* Modals */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center; z-index: 500;
  }
  .modal {
    background: #1a1a30; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; padding: 24px; width: 400px; max-width: 90vw;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .modal-header h3 { color: #F0EEF5; font-size: 16px; font-weight: 600; margin: 0; }
  .modal-close { background: none; border: none; color: #5a5878; cursor: pointer; padding: 4px; border-radius: 4px; }
  .modal-close:hover { color: #F0EEF5; }
  .modal-desc { color: #8B89A6; font-size: 12px; margin: 0 0 12px; }
  .modal-input {
    width: 100%; padding: 10px 12px; margin-bottom: 12px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; color: #F0EEF5; font-size: 13px; outline: none; box-sizing: border-box;
  }
  .modal-input:focus { border-color: rgba(232,184,75,0.3); }
  .modal-error { color: #e74c3c; font-size: 11px; margin: -8px 0 10px; }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .modal-btn {
    padding: 8px 16px; border-radius: 8px; border: none;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.15s;
  }
  .modal-btn.ghost { background: transparent; color: #8B89A6; }
  .modal-btn.ghost:hover { color: #F0EEF5; background: rgba(255,255,255,0.04); }
  .modal-btn.primary { background: rgba(232,184,75,0.12); color: #E8B84B; }
  .modal-btn.primary:hover { background: rgba(232,184,75,0.2); }
  .modal-btn:disabled { opacity: 0.4; cursor: default; }

  .sidebar-bottom { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.03); }
  .version { color: #3a3858; font-size: 10px; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
  }
</style>