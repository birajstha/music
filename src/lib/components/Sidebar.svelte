<script lang="ts">
  export let page: string;
  export let onNavigate: (p: string) => void = () => {};

  const NAV = [
    { id: 'home',     icon: '🏠', label: 'Home' },
    { id: 'genres',   icon: '🎸', label: 'Genres' },
    { id: 'search',   icon: '🔍', label: 'Search' },
    { id: 'podcasts', icon: '🎙️', label: 'Podcasts' },
    { id: 'learning', icon: '📚', label: 'Learn' },
  ];

  let installPrompt: any = null;
  let showInstall = false;
  let isIOS = false;
  let showIOSGuide = false;

  if (typeof window !== 'undefined') {
    isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !standalone) showInstall = true;
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault(); installPrompt = e; showInstall = true;
    });
    window.addEventListener('appinstalled', () => { showInstall = false; showIOSGuide = false; });
  }

  async function install() {
    if (isIOS) { showIOSGuide = !showIOSGuide; return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') showInstall = false;
    installPrompt = null;
  }
</script>

<!-- Desktop sidebar -->
<nav class="sidebar">
  <div class="logo">🎵 <span>Evanié</span></div>
  {#each NAV as item}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="nav-item {page === item.id ? 'active' : ''}" on:click={() => onNavigate(item.id)}>
      <span class="nav-icon">{item.icon}</span>
      <span class="nav-label">{item.label}</span>
    </div>
  {/each}

  <div class="sidebar-footer">
    {#if showInstall}
      <button class="install-btn" on:click={install}>📲 Install App</button>
    {/if}
    <p class="brand">Powered by free sources</p>
  </div>
</nav>

<!-- Mobile bottom tab bar -->
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

{#if showIOSGuide}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="ios-overlay" on:click={() => showIOSGuide = false}>
    <div class="ios-guide" on:click|stopPropagation>
      <h3>Install Evanié Music</h3>
      <p>1. Tap <strong>Share ⎙</strong> in Safari</p>
      <p>2. Choose <strong>Add to Home Screen ➕</strong></p>
      <p>3. Tap <strong>Add ✅</strong></p>
      <button on:click={() => showIOSGuide = false}>Got it</button>
    </div>
  </div>
{/if}

<style>
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 80px; width: 220px;
    background: #0d0d18; display: flex; flex-direction: column;
    padding: 20px 0; border-right: 1px solid #1a1a2e; z-index: 50;
  }
  .logo { color: #fff; font-size: 20px; font-weight: 700; padding: 8px 20px 24px; }
  .logo span { background: linear-gradient(135deg, #7c5cbf, #1db954); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 20px; cursor: pointer; color: #b3b3b3; border-radius: 0; transition: all 0.15s; }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
  .nav-item.active { color: #fff; background: rgba(124,92,191,0.15); border-right: 3px solid #7c5cbf; }
  .nav-icon { font-size: 18px; }
  .nav-label { font-size: 14px; font-weight: 500; }
  .sidebar-footer { margin-top: auto; padding: 16px 20px; }
  .install-btn { width: 100%; padding: 10px; background: #7c5cbf; border: none; border-radius: 8px; color: #fff; font-size: 13px; cursor: pointer; margin-bottom: 8px; }
  .install-btn:hover { background: #9370d8; }
  .brand { color: #555; font-size: 11px; margin: 0; }

  /* Mobile tabbar */
  .tabbar {
    display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
    background: #0d0d18; border-top: 1px solid #1a1a2e;
    flex-direction: row; justify-content: space-around; align-items: center;
    z-index: 100;
  }
  .tab { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; padding: 6px 10px; color: #888; flex: 1; }
  .tab.active { color: #7c5cbf; }
  .tab-icon { font-size: 20px; }
  .tab-label { font-size: 10px; font-weight: 500; }

  .ios-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 80px; }
  .ios-guide { background: #1e1e30; border-radius: 16px; padding: 24px; max-width: 320px; width: 100%; }
  .ios-guide h3 { color: #fff; margin: 0 0 16px; }
  .ios-guide p { color: #b3b3b3; margin: 8px 0; font-size: 14px; }
  .ios-guide button { margin-top: 16px; width: 100%; padding: 12px; background: #7c5cbf; border: none; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .tabbar { display: flex; }
  }
</style>
