import { useState } from "react";
import { CATEGORY_SUGGESTIONS, COMPLAINT_CATEGORIES } from "../constants/categories";

function ComplaintForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    category: "Infrastructure",
    issue_type: "",
    title: "",
    description: ""
  });

  const [isCustom, setIsCustom] = useState(false);

  const suggestions = CATEGORY_SUGGESTIONS[form.category] || [];

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: newCategory,
      issue_type: "",
      title: ""
    }));
    setIsCustom(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "Others") {
      setIsCustom(true);
      setForm((prev) => ({
        ...prev,
        issue_type: "Others",
        title: ""
      }));
    } else {
      setIsCustom(false);
      setForm((prev) => ({
        ...prev,
        issue_type: suggestion,
        title: suggestion
      }));
    }
  };

  const handleDescriptionChange = (e) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleCustomTitleChange = (e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    onSubmit({
      category: form.category,
      issue_type: form.issue_type || "Others",
      title: form.title,
      description: form.description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Select Issue Category
        </label>
        <select
          value={form.category}
          onChange={handleCategoryChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {COMPLAINT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Select Issue Type
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition sm:text-sm ${
                form.issue_type === suggestion
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {isCustom ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-900">
            Describe Your Issue
          </label>
          <input
            type="text"
            value={form.title}
            onChange={handleCustomTitleChange}
            placeholder="Enter your issue title"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      ) : (
        form.issue_type && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">
              Issue: {form.title}
            </label>
            <p className="text-xs text-slate-500">
              Selected issue will be used as the complaint title
            </p>
          </div>
        )
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Detailed Description
        </label>
        <textarea
          value={form.description}
          onChange={handleDescriptionChange}
          placeholder="Provide more details about your complaint..."
          rows="5"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.issue_type}
        className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {loading ? "Submitting..." : "File Complaint"}
      </button>
    </form>
  );
}

export default ComplaintForm;
