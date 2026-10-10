import { canImportLegacy, createAccountStorage } from './accountStorage';
import { navigationSessionKey } from './navigationSession';

export function deleteAccountBrowserData(local: Storage, session: Storage, uid: string, email: string) {
  // Preserve other signed-in accounts and unrelated browser records.
  createAccountStorage(local, uid).clear();
  if (canImportLegacy(local, email)) {
    const keys = Array.from({ length: local.length }, (_, index) => local.key(index));
    for (const key of keys) if (key?.startsWith('sp_')) local.removeItem(key);
  }
  session.removeItem(navigationSessionKey(uid));
}
