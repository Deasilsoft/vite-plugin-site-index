import { describe, expect, it } from "vitest";
import { validateEntryUrl } from "../../../src/validate/validate-entry-url.js";

describe("validateEntryUrl", () => {
  it("accepts a valid path", () => {
    expect(() => validateEntryUrl("/about")).not.toThrow();
  });

  it("rejects a url without a leading slash", () => {
    expect(() => validateEntryUrl("about")).toThrow("Invalid url: about");
  });

  it("rejects a url with a query string", () => {
    expect(() => validateEntryUrl("/about?x=1")).toThrow(
      "Invalid url (no query/fragment): /about?x=1",
    );
  });

  it("rejects a url with a fragment", () => {
    expect(() => validateEntryUrl("/about#team")).toThrow(
      "Invalid url (no query/fragment): /about#team",
    );
  });
});
