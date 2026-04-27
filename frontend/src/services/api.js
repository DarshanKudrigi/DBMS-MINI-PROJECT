const BASE_URL = "http://localhost:5000/api";

async function handleResponse(response) {
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
}

function getAuthHeader(token) {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export async function registerUser(payload) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

export async function loginUser(role, payload) {
  const response = await fetch(`${BASE_URL}/auth/login/${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

export async function getDepartments() {
  const response = await fetch(`${BASE_URL}/auth/departments`);
  return handleResponse(response);
}

export async function getMyComplaints(token) {
  const response = await fetch(`${BASE_URL}/complaints`, {
    headers: getAuthHeader(token)
  });

  return handleResponse(response);
}

export async function createComplaint(payload, token) {
  const response = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token)
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

export async function getAllComplaints(token) {
  const response = await fetch(`${BASE_URL}/admin/complaints`, {
    headers: getAuthHeader(token)
  });

  return handleResponse(response);
}

export async function updateComplaintStatus(id, status, token) {
  const response = await fetch(`${BASE_URL}/admin/complaints/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(token)
    },
    body: JSON.stringify({ status })
  });

  return handleResponse(response);
}
