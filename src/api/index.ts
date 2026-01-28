
import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_BASE = isProduction ? '/FlowBoard-New/api/' : 'http://localhost:3001/';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
