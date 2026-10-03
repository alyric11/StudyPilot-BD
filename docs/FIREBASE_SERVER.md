# Secure Firebase server connection

The official Firebase Admin SDK lives in server/firebaseAdmin.ts, outside the frontend source directory. It initializes lazily and accepts only a service-account key for studypilot-bd-test. Existing endpoints still use their current storage until the shared-content migration step.

## Local setup

1. In Firebase console select StudyPilot BD Test, then Project settings > Service accounts > Firebase Admin SDK.
2. Generate a new private key and download the JSON file. Keep it private; do not paste it into chat or upload it to GitHub.
3. Store it outside the repository, or in the ignored .secrets folder. Files whose names contain firebase-adminsdk are also ignored as a safeguard.
4. In the existing ignored .env file add GOOGLE_APPLICATION_CREDENTIALS="C:/full/path/to/your/downloaded-key.json". Use forward slashes in the path. Do not modify the existing settings.
5. Run npm run check:firebase. A successful check reads at most one shared-content document and writes nothing; the document does not need to exist.

## Later on Render

Prefer a Render secret file containing the downloaded JSON. Set GOOGLE_APPLICATION_CREDENTIALS to that secret file's runtime path. Alternatively set FIREBASE_SERVICE_ACCOUNT_JSON as a private environment variable containing the JSON. Do not use a VITE_ prefix, place the file in public/ or src/, or put key contents in render.yaml. Inline JSON takes precedence if both are configured.

The Admin SDK uses service-account permissions and bypasses browser Firestore rules. Therefore publishing endpoints must continue checking administrator authorization, and shared read endpoints must check verified Firebase student tokens when they are connected in the migration step. Never expose generic database access endpoints. No student rules or published content are changed by this setup.

The key needs Firestore access. If the verification command fails, check that the downloaded key belongs to this project and the service account has appropriate Firestore IAM permissions. Do not enable billing or change database rules just to resolve a key error.
