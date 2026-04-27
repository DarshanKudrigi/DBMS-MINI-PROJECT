import { useEffect, useState } from "react";
import { getAllComplaints, updateComplaintStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

const statuses = ["pending", "in_progress", "resolved"];

function AdminDashboard() {
  const { token, logout } = useAuth();
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
    <section className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button className="rounded bg-gray-800 px-3 py-2 text-sm text-white" onClick={logout} type="button">
          Logout
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="space-y-3 rounded bg-white p-4 shadow">
        {complaints.map((item) => (
          <div className="rounded border p-3" key={item.id}>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm">{item.description}</p>
            <p className="text-xs text-gray-600">
              Student: {item.student_name} ({item.student_email})
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">Status:</span>
              {statuses.map((status) => (
                <button
                  className={`rounded px-2 py-1 text-xs ${item.status === status ? "bg-blue-600 text-white" : "bg-gray-200"}`}
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
        {complaints.length === 0 ? <p className="text-sm text-gray-500">No complaints available.</p> : null}
      </div>
    </section>
  );
}

export default AdminDashboard;
