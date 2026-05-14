import axios from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

function buildConfig(token, extraHeaders = {}) {
  const headers = { ...extraHeaders };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { headers };
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error.message || "API request failed";
}

export async function registerUser(payload) {
  try {
    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    console.error("Register API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function loginUser(role, payload) {
  try {
    const response = await api.post(`/auth/login/${role}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Login API failed for ${role}:`, error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyComplaints(token) {
  try {
    const response = await api.get("/complaints", buildConfig(token));
    return response.data;
  } catch (error) {
    console.error("Get complaints API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function createComplaint(payload, token) {
  try {
    const response = await api.post("/complaints/file", payload, buildConfig(token));
    return response.data;
  } catch (error) {
    console.error("Create complaint API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllComplaints(token) {
  try {
    const response = await api.get("/admin/complaints", buildConfig(token));
    return response.data;
  } catch (error) {
    console.error("Get admin complaints API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getAdmins(token) {
  try {
    const response = await api.get("/admin/admins", buildConfig(token));
    return response.data;
  } catch (error) {
    console.error("Get admins API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function getComplaintDetails(complaintId, token) {
  try {
    const response = await api.get(`/complaints/${complaintId}`, buildConfig(token));
    return response.data;
  } catch (error) {
    console.error("Get complaint details API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}

export async function updateComplaintStatus(complaintId, status, token, remarks = '') {
  try {
    const response = await api.patch(
      `/admin/complaints/${complaintId}/status`,
      { status, remarks },
      buildConfig(token)
    );
    return response.data;
  } catch (error) {
    console.error("Update complaint status API failed:", error);
    throw new Error(getErrorMessage(error));
  }
}
