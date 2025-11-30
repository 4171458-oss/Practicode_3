import axios from 'axios';

// קריאת ה-API URL מקובץ config ב-public (לא עובר minification)
// משתמשים ב-URL ישיר כ-default, ואז מעדכנים מה-config.json
const DEFAULT_API_URL = 'https://todoapis-qdh6.onrender.com';

// יוצר מופע axios עם baseURL (Config Defaults)
const instance = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// עדכון ה-baseURL מה-config.json בזמן ריצה
(async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    if (config.API_URL) {
      instance.defaults.baseURL = config.API_URL;
    }
  } catch (error) {
    // Using default URL
  }
})();

// מזריק אוטומטית את ה־JWT לכל בקשה
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// טיפול בשגיאות
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 401) {
      // אם יש שגיאת 401, מנקים את ה-JWT ומעבירים לדף התחברות
      localStorage.removeItem('jwt');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
