
import React, { useMemo } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { VerifiedBadgeIcon, CrownIcon, OwnerVerifiedBadgeIcon } from './Icons';

interface UserCardProps {
    user: User;
    adminMode?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, adminMode = false }) => {
    const navigate = useNavigate();
    const { follows, manualVerifications, owners, generatedFollowers } = useData();

    const isVerified = useMemo(() => {
        const realFollowerCount = follows.filter(f => f.followingId === user.id).length;
        const fakeFollowerCount = generatedFollowers[user.id] || 0;
        const totalFollowerCount = realFollowerCount + fakeFollowerCount;
        const isManuallyVerified = manualVerifications.includes(user.id);
        return totalFollowerCount >= 1000 || isManuallyVerified;
    }, [follows, manualVerifications, generatedFollowers, user.id]);

    const isUserOwner = useMemo(() => {
        return user.username.toLowerCase() === 'zezo' || owners.includes(user.id);
    }, [owners, user]);

    const handleClick = () => {
        if (adminMode) {
            navigate(`/admin/user/${user.id}`);
        } else {
            navigate(`/profile/${user.username}`);
        }
    };

    return (
        <div 
            className="flex items-center p-4 border-b border-brand-border hover:bg-brand-purple-light/10 transition-colors duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full mr-4" />
            <div>
                <p className="font-bold hover:underline flex items-center">
                    {user.displayName}
                    {isUserOwner && <CrownIcon />}
                    {isVerified && (isUserOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
                </p>
                <p className="text-gray-400">@{user.username}</p>
            </div>
        </div>
    );
};

export default UserCard;
