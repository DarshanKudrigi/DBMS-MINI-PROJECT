import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllComplaints, updateComplaintStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

const statuses = ["pending", "in_progress", "resolved"];

function AdminDashboard() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    try {
      const data = await getAllComplaints(token);
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateComplaintStatus(id, status, token);
      await loadComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-200/60 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Admin Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Complaint review queue</h1>
            </div>
          </div>
        </section>

        {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <section className="mt-8 space-y-4">
          {complaints.map((item) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.id}>
              <p className="text-lg font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <p className="mt-3 text-sm text-slate-500">
                Student: {item.student_name} ({item.student_email})
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Status:</span>
                {statuses.map((status) => (
                  <button
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${item.status === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    key={status}
                    onClick={() => handleStatusChange(item.id, status)}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {complaints.length === 0 ? <p className="text-sm text-slate-500">No complaints available.</p> : null}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
