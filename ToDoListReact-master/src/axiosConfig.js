import axios from 'axios';

// לוקח את כתובת ה־API מה־Environment של Render
const API_URL = process.env.REACT_APP_API_URL;

console.log("Loaded API URL:", API_URL); // בדיקה חשובה בענן

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

export default instance;
