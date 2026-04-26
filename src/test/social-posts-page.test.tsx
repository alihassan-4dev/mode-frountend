import { describe, expect, it, vi, beforeEach } from "vitest";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import SocialPosts from "@/pages/SocialPosts";

vi.mock("@/components/layout/AppLayout", () => ({
  default: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

const mockedUseSocialConnections = vi.fn();
const mockedUseSocialPosts = vi.fn();

vi.mock("@/hooks/useSocialConnections", () => ({
  useSocialConnections: () => mockedUseSocialConnections(),
}));

vi.mock("@/hooks/useSocialPosts", () => ({
  useSocialPosts: (...args: unknown[]) => mockedUseSocialPosts(...args),
}));

describe("SocialPosts page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows disconnected state when platform is not connected", () => {
    mockedUseSocialConnections.mockReturnValue({
      getConnection: () => undefined,
    });
    mockedUseSocialPosts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { posts: [], meta: { fetched_at: null } },
    });

    render(
      <MemoryRouter>
        <SocialPosts />
      </MemoryRouter>
    );

    expect(screen.getByText(/is not connected/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open integrations/i })).toBeInTheDocument();
  });

  it("shows loading indicator for connected platform", () => {
    mockedUseSocialConnections.mockReturnValue({
      getConnection: () => ({ platform: "facebook" }),
    });
    mockedUseSocialPosts.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
    });

    render(
      <MemoryRouter>
        <SocialPosts />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading live posts/i)).toBeInTheDocument();
  });

  it("renders post and ai analysis card", () => {
    mockedUseSocialConnections.mockReturnValue({
      getConnection: () => ({ platform: "facebook" }),
    });
    mockedUseSocialPosts.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        posts: [
          {
            platform: "facebook",
            post_id: "fb-1",
            text: "Testing post content",
            created_at: "2026-04-25T12:10:00+0000",
            permalink: "https://facebook.com/post/1",
            media_type: "status",
            media_url: null,
            likes_count: 5,
            comments_count: 2,
            analysis: {
              sentiment_label: "positive",
              sentiment_score: 0.7,
              engagement_quality: "medium",
              recommendation: "Keep this style.",
            },
          },
        ],
        meta: { fetched_at: "2026-04-25T12:10:00+0000" },
      },
    });

    render(
      <MemoryRouter>
        <SocialPosts />
      </MemoryRouter>
    );

    expect(screen.getByText("Testing post content")).toBeInTheDocument();
    expect(screen.getByText(/AI analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep this style/i)).toBeInTheDocument();
  });
});
