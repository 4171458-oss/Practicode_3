import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5098', // כתובת השרת שלך
});

// מוסיפים interceptor לשגיאות
api.interceptors.response.use(
  response => response,
  error => {
    // רושמים את השגיאה ללוג
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'; // במקרה של 401 נשלח לדף לוגין
    }
    return Promise.reject(error);
  }
);

// מוסיפים JWT ל־headers אם קיים
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
