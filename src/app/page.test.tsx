import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the ProofPing landing page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Ask someone who’s actually there.",
      }),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Ask for proof" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Help nearby" })).toBeDefined();
    expect(screen.getByRole("link", { name: "My requests" })).toBeDefined();
    expect(
      screen.getByText(/Free to ask · 30-sec proofs · Help nearby/i),
    ).toBeDefined();
    expect(screen.getByText(/How it works/i)).toBeDefined();
    expect(screen.getByText(/^Ask$/i)).toBeDefined();
    expect(screen.getByText(/Get a proof/i)).toBeDefined();
    expect(screen.getByText(/^Decide$/i)).toBeDefined();
    expect(
      screen.getByRole("heading", {
        name: "How long is the queue at the west gate?",
      }),
    ).toBeDefined();
  });
});
