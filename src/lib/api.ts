import { Dashboard } from '@/type/model';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/trade-sim';

export const fetchStocks = async (): Promise<string> => {
  const res = await axios.get(`${API_BASE}/test`);
  return res.data.data;
};

export const getDashboardData = async (userId: number): Promise<Dashboard | null> => {
  const res = await axios.get(`${API_BASE}/dashboard`, {
                      params: {
                        userId: userId
                      }
                    });
  const data = res.data;
  if(data.Success){
    console.log('Dashboard data fetched successfully:', data.Data);
    return data.Data as Dashboard;
  }

  return null;
}