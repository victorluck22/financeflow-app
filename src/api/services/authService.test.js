import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockHttpClient } = vi.hoisted(() => ({
  mockHttpClient: {
    post: vi.fn(),
    patch: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("../httpClient", () => ({
  default: mockHttpClient,
}));

import {
  preRegisterRequest,
  setupPasswordRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  updateProfileRequest,
  requestEmailChangeRequest,
  confirmEmailChangeRequest,
  searchShareUserByEmailRequest,
  listUserSharesRequest,
  createUserShareRequest,
  acceptUserShareRequest,
  revokeUserShareRequest,
} from "./authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls pre-register endpoint", async () => {
    mockHttpClient.post.mockResolvedValueOnce({ data: { success: true } });

    await preRegisterRequest({ name: "Ana", email: "ana@example.com" });

    expect(mockHttpClient.post).toHaveBeenCalledWith("/auth/register", {
      name: "Ana",
      email: "ana@example.com",
    });
  });

  it("calls setup and reset password endpoints", async () => {
    mockHttpClient.post.mockResolvedValue({ data: { success: true } });

    await setupPasswordRequest({
      email: "ana@example.com",
      token: "abc",
      password: "x",
      password_confirmation: "x",
    });
    await forgotPasswordRequest({ email: "ana@example.com" });
    await resetPasswordRequest({
      email: "ana@example.com",
      token: "abc",
      password: "x",
      password_confirmation: "x",
    });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/auth/setup-password",
      expect.any(Object),
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "ana@example.com",
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/auth/reset-password",
      expect.any(Object),
    );
  });

  it("calls profile and email change endpoints", async () => {
    mockHttpClient.patch.mockResolvedValueOnce({ data: { success: true } });
    mockHttpClient.post.mockResolvedValue({ data: { success: true } });

    await updateProfileRequest({ name: "Ana" });
    await requestEmailChangeRequest({
      new_email: "new@example.com",
      password: "secret",
    });
    await confirmEmailChangeRequest({
      token: "token",
      email: "new@example.com",
    });

    expect(mockHttpClient.patch).toHaveBeenCalledWith("/user/profile", {
      name: "Ana",
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/auth/email-change/request",
      {
        new_email: "new@example.com",
        password: "secret",
      },
    );
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "/auth/email-change/confirm",
      {
        token: "token",
        email: "new@example.com",
      },
    );
  });

  it("calls sharing endpoints", async () => {
    mockHttpClient.get.mockResolvedValue({ data: { success: true } });
    mockHttpClient.post.mockResolvedValue({ data: { success: true } });

    await searchShareUserByEmailRequest("owner@example.com");
    await listUserSharesRequest();
    await createUserShareRequest({ email: "owner@example.com" });
    await acceptUserShareRequest(10);
    await revokeUserShareRequest(10);

    expect(mockHttpClient.get).toHaveBeenCalledWith("/user-shares/search", {
      params: { email: "owner@example.com" },
    });
    expect(mockHttpClient.get).toHaveBeenCalledWith("/user-shares");
    expect(mockHttpClient.post).toHaveBeenCalledWith("/user-shares", {
      email: "owner@example.com",
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith("/user-shares/10/accept");
    expect(mockHttpClient.post).toHaveBeenCalledWith("/user-shares/10/revoke");
  });
});
