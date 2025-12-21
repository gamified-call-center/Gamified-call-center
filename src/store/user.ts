import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  username: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // ✅ Call on successful login
      login: (token, user) => {
        console.log(user);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      // ✅ Logout user
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // ✅ Rehydrate auth on app load
      initializeAuth: () => {
        const { token, user } = get();

        if (token && user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
