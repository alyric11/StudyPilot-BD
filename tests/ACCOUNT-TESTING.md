# Firebase student accounts

This step adds accounts only. Study records remain local to each account on each browser; Firestore synchronization is not implemented yet. AI remains disabled.

The registered Firebase web project is `studypilot-bd-test`. Its public configuration is in `src/config/firebase.ts`. No service-account credentials are needed.

## Console setup

- Enable Authentication > Sign-in method > Email/Password.
- Authorize `localhost` for development and the actual website hostname when deployed.
- Verification and password reset use Firebase's hosted email action pages, returning to the website origin. Customize email templates in Authentication > Templates if desired.
- Keep Firestore unavailable until per-student access rules and cloud saving are implemented.

## Test with two email accounts you control

1. Open the local app. Try sign-up with nonmatching passwords; it must show a validation error without creating an account.
2. Create account A. Before email verification, the study dashboard must stay inaccessible.
3. Open the verification email, then return and press "I've verified my email". Complete the student profile; its email must match the verified account.
4. Add a routine, homework, diary entry, difficult point, and saved video. Refresh and confirm they remain.
5. Log out. The login screen must appear and study records must not be visible.
6. Create and verify account B on the same browser. It must start with its own profile and must not show A's records.
7. Log out B and sign back into A. All A's records must still appear.
8. Use "Forgot password?" for A. Follow Firebase's emailed reset link and verify login with the new password.
9. Sign in on another device. Account login works, but study records will not transfer in this step.
10. Check another open tab after logout: it must return to login through Firebase's session listener.

## Existing browser records

Original `sp_*` data is left intact. A verified account with the same email as the original student profile may explicitly copy the records into its empty account. Import does not overwrite account records or delete the original data. These are browser records, not encrypted cloud backups; browser clearing still removes them.

## Automated verification

Run `npm run lint`, `npm test`, and `npm run build`. Account storage tests cover separation, import ownership, preservation of originals, and rollback on storage failure. Live email delivery and the full sign-in lifecycle require the owner-controlled test inboxes above.
