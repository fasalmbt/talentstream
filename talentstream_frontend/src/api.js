import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auto-refresh access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't intercept auth endpoints — let errors pass through normally
    const isAuthEndpoint = original.url.includes('/auth/login/') || 
                           original.url.includes('/auth/token/refresh/') ||
                           original.url.includes('/auth/register/');
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),  // Fetch authenticated user's profile
};

export const jobsAPI = {
  list: () => api.get('/jobs/'),
  create: (data) => api.post('/jobs/', data),
  apply: (formData) => api.post('/jobs/apply/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const applicationsAPI = {
  getRecruiterApps: () => api.get('/recruiter/applications/'),
  getJobSeekerApps: () => api.get('/my-applications/'),
  downloadResume: (id) => api.get(`/applications/${id}/resume/`, { responseType: 'blob' }),
};

export default api;
