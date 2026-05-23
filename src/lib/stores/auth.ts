import { writable, get } from 'svelte/store';

export interface GoogleUser {
  displayName: string;
  email: string;
  photoURL: string;
  id: string;
}

// Google OAuth client ID - user configures this once
// Get it from https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID_KEY = 'chillpill_google_client_id';

export const googleClientId = writable<string>(
  localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || ''
);

export function setGoogleClientId(id: string) {
  localStorage.setItem(GOOGLE_CLIENT_ID_KEY, id);
  googleClientId.set(id);
}

// User state
export const googleUser = writable<GoogleUser | null>(null);
export const authLoading = writable(false);

// Load user from session storage
const USER_KEY = 'chillpill_google_user';
try {
  const saved = sessionStorage.getItem(USER_KEY);
  if (saved) googleUser.set(JSON.parse(saved));
} catch {}

let gisLoaded = false;
let tokenClient: any = null;

export function initGoogleAuth(clientId: string) {
  if (!clientId || typeof window === 'undefined') return;

  // Load Google Identity Services
  if (!gisLoaded && !document.querySelector('#gis-script')) {
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      gisLoaded = true;
      initializeTokenClient(clientId);
    };
  } else if (gisLoaded) {
    initializeTokenClient(clientId);
  }
}

function initializeTokenClient(clientId: string) {
  if (typeof google === 'undefined' || !google.accounts) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: (response: any) => {
      if (response.access_token) {
        fetchUserInfo(response.access_token);
      }
    },
  });
}

async function fetchUserInfo(token: string) {
  authLoading.set(true);
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const user: GoogleUser = {
      displayName: data.name || data.given_name || 'User',
      email: data.email || '',
      photoURL: data.picture || '',
      id: data.id || '',
    };
    googleUser.set(user);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to fetch user info', e);
  } finally {
    authLoading.set(false);
  }
}

export function signIn() {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    const clientId = get(googleClientId);
    if (clientId) initGoogleAuth(clientId);
  }
}

export function signOut() {
  googleUser.set(null);
  sessionStorage.removeItem(USER_KEY);
  // Revoke token if available
  try {
    const token = google?.accounts?.oauth2?.revoke;
    if (token) token('', () => {});
  } catch {}
}