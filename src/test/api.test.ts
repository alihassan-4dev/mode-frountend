import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "@/lib/api";
import { displayNameFromUser } from "@/lib/utils";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("sends the auth header and parses successful json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ version: "2.0.0" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const result = await api.version();
    expect(result.version).toBe("2.0.0");
  });

  it("raises ApiError with backend detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Invalid token." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
          statusText: "Unauthorized",
        })
      )
    );

    await expect(api.me("bad-token")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("displayNameFromUser", () => {
  it("prefers full_name and falls back to email", () => {
    expect(
      displayNameFromUser({
        id: "1",
        email: "someone@example.com",
        full_name: "Ali",
        created_at: new Date().toISOString(),
      })
    ).toBe("Ali");

    expect(
      displayNameFromUser({
        id: "1",
        email: "someone@example.com",
        full_name: null,
        created_at: new Date().toISOString(),
      })
    ).toBe("someone");
  });
});
