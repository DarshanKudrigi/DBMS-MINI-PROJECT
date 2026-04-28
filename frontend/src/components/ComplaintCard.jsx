function statusStyles(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "in_progress") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (normalized === "resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "rejected") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatStatusLabel(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "in_progress") {
    return "In Progress";
  }

  if (normalized === "resolved") {
    return "Resolved";
  }

  if (normalized === "rejected") {
    return "Rejected";
  }

  return "Pending";
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles(status)}`}>
      {formatStatusLabel(status)}
    </span>
  );
}

function ComplaintCard({ complaint, onClick }) {
  return (
    <button
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">{complaint.title}</h3>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{complaint.description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Category</p>
          <p className="mt-1 font-medium text-slate-800">{complaint.category}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Department</p>
          <p className="mt-1 font-medium text-slate-800">{complaint.dept_name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Submitted</p>
          <p className="mt-1 font-medium text-slate-800">{new Date(complaint.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700">
          View More
        </button>
        <span className="font-medium text-slate-700">{complaint.latest_status_label || formatStatusLabel(complaint.status)}</span>
      </div>
    </button>
  );
}

export default ComplaintCard;
