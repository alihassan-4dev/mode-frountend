import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AuthUser } from "@/types/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displayNameFromUser(user: AuthUser | null): string {
  if (!user) return "User";
  const full = user.full_name?.trim();
  if (full) return full;
  return user.email?.split("@")[0] ?? "User";
}
