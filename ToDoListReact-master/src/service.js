import apiClient from './axiosConfig';


export default {
  // =====================
  // Auth
  // =====================
  register: async (username, password) => {
    try {
      const result = await apiClient.post('/register', { username, passwordHash: password });
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const result = await apiClient.post('/login', { username, password });
      
      if (typeof result.data === 'string' && result.data.trim() !== '') {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.token) {
            localStorage.setItem('jwt', parsed.token);
            return parsed.token;
          }
        } catch (e) {
          // Continue to normal flow
        }
      }
      
      if (!result.data || !result.data.token) {
        throw new Error('No token received from server');
      }
      
      const token = result.data.token;
      localStorage.setItem('jwt', token);
      return token;
    } catch (error) {
      throw error;
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
      const result = await apiClient.get('/tasks');
      if (Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      throw error;
    }
  },

  
  addTask: async (name) => {
    try {
      const result = await apiClient.post('/tasks', { name, isComplete: false });
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  setCompleted: async (id, name, isComplete) => {
    try {
      const result = await apiClient.put(`/tasks/${id}`, { id, name, isComplete });
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (error) {
      throw error;
    }
  }
};
