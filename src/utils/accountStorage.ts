export type StudentStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;

export function createAccountStorage(storage: Storage, uid: string): StudentStorage {
  if (!uid) throw new Error("A signed-in account is required.");
  const prefix = `studypilot:user:${uid}:`;
  return {
    getItem: key => storage.getItem(prefix + key),
    setItem: (key, value) => storage.setItem(prefix + key, value),
    removeItem: key => storage.removeItem(prefix + key),
    clear: () => {
      const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
      keys.forEach(key => { if (key?.startsWith(prefix)) storage.removeItem(key); });
    },
  };
}

export function canImportLegacy(storage: Storage, email: string): boolean {
  try {
    const profile = JSON.parse(storage.getItem("sp_profile") || "null");
    return typeof profile?.email === "string" &&
      profile.email.trim().toLowerCase() === email.trim().toLowerCase();
  } catch { return false; }
}

// Copy only into an empty account; keep the original browser data untouched.
export function importLegacy(storage: Storage, uid: string, email: string) {
  const target = createAccountStorage(storage, uid);
  if (!canImportLegacy(storage, email)) throw new Error("Existing profile email does not match this account.");
  const prefix = `studypilot:user:${uid}:`;
  const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
  if (keys.some(key => key?.startsWith(prefix))) throw new Error("This account already has browser data.");
  const written: string[] = [];
  try {
    keys.forEach(key => {
      if (!key?.startsWith("sp_")) return;
      const value = storage.getItem(key);
      if (value !== null) { target.setItem(key, value); written.push(key); }
    });
  } catch (error) {
    written.forEach(key => target.removeItem(key));
    throw error;
  }
}
