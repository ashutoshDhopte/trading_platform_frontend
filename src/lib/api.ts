import { ApiResponse, Dashboard, Order, User } from '@/type/model';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

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

export const getUserById = async (userId: number): Promise<User | null> => {
  const res = await axios.get(`${API_BASE}/user/v2`, {
                      params: {
                        userId: userId
                      }
                    });
  const data = res.data as ApiResponse;
  // console.log(data);
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

export const sellStocks = async (userId: number, ticker: string, quantity: number): Promise<string> => {
  const res = await axios.post(`${API_BASE}/sell-stocks`, {
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

export const login = async (email: string, password: string): Promise<ApiResponse> => {
  const res = await axios.get(`${API_BASE}/login`, {
    params: {
      email: email,
      password: password
    }
  });

  return res.data as ApiResponse;
}

export const createAccount = async (email: string, password: string, verifyPassword: string): Promise<ApiResponse> => {
  const res = await axios.get(`${API_BASE}/create-account`, {
    params: {
      email: email,
      password: password,
      verifyPassword: verifyPassword
    }
  });

  return res.data as ApiResponse;
}

export const getOrders = async (userId: number): Promise<Order[]> => {
  const res = await axios.get(`${API_BASE}/orders`, {
    params: {
      userId: userId
    }
  });

  const data = res.data as ApiResponse;
  // console.log(data);
  if(data.Success && data.Data){
    return data.Data as Order[];
  }

  return [];
}

export const addStockToWatchlist = async (userId: number, stockId: number, targetPrice: number): Promise<string> => {
  const res = await axios.post(`${API_BASE}/add-stock-watchlist`, {
    userId: userId,
    stockId: stockId,
    targetPrice: targetPrice
  });

  const data = res.data as ApiResponse;
  // console.log(data);
  if(!data.Success){
    console.error(data.ErrorMessage);
    return data.ErrorMessage ?? "Failed to add stock to the watchlist";
  }

  return "";
}

export const deleteStockFromWatchlist = async (userId: number, stockId: number): Promise<string> => {
  const res = await axios.delete(`${API_BASE}/delete-stock-watchlist`, {
    params:{
      userId: userId,
      stockId: stockId
    }
  });

  const data = res.data as ApiResponse;
  // console.log(data);
  if(!data.Success){
    console.error(data.ErrorMessage);
    return data.ErrorMessage ?? "Failed to add stock to the watchlist";
  }

  return "";
}

export const updateUserSettings = async (userId: number, settings: Map<string, unknown>): Promise<User | null> => {
  const res = await axios.post(`${API_BASE}/update-user-setting`, {
    userId: userId,
    settings: Object.fromEntries(settings)
  });

  const data = res.data as ApiResponse;
  // console.log(data);
  if(!data.Success){
    console.error(data.ErrorMessage);
    return null;
  }

  return data.Data as User;
}