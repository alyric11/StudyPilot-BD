# Student cloud saving

Personal records use `users/{Firebase Auth UID}/records/{encoded record ID}` in the default Firestore database. Only the signed-in, email-verified owner can access this path under `firestore.rules`. Publish that file's contents in the Firebase console; editing the local file does not publish rules.

The connection starts after email verification. A first server-confirmed snapshot is required before deciding that an account is empty. Existing browser records are archived once before loading cloud data. An empty cloud account with existing local records asks whether to upload them. An account that already has cloud data loads the cloud copy instead of uploading local records over it. The Download backup button exports both the current browser copy and the archived pre-cloud copy.

Profile fields, each routine block, dated routine task, homework item, diary entry, difficult point, chapter progress record, selected subject, and personal video save are stored separately. Nested object fields merge individually. Deletes use hidden tombstones. Concurrent edits to the same field, or an edit conflicting with deletion, follow the order Firebase accepts the writes. Check the result after editing the same record on two devices. Arrays inside a single record are saved as one field.

Changed records are grouped for 700 milliseconds and sent in batches of at most 400 documents. Unchanged values do not write again. Entirely incomplete chapter defaults are omitted. Empty collections are explicit so deleted notes do not become demo notes on another device. One collection listener loads the account at sign-in and receives subsequent changes; there is no timed read polling. Initial loads and reconnects may read the entire account, including tombstones. A batch still counts one write per document, and each device's listener can incur reads for changed documents. Monitor the project's shared allowance in the Firestore Usage tab.

An account-scoped local browser queue retains unsaved changes across reload and logout. Once cloud saving has been initialized, that browser copy can open offline. Saved online means writes have been acknowledged; pending changes have not reached another device. Keep the same browser's site storage until pending changes finish. The Firebase SDK uses memory caching, not persistent shared IndexedDB caching. A browser lock allows one active tab per account and asks a second tab to close the first before editing. Separate browsers and devices have independent queues and can edit concurrently.

Shared chapter overviews and administrator-published lesson videos still use the existing server storage. They are outside this personal-data change. AI remains disabled. This change does not deploy the website.

## Manual check against your Firebase project

1. Start the existing development server and open `http://localhost:3000`.
2. Sign in to a verified student account. If offered, download the backup, then choose Upload my browser records to keep the existing work.
3. Add a distinctive diary note and routine block. Wait for Saved online.
4. Open another browser on the same computer and sign in to the same account. Confirm those records appear, then edit one and confirm the first browser receives it.
5. Turn off the connection in the first browser, edit a note, and confirm the pending status. Reload that browser, reconnect, and wait for Saved online. Verify the result in the second browser.
6. Delete the test records and check both browsers. Also sign into a different student account and confirm it does not show the first student's personal records.

Local unit tests use an injected transport to check merging, backups, retries, and account separation. They do not verify the rules actually published in the console or live Firebase credentials. The manual checks above remain necessary before deployment.

Update: Shared chapter content now uses Firestore through protected server endpoints; see HOSTING.md. The earlier server-file description above records the previous implementation.
