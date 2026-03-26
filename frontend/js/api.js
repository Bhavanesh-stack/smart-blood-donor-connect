const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// ===== AUTH =====
async function registerUser(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

async function loginUser(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// ===== DONORS =====
async function searchDonors(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/donors/search?${query}`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

async function getMyProfile() {
  const res = await fetch(`${API_BASE}/donors/profile`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

async function toggleAvailability(available) {
  const res = await fetch(`${API_BASE}/donors/availability`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ available })
  });
  return handleResponse(res);
}

async function updateProfile(data) {
  const res = await fetch(`${API_BASE}/donors/profile`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// ===== REQUESTS =====
async function createRequest(data) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

async function getMyRequests() {
  const res = await fetch(`${API_BASE}/requests/my`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

async function getIncomingRequests() {
  const res = await fetch(`${API_BASE}/requests/incoming`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

async function respondToRequest(id, action) {
  const res = await fetch(`${API_BASE}/requests/${id}/respond`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ action })
  });
  return handleResponse(res);
}

async function fulfillRequest(id) {
  const res = await fetch(`${API_BASE}/requests/${id}/fulfill`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return handleResponse(res);
}
