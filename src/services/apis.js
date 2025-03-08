import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://task-server-nu-opal.vercel.app'; 
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicio de autenticación
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
};

export const taskService = {
    getUserTasks: async (userId) => {
      const response = await api.get(`/users/${userId}/tasks`);
      return response.data;
    },
    getGroupTasks: async (groupId) => {
      const response = await api.get(`/groups/${groupId}/tasks`);
      return response.data;
    },
    getAllTasks: async () => {
      const response = await api.get('/admin/tasks');
      return response.data;
    },
    createTask: async (taskData) => {
      const response = await api.post('/tasks', taskData);
      return response.data;
    },
    updateTask: async (taskId, taskData) => {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    },
    deleteTask: async (taskId) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    },
  };

  export const groupService = {
    createGroup: async (groupData) => {
      const response = await api.post('/groups', groupData);
      return response.data;
    },
    getUserGroups: async (userId) => {
      const response = await api.get(`/users/${userId}/groups`);
      return response.data;
    },
    getAllGroups: async () => {
      const response = await api.get('/groups');
      return response.data;
    },
    getGroupById: async (groupId) => {
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    },
  };


export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },
};

export default {
  authService,
  taskService,
  groupService,
  userService,
};