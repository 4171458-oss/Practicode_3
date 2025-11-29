import axios from 'axios';

// CRITICAL FIX: קריאת ה-API URL מקובץ config ב-public
// קבצים ב-public לא עוברים minification, אז ה-URL יישמר
let API_BASE_URL = 'https://todoapis-qdh6.onrender.com';

// קריאת ה-config בזמן ריצה (לא בזמן build)
(async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    if (config.API_URL) {
      API_BASE_URL = config.API_URL;
    }
  } catch (error) {
    // Using default URL
  }
})();

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
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.post(`${apiUrl}/register`, { username, passwordHash: password }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  login: async (username, password) => {
    try {
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.post(`${apiUrl}/login`, { username, password }, getConfig());
      
      if (typeof result.data === 'string' && result.data.trim() !== '') {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.token) {
            localStorage.setItem('jwt', parsed.token);
            return parsed.token;
          }
        } catch (e) {
          // Continue to normal flow
        }
      }
      
      if (!result.data || !result.data.token) {
        throw new Error('No token received from server');
      }
      
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
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.get(`${apiUrl}/tasks`, getConfig());
      
      if (Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwt');
      }
      throw error;
    }
  },

  
  addTask: async (name) => {
    try {
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.post(`${apiUrl}/tasks`, { name, isComplete: false }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.put(`${apiUrl}/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      await axios.delete(`${apiUrl}/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
