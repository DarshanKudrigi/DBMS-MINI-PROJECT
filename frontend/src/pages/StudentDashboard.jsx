import { useEffect, useState } from "react";
import { createComplaint, getMyComplaints } from "../services/api";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { token, logout } = useAuth();
  const [form, setForm] = useState({ title: "", description: "" });
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    try {
      const data = await getMyComplaints(token);
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await createComplaint(form, token);
      setForm({ title: "", description: "" });
      await loadComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <button className="rounded bg-gray-800 px-3 py-2 text-sm text-white" onClick={logout} type="button">
          Logout
        </button>
      </div>

      <form className="space-y-3 rounded bg-white p-4 shadow" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold">Submit Complaint</h2>
        <input
          className="w-full rounded border p-2"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          className="w-full rounded border p-2"
          name="description"
          placeholder="Description"
          rows="4"
          value={form.description}
          onChange={handleChange}
        />
        <button className="rounded bg-blue-600 px-3 py-2 font-semibold text-white" type="submit">
          Submit
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">My Complaints</h2>
        <div className="space-y-2">
          {complaints.map((item) => (
            <div className="rounded border p-3" key={item.id}>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-700">{item.description}</p>
              <p className="text-xs text-gray-500">Status: {item.status}</p>
            </div>
          ))}
          {complaints.length === 0 ? <p className="text-sm text-gray-500">No complaints yet.</p> : null}
        </div>
      </div>
    </section>
  );
}

export default StudentDashboard;
