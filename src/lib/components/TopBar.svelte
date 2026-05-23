<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getWeather, type WeatherData } from '../api/weather';
  import { searchTracks } from '../api/music';
  import { player } from '../stores/player';
  import { googleUser, googleClientId, authLoading, initGoogleAuth, signIn, signOut } from '../stores/auth';
  import type { Track } from '../api/types';

  export let onSearch: (query: string) => void = () => {};

  let weather: WeatherData | null = null;
  let searchQuery = '';
  let searchResults: Track[] = [];
  let searching = false;
  let showSearch = false;
  let showResults = false;
  let searchTimer: any;

  onMount(async () => {
    weather = await getWeather();

    // Init Google Auth if client ID is configured
    const unsub = googleClientId.subscribe(id => {
      if (id) initGoogleAuth(id);
    });
    return unsub;
  });

  function onSearchInput() {
    clearTimeout(searchTimer);
    if (searchQuery.trim().length < 2) {
      searchResults = [];
      showResults = false;
      return;
    }
    searchTimer = setTimeout(async () => {
      searching = true;
      showResults = true;
      searchResults = await searchTracks(searchQuery).catch(() => []);
      searching = false;
    }, 350);
  }

  function selectTrack(track: Track) {
    showResults = false;
    searchQuery = '';
    player.play({ ...track, _type: 'track' }, [track]);
  }
</script>

<header class="topbar">
  <div class="logo-area">
    <div class="logo-mark"></div>
    <span class="logo-text">ChillPill</span>
  </div>

  <!-- Global search bar -->
  <div class="search-wrap">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <input
      type="text"
      class="search-input"
      placeholder="Search songs, artists..."
      bind:value={searchQuery}
      on:input={onSearchInput}
      on:focus={() => searchQuery.trim().length >= 2 && (showResults = true)}
      on:blur={() => setTimeout(() => showResults = false, 200)}
    />
    {#if searching}
      <div class="search-spinner"></div>
    {:else if searchQuery}
      <button class="search-clear" on:click={() => { searchQuery = ''; searchResults = []; showResults = false; }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    {/if}

    <!-- Search dropdown -->
    {#if showResults && searchResults.length > 0}
      <div class="search-dropdown">
        {#each searchResults.slice(0, 8) as track}
          <button class="search-result-item" on:click={() => selectTrack(track)}>
            <img class="sr-thumb" src={track.thumbnail} alt="" loading="lazy" />
            <div class="sr-info">
              <span class="sr-title">{track.title}</span>
              <span class="sr-artist">{track.artist}</span>
            </div>
            <svg class="sr-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Right section: Weather + Auth -->
  <div class="topbar-right">
    {#if weather}
      <div class="weather-widget" title="{weather.condition} · H:{weather.high}° L:{weather.low}°">
        <div class="weather-temp">{weather.temp}°</div>
        <div class="weather-info">
          <span class="weather-loc">{weather.location}</span>
          <span class="weather-condition">{weather.condition}</span>
        </div>
      </div>
    {:else}
      <div class="weather-widget weather-loading" title="Weather unavailable">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </div>
    {/if}

    <div class="auth-area">
      {#if $googleUser}
        <div class="user-menu">
          <img class="user-avatar" src={$googleUser.photoURL} alt={$googleUser.displayName} title={$googleUser.displayName} />
          <button class="auth-btn ghost" on:click={signOut}>Sign out</button>
        </div>
      {:else if $googleClientId}
        <button class="auth-btn" on:click={signIn} disabled={$authLoading}>
          {#if $authLoading}
            <div class="mini-spinner"></div>
          {:else}
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-2.5 7.2-9.5 12.3-17.5 12.3C10.2 40.3 4 34.1 4 24S10.2 7.7 17.8 7.7c5.1 0 9.7 2.1 13 5.5l5.7-5.7C33.8 4.3 26.2 1 17.8 1 8.6 1 1 8.6 1 17.8s7.6 16.8 16.8 16.8c8.3 0 15.4-6 16.7-13.9l.1-.6z"/><path fill="#FF3D00" d="M3.3 11.6l6.6 4.8C12.2 12 14.8 9.7 17.8 9.7c3.5 0 6.6 1.7 8.6 4.4l6.7-5.1C30.3 5.1 24.4 2 17.8 2 11 2 5.2 5.9 3.3 11.6z"/></svg>
            Sign in
          {/if}
        </button>
      {:else}
        <button class="auth-btn ghost" title="Set up Google login in Settings">Sign in</button>
      {/if}
    </div>
  </div>
</header>

<style>
  .topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 64px;
    background: rgba(12, 12, 24, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    display: flex; align-items: center; gap: 20px;
    padding: 0 24px; z-index: 150;
  }

  .logo-area { display: flex; align-items: center; gap: 10px; width: 200px; flex-shrink: 0; }
  .logo-mark {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, #E8B84B, #C9942E);
    box-shadow: 0 2px 8px rgba(232,184,75,0.25);
  }
  .logo-text {
    font-size: 18px; font-weight: 700; color: #F0EEF5;
    letter-spacing: -0.3px;
  }

  /* Search */
  .search-wrap {
    position: relative; flex: 1; max-width: 520px;
  }
  .search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: #5a5878; pointer-events: none;
  }
  .search-input {
    width: 100%; padding: 10px 36px 10px 40px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; color: #F0EEF5; font-size: 14px;
    outline: none; transition: all 0.2s;
  }
  .search-input:focus {
    border-color: rgba(232,184,75,0.3);
    background: rgba(255,255,255,0.06);
    box-shadow: 0 0 0 3px rgba(232,184,75,0.08);
  }
  .search-input::placeholder { color: #5a5878; }
  .search-clear {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #5a5878; cursor: pointer; padding: 4px;
  }
  .search-clear:hover { color: #F0EEF5; }
  .search-spinner {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    width: 16px; height: 16px; border: 2px solid #2a2a44;
    border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

  /* Search dropdown */
  .search-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0;
    background: #1a1a30; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; overflow: hidden; z-index: 200;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  }
  .search-result-item {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 10px 14px;
    background: none; border: none; color: #F0EEF5; cursor: pointer;
    text-align: left; transition: background 0.1s;
  }
  .search-result-item:hover { background: rgba(255,255,255,0.04); }
  .sr-thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
  .sr-info { flex: 1; min-width: 0; }
  .sr-title { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sr-artist { display: block; font-size: 11px; color: #8B89A6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sr-play { color: #8B89A6; flex-shrink: 0; }
  .search-result-item:hover .sr-play { color: #E8B84B; }

  /* Right side */
  .topbar-right { display: flex; align-items: center; gap: 16px; margin-left: auto; flex-shrink: 0; }

  /* Weather */
  .weather-widget {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px; border-radius: 10px;
    background: rgba(255,255,255,0.03);
    cursor: default;
  }
  .weather-temp {
    font-size: 20px; font-weight: 600; color: #E8B84B;
    line-height: 1;
  }
  .weather-info { display: flex; flex-direction: column; line-height: 1.2; }
  .weather-loc { font-size: 11px; color: #8B89A6; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .weather-condition { font-size: 10px; color: #6a6886; }
  .weather-loading { opacity: 0.5; }

  /* Auth */
  .auth-area { display: flex; align-items: center; }
  .auth-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px; border: none;
    background: rgba(232,184,75,0.1); color: #E8B84B;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background 0.15s;
  }
  .auth-btn:hover { background: rgba(232,184,75,0.18); }
  .auth-btn:disabled { opacity: 0.5; cursor: default; }
  .auth-btn.ghost { background: transparent; color: #5a5878; padding: 8px 10px; }
  .auth-btn.ghost:hover { color: #8B89A6; background: rgba(255,255,255,0.03); }
  .user-menu { display: flex; align-items: center; gap: 8px; }
  .user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(232,184,75,0.3); }
  .mini-spinner { width: 14px; height: 14px; border: 2px solid rgba(232,184,75,0.2); border-top-color: #E8B84B; border-radius: 50%; animation: spin 0.6s linear infinite; }

  @media (max-width: 768px) {
    .topbar { padding: 0 12px; gap: 10px; }
    .logo-area { width: auto; }
    .logo-text { display: none; }
    .weather-loc, .weather-condition { display: none; }
    .search-wrap { max-width: none; }
    .auth-btn span { display: none; }
  }
</style>