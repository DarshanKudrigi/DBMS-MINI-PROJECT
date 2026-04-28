import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

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
    throw new Error(getErrorMessage(error));
  }
}

export async function loginUser(role, payload) {
  try {
    const response = await api.post(`/auth/login/${role}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyComplaints(token) {
  try {
    const response = await api.get("/complaints", buildConfig(token));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createComplaint(payload, token) {
  try {
    const response = await api.post("/complaints/file", payload, buildConfig(token));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAllComplaints(token) {
  try {
    const response = await api.get("/admin/complaints", buildConfig(token));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateComplaintStatus(id, status, token) {
  try {
    const response = await api.patch(`/admin/complaints/${id}/status`, { status }, buildConfig(token));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getComplaintDetails(id, token) {
  try {
    const response = await api.get(`/complaints/${id}`, buildConfig(token));
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
