import "dotenv/config";
import { getServerFirestore } from "../server/firebaseAdmin";

// Read one document only; no publishing, migration, or student-data access.
const timeout = setTimeout(() => {
  console.error("Firebase connection timed out. Check your connection and private credentials.");
  process.exit(1);
}, 20000);
try {
  await getServerFirestore().collection("sharedChapters").doc("_connection_check").get();
  console.log("Firebase server connection verified. No data was changed.");
} catch {
  // SDK errors may include credential paths or account details; don't print them.
  console.error("Firebase server connection could not be verified. Check the key file, project, network, and service-account permissions.");
  process.exitCode = 1;
} finally { clearTimeout(timeout); }
