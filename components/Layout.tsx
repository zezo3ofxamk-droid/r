

import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { HomeIcon, HashIcon, UserIcon, CreateIcon } from './Icons';
import CreateRt from './CreateZeet';
import { useAuth } from '../hooks/useAuth';

const BottomNav: React.FC<{ onComposeClick: () => void }> = ({ onComposeClick }) => {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    const navItems = [
        { icon: <HomeIcon />, path: '/' },
        { icon: <HashIcon />, path: '/search' },
        { icon: <UserIcon />, path: `/profile/${currentUser.username}` },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-purple-dark border-t border-brand-border h-16 flex items-center justify-around z-20">
            {navItems.map((item, index) => (
                <NavLink 
                    key={index}
                    to={item.path}
                    className={({ isActive }) => 
                        `flex items-center justify-center w-full h-full ${isActive ? 'text-white' : 'text-gray-400'}`
                    }
                >
                    {item.icon}
                </NavLink>
            ))}
            <button 
                onClick={onComposeClick}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 absolute right-5 -top-7 shadow-lg"
                aria-label="Create new RT"
            >
                <CreateIcon />
            </button>
        </div>
    );
};

const CreateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-start justify-center pt-10 sm:pt-20" onClick={onClose}>
        <div 
            className="bg-brand-purple-dark rounded-2xl w-full max-w-xl m-4 border border-brand-border"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-2 border-b border-brand-border text-left">
                <button 
                    onClick={onClose} 
                    className="text-white text-2xl font-bold leading-none px-2 py-0 rounded-full hover:bg-white/10"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
            <CreateRt onRtPosted={onClose} />
        </div>
    </div>
);


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    return (
        <>
            {isCreateModalOpen && <CreateModal onClose={() => setCreateModalOpen(false)} />}
            <div className="container mx-auto flex min-h-screen max-w-7xl">
                <Sidebar onComposeClick={() => setCreateModalOpen(true)} />
                <main className="flex-grow w-full max-w-[600px] border-x border-brand-border pb-16 lg:pb-0">
                    {children}
                </main>
                <RightSidebar />
            </div>
            <BottomNav onComposeClick={() => setCreateModalOpen(true)} />
        </>
    );
};

export default Layout;