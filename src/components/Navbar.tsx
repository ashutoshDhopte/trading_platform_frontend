'use client';

import { formatCurrency } from '@/lib/util';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUser, getUserById } from '@/lib/api';

// Create a map for tab names and their corresponding paths outside the component
const tabPaths = [
    { name: 'Dashboard', path: '/dashboard' },
    // { name: 'Portfolio', path: '/' },
    // { name: 'Markets', path: '/' },
    { name: 'Orders', path: '/orders' },
];

const Navbar = () => {

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>();
    const [showProfilePopup, setShowProfilePopup] = useState<boolean>(false);
    const { user, setUser } = useUser();
    const userId = Number(useSearchParams().get('userId'));
    
    useEffect(() => {

        const currentPath = window.location.pathname.split('/')[1];
        const foundTab = tabPaths.find(tab => tab.path.includes(currentPath));
        if (foundTab) 
            setActiveTab(foundTab.name)
        else 
            setActiveTab(tabPaths[0].name); // Set default tab only once



        const fetchUserById = async (id: number) => {
            try {
                const userData = await getUserById(id);
                if (userData) {
                    setUser(userData);
                } else {
                    console.error('User not found');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserById(userId);
        
    }, [setUser, userId]);


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
                                href={{
                                    pathname: tab.path,
                                    query: { userId: user?.UserID }
                                }} 
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
                        <div className="text-xs text-white/70 mb-1">Initial Investment</div>
                        <div className="text-2xl font-bold">{formatCurrency(100000)}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-lg">
                        <div className="text-xs text-white/70 mb-1">Account Balance</div>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(user?.CashBalanceDollars || 0)}</div>
                    </div>
                    <div className="relative">
                        <button
                            className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center focus:outline-none cursor-pointer"
                            onClick={() => setShowProfilePopup((prev) => !prev)}
                            aria-label="Open profile menu"
                        >
                            {/* Optionally, add a user icon here */}
                        </button>
                        {showProfilePopup && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                {/* <Link
                                    href="/profile"
                                    className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setShowProfilePopup(false)}
                                >
                                    <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Profile
                                </Link> */}
                                <button
                                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setShowProfilePopup(false);
                                        // Add logout logic here
                                        router.push('/');
                                    }}
                                >
                                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </nav>
    )

}

export default Navbar;