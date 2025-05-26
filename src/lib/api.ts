import axios from 'axios';

const API_BASE = 'http://localhost:8080/trade-sim';

export const fetchStocks = async (): Promise<string> => {
  const res = await axios.get(`${API_BASE}/test`);
  return res.data.data;
};