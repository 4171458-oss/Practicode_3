import axios from 'axios';

// URL של ה-API - FIXED FOR RENDER - ישירות בכל קריאה

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
      const result = await axios.post('https://todoapis-qdh6.onrender.com/register', { username, passwordHash: password }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  login: async (username, password) => {
    try {
      const result = await axios.post('https://todoapis-qdh6.onrender.com/login', { username, password }, getConfig());
      const token = result.data.token;
      localStorage.setItem('jwt', token);
      return token;
    } catch (error) {
      handleError(error);
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
      const result = await axios.get('https://todoapis-qdh6.onrender.com/tasks', getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  
  addTask: async (name) => {
    try {
      const result = await axios.post('https://todoapis-qdh6.onrender.com/tasks', { name, isComplete: false }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      const result = await axios.put(`https://todoapis-qdh6.onrender.com/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`https://todoapis-qdh6.onrender.com/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};
