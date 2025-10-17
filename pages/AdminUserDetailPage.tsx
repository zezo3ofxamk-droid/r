
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { CrownIcon, OwnerVerifiedBadgeIcon, VerifiedBadgeIcon } from '../components/Icons';
import { Rt as RtType } from '../types';

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

const AdminUserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { 
        getUser, 
        deleteUser, 
        manualVerifications, 
        toggleManualVerification, 
        addFollowers,
        removeFollowers, 
        generatedFollowers, 
        owners, 
        toggleOwnerStatus,
        follows,
        rts,
        adminDeleteRt,
        adminEditRt
    } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [followersToAdd, setFollowersToAdd] = useState(0);
    const [followersToRemove, setFollowersToRemove] = useState(0);
    const [editingRtId, setEditingRtId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [deletingRtId, setDeletingRtId] = useState<string | null>(null);


    const profileUser = useMemo(() => userId ? getUser(userId) : undefined, [getUser, userId]);

    const userRts = useMemo(() => {
        if (!profileUser) return [];
        return rts
            .filter(rt => rt.authorId === profileUser.id && !rt.repostOf)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [rts, profileUser]);

    const isManuallyVerified = useMemo(() => {
        return profileUser ? manualVerifications.includes(profileUser.id) : false;
    }, [manualVerifications, profileUser]);
    
    const realFollowersCount = useMemo(() => {
        if (!profileUser) return 0;
        return follows.filter(f => f.followingId === profileUser.id).length;
    },[follows, profileUser]);

    const fakeFollowersCount = useMemo(() => {
        if(!profileUser) return 0;
        return generatedFollowers[profileUser.id] || 0;
    }, [generatedFollowers, profileUser]);
    
    const totalFollowersCount = realFollowersCount + fakeFollowersCount;

    const isProfileUserVerified = useMemo(() => totalFollowersCount >= 1000 || isManuallyVerified, [totalFollowersCount, isManuallyVerified]);

    const isProfileUserOwner = useMemo(() => {
        if (!profileUser) return false;
        return profileUser.username.toLowerCase() === 'zezo' || owners.includes(profileUser.id);
    }, [owners, profileUser]);

    if (!profileUser) {
        return <div className="p-4 text-center">User not found.</div>;
    }

    const handleDeleteUser = () => {
        deleteUser(profileUser.id);
        navigate('/admin'); 
    };

    const handleAddFollowers = () => {
        if (followersToAdd <= 0) return;
        addFollowers(profileUser.id, followersToAdd);
        setFollowersToAdd(0);
    };

    const handleRemoveFollowers = () => {
        if (followersToRemove <= 0) return;
        removeFollowers(profileUser.id, followersToRemove);
        setFollowersToRemove(0);
    };

    const handleStartEdit = (rt: RtType) => {
        setDeletingRtId(null);
        setEditingRtId(rt.id);
        setEditingText(rt.text);
    };

    const handleSaveEdit = () => {
        if (editingRtId) {
            adminEditRt(editingRtId, editingText);
            setEditingRtId(null);
            setEditingText('');
        }
    };

    const handleCancelEdit = () => {
        setEditingRtId(null);
        setEditingText('');
    };

    const handleStartDelete = (rt: RtType) => {
        setEditingRtId(null);
        setDeletingRtId(rt.id);
    };

    const handleConfirmDelete = () => {
        if (deletingRtId) {
            adminDeleteRt(deletingRtId);
            setDeletingRtId(null);
        }
    };

    const handleCancelDelete = () => {
        setDeletingRtId(null);
    };


    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex items-center space-x-6">
                <button onClick={() => navigate(-1)} className="text-white text-2xl font-bold" aria-label="Go back">&larr;</button>
                <div>
                    <h1 className="text-xl font-bold">Admin Controls</h1>
                </div>
            </div>
            <div className="p-4 border-b border-brand-border">
                <div className="flex items-center space-x-4">
                    <img src={profileUser.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            {profileUser.displayName}
                            {isProfileUserOwner && <CrownIcon />}
                            {isProfileUserVerified && (isProfileUserOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
                        </h2>
                        <p className="text-gray-400">@{profileUser.username}</p>
                        <p className="text-sm text-gray-300 mt-1">
                            {formatNumber(totalFollowersCount)} Followers ({formatNumber(realFollowersCount)} real, {formatNumber(fakeFollowersCount)} generated)
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-200">Roles & Verification</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {profileUser.username.toLowerCase() !== 'zezo' && (
                            <button 
                                onClick={() => toggleOwnerStatus(profileUser.id)}
                                className={`px-4 py-2 rounded-full font-bold ${isProfileUserOwner ? 'bg-transparent text-white border border-gray-400' : 'bg-yellow-500 text-black hover:bg-yellow-600'}`}
                            >
                                {isProfileUserOwner ? 'Remove Owner' : 'Make Owner'}
                            </button>
                        )}
                        <button 
                            onClick={() => toggleManualVerification(profileUser.id)}
                            className={`px-4 py-2 rounded-full font-bold ${isManuallyVerified ? 'bg-transparent text-white border border-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            {isManuallyVerified ? 'Remove Verification' : 'Verify User'}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-200">Follower Management</h3>
                    <div className="space-y-4">
                         <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={followersToAdd || ''}
                                onChange={(e) => setFollowersToAdd(parseInt(e.target.value, 10) || 0)}
                                className="bg-brand-purple-dark border border-brand-border rounded-md px-3 py-2 w-40 text-white"
                                placeholder="Number to add"
                            />
                            <button
                                onClick={handleAddFollowers}
                                disabled={followersToAdd <= 0}
                                className="px-4 py-2 rounded-full font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Followers
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={followersToRemove || ''}
                                onChange={(e) => setFollowersToRemove(parseInt(e.target.value, 10) || 0)}
                                className="bg-brand-purple-dark border border-brand-border rounded-md px-3 py-2 w-40 text-white"
                                placeholder="Number to remove"
                            />
                            <button
                                onClick={handleRemoveFollowers}
                                disabled={followersToRemove <= 0}
                                className="px-4 py-2 rounded-full font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove Followers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-200">Manage User's RTs</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto bg-brand-purple-dark p-2 rounded-md border border-brand-border">
                        {userRts.length > 0 ? (
                            userRts.map(rt => (
                                <div key={rt.id} className="p-3 bg-brand-purple-mid rounded-lg">
                                {editingRtId === rt.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="w-full bg-brand-purple-dark border border-brand-border rounded-md px-3 py-2 text-white resize-y"
                                            rows={4}
                                        />
                                        <div className="flex items-center space-x-2 justify-end">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-gray-600 text-white hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : deletingRtId === rt.id ? (
                                     <div className="space-y-2">
                                        <textarea
                                            value="deleted by admin"
                                            readOnly
                                            className="w-full bg-brand-purple-dark border border-brand-border rounded-md px-3 py-2 text-gray-400 resize-y cursor-not-allowed"
                                            rows={3}
                                        />
                                        <div className="flex items-center space-x-2 justify-end">
                                            <button
                                                onClick={handleCancelDelete}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-gray-600 text-white hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirmDelete}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-4">
                                            <p className="text-gray-300 whitespace-pre-wrap">{rt.text}</p>
                                            {rt.mediaUrl && rt.mediaType === 'image' && (
                                                <img src={rt.mediaUrl} alt="media" className="mt-2 max-h-20 rounded-md" />
                                            )}
                                            {rt.mediaUrl && rt.mediaType === 'video' && (
                                                <p className="mt-2 text-xs text-blue-400">[Video content]</p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                            <button
                                                onClick={() => handleStartEdit(rt)}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleStartDelete(rt)}
                                                className="px-3 py-1.5 text-sm rounded-full font-bold bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Delete RT
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center p-4">This user has not posted any original RTs.</p>
                        )}
                    </div>
                </div>
                
                <div className="border-t border-red-500/50 pt-6">
                    <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                     {currentUser?.id !== profileUser.id && (
                        <button 
                            onClick={handleDeleteUser}
                            className={`mt-2 px-4 py-2 rounded-full font-bold bg-red-600 text-white hover:bg-red-700`}
                        >
                            Delete User
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
