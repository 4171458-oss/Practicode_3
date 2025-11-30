import axios from 'axios';

// לוקח את כתובת ה־API מה־Environment של Render
// ב-Render Static Site, משתני סביבה לא תמיד מועברים ל-Build
// לכן משתמשים בערך ישיר ישירות ב-baseURL
const API_URL = process.env.REACT_APP_API_URL || 'https://todoapis-qdh6.onrender.com';

// Debug logs
console.log("=== API CONFIG DEBUG ===");
console.log("API_URL constant:", API_URL);
console.log("REACT_APP_API_URL from env:", process.env.REACT_APP_API_URL);
console.log("Final API URL:", API_URL);
console.log("========================");

// יוצר מופע axios עם baseURL קבוע לשרת של ה־API
// CRITICAL FIX: שימוש ב-URL ישיר - webpack לא יכול למחוק string literal
const API_BASE_URL_HARDCODED = 'https://todoapis-qdh6.onrender.com';
const instance = axios.create({
  baseURL: API_BASE_URL_HARDCODED,
  headers: {
    "Content-Type": "application/json"
  }
});

// Debug - וידוא שה-baseURL נטמע
console.log('🔧 AXIOS CONFIG - baseURL:', instance.defaults.baseURL);
console.log('🔧 AXIOS CONFIG - API_BASE_URL_HARDCODED:', API_BASE_URL_HARDCODED);

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
