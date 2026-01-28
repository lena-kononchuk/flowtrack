// src/api/axios.config.ts
import axios from 'axios';

const isProduction = import.meta.env.PROD;

// Base URL
const BASE_URL = isProduction
  ? window.location.origin + '/FlowBoard-New/api/'
  : 'http://localhost:3001/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for production requests
apiClient.interceptors.request.use(config => {
  if (isProduction) {
    // For GitHub Pages, change URL to static files
    if (config.url?.includes('/tasks')) {
      config.url = 'tasks.json';
    } else if (config.url?.includes('/projects')) {
      config.url = 'projects.json';
    }
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (isProduction) {
      console.log('Production API error, trying fallback...');
      // Add fallback logic here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
