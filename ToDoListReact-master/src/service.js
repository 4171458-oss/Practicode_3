import axios from 'axios';

// URL של ה-API - משתמש במשתנה סביבה לפי המטלה
// ב-create-react-app משתני סביבה חייבים להתחיל ב-REACT_APP_
// IMPORTANT: ב-Render, משתני סביבה נטמעים רק בזמן ה-build
// FIX: משתמשים ב-URL ישיר כדי להבטיח שהוא תמיד נטמע ב-build
// אם המשתנה לא מוגדר, נשתמש ב-URL ישיר
const API_URL_DEFAULT = 'https://todoapis-qdh6.onrender.com';

// בדיקה אם המשתנה קיים ולא ריק
// CRITICAL FIX: משתמשים ב-URL ישיר כדי להבטיח שהוא תמיד נטמע ב-build
// ב-Render, אם המשתנה לא מוגדר בזמן ה-build, הוא לא נטמע
// לכן, נשתמש ב-URL ישיר בקוד
const FINAL_API_URL = 'https://todoapis-qdh6.onrender.com';

// Debug - הדפסת ה-API URL
console.log('🌐 API CONFIG - REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('🌐 API CONFIG - FINAL_API_URL (will be used):', FINAL_API_URL);
console.log('🌐 API CONFIG - API_URL_DEFAULT:', API_URL_DEFAULT);
console.log('🌐 API CONFIG - FINAL_API_URL type:', typeof FINAL_API_URL);
console.log('🌐 API CONFIG - FINAL_API_URL length:', FINAL_API_URL ? FINAL_API_URL.length : 0);

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
      const url = `${FINAL_API_URL}/register`;
      console.log('🔵 REGISTER - Sending request to:', url);
      console.log('🔵 REGISTER - Username:', username);
      console.log('🔵 REGISTER - Payload:', { username, passwordHash: password });
      
      const result = await axios.post(url, { username, passwordHash: password }, getConfig());
      
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
      const url = `${FINAL_API_URL}/login`;
      console.log('🔵 LOGIN - Sending request to:', url);
      console.log('🔵 LOGIN - Username:', username);
      console.log('🔵 LOGIN - Payload:', { username, password: '***' });
      
      const result = await axios.post(url, { username, password }, getConfig());
      
      console.log('🟢 LOGIN - Success! Status:', result.status);
      console.log('🟢 LOGIN - Full response object:', result);
      console.log('🟢 LOGIN - Full response.data:', result.data);
      console.log('🟢 LOGIN - Response.data type:', typeof result.data);
      console.log('🟢 LOGIN - Response.data keys:', result.data ? Object.keys(result.data) : 'null/undefined');
      console.log('🟢 LOGIN - Has token:', !!result.data?.token);
      console.log('🟢 LOGIN - Token value:', result.data?.token);
      
      if (!result.data.token) {
        console.error('🔴 LOGIN - No token in response!');
        throw new Error('No token received from server');
      }
      
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
      const url = `${FINAL_API_URL}/tasks`;
      console.log('🔵 GET TASKS - Sending request to:', url);
      const token = localStorage.getItem('jwt');
      console.log('🔵 GET TASKS - Has token:', !!token);
      
      const result = await axios.get(url, getConfig());
      
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
      const url = `${FINAL_API_URL}/tasks`;
      console.log('🔵 ADD TASK - Sending request to:', url);
      console.log('🔵 ADD TASK - Task name:', name);
      console.log('🔵 ADD TASK - Payload:', { name, isComplete: false });
      
      const result = await axios.post(url, { name, isComplete: false }, getConfig());
      
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
      const result = await axios.put(`${FINAL_API_URL}/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`${FINAL_API_URL}/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
