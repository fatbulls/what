"use client";

// Shim for `next-auth/client` — this import path exists in next-auth v3 but
// was renamed to `next-auth/react` in v4. ChawkBazar components still import
// it. We provide a stub that covers the methods they use (`signIn`,
// `signOut`, `useSession`, `getSession`, `providers`).

export const signIn = async (
  _provider?: string,
  _options?: any
): Promise<{ ok: boolean; error?: string; url?: string }> => {
  return { ok: false, error: "social-login-disabled" };
};

export const signOut = async (_options?: any): Promise<{ url: string }> => ({
  url: "/",
});

export function useSession(): [null, boolean] {
  return [null, false];
}

export const getSession = async (): Promise<null> => null;

export const providers = async (): Promise<Record<string, any>> => ({});

export const csrfToken = async (): Promise<string | null> => null;

// Provider wrapper was a component in v3
export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return children as any;
};

import type React from "react";
