import axios from 'axios';

// URL של ה-API - משתמש במשתנה סביבה לפי המטלה
// ב-create-react-app משתני סביבה חייבים להתחיל ב-REACT_APP_
const API_URL = process.env.REACT_APP_API_URL || 'https://todoapis-qdh6.onrender.com';

// Debug - הדפסת ה-API URL
console.log('🌐 API CONFIG - API_URL:', API_URL);
console.log('🌐 API CONFIG - REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);

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
      console.log('🔵 REGISTER - Sending request to:', `${API_URL}/register`);
      console.log('🔵 REGISTER - Username:', username);
      console.log('🔵 REGISTER - Payload:', { username, passwordHash: password });
      
      const result = await axios.post(`${API_URL}/register`, { username, passwordHash: password }, getConfig());
      
      console.log('🟢 REGISTER - Success! Response:', result.data);
      console.log('🟢 REGISTER - Status:', result.status);
      
      return result.data;
    } catch (error) {
      console.error('🔴 REGISTER - Error:', error);
      console.error('🔴 REGISTER - Error response:', error.response?.data);
      console.error('🔴 REGISTER - Error status:', error.response?.status);
      handleError(error);
    }
  },

  login: async (username, password) => {
    try {
      console.log('🔵 LOGIN - Sending request to:', `${API_URL}/login`);
      console.log('🔵 LOGIN - Username:', username);
      console.log('🔵 LOGIN - Payload:', { username, password: '***' });
      
      const result = await axios.post(`${API_URL}/login`, { username, password }, getConfig());
      
      console.log('🟢 LOGIN - Success! Status:', result.status);
      console.log('🟢 LOGIN - Has token:', !!result.data.token);
      
      const token = result.data.token;
      localStorage.setItem('jwt', token);
      console.log('🟢 LOGIN - Token saved to localStorage');
      
      return token;
    } catch (error) {
      console.error('🔴 LOGIN - Error:', error);
      console.error('🔴 LOGIN - Error response:', error.response?.data);
      console.error('🔴 LOGIN - Error status:', error.response?.status);
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
      console.log('🔵 GET TASKS - Sending request to:', `${API_URL}/tasks`);
      const token = localStorage.getItem('jwt');
      console.log('🔵 GET TASKS - Has token:', !!token);
      
      const result = await axios.get(`${API_URL}/tasks`, getConfig());
      
      console.log('🟢 GET TASKS - Success! Status:', result.status);
      console.log('🟢 GET TASKS - Data type:', Array.isArray(result.data) ? 'Array' : typeof result.data);
      console.log('🟢 GET TASKS - Data length:', Array.isArray(result.data) ? result.data.length : 'N/A');
      console.log('🟢 GET TASKS - Data:', result.data);
      
      // וודא שהתוצאה היא מערך
      if (Array.isArray(result.data)) {
        return result.data;
      }
      // אם זה לא מערך, נחזיר מערך ריק
      return [];
    } catch (error) {
      console.error('🔴 GET TASKS - Error:', error);
      console.error('🔴 GET TASKS - Error response:', error.response?.data);
      console.error('🔴 GET TASKS - Error status:', error.response?.status);
      // אם יש שגיאת 401, נטפל בה וזורקים שגיאה כדי שהקוד יידע
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('jwt');
        // זורקים שגיאה כדי שהקוד יידע שיש בעיה
        throw error;
      }
      // אם זו שגיאה אחרת, גם זורקים
      throw error;
    }
  },

  
  addTask: async (name) => {
    try {
      console.log('🔵 ADD TASK - Sending request to:', `${API_URL}/tasks`);
      console.log('🔵 ADD TASK - Task name:', name);
      console.log('🔵 ADD TASK - Payload:', { name, isComplete: false });
      
      const result = await axios.post(`${API_URL}/tasks`, { name, isComplete: false }, getConfig());
      
      console.log('🟢 ADD TASK - Success! Status:', result.status);
      console.log('🟢 ADD TASK - Created task:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('🔴 ADD TASK - Error:', error);
      console.error('🔴 ADD TASK - Error response:', error.response?.data);
      console.error('🔴 ADD TASK - Error status:', error.response?.status);
      handleError(error);
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      const result = await axios.put(`${API_URL}/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
