
import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { HomeIcon, HashIcon, UserIcon, RIcon, LogoutIcon, VerificationIcon, VerifiedBadgeIcon, CrownIcon, OwnerVerifiedBadgeIcon, AdminIcon, DMIcon } from './Icons';

interface SidebarProps {
  onComposeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onComposeClick }) => {
  const { currentUser, logout, isOwner } = useAuth();
  const { follows, manualVerifications, generatedFollowers } = useData();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentUserVerified = useMemo(() => {
    if (!currentUser) return false;
    const realFollowerCount = follows.filter(f => f.followingId === currentUser.id).length;
    const fakeFollowerCount = generatedFollowers[currentUser.id] || 0;
    const totalFollowerCount = realFollowerCount + fakeFollowerCount;

    const isManuallyVerified = manualVerifications.includes(currentUser.id);
    return totalFollowerCount >= 1000 || isManuallyVerified;
  }, [currentUser, follows, manualVerifications, generatedFollowers]);

  if (!currentUser) return null;

  const navItems = [
    { icon: <HomeIcon />, text: 'Home', path: '/' },
    { icon: <HashIcon />, text: 'Search', path: '/search' },
    { icon: <UserIcon />, text: 'Profile', path: `/profile/${currentUser.username}` },
    { icon: <DMIcon />, text: 'Messages', path: '/messages' },
    { icon: <VerificationIcon />, text: 'Verification', path: '/verification' },
  ];

  if (isOwner) {
    navItems.push({ icon: <AdminIcon />, text: 'Admin Panel', path: '/admin' });
  }

  return (
    <header className="hidden lg:flex w-[275px] px-2 flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="p-3 text-3xl font-bold">
            <RIcon />
        </div>
        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-4 p-3 rounded-full hover:bg-white/10 transition-colors duration-200 ${isActive ? 'font-bold' : ''}`
                  }
                >
                  {item.icon}
                  <span className="text-xl">{item.text}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button 
          onClick={onComposeClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full w-full mt-4 text-lg"
        >
          RT
        </button>
      </div>

      <div className="py-4 relative">
        {showLogout && (
          <div 
            onClick={handleLogout}
            className="absolute bottom-full left-0 w-full mb-2 bg-brand-purple-dark border border-brand-border rounded-lg shadow-lg cursor-pointer hover:bg-brand-purple-mid"
          >
            <div className="p-3 flex items-center space-x-3 text-red-500 font-bold">
                <LogoutIcon />
                <span>Log out @{currentUser.username}</span>
            </div>
          </div>
        )}
        <div 
          onClick={() => setShowLogout(!showLogout)} 
          className="flex items-center space-x-3 p-3 rounded-full hover:bg-white/10 cursor-pointer transition-colors duration-200"
        >
          <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold flex items-center">
                {currentUser.displayName}
                {isOwner && <CrownIcon />}
                {isCurrentUserVerified && (isOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
            </p>
            <p className="text-gray-400">@{currentUser.username}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
