import axios from 'axios';

// During development the React app runs on localhost:3000 and the Spring Boot
// backend runs on localhost:8080. Set baseURL accordingly so API calls go to
// the backend. For production you can change this to '' (same origin) or
// use an environment variable.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
