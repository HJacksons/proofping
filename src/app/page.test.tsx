import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the ProofPing landing page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Can a real person check this for you?",
      }),
    ).toBeDefined();
    expect(screen.getByRole("link", { name: "Ask for proof" })).toBeDefined();
    expect(screen.getByRole("link", { name: "My requests" })).toBeDefined();
    expect(
      screen.getByText(/Optional AI helps you write a clear question/i),
    ).toBeDefined();
  });
});
