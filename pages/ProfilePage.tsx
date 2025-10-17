import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Rt from '../components/Zeet';
import { Rt as RtType } from '../types';
import { VerifiedBadgeIcon, CrownIcon, OwnerVerifiedBadgeIcon } from '../components/Icons';

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        const formatted = (num / 1000000).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'M' : formatted + 'M';
    }
    if (num >= 1000) {
        const formatted = (num / 1000).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'K' : formatted + 'K';
    }
    return num.toString();
};

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { users, rts, follows, toggleFollow, manualVerifications, generatedFollowers, owners, getOrCreateOneToOneConversation } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const profileUser = useMemo(() => users.find(u => u.username === username), [users, username]);

    const userRts = useMemo(() => {
        if (!profileUser) return [];
        return rts
            .filter(z => z.authorId === profileUser.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [rts, profileUser]);

    const { followersCount, followingCount, isFollowing } = useMemo(() => {
        if (!profileUser || !currentUser) return { followersCount: 0, followingCount: 0, isFollowing: false };

        const realFollowersCount = follows.filter(f => f.followingId === profileUser.id).length;
        const fakeFollowersCount = generatedFollowers[profileUser.id] || 0;
        const totalFollowers = realFollowersCount + fakeFollowersCount;

        const following = follows.filter(f => f.followerId === profileUser.id);
        const selfIsFollowing = follows.some(f => f.followerId === currentUser.id && f.followingId === profileUser.id);

        return {
            followersCount: totalFollowers,
            followingCount: following.length,
            isFollowing: selfIsFollowing
        };
    }, [follows, profileUser, currentUser, generatedFollowers]);
    
    const isManuallyVerified = useMemo(() => {
        return profileUser ? manualVerifications.includes(profileUser.id) : false;
    }, [manualVerifications, profileUser]);

    const isProfileUserVerified = useMemo(() => followersCount >= 1000 || isManuallyVerified, [followersCount, isManuallyVerified]);

    const isProfileUserOwner = useMemo(() => {
        if (!profileUser) return false;
        return profileUser.username.toLowerCase() === 'zezo' || owners.includes(profileUser.id);
    }, [owners, profileUser]);

    if (!profileUser) {
        return <div className="p-4 text-center">User not found.</div>;
    }
    
    const handleFollow = () => {
        if (currentUser && currentUser.id !== profileUser.id) {
            toggleFollow(currentUser.id, profileUser.id);
        }
    };

    const handleDm = () => {
        if (currentUser && profileUser) {
            const conversation = getOrCreateOneToOneConversation(currentUser.id, profileUser.id);
            navigate(`/messages/${conversation.id}`);
        }
    };

    return (
        <div>
            <div className="border-b border-brand-border">
                {/* Banner */}
                <div className="h-32 sm:h-48 bg-brand-purple-mid">
                    {profileUser.banner && (
                        <img src={profileUser.banner} alt="banner" className="w-full h-full object-cover" />
                    )}
                </div>

                {/* Content below banner */}
                <div className="p-4">
                    {/* Top row with avatar pulled up and buttons */}
                    <div className="flex justify-between items-end">
                        <div className="-mt-12 sm:-mt-16"> {/* Negative margin to pull avatar up */}
                            <img 
                                src={profileUser.avatar} 
                                alt="avatar" 
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-brand-purple-dark bg-brand-purple-dark"
                            />
                        </div>
                        {/* Action buttons */}
                        {currentUser && currentUser.id === profileUser.id ? (
                            <button
                                onClick={() => navigate('/profile/edit')}
                                className="px-4 py-1.5 rounded-full font-bold bg-transparent text-white border border-gray-400 hover:bg-white/10"
                            >
                                Edit Profile
                            </button>
                        ) : currentUser && currentUser.id !== profileUser.id && (
                            <div className="flex justify-end items-center space-x-2">
                                <button
                                    onClick={handleDm}
                                    className="px-4 py-1.5 rounded-full font-bold bg-transparent text-white border border-gray-400 hover:bg-white/10"
                                >
                                    DM
                                </button>
                                <button 
                                    onClick={handleFollow}
                                    className={`px-4 py-1.5 rounded-full font-bold ${isFollowing ? 'bg-transparent text-white border border-gray-400' : 'bg-white text-black'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User info */}
                    <div className="mt-4">
                        <h2 className="text-xl font-bold flex items-center">
                            {profileUser.displayName}
                            {isProfileUserOwner && <CrownIcon />}
                            {isProfileUserVerified && (isProfileUserOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
                        </h2>
                        <p className="text-gray-400">@{profileUser.username}</p>
                        <p className="mt-2">{profileUser.bio}</p>
                        <div className="flex space-x-4 mt-2 text-gray-400">
                            <span><span className="font-bold text-white">{formatNumber(followingCount)}</span> Following</span>
                            <span><span className="font-bold text-white">{formatNumber(followersCount)}</span> Followers</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-bold p-4 border-b border-brand-border">RTs</h3>
                {userRts.map((rt: RtType) => (
                    <Rt key={rt.id} rt={rt} />
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;