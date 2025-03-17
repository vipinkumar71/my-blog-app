import { create } from "zustand";
import { Session } from "next-auth";

interface AuthState {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (session: Session | null) => void;
  setStatus: (status: "loading" | "authenticated" | "unauthenticated") => void;
}

const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: "loading",
  setSession: (session) => set({ session }),
  setStatus: (status) => set({ status }),
}));

export default useAuthStore;
