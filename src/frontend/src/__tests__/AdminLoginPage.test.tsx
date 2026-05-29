import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminLoginPage from "../pages/AdminLoginPage";
import * as adminAuthApiModule from "../api/adminAuthApi";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../api/adminAuthApi", () => ({
  adminAuthApi: {
    login: vi.fn(),
  },
}));

const mockApi = adminAuthApiModule.adminAuthApi as {
  login: ReturnType<typeof vi.fn>;
};

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders_login_form", () => {
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /admin login/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows_error_message_on_wrong_password", async () => {
    const user = userEvent.setup();
    mockApi.login.mockRejectedValueOnce(new Error("HTTP 401"));

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/password/i), "wrong-pass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await screen.findByText(/incorrect password/i);
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
  });

  it("clears_password_field_on_failed_login", async () => {
    const user = userEvent.setup();
    mockApi.login.mockRejectedValueOnce(new Error("HTTP 401"));

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/password/i);
    await user.type(input, "wrong-pass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await screen.findByText(/incorrect password/i);
    expect(input).toHaveValue("");
  });

  it("navigates_to_admin_on_successful_login", async () => {
    const user = userEvent.setup();
    mockApi.login.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/password/i), "correct-secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });
});
