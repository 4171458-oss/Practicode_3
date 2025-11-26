import axios from 'axios';

// URL של ה-API - FIXED FOR RENDER
const API_URL = 'https://todoapis-qdh6.onrender.com';

// פונקציה עזר ליצירת config עם JWT
const getConfig = () => {
  const token = localStorage.getItem('jwt');
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// פונקציה עזר לטיפול בשגיאות
const handleError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('jwt');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
  throw error;
};


export default {
  // =====================
  // Auth
  // =====================
  register: async (username, password) => {
    try {
      const result = await axios.post(`${API_URL}/register`, { username, passwordHash: password }, getConfig());
      return result.data;
    } catch (error) {
      return handleError(error);
    }
  },

  login: async (username, password) => {
    try {
      const result = await axios.post(`${API_URL}/login`, { username, password }, getConfig());
      const token = result.data.token;
      localStorage.setItem('jwt', token);
      return token;
    } catch (error) {
      return handleError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('jwt');
  },

  // =====================
  // Tasks
  // =====================
  getTasks: async () => {
    try {
      const result = await axios.get(`${API_URL}/tasks`, getConfig());
      return result.data;
    } catch (error) {
      return handleError(error);
    }
  },

  
  addTask: async (name) => {
    try {
      const result = await axios.post(`${API_URL}/tasks`, { name, isComplete: false }, getConfig());
      return result.data;
    } catch (error) {
      return handleError(error);
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      const result = await axios.put(`${API_URL}/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      return handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, getConfig());
    } catch (error) {
      return handleError(error);
    }
  }
};
