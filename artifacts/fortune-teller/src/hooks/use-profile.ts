import { useState, useCallback } from "react";

const BASE_KEY = "falcizade_profile";

export type Gender = "male" | "female";

export interface UserProfile {
  name: string;
  gender: Gender;
}

export function getProfileStorageKey(): string {
  try {
    const raw = localStorage.getItem("falcizade_auth");
    if (!raw) return BASE_KEY;
    const auth = JSON.parse(raw);
    if (auth?.type === "google" && auth?.id) return `${BASE_KEY}_${auth.id}`;
    return BASE_KEY;
  } catch {
    return BASE_KEY;
  }
}

export function readProfileFromStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem(getProfileStorageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.name && parsed?.gender) return parsed as UserProfile;
    return null;
  } catch {
    return null;
  }
}

function writeProfileToStorage(profile: UserProfile): void {
  try {
    localStorage.setItem(getProfileStorageKey(), JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(() => readProfileFromStorage());

  const saveProfile = useCallback((data: UserProfile) => {
    writeProfileToStorage(data);
    setProfile(data);
  }, []);

  return { profile, saveProfile };
}
