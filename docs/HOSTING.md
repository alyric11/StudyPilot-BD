# Render Free hosting

Shared chapter overviews and lesson links now use Firestore sharedChapters documents. Local data files are preserved as migration sources and backups; runtime endpoints do not read or write them. No persistent disk or SHARED_DATA_DIR setting is needed.

Use the StudyPilot-BD repository root. Build: npm ci followed by npm run build. Start: npm start. The start command sets production mode; PORT is supplied by Render.

Configure GOOGLE_APPLICATION_CREDENTIALS to a Render secret file containing the Firebase service-account JSON. Keep OVERVIEW_ADMIN_TOKEN and YOUTUBE_API_KEY in private Render settings. See FIREBASE_SERVER.md for credential details. Firebase Admin credentials must be configured at startup; no silent local-storage fallback occurs.

Shared read/publishing endpoints require a verified Firebase login token. Publishing additionally requires the existing administrator password. Direct browser Firestore access to sharedChapters remains denied by the existing rules. Server access is protected by endpoint authorization, because the Admin SDK bypasses browser rules.

Each chapter read retrieves its overview and videos together. The server caches a chapter for 30 seconds, groups concurrent reads, and invalidates its cache after a successful publish. Another server process may show its cached copy for up to 30 seconds. Browsers must reopen/reload a chapter to receive newly published content. No timed database polling is used.

The imported content already exists online. Import is a separate explicit command, never a startup task. Do not run imports automatically during Render deploys.

AI remains disabled. Student cloud saving is unchanged. After deployment, authorize the public domain in Firebase and check verification/reset links. Render Free sleeps after inactivity; restarting does not delete Firestore content. The website has not yet been deployed.
