import { useEffect, useMemo, useState } from "react";
import ComplaintCard from "../components/ComplaintCard";
import ComplaintForm from "../components/ComplaintForm";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createComplaint, getComplaintDetails, getMyComplaints } from "../services/api";

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function StudentDashboard() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const loadComplaints = async () => {
    try {
      setError("");
      const data = await getMyComplaints(token);
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadComplaints().finally(() => setLoading(false));
  }, [token]);

  const studentName = useMemo(() => user?.name || "Student", [user]);

  const openHistory = async (complaintId) => {
    setSelectedComplaint(null);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setError("");

    try {
      const data = await getComplaintDetails(complaintId, token);
      setSelectedComplaint(data.data);
    } catch (err) {
      setError(err.message);
      setShowHistoryModal(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    setError("");

    try {
      await createComplaint(
        {
          title: formData.title.trim(),
          category: formData.category,
          issue_type: formData.issue_type,
          description: formData.description.trim()
        },
        token
      );

      setShowComplaintModal(false);
      await loadComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">My Complaints</h1>
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={() => setShowComplaintModal(true)}
            type="button"
          >
            File New Complaint
          </button>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {[{label: "All", value: "all"}, {label: "Pending", value: "pending"}, {label: "In Progress", value: "in_progress"}, {label: "Completed", value: "completed"}].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedFilter(tab.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                selectedFilter === tab.value
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((item) => (
              <div className="h-20 animate-pulse rounded-lg border border-slate-200 bg-white" key={item} />
            ))}
          </div>
        ) : (() => {
          const filtered =
            selectedFilter === "all"
              ? complaints
              : selectedFilter === "completed"
              ? complaints.filter((c) => c.status === "resolved" || c.status === "rejected")
              : complaints.filter((c) => c.status === selectedFilter);

          return filtered.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-base font-medium text-slate-900">No complaints found.</p>
              <p className="mt-2 text-sm text-slate-500">Use File Complaint to raise your first issue.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() => openHistory(complaint.id)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{complaint.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{complaint.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{formatDate(complaint.created_at)}</p>
                        <p className="mt-1 text-xs font-medium text-slate-700">{complaint.latest_status_label}</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })()}
      </main>

      {showComplaintModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">New complaint</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">File Complaint</h2>
              </div>
              <button className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700" onClick={() => setShowComplaintModal(false)} type="button">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ComplaintForm onSubmit={handleFormSubmit} loading={submitting} />
          </div>
        </div>
      ) : null}

      {showHistoryModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Complaint details</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">Status History</h2>
              </div>
              <button className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700" onClick={() => setShowHistoryModal(false)} type="button">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {historyLoading ? (
              <div className="mt-6 space-y-4">
                <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ) : selectedComplaint ? (
              <div className="mt-6 space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{selectedComplaint.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{selectedComplaint.description}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>
                        <span className="font-medium text-slate-700">Category:</span> {selectedComplaint.category}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Issue Type:</span> {selectedComplaint.issue_type || "Not specified"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Submitted:</span> {formatDate(selectedComplaint.created_at)}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Latest status:</span> {selectedComplaint.latest_status_label}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Timeline</h3>
                  <div className="mt-4 space-y-4">
                    {selectedComplaint.status_history?.length > 0 ? (
                      selectedComplaint.status_history.map((item, index) => (
                        <div className="relative flex gap-4 rounded-2xl border border-slate-200 p-4" key={`${item.updated_at}-${index}`}>
                          <div className="flex flex-col items-center">
                            <span className="mt-1 h-3 w-3 rounded-full bg-slate-900" />
                            {index !== selectedComplaint.status_history.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-slate-200" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{item.status}</p>
                              <span className="text-xs text-slate-500">{formatDateTime(item.updated_at)}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{item.remarks || "No remarks provided."}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                              Updated by {item.updated_by_name}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                        No status updates yet.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentDashboard;
