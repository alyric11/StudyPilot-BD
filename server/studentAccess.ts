import type { RequestHandler } from "express";
import { getServerAuth } from "./firebaseAdmin";

export function verifiedStudentAccess(verify = (token: string) => getServerAuth().verifyIdToken(token)): RequestHandler {
  return async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const match = req.header("authorization")?.match(/^Bearer (\S+)$/);
    if (!match) { res.status(401).json({ error: "Please log in to view shared lessons." }); return; }
    try {
      const token = await verify(match[1]);
      if (token.email_verified !== true) { res.status(403).json({ error: "Verify your email before opening shared lessons." }); return; }
      res.locals.studentId = token.uid;
      next();
    } catch { res.status(401).json({ error: "Your login could not be verified. Please sign in again." }); }
  };
}
