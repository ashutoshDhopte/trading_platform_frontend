'use client'

import TradingDashboard from '../components/TradingDashboard'
import Navbar from '../components/Navbar'


export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main>
        <TradingDashboard/>
      </main>
    </div>
  )
}
