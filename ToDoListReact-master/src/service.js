import axios from 'axios';

// CRITICAL FIX: שימוש ב-URL מלא ישירות בכל קריאה
// ב-Render, baseURL לא נטמע ב-build, אז נשתמש ב-URL מלא ישירות
// כל הקריאות משתמשות ב-URL ישיר (hardcoded) כדי להבטיח שהוא נטמע ב-build
const API_BASE = 'https://todoapis-qdh6.onrender.com';

// Debug - וידוא שה-URL נטמע
console.log('🔧 SERVICE INIT - API_BASE:', API_BASE);
console.log('🔧 SERVICE INIT - API_BASE length:', API_BASE.length);

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
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/register`;
      console.log('🔵 REGISTER - Full URL:', fullUrl);
      console.log('🔵 REGISTER - Username:', username);
      
      const result = await axios.post(fullUrl, { username, passwordHash: password }, getConfig());
      
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
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/login`;
      console.log('🔵 LOGIN - Full URL:', fullUrl);
      console.log('🔵 LOGIN - Username:', username);
      
      const result = await axios.post(fullUrl, { username, password }, getConfig());
      
      console.log('🟢 LOGIN - Success! Status:', result.status);
      console.log('🟢 LOGIN - Response data:', result.data);
      console.log('🟢 LOGIN - Has token:', !!result.data?.token);
      
      // אם result.data הוא string, ננסה לפרסר אותו כ-JSON
      if (typeof result.data === 'string' && result.data.trim() !== '') {
        try {
          const parsed = JSON.parse(result.data);
          console.log('🟢 LOGIN - Parsed JSON:', parsed);
          if (parsed.token) {
            const token = parsed.token;
            localStorage.setItem('jwt', token);
            console.log('🟢 LOGIN - Token saved to localStorage (from parsed JSON)');
            return token;
          }
        } catch (e) {
          console.error('🔴 LOGIN - Failed to parse JSON:', e);
        }
      }
      
      if (!result.data || !result.data.token) {
        console.error('🔴 LOGIN - No token in response!');
        console.error('🔴 LOGIN - Response data:', result.data);
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
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/tasks`;
      console.log('🔵 GET TASKS - Full URL:', fullUrl);
      const token = localStorage.getItem('jwt');
      console.log('🔵 GET TASKS - Has token:', !!token);
      
      const result = await axios.get(fullUrl, getConfig());
      
      console.log('🟢 GET TASKS - Success! Status:', result.status);
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
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/tasks`;
      console.log('🔵 ADD TASK - Full URL:', fullUrl);
      console.log('🔵 ADD TASK - Task name:', name);
      
      const result = await axios.post(fullUrl, { name, isComplete: false }, getConfig());
      
      console.log('🟢 ADD TASK - Success! Created task:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('🔴 ADD TASK - Error:', error);
      console.error('🔴 ADD TASK - Error response:', error.response?.data);
      handleError(error);
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/tasks/${id}`;
      const result = await axios.put(fullUrl, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      // CRITICAL: שימוש ב-URL ישיר ללא משתנה
      const fullUrl = `${API_BASE}/tasks/${id}`;
      await axios.delete(fullUrl, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
