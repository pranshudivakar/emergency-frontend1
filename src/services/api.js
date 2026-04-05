import axios from 'axios';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://emergency-backend-8n80.onrender.com',
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      alert('Server is taking too long to respond. Please try again.');
    } else if (!error.response) {
      alert('Cannot connect to server. Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);