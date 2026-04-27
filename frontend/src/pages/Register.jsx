import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDepartments, registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dept_id: ""
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data.data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "student_id" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const usnRegex = /^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/;
    if (!usnRegex.test(form.student_id.trim())) {
      setError("USN must be like 4NI24IS040");
      setLoading(false);
      return;
    }

    try {
      await registerUser({
        student_id: form.student_id.trim(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        dept_id: Number(form.dept_id)
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
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
          <h1 className="text-2xl font-bold text-slate-900">Student Registration</h1>
          <p className="mt-1 text-sm text-slate-600">Create your account</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="student_id"
            type="text"
            placeholder="USN (e.g. 4NI24IS040)"
            value={form.student_id}
            onChange={handleChange}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
            name="phone"
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="dept_id"
            value={form.dept_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.dept_id} value={dept.dept_id}>
                {dept.dept_name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="mt-1 w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-semibold text-blue-700 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
