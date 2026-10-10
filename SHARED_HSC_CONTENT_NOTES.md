# Shared Class 11–12 chapter content

Matching HSC chapters share published overviews, saved video pools and featured selections. Personal video links, saved videos, difficult points, homework, chapter progress, navigation and curriculum IDs are unchanged.

## Identity

`src/data/sharedHscChapters.ts` freezes 513 reviewed pairs across 51 subjects. Each pair maps to a versioned shared ID, e.g. `physics1:hsc-v1-p1_ch1`. This is deliberately separate from student chapter IDs. Existing links still send their original IDs; the server resolves them.

The pairing test checks coverage in both class datasets, paper identity, textbook, section and normalized Bangla titles. The known ICT Chapter 1 English wording difference and Bangla 2nd Paper numbering difference are intentional. If curriculum coverage changes, review this map and create a new content version where necessary; do not silently remap old content.

## Preservation and transition

- Reads fall back to both original chapter records until a shared field/library exists. Reads do not migrate or modify data.
- One saved overview or identical saved overviews can be shared immediately, with existing text preserved exactly.
- Video entries are combined without duplicates; existing library records take precedence over that class's older five-video list. Compatible featured selections retain their order, and saved approval decisions survive.
- Competing overviews or nonempty featured selections return an explicit conflict. Neither original is overwritten or chosen arbitrarily. Overview and video conflicts are isolated.
- The first edit writes the shared record transactionally. All subsequent edits use the common record. Original class records remain untouched as recovery copies.
- An intentionally empty shared library/featured list remains empty; legacy content is not resurrected.
- Overview cache keys are common to both classes and publishing invalidates the local server cache. Other server instances can retain the existing 30-second cache. An already-open page refreshes content when reloaded; this change does not introduce live listeners.
- Admin interfaces identify content as shared with Classes 11–12.

## Read-only preflight

Run `node --import tsx scripts/check-shared-hsc.ts` from the project directory with existing server Firebase configuration. It reads only `sharedChapters` and `chapterVideoLibraries`, reports counts and conflict IDs, and never writes data or calls YouTube/Gemini. Exit status 2 means conflicts were found; 1 means access/check failure.

Initial check: 58 populated pairs; no competing overviews. Physics 2nd Paper Chapters 3 and 8 had competing featured selections. The owner chose Class 11's selections for both. `server/sharedChapterMerge.ts` records these two explicit decisions: combine both pools but use Class 11's featured IDs while reading originals. Once a common library is saved, its featured choices take precedence, so later edits can change these selections normally. Other conflicts still require review. No remote data was changed by the check or this resolution.

## Verification and rollback

The automated tests cover all curriculum pairs, legacy overview preservation, conflict rejection, video deduplication, common reads/edits, personal-record isolation and cache invalidation. Production build and TypeScript checks also pass. Browser behavior and authenticated production writes have not been tested.

Reverting the code restores the previous class-specific reads because originals remain intact. If shared content has been edited since deployment, export/reconcile those newer shared records before reverting, so updates remain visible. No student-data migration is involved. No new dependencies are required.
