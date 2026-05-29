import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthApi } from "../api/adminAuthApi";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminAuthApi.login(password);
      setPassword("");
      navigate("/admin");
    } catch {
      setError("Incorrect password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-sm mx-auto mt-16 bg-gray-800 p-8 rounded-lg">
        <h1 className="text-xl font-bold text-indigo-400 mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-gray-100 placeholder-gray-500 disabled:opacity-50"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
