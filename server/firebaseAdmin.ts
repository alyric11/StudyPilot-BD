// Server-only: never import this module from src/ or browser components.
import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = "studypilot-bd-test";
const appName = "studypilot-server";

function getServerApp() {
  let app = getApps().find(existing => existing.name === appName);
  if (!app) {
    const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!inline && !file) throw new Error("Firebase server credentials are not configured.");
    let account;
    try { account = JSON.parse(inline || readFileSync(file!, "utf8")); }
    catch { throw new Error("Firebase server credentials could not be read. Check the private configuration."); }
    if (account?.type !== "service_account" || account.project_id !== projectId ||
      typeof account.client_email !== "string" || typeof account.private_key !== "string") {
      throw new Error("Use a service-account key from the StudyPilot BD Test Firebase project.");
    }
    try {
      app = initializeApp({ projectId, credential: cert(account) }, appName);
    } catch { throw new Error("Firebase server credentials are invalid. Check the private configuration."); }
  }
  return app;
}
export function getServerFirestore() { return getFirestore(getServerApp()); }
export function getServerAuth() { return getAuth(getServerApp()); }
