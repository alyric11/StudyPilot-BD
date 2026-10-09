# Saved chapter video library

Local implementation; not pushed or deployed. Existing shared recommendations, personal links, chapter overviews and student records are preserved.

## Temporary development access — restore before public launch

At the owner's request, `server/videoDevelopment.ts` currently defaults BOTH video password bypass and unlimited daily search to true. All verified signed-in accounts can therefore manage the shared video library while this development mode is active. The overview editor password is unchanged. The UI reads the server's password requirement; Management opens directly during development.

Before public launch, set `VIDEO_DEV_PASSWORD_BYPASS=false` and `VIDEO_DEV_UNLIMITED_SEARCH=false` in the hosting environment AND change both `developmentDefaults` in `server/videoDevelopment.ts` to false. The existing admin token and `YOUTUBE_DAILY_SEARCH_LIMIT` are retained, ready to take effect again. The daily usage counter continues recording searches while the cap is bypassed. Verified login, brief per-account rate limits, search caching, transaction leases, failure cooldowns and YouTube's own quota remain active. These switches do not increase YouTube's quota.

## Management

1. Open Video Lessons, unlock Management with the existing admin password, and choose Search Videos.
2. Save all candidates in one click, or save individual candidates. This merges into the chapter library without duplicating IDs. Save all also fills empty featured spots from the whole saved library in descending view count, with one video per verified channel ID; it preserves existing featured choices. Individual saves do not trigger selection.
3. Review uncertain matches and approve only suitable lessons. Explicitly wrong curriculum levels or papers are excluded before saving. Classification uses video metadata; an administrator still needs to check teaching content.
4. Feature up to five lessons. Auto-select featured deliberately replaces the current selection with the most-viewed approved, available lessons, one per channel. Fewer than five suitable channels produce fewer choices. Pending matches, unavailable videos and unknown channel IDs are excluded. Manual choices remain editable. Clicking Featured unfeatures a lesson but keeps it in the library. Remove deletes its library membership and featured selection, never students' personal copies.
5. Find more candidates explicitly requests another upstream page when available. There is no automatic upstream pagination or fallback search.

Existing recommendations seed the library as approved featured entries until the first management write. Subsequent edits never resurrect removed legacy entries. Transactions merge each action into the latest library. No existing sharedChapters or users documents are rewritten.

## Students

- Featured lessons appear first. Explore more videos browses approved, available library entries five at a time, excluding featured and personally saved IDs.
- Next and Previous use the loaded library only. The last batch says “You’ve seen all available videos” and offers Start again. An empty library never triggers YouTube search.
- Students retain their three personal slots, including pasted YouTube links and Save on explored videos. Library removal does not remove personal links.
- Personal links use the existing account storage and synchronization. Other open devices see library changes on reopening/reloading the page; this is not a live Firestore subscription.

## Search and cost controls

- Only verified students with the existing private administrator token may invoke /api/video-lessons. Supplying an admin query flag alone grants no access.
- The server resolves class, subject, paper and chapter from curriculum data, respecting intentionally blank English titles. It uses one concise query, not eight separate searches.
- SSC/HSC, English/Roman/Bangla class labels, paper identity, topic relevance and popularity inform filtering and ranking. Title evidence takes precedence over promotional descriptions. Five-minute and 5,000-view thresholds remain.
- Each fresh candidate batch uses at most one search (25 results) and one batched details call. The saved library can grow through explicit additional batches; 25 is the upstream batch size, not the total library limit.
- Temporary batches in youtubeSearchPools expire after 24 hours. Bounded memory caches, transaction leases and a one-minute failure cooldown prevent duplicate work. Empty successful batches are cached.
- youtubeSearchControl/dailyBudget reserves a global Pacific-date budget. YOUTUBE_DAILY_SEARCH_LIMIT defaults to 20, accepts 0–100; 0 disables fresh searches while allowing valid cached batches. Failed requests still consume their reserved allowance. This does not account for other applications using the same API key.
- Verified account endpoints also have a 30 requests/minute per-process limit. Upstream calls time out after 15 seconds.

## Metadata and storage

- chapterVideoLibraries stores selected IDs, approvals and featured choices permanently, separately from temporary search results.
- youtubeVideoMetadata stores titles, channels, duration, views and availability for 28 days. Expired details refresh through batched videos.list calls, never search. Missing/private videos are skipped in exploration while saved identities remain.
- Channel IDs are captured from new searches. Automatic selection checks older metadata missing channel IDs through cached/batched videos.list calls; this does not run additional searches. Candidate saving and featured selection commit together, with concurrent-library changes rejected for retry so editorial choices are not overwritten.
- An outage preserves identities and featured choices, presents fallback details, and reports that refreshing failed. Expired metadata is not returned by the server.
- Existing Firestore rules deny browser access to the new server-only collections. The existing server service account handles reads and writes.

## Deployment setup still required

Keep the existing YouTube key, Firebase server credentials and administrator token configured. Set the optional daily allowance on Render if a different limit is desired.

Before production use, enable Firestore TTL for deleteAfter (timestamp) on youtubeSearchPools and youtubeVideoMetadata. Also disable indexing of their pool/video payload fields and chapterVideoLibraries.library if appropriate, merging with existing index configuration. Do not enable TTL on chapterVideoLibraries, sharedChapters or student collections. Expiration checks already stop the server serving expired data; TTL cleans dormant cache records and incurs normal Firestore deletion charges. TTL changes have not been deployed.

## Verification

- TypeScript checks and 103 automated tests pass (including pending navigation restoration tests). Video tests also cover automatic view-count ranking, distinct channel IDs despite identical channel names, preservation versus explicit replacement, excluded candidates and older metadata channel refresh without searches.
- Production build passes with the existing large-chunk warning.
- Isolated browser fixture tests/video-search-preview.html uses only in-memory records and mocked APIs. Verified zero search calls during student paging/restart, saving explored lessons, bulk-saving candidates, featuring a lesson, pending-review controls and preserved selections after search failure.
- Automatic-feature browser verification: bulk save preserved two editorial choices and filled three spots; explicit auto-select selected the top five approved videos from five channels, excluded the highest-view pending candidate, retained the personal save and made no extra search requests.
- One earlier live HSC Vector search returned 22 eligible candidates, 21 confident. No further live search was used for this change.
- Live Firestore library writes, cross-instance transactions, deployed authentication and TTL cleanup remain untested. No student data was changed during verification.

Release check: Firebase server connectivity verified. Cache TTL inspection succeeded, but enabling TTL returned permission denied (403) for both cache collections; a Firebase project administrator must enable these two policies. No permissions or student records were changed.
