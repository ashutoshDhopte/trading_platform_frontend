import { ApiResponse, Dashboard, User } from '@/type/model';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/trade-sim';

export const getDashboardData = async (userId: number): Promise<Dashboard | null> => {
  const res = await axios.get(`${API_BASE}/dashboard`, {
                      params: {
                        userId: userId
                      }
                    });
  const data = res.data as ApiResponse;
  // console.log(data);
  if(data.Success && data.Data){
    return data.Data as Dashboard;
  }

  return null;
}

export const getUser = async (email: string, password: string): Promise<User | null> => {
  const res = await axios.get(`${API_BASE}/user`, {
                      params: {
                        email: email,
                        password: password
                      }
                    });
  const data = res.data as ApiResponse;
  if(data.Success && data.Data){
    return data.Data as User;
  }

  return null;
}

export const buyStocks = async (userId: number, ticker: string, quantity: number): Promise<string> => {
  const res = await axios.post(`${API_BASE}/buy-stocks`, {
    userId: userId,
    ticker: ticker,
    quantity: quantity
  });

  const data = res.data as ApiResponse;
  if(!data.Success){
    return data.ErrorMessage ?? "";
  }

  return ""
}