import { useCallback, useSyncExternalStore } from 'react';

export type Route = { path: '/' | '/garden' | '/journal'; params: URLSearchParams };

function parse(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [p, q = ''] = raw.split('?');
  const path = p === '/garden' || p === '/journal' ? p : '/';
  return { path, params: new URLSearchParams(q) };
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function navigate(to: string, { replace = false } = {}) {
  const hash = `#${to}`;
  if (replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (location.hash !== hash) {
    location.hash = hash;
  }
}

/** Hash routing keeps the app a static, offline-friendly bundle with deep links. */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => '');
  return parse(hash);
}

export function useNavigate() {
  return useCallback(navigate, []);
}
