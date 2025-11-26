import axios from 'axios';

// הגדרת axios עם baseURL ישיר - FIXED FOR RENDER
const apiClient = axios.create({
  baseURL: 'https://todoapis-qdh6.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// מזריק JWT אוטומטית
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// טיפול בשגיאות
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


export default {
  // =====================
  // Auth
  // =====================
  register: async (username, password) => {
    const result = await apiClient.post('/register', { username, passwordHash: password });
    return result.data;
  },

  login: async (username, password) => {
    const result = await apiClient.post('/login', { username, password });
    const token = result.data.token;
    localStorage.setItem('jwt', token); // שמירת JWT ב-localStorage
    return token;
  },

  logout: () => {
    localStorage.removeItem('jwt');
  },

  // =====================
  // Tasks
  // =====================
  getTasks: async () => {
    const result = await apiClient.get('/tasks');
    return result.data;
  },

  
  addTask: async (name) => {
    const result = await apiClient.post('/tasks', { name, isComplete: false });
    return result.data;
  },

  setCompleted: async (id, name, isComplete) => {
    const result = await apiClient.put(`/tasks/${id}`, { id, name, isComplete });
    return result.data;
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}`);
  }
};
