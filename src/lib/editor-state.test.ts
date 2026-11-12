import { describe, expect, it } from "vitest";
import { generationSucceeded, workspaceDestination } from "./editor-state";

describe("workspace login", () => {
  it("takes signed-in visitors from the home and sign-in pages to the dashboard", () => {
    expect(workspaceDestination("/", true)).toBe("/dashboard");
    expect(workspaceDestination("/auth", true)).toBe("/dashboard");
    expect(workspaceDestination("/", false)).toBeNull();
    expect(workspaceDestination("/reset-password", true)).toBeNull();
    expect(workspaceDestination("/sites/example", true)).toBeNull();
  });
});

describe("editing result", () => {
  it("only shows success for a complete result without an error marker", () => {
    expect(generationSucceeded("<!doctype html><html><body>Shop</body></html>")).toBe(true);
    expect(generationSucceeded("<html><body>unfinished")).toBe(false);
    expect(generationSucceeded("<html></html><!--SHOPSITE_ERROR-->")).toBe(false);
    expect(generationSucceeded("")).toBe(false);
  });
});