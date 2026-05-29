import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminAuthGuard from "../components/AdminAuthGuard";
import * as adminAuthApiModule from "../api/adminAuthApi";

vi.mock("../api/adminAuthApi", () => ({
  adminAuthApi: {
    checkStatus: vi.fn(),
  },
}));

const mockApi = adminAuthApiModule.adminAuthApi as {
  checkStatus: ReturnType<typeof vi.fn>;
};

describe("AdminAuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows_loading_state_while_checking", () => {
    // Never resolves — keeps status as "checking" indefinitely
    mockApi.checkStatus.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminAuthGuard />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("redirects_to_login_when_unauthenticated", async () => {
    mockApi.checkStatus.mockResolvedValueOnce({ authenticated: false });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminAuthGuard />} />
          <Route path="/admin/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText("Login Page");
  });

  it("renders_outlet_when_authenticated", async () => {
    mockApi.checkStatus.mockResolvedValueOnce({ authenticated: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminAuthGuard />}>
            <Route index element={<div>Admin Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByText("Admin Dashboard");
  });
});
