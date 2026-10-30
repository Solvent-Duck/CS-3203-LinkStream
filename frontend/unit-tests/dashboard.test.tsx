import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "../app/dashboard/page";
import type { Link } from "@/app/lib/api";

const api = vi.hoisted(() => ({
  getLinks: vi.fn(),
  createLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/app/lib/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, fullName: "Ada Lovelace", email: "ada@example.com", initials: "AL" },
    loading: false,
    logout: vi.fn(),
  }),
}));
vi.mock("@/app/lib/api", () => ({
  ...api,
  API_BASE: "http://localhost:3333",
  ApiError: class ApiError extends Error {},
}));

const createdLink: Link = {
  id: 7,
  slug: "product-roadmap",
  destinationUrl: "https://example.com/roadmap",
  title: "Product roadmap",
  description: "Quarterly priorities",
  teamId: null,
  userId: 1,
  clickCount: 4,
  healthStatus: "healthy",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
  team: null,
  tags: [{ id: 2, name: "planning" }],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    api.getLinks.mockReset();
    api.createLink.mockReset();
    api.updateLink.mockReset();
    api.deleteLink.mockReset();
  });

  afterEach(cleanup);

  it("creates, displays, and edits a dashboard link", async () => {
    let links: Link[] = [];
    api.getLinks.mockImplementation(async () => links);
    api.createLink.mockImplementation(async () => {
      links = [createdLink];
      return createdLink;
    });

    const updatedLink = {
      ...createdLink,
      title: "FY26 roadmap",
      destinationUrl: "https://example.com/fy26-roadmap",
    };
    api.updateLink.mockImplementation(async () => {
      links = [updatedLink];
      return updatedLink;
    });

    render(<DashboardPage />);
    await screen.findByText("No links yet. Create your first shortcut!");

    fireEvent.click(screen.getByRole("button", { name: /new link/i }));
    fireEvent.change(screen.getByLabelText("Shortcut slug"), { target: { value: createdLink.slug } });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: createdLink.destinationUrl } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: createdLink.title } });
    fireEvent.change(screen.getByLabelText("Description (optional)"), { target: { value: createdLink.description } });
    fireEvent.change(screen.getByLabelText("Tags (comma separated)"), { target: { value: "planning" } });
    fireEvent.click(screen.getByRole("button", { name: "Create shortcut" }));

    await screen.findByText("Product roadmap");
    expect(api.createLink).toHaveBeenCalledWith({
      slug: "product-roadmap",
      destinationUrl: "https://example.com/roadmap",
      title: "Product roadmap",
      description: "Quarterly priorities",
      tags: ["planning"],
    });
    expect(screen.getByText("go/product-roadmap")).toBeTruthy();
    expect(screen.getByText("Quarterly priorities")).toBeTruthy();
    expect(screen.getByText("planning")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("heading", { name: "Edit shortcut" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: updatedLink.title } });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: updatedLink.destinationUrl } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByText("FY26 roadmap");
    expect(api.updateLink).toHaveBeenCalledWith(7, expect.objectContaining({
      title: "FY26 roadmap",
      destinationUrl: "https://example.com/fy26-roadmap",
    }));
    await waitFor(() => expect(screen.queryByText("Product roadmap")).toBeNull());
  });
});
