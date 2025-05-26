'use client'

import { useEffect, useState } from 'react';
import TradingDashboard from '../components/TradingDashboard'
import Navbar from '../components/Navbar'
import { fetchStocks } from '../lib/api';


export default function Home() {

  const [stock, setStocks] = useState<string>();

  useEffect(() => {
    fetchStocks().then(setStocks).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main>
        <h1>{stock}</h1>
        <TradingDashboard/>
      </main>
    </div>
  )
}
