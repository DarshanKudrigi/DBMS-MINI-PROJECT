import { useEffect, useState } from "react";
import { CATEGORY_SUGGESTIONS, COMPLAINT_CATEGORIES } from "../constants/categories";

function ComplaintForm({ onSubmit, loading = false, departments = [], tags = [] }) {
  const [form, setForm] = useState({
    category: "Infrastructure",
    department_id: "",
    issue_type: "",
    tag_ids: [],
    title: "",
    description: ""
  });

  const [isCustom, setIsCustom] = useState(false);

  const suggestions = CATEGORY_SUGGESTIONS[form.category] || [];

  useEffect(() => {
    if (!form.department_id && departments.length > 0) {
      setForm((prev) => ({
        ...prev,
        department_id: String(departments[0].department_id)
      }));
    }
  }, [departments, form.department_id]);

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

  const handleDepartmentChange = (e) => {
    setForm((prev) => ({ ...prev, department_id: e.target.value }));
  };

  const handleTagToggle = (tagId) => {
    setForm((prev) => {
      const exists = prev.tag_ids.includes(tagId);

      return {
        ...prev,
        tag_ids: exists ? prev.tag_ids.filter((id) => id !== tagId) : [...prev.tag_ids, tagId]
      };
    });
  };

  const handleCustomTitleChange = (e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.department_id) {
      alert("Please fill in all fields");
      return;
    }

    onSubmit({
      category: form.category,
      department_id: Number(form.department_id),
      issue_type: form.issue_type || "Others",
      tag_ids: form.tag_ids,
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
          Select Tags
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tags.map((tag) => (
            <button
              key={tag.tag_id}
              type="button"
              onClick={() => handleTagToggle(tag.tag_id)}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
                form.tag_ids.includes(tag.tag_id)
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {tag.tag_name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Select Department
        </label>
        <select
          value={form.department_id}
          onChange={handleDepartmentChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        >
          {departments.length === 0 ? (
            <option value="">No departments available</option>
          ) : (
            departments.map((department) => (
              <option key={department.department_id} value={department.department_id}>
                {department.dept_name}
              </option>
            ))
          )}
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
        disabled={loading || !form.issue_type || !form.department_id}
        className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {loading ? "Submitting..." : "File Complaint"}
      </button>
    </form>
  );
}

export default ComplaintForm;
