
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { User } from '../types';

const UserSuggestion: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { toggleFollow } = useData();

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking the button
        if (currentUser) {
            toggleFollow(currentUser.id, user.id);
        }
    };

    const handleNavigate = () => {
        navigate(`/profile/${user.username}`);
    };

    return (
        <div 
            className="flex items-center justify-between p-3 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            onClick={handleNavigate}
        >
            <div className="flex items-center space-x-3 overflow-hidden">
                <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="truncate">
                    <p className="font-bold hover:underline truncate">{user.displayName}</p>
                    <p className="text-sm text-gray-400 truncate">@{user.username}</p>
                </div>
            </div>
            <button 
                onClick={handleFollow}
                className="bg-white text-black font-bold text-sm px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
            >
                Follow
            </button>
        </div>
    );
};


const RightSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users, follows } = useData();

  const suggestedUsers = useMemo(() => {
    if (!currentUser) return [];

    const followingIds = new Set(
        follows.filter(f => f.followerId === currentUser.id).map(f => f.followingId)
    );

    const candidates = users.filter(u => u.id !== currentUser.id && !followingIds.has(u.id));

    const scoredCandidates = candidates.map(candidate => {
        let score = 0;

        // Score based on total followers
        const followerCount = follows.filter(f => f.followingId === candidate.id).length;
        score += followerCount * 0.1;

        // Score based on mutual follows (people I follow who also follow this candidate)
        const candidateFollowerIds = new Set(
            follows.filter(f => f.followingId === candidate.id).map(f => f.followerId)
        );
        
        let mutuals = 0;
        for (const id of followingIds) {
            if (candidateFollowerIds.has(id)) {
                mutuals++;
            }
        }
        score += mutuals * 10; // High weight for mutual connections

        return { user: candidate, score };
    });

    return scoredCandidates
        .sort((a, b) => b.score - a.score)
        .filter(c => c.score > 0) // Only suggest users with some relevance
        .slice(0, 3)
        .map(item => item.user);

  }, [currentUser, users, follows]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <aside className="hidden xl:block w-[350px] px-6 py-2">
      <div className="sticky top-0 py-2 bg-brand-purple-dark/80 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search R"
            className="w-full bg-brand-purple-mid text-white rounded-full py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
        </form>
      </div>
      
      {suggestedUsers.length > 0 && (
          <div className="mt-4 bg-brand-purple-mid rounded-2xl border border-brand-border overflow-hidden">
              <h2 className="text-xl font-bold p-3">Who to follow</h2>
              <div>
                  {suggestedUsers.map(user => (
                      <UserSuggestion key={user.id} user={user} />
                  ))}
              </div>
          </div>
      )}
    </aside>
  );
};

export default RightSidebar;
