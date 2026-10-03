import { createContext, useContext } from "react";
import type { User } from "firebase/auth";
import type { StudentStorage } from "../utils/accountStorage";

export const AccountContext = createContext<{ user: User; storage: StudentStorage } | null>(null);
export function useAccount() {
  const account = useContext(AccountContext);
  if (!account) throw new Error("Student screens require a verified account.");
  return account;
}
