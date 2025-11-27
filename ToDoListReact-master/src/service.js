import axios from 'axios';

// CRITICAL FIX: יצירת axios instance עם baseURL ישיר
// זה מבטיח שה-URL תמיד נטמע ב-build
const apiClient = axios.create({
  baseURL: 'https://todoapis-qdh6.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Debug - הדפסת ה-API URL
console.log('🌐 API CONFIG - baseURL:', apiClient.defaults.baseURL);
console.log('🌐 API CONFIG - baseURL type:', typeof apiClient.defaults.baseURL);
console.log('🌐 API CONFIG - baseURL length:', apiClient.defaults.baseURL ? apiClient.defaults.baseURL.length : 0);

// Interceptor להוספת JWT לכל בקשה
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      console.log('🔵 REGISTER - baseURL:', apiClient.defaults.baseURL);
      console.log('🔵 REGISTER - Full URL will be:', apiClient.defaults.baseURL + '/register');
      console.log('🔵 REGISTER - Username:', username);
      console.log('🔵 REGISTER - Payload:', { username, passwordHash: password });
      
      const result = await apiClient.post('/register', { username, passwordHash: password });
      
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
      console.log('🔵 LOGIN - baseURL:', apiClient.defaults.baseURL);
      console.log('🔵 LOGIN - Full URL will be:', apiClient.defaults.baseURL + '/login');
      console.log('🔵 LOGIN - Username:', username);
      console.log('🔵 LOGIN - Payload:', { username, password: '***' });
      
      const result = await apiClient.post('/login', { username, password });
      
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
      console.log('🔵 GET TASKS - baseURL:', apiClient.defaults.baseURL);
      console.log('🔵 GET TASKS - Full URL will be:', apiClient.defaults.baseURL + '/tasks');
      const token = localStorage.getItem('jwt');
      console.log('🔵 GET TASKS - Has token:', !!token);
      
      const result = await apiClient.get('/tasks');
      
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
      console.log('🔵 ADD TASK - baseURL:', apiClient.defaults.baseURL);
      console.log('🔵 ADD TASK - Full URL will be:', apiClient.defaults.baseURL + '/tasks');
      console.log('🔵 ADD TASK - Task name:', name);
      console.log('🔵 ADD TASK - Payload:', { name, isComplete: false });
      
      const result = await apiClient.post('/tasks', { name, isComplete: false });
      
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
      const result = await apiClient.put(`/tasks/${id}`, { id, name, isComplete });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteTask: async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (error) {
      handleError(error);
    }
  }
};
