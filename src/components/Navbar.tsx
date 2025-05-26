import { useState, useEffect } from 'react';

const Navbar = () => {

    const [activeTab, setActiveTab] = useState('Dashboard');

    return(

        <nav className="bg-gray-900 text-white px-6 lg:px-12 pt-4 fixed top-0 w-full z-50">

            <header className="flex flex-col lg:flex-row justify-between items-center py-5 border-b border-white/10 gap-5">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    trade/sim
                </div>
                
                <nav className="flex gap-8">
                    {['Dashboard', 'Portfolio', 'Markets', 'Orders'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 border-b-2 transition-all duration-300 font-medium ${
                        activeTab === tab 
                            ? 'border-cyan-400 text-cyan-400' 
                            : 'border-transparent hover:text-cyan-400'
                        }`}
                    >
                        {tab}
                    </button>
                    ))}
                </nav>
                
                <div className="flex items-center gap-5">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-lg">
                        <div className="text-xs text-white/70 mb-1">Account Balance</div>
                        <div className="text-2xl font-bold text-green-400">$127,450.80</div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                </div>
            </header>
        </nav>
    )

}

export default Navbar;