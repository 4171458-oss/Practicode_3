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
      console.log('🔧 Loaded API URL from config.json:', API_BASE_URL);
    }
  } catch (error) {
    console.warn('⚠️ Could not load config.json, using default URL:', API_BASE_URL);
  }
})();

console.log('🔧 Using API URL:', API_BASE_URL);

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
      // קריאת ה-API URL מה-config
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      console.log('🔵 REGISTER - Username:', username);
      console.log('🔵 REGISTER - API URL:', apiUrl);
      
      const result = await axios.post(`${apiUrl}/register`, { username, passwordHash: password }, getConfig());
      
      console.log('🟢 REGISTER - Success!', result.data);
      
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
      // קריאת ה-API URL מה-config
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      const loginUrl = `${apiUrl}/login`;
      
      console.log('🔵 LOGIN - Username:', username);
      console.log('🔵 LOGIN - API URL:', apiUrl);
      console.log('🔵 LOGIN - Full URL:', loginUrl);
      
      const result = await axios.post(loginUrl, { username, password }, getConfig());
      
      console.log('🔵 LOGIN - Request URL (after):', result.config?.url);
      console.log('🔵 LOGIN - Request baseURL:', result.config?.baseURL);
      console.log('🔵 LOGIN - Request full URL:', result.config?.baseURL ? result.config.baseURL + result.config.url : result.config?.url);
      
      console.log('🟢 LOGIN - Success!');
      console.log('🟢 LOGIN - Status:', result.status);
      console.log('🟢 LOGIN - Status text:', result.statusText);
      console.log('🟢 LOGIN - Headers:', result.headers);
      console.log('🟢 LOGIN - Content-Type:', result.headers['content-type'] || result.headers['Content-Type']);
      console.log('🟢 LOGIN - Response data:', result.data);
      console.log('🟢 LOGIN - Response data type:', typeof result.data);
      console.log('🟢 LOGIN - Response data stringified:', JSON.stringify(result.data));
      console.log('🟢 LOGIN - Has token:', !!result.data?.token);
      console.log('🟢 LOGIN - Full response object:', result);
      
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
        console.error('🔴 LOGIN - No token!');
        console.error('🔴 LOGIN - Response data:', result.data);
        throw new Error('No token received from server');
      }
      
      const token = result.data.token;
      localStorage.setItem('jwt', token);
      console.log('🟢 LOGIN - Token saved!');
      
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
      // קריאת ה-API URL מה-config
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      const result = await axios.get(`${apiUrl}/tasks`, getConfig());
      
      console.log('🟢 GET TASKS - Success!', result.data);
      
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
      // קריאת ה-API URL מה-config
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      console.log('🔵 ADD TASK - Task name:', name);
      
      const result = await axios.post(`${apiUrl}/tasks`, { name, isComplete: false }, getConfig());
      
      console.log('🟢 ADD TASK - Success!', result.data);
      
      return result.data;
    } catch (error) {
      console.error('🔴 ADD TASK - Error:', error);
      console.error('🔴 ADD TASK - Error response:', error.response?.data);
      handleError(error);
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      // קריאת ה-API URL מה-config
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
      // קריאת ה-API URL מה-config
      const configResponse = await fetch('/config.json');
      const config = await configResponse.json();
      const apiUrl = config.API_URL || 'https://todoapis-qdh6.onrender.com';
      
      await axios.delete(`${apiUrl}/tasks/${id}`, getConfig());
    } catch (error) {
      handleError(error);
    }
  }
};
