export function accountError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "Email or password is incorrect.",
    "auth/email-already-in-use": "An account already uses this email. Sign in or reset your password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/password-does-not-meet-requirements": "Your password does not meet the project's password requirements. Try a longer password with uppercase and lowercase letters, a number, and a symbol.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Could not connect. Check your internet and try again.",
    "auth/operation-not-allowed": "Email/password login is not enabled in Firebase yet.",
    "auth/user-disabled": "This account is disabled. Contact the project owner.",
    "auth/unauthorized-continue-uri": "This website address must be added to Firebase Authentication's authorized domains. Contact the project owner.",
  };
  return messages[code || ""] || "Could not complete this action. Please try again.";
}
