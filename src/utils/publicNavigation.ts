export type PublicPage = 'welcome' | 'login' | 'signup' | 'reset' | 'verify' | 'app';
export const publicPaths: Record<PublicPage, string> = {
  welcome: '/', login: '/signin', signup: '/signup', reset: '/reset-password', verify: '/verify-email', app: '/app',
};
export function publicPageFromPath(path: string): PublicPage {
  const normalized = path.replace(/\/+$/, '') || '/';
  return (Object.entries(publicPaths).find(([, value]) => value === normalized)?.[0] as PublicPage) || 'welcome';
}

/** Public forms remain accessible even when this browser remembers another account. */
export function accountDestination(page: PublicPage, verified: boolean, signedIn: boolean): PublicPage {
  if (page === 'verify') return !signedIn ? 'signup' : verified ? 'app' : 'verify';
  if (page === 'app') return !signedIn ? 'login' : verified ? 'app' : 'verify';
  return page;
}
