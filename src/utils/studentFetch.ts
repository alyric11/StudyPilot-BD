import { auth } from "../config/firebase";

export async function studentFetch(url: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user?.emailVerified) throw new Error("Sign in with a verified student account to continue.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401) return response;
  headers.set("Authorization", `Bearer ${await user.getIdToken(true)}`);
  return fetch(url, { ...options, headers });
}
