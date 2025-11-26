import axios from 'axios';

// לוקח את כתובת ה־API מה־Environment של Render
// ב-Render Static Site, משתני סביבה לא תמיד מועברים ל-Build
// לכן משתמשים בערך ישיר (זמני - לבדיקה)
// TODO: לחזור ל-process.env.REACT_APP_API_URL אחרי שתתוקן הבעיה ב-Render
const API_URL = 'https://todoapis-qdh6.onrender.com';

console.log("Loaded API URL:", API_URL); // בדיקה חשובה בענן
console.log("REACT_APP_API_URL from env:", process.env.REACT_APP_API_URL); // דיבוג

// יוצר מופע axios עם baseURL קבוע לשרת של ה־API
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

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
