/** Matches backend `AuthUser` / `AuthResponse` JSON. */

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};
