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

  const filteredComplaints = useMemo(() => {
    if (selectedFilter === "all") {
      return complaints;
    }

    if (selectedFilter === "completed") {
      return complaints.filter((c) => c.status === "resolved" || c.status === "rejected");
    }

    return complaints.filter((c) => c.status === selectedFilter);
  }, [complaints, selectedFilter]);

  const dashboardStats = useMemo(
    () => [
      {
        label: "Total complaints",
        value: complaints.length,
        accent: "from-slate-500 to-slate-700",
        tint: "bg-slate-50",
        valueColor: "text-slate-700"
      },
      {
        label: "Pending",
        value: complaints.filter((c) => c.status === "pending").length,
        accent: "from-amber-500 to-amber-700",
        tint: "bg-amber-50",
        valueColor: "text-amber-800"
      },
      {
        label: "In progress",
        value: complaints.filter((c) => c.status === "in_progress").length,
        accent: "from-indigo-500 to-indigo-700",
        tint: "bg-indigo-50",
        valueColor: "text-indigo-700"
      },
      {
        label: "Completed",
        value: complaints.filter((c) => c.status === "resolved" || c.status === "rejected").length,
        accent: "from-emerald-500 to-emerald-700",
        tint: "bg-emerald-50",
        valueColor: "text-emerald-800"
      }
    ],
    [complaints]
  );

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
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(100,116,139,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.88),_rgba(244,247,255,1))]" />
      <div className="pointer-events-none absolute -left-16 top-28 h-72 w-72 rounded-full bg-slate-300/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute right-0 top-80 h-80 w-80 rounded-full bg-blue-300/15 blur-3xl animate-float-slower" />

      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:p-8 animate-fade-up">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                Student dashboard
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Welcome back, <span className="bg-gradient-to-r from-slate-700 via-blue-700 to-slate-900 bg-clip-text text-transparent">{studentName}</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Track complaints, stay on top of status updates, and raise new issues with a smoother, more visual workflow.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-xl hover:shadow-slate-950/20 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              onClick={() => setShowComplaintModal(true)}
              type="button"
            >
              File New Complaint
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <article
                className={`relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${stat.tint}`}
                key={stat.label}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${stat.accent}`} />
                <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                <p className={`mt-3 text-4xl font-black tracking-tight ${stat.valueColor}`}>{stat.value}</p>
              </article>
            ))}
          </div>
        </section>

        {error ? (
          <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur">{error}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {[{label: "All", value: "all"}, {label: "Pending", value: "pending"}, {label: "In Progress", value: "in_progress"}, {label: "Completed", value: "completed"}].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedFilter(tab.value)}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 ${
                selectedFilter === tab.value
                  ? "border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-950/15"
                  : "border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <div className="h-40 animate-pulse rounded-[1.75rem] border border-white/80 bg-white/80 shadow-sm backdrop-blur" key={item} />
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-dashed border-slate-200 bg-white/85 px-6 py-14 text-center shadow-sm backdrop-blur-xl animate-fade-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/15">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <p className="mt-6 text-xl font-bold text-slate-950">No complaints found.</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use File New Complaint to raise your first issue and start tracking progress.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} onClick={() => openHistory(complaint.id)} />
            ))}
          </div>
        )}
      </main>

      {showComplaintModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] animate-modal-pop">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">New complaint</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">File Complaint</h2>
              </div>
              <button className="rounded-full bg-slate-800 p-2.5 text-white shadow-lg shadow-slate-500/15 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700" onClick={() => setShowComplaintModal(false)} type="button">
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] animate-modal-pop">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Complaint details</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Status History</h2>
              </div>
              <button className="rounded-full bg-slate-800 p-2.5 text-white shadow-lg shadow-slate-500/15 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700" onClick={() => setShowHistoryModal(false)} type="button">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {historyLoading ? (
              <div className="mt-6 space-y-4">
                <div className="h-28 animate-pulse rounded-2xl bg-slate-100/80" />
                <div className="h-56 animate-pulse rounded-2xl bg-slate-100/80" />
              </div>
            ) : selectedComplaint ? (
              <div className="mt-6 space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{selectedComplaint.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{selectedComplaint.description}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-500 shadow-sm backdrop-blur">
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
                        <div className="relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={`${item.updated_at}-${index}`}>
                          <div className="flex flex-col items-center">
                            <span className="mt-1 h-3 w-3 rounded-full bg-slate-700 shadow-[0_0_0_6px_rgba(100,116,139,0.12)]" />
                            {index !== selectedComplaint.status_history.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-slate-200" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-slate-950">{item.status}</p>
                              <span className="text-xs text-slate-500">{formatDateTime(item.updated_at)}</span>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.remarks || "No remarks provided."}</p>
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
