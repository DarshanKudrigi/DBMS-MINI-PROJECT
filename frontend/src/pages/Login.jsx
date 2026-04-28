import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(activeTab, form);
      login(data.token, data.user);
      setTimeout(() => {
        navigate(activeTab === "admin" ? "/admin" : "/dashboard");
      }, 100);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            CC
          </div>
          <h1 className="text-2xl font-bold text-slate-900">College Complaint System</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to continue</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "student" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => handleTabChange("student")}
            type="button"
          >
            Student Login
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "admin" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
            onClick={() => handleTabChange("admin")}
            type="button"
          >
            Admin Login
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {activeTab === "student" ? (
          <p className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-blue-700 hover:underline" to="/register">
              Register
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default Login;
