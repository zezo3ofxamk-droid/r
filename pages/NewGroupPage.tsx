import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const UserSelectItem: React.FC<{ user: User, isSelected: boolean, onToggle: (id: string) => void }> = ({ user, isSelected, onToggle }) => {
    return (
        <div 
            className="flex items-center p-3 border-b border-brand-border hover:bg-white/5 cursor-pointer"
            onClick={() => onToggle(user.id)}
        >
            <input 
                type="checkbox" 
                checked={isSelected}
                readOnly
                className="w-5 h-5 rounded text-blue-500 bg-brand-purple-mid border-brand-border focus:ring-blue-500"
            />
            <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full mx-3" />
            <div>
                <p className="font-bold">{user.displayName}</p>
                <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
        </div>
    );
};


const NewGroupPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { follows, getUser, createGroupConversation } = useData();
    const navigate = useNavigate();

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');

    const followers = useMemo(() => {
        if (!currentUser) return [];
        return follows
            .filter(f => f.followingId === currentUser.id)
            .map(f => getUser(f.followerId))
            .filter((u): u is User => u !== undefined);
    }, [currentUser, follows, getUser]);

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreateGroup = () => {
        if (!currentUser || selectedUserIds.length === 0 || !groupName.trim()) {
            alert('Please select at least one user and provide a group name.');
            return;
        }
        const participantIds = [currentUser.id, ...selectedUserIds];
        const newConversation = createGroupConversation(participantIds, groupName.trim());
        navigate(`/messages/${newConversation.id}`);
    };

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex items-center space-x-6">
                 <button onClick={() => navigate(-1)} className="text-white text-2xl font-bold" aria-label="Go back">&larr;</button>
                 <div>
                    <h1 className="text-xl font-bold">New Group Chat</h1>
                 </div>
            </div>
            <div className="p-4 space-y-4">
                <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Group Name"
                    className="w-full bg-brand-purple-mid text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <button 
                    onClick={handleCreateGroup}
                    disabled={selectedUserIds.length === 0 || !groupName.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50"
                >
                    Create Group
                </button>
            </div>
            <div>
                <p className="p-4 text-sm text-gray-400 border-t border-b border-brand-border">Select followers to add to the group:</p>
                {followers.length > 0 ? (
                    followers.map(user => (
                        <UserSelectItem 
                            key={user.id}
                            user={user}
                            isSelected={selectedUserIds.includes(user.id)}
                            onToggle={handleToggleUser}
                        />
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-400">You don't have any followers to add to a group.</p>
                )}
            </div>
        </div>
    );
};

export default NewGroupPage;
