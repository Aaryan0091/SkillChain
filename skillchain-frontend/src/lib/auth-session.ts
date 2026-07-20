"use client";

import { createClient } from "@/utils/supabase/client";

const LOGGED_OUT_KEY = "skillchain.intentional_logout";

type RouterLike = {
  replace: (href: string) => void;
};

export function markIntentionalLogout() {
  window.localStorage.setItem(LOGGED_OUT_KEY, "true");
}

export function clearIntentionalLogout() {
  window.localStorage.removeItem(LOGGED_OUT_KEY);
}

export function hasIntentionalLogout() {
  return window.localStorage.getItem(LOGGED_OUT_KEY) === "true";
}

function clearBrowserAuthArtifacts() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
        storage.removeItem(key);
      }
    }
  }

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("sb-")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }
}

export async function signOutCompletely(router?: RouterLike) {
  markIntentionalLogout();

  try {
    await createClient().auth.signOut({ scope: "global" });
  } finally {
    clearBrowserAuthArtifacts();
    if (router) {
      router.replace("/login?logged_out=1");
    }
    window.location.replace("/auth/signout");
  }
}
