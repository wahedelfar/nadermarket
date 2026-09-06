import { describe, expect, it } from "vitest";
import { validateAdminCredentials } from "./adminAuth";

describe("admin credential API contract", () => {
  it("accepts the configured admin email, username, and password", () => {
    expect(
      validateAdminCredentials({
        email: "akardomiat@gmail.com",
        username: "nader",
        password: "nadermarket",
      }),
    ).toBe(true);
  });

  it("rejects any credential mismatch", () => {
    expect(
      validateAdminCredentials({
        email: "wrong@example.com",
        username: "nader",
        password: "nadermarket",
      }),
    ).toBe(false);
    expect(
      validateAdminCredentials({
        email: "akardomiat@gmail.com",
        username: "wrong",
        password: "nadermarket",
      }),
    ).toBe(false);
    expect(
      validateAdminCredentials({
        email: "akardomiat@gmail.com",
        username: "nader",
        password: "wrong-password",
      }),
    ).toBe(false);
  });
});
