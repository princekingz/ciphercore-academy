import { create } from "zustand";
import api from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("cc_token") : null,
  loading: false,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("cc_token", data.token);
    }
    set({ user: data.user, token: data.token });
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("cc_token", data.token);
    }
    set({ user: data.user, token: data.token });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cc_token");
    }
    set({ user: null, token: null });
  },

  loadUser: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("cc_token");
    if (!token) return;
    try {
      set({ loading: true });
      const { data } = await api.get("/auth/me");
      set({ user: data.user });
    } catch {
      localStorage.removeItem("cc_token");
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },
}));
