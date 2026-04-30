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
      className="group relative w-full overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-5 text-left shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
      onClick={onClick}
      type="button"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{complaint.title}</h3>
            <StatusBadge status={complaint.status} />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{complaint.description}</p>
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
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition duration-300 group-hover:bg-slate-800">
          View details
        </span>
        <span className="font-semibold text-slate-700">{complaint.latest_status_label || formatStatusLabel(complaint.status)}</span>
      </div>
    </button>
  );
}

export default ComplaintCard;
