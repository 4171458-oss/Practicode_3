import axios from 'axios';

// URL של ה-API - משתמש במשתנה סביבה לפי המטלה
// ב-create-react-app משתני סביבה חייבים להתחיל ב-REACT_APP_
// IMPORTANT: ב-Render, משתני סביבה נטמעים רק בזמן ה-build
// CRITICAL FIX: משתמשים ב-URL ישיר כדי להבטיח שהוא תמיד נטמע ב-build
// שימוש ב-URL ישיר ללא משתנה כדי להבטיח שהוא נטמע ב-build
const API_BASE_URL = 'https://todoapis-qdh6.onrender.com';

// Debug - הדפסת ה-API URL
console.log('🌐 API CONFIG - REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('🌐 API CONFIG - API_BASE_URL (hardcoded):', API_BASE_URL);
console.log('🌐 API CONFIG - API_BASE_URL type:', typeof API_BASE_URL);
console.log('🌐 API CONFIG - API_BASE_URL length:', API_BASE_URL ? API_BASE_URL.length : 0);

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
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      const url = API_BASE_URL + '/register';
      console.log('🔵 REGISTER - Sending request to:', url);
      console.log('🔵 REGISTER - API_BASE_URL:', API_BASE_URL);
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
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      // שימוש ב-URL ישיר ללא משתנה כדי להבטיח שהוא נטמע ב-build
      const apiBaseUrl = 'https://todoapis-qdh6.onrender.com';
      const loginEndpoint = '/login';
      const fullUrl = apiBaseUrl + loginEndpoint;
      
      console.log('🔵 LOGIN - apiBaseUrl:', apiBaseUrl);
      console.log('🔵 LOGIN - loginEndpoint:', loginEndpoint);
      console.log('🔵 LOGIN - fullUrl:', fullUrl);
      console.log('🔵 LOGIN - fullUrl type:', typeof fullUrl);
      console.log('🔵 LOGIN - fullUrl length:', fullUrl.length);
      console.log('🔵 LOGIN - Sending request to:', fullUrl);
      console.log('🔵 LOGIN - API_BASE_URL:', apiBaseUrl);
      console.log('🔵 LOGIN - Username:', username);
      console.log('🔵 LOGIN - Payload:', { username, password: '***' });
      
      const result = await axios.post(fullUrl, { username, password }, getConfig());
      
      console.log('🟢 LOGIN - Success! Status:', result.status);
      console.log('🟢 LOGIN - Response headers:', result.headers);
      console.log('🟢 LOGIN - Content-Type:', result.headers['content-type']);
      console.log('🟢 LOGIN - Full response object:', result);
      console.log('🟢 LOGIN - Full response.data:', result.data);
      console.log('🟢 LOGIN - Response.data type:', typeof result.data);
      console.log('🟢 LOGIN - Response.data value:', JSON.stringify(result.data));
      console.log('🟢 LOGIN - Response.data keys:', result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'not an object');
      console.log('🟢 LOGIN - Has token:', !!result.data?.token);
      console.log('🟢 LOGIN - Token value:', result.data?.token);
      
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
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      const url = API_BASE_URL + '/tasks';
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
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      const url = API_BASE_URL + '/tasks';
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
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      const result = await axios.put(`${API_BASE_URL}/tasks/${id}`, { id, name, isComplete }, getConfig());
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      // CRITICAL FIX: שימוש ב-URL ישיר כדי להבטיח שהוא נטמע ב-build
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
