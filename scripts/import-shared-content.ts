import "dotenv/config";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "../server/firebaseAdmin";
import { prepareSharedChapters } from "../server/sharedContentImport";

const write = process.argv.includes("--write");
const timeout = setTimeout(() => { console.error("Import timed out. Rerun safely: existing chapters will be skipped."); process.exit(1); }, 45000);
try {
  const overviewSource = await readFile("data/chapter-overviews.json", "utf8");
  const videoSource = await readFile("data/chapter-videos.json", "utf8");
  const chapters = prepareSharedChapters(JSON.parse(overviewSource), JSON.parse(videoSource));
  const collection = getServerFirestore().collection("sharedChapters");
  let created = 0, skipped = 0, absent = 0;
  for (const { id, record } of chapters) {
    const ref = collection.doc(id);
    if (!write) {
      if ((await ref.get()).exists) skipped++; else absent++;
      continue;
    }
    try {
      // Atomic create protects newer content even if another publisher wins a race.
      await ref.create({ ...record, importedAt: FieldValue.serverTimestamp() });
      created++;
      const saved = (await ref.get()).data();
      if (!saved || Object.entries(record).some(([key, value]) => !isDeepStrictEqual(saved[key], value))) {
        throw new Error("Imported content could not be verified.");
      }
    } catch (error) {
      if ((error as { code?: number }).code === 6) skipped++;
      else throw error;
    }
  }
  console.log(write ? `Import verified: ${created} chapters created; ${skipped} existing chapters skipped.` : `Preview: ${absent} chapters to create; ${skipped} existing chapters to skip. No data changed.`);
  console.log(`Source: ${Object.keys(JSON.parse(overviewSource)).length} overviews; ${Object.keys(JSON.parse(videoSource)).length} video lists. Local files were preserved.`);
} catch {
  console.error("Import failed. No existing chapter was overwritten. Check source validation or Firebase access; rerun safely after resolving the issue.");
  process.exitCode = 1;
} finally { clearTimeout(timeout); }
