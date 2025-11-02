import axios from './axiosConfig.js'; // וודאי ש־axiosConfig.js מגדיר את baseURL

export default {
  // =====================
  // Auth
  // =====================
  register: async (username, password) => {
    const result = await axios.post('/register', { username, passwordHash: password });
    return result.data;
  },

  login: async (username, password) => {
    const result = await axios.post('/login', { username, password });
    const token = result.data.token;
    localStorage.setItem('jwt', token); // שמירת JWT ב-localStorage
    return token;
  },

  logout: () => {
    localStorage.removeItem('jwt');
  },

  // =====================
  // Tasks
  // =====================
  getTasks: async () => {
    const result = await axios.get('/tasks');
    return result.data;
  },

  
  addTask: async (name) => {
    const result = await axios.post('/tasks', { name, isComplete: false });
    return result.data;
  },

  setCompleted: async (id, name, isComplete) => {
    const result = await axios.put(`/tasks/${id}`, { id, name, isComplete });
    return result.data;
  },

  deleteTask: async (id) => {
    await axios.delete(`/tasks/${id}`);
  }
};
