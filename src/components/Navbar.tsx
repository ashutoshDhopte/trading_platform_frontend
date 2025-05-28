'use client';

import { getUser } from '@/lib/api';
import { User } from '@/type/model';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Create a map for tab names and their corresponding paths outside the component
const tabPaths = [
    { name: 'Dashboard', path: '/dashboard' },
    // { name: 'Portfolio', path: '/portfolio' },
    // { name: 'Markets', path: '/markets' },
    // { name: 'Orders', path: '/orders' },
    // { name: 'Profile', path: '/profile' }
];

const Navbar = () => {

    const [activeTab, setActiveTab] = useState<string>();
    const [user, setUser] = useState<User>();

    useEffect(() => {
        setActiveTab(tabPaths[0].name); // Set default tab only once

        const getData = async () => {
            const data = await getUser('user@example.com', '12345');
            if(data == null){
                console.error('Failed to fetch user data');
                return;
            }
            setUser(data == null ? new User(0, '', '', 0, '', '') : data);
        };

        getData();

    }, []);

    return(

        <nav className="bg-gray-900 text-white px-6 lg:px-12 pt-4 fixed top-0 w-full z-50">

            <header className="flex flex-col lg:flex-row justify-between items-center py-5 border-b border-white/10 gap-5">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    trade/sim
                </div>
                
                <nav className="flex gap-8">
                    {
                        tabPaths.map((tab) => (
                            <Link 
                                key={tab.name} 
                                href={tab.path} 
                                onClick={() => setActiveTab(tab.name)} 
                                className={`py-3 border-b-2 transition-all duration-300 font-medium ${
                                    activeTab === tab.name 
                                        ? 'border-cyan-400 text-cyan-400' 
                                        : 'border-transparent hover:text-cyan-400'
                                    }`
                                }
                            >
                                {tab.name}
                            </Link>
                        ))
                    }
                </nav>
                
                <div className="flex items-center gap-5">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-lg">
                        <div className="text-xs text-white/70 mb-1">Account Balance</div>
                        <div className="text-2xl font-bold text-green-400">${user != null ? user.CashBalanceDollars : 0}</div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                </div>
            </header>
        </nav>
    )

}

export default Navbar;