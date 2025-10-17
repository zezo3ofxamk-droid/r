
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rt as RtType } from '../types';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { LikeIcon, RepostIcon, LikedIcon, CommentIcon, TrashIcon, VerifiedBadgeIcon, CrownIcon, OwnerVerifiedBadgeIcon, EditIcon } from './Icons';

interface RtProps {
  rt: RtType;
}

const Rt: React.FC<RtProps> = ({ rt }) => {
    const { getUser, likes, toggleLike, addRt, getRt, comments, adminDeleteRt, adminEditRt, follows, manualVerifications, generatedFollowers, owners, rts } = useData();
    const { currentUser, isOwner } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const author = getUser(rt.authorId);
    
    const isRepost = !!rt.repostOf;
    const originalRt = isRepost ? getRt(rt.repostOf!) : rt;
    const repostingUser = isRepost ? author : null;
    const originalAuthor = originalRt ? getUser(originalRt.authorId) : null;

    const likeCount = useMemo(() => likes.filter(l => l.rtId === originalRt?.id).length, [likes, originalRt]);
    const commentCount = useMemo(() => comments.filter(c => c.rtId === originalRt?.id).length, [comments, originalRt]);
    const repostCount = useMemo(() => rts.filter(z => z.repostOf === originalRt?.id).length, [rts, originalRt]);
    
    const isLiked = useMemo(() => currentUser && likes.some(l => l.userId === currentUser.id && l.rtId === originalRt?.id), [likes, currentUser, originalRt]);
    const hasReposted = useMemo(() => currentUser && rts.some(z => z.authorId === currentUser.id && z.repostOf === originalRt?.id), [rts, currentUser, originalRt]);

    const isAuthorVerified = useMemo(() => {
        if (!originalAuthor) return false;
        const realFollowerCount = follows.filter(f => f.followingId === originalAuthor.id).length;
        const fakeFollowerCount = generatedFollowers[originalAuthor.id] || 0;
        const totalFollowerCount = realFollowerCount + fakeFollowerCount;
        const isManuallyVerified = manualVerifications.includes(originalAuthor.id);
        return totalFollowerCount >= 1000 || isManuallyVerified;
    }, [follows, manualVerifications, generatedFollowers, originalAuthor]);

    const isAuthorOwner = useMemo(() => {
        if (!originalAuthor) return false;
        return originalAuthor.username.toLowerCase() === 'zezo' || owners.includes(originalAuthor.id);
    }, [owners, originalAuthor]);
    
    if (!originalAuthor) {
        return (
             <div className="p-4 border-b border-brand-border text-gray-400">
                This content is no longer available because the original author's account was deleted.
            </div>
        );
    }
    
    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentUser && originalRt) {
            toggleLike(currentUser.id, originalRt.id);
        }
    };

    const handleRepost = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentUser && originalRt && !hasReposted) {
            const newRepost: RtType = {
                id: `rt_${Date.now()}`,
                authorId: currentUser.id,
                text: '', // Reposts don't have their own text
                repostOf: originalRt.id,
                createdAt: new Date().toISOString(),
            };
            addRt(newRepost);
        }
    };
    
    const navigateToDetail = () => {
        if (isEditing || isDeleting) return; // Don't navigate when in edit/delete mode
        if (originalRt) {
            navigate(`/rt/${originalRt.id}`);
        }
    };
    
    const navigateToProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (originalAuthor) {
          navigate(`/profile/${originalAuthor.username}`);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (originalRt) {
            setEditText(originalRt.text || '');
            setIsEditing(true);
        }
    };

    const handleSaveEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (originalRt) {
            adminEditRt(originalRt.id, editText);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (originalRt) {
            adminDeleteRt(originalRt.id);
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleting(false);
    };

    const canModify = isOwner;

    return (
        <div className="p-4 border-b border-brand-border hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={navigateToDetail}>
            {isRepost && repostingUser && (
                <div className="text-gray-400 text-sm mb-2 ml-6 flex items-center">
                    <RepostIcon />
                    <span className="ml-2 font-bold cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${repostingUser.username}`)}}>{repostingUser.displayName} reposted</span>
                </div>
            )}
            <div className="flex space-x-4">
                <img src={originalAuthor.avatar} alt="avatar" className="w-12 h-12 rounded-full cursor-pointer" onClick={navigateToProfile} />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm sm:text-base">
                            <span className="font-bold cursor-pointer hover:underline flex items-center" onClick={navigateToProfile}>
                                {originalAuthor.displayName}
                                {isAuthorOwner && <CrownIcon />}
                                {isAuthorVerified && (isAuthorOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
                            </span>
                            <span className="text-gray-400 hidden sm:inline">@{originalAuthor.username}</span>
                            <span className="text-gray-400">&middot;</span>
                            <span className="text-gray-400">{formatDistanceToNow(new Date(originalRt.createdAt), { addSuffix: true })}</span>
                        </div>
                         {canModify && !isEditing && !isDeleting && (
                            <div className="flex items-center">
                                <button onClick={handleEdit} className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-500/10">
                                    <EditIcon />
                                </button>
                                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10">
                                    <TrashIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea
                                className="w-full bg-brand-purple-dark text-white rounded-md p-2 border border-brand-border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={4}
                                onClick={e => e.stopPropagation()}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={handleCancelEdit} className="px-4 py-1.5 rounded-full text-sm font-bold bg-transparent text-white border border-gray-400 hover:bg-white/10">Cancel</button>
                                <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200">Save</button>
                            </div>
                        </div>
                    ) : isDeleting ? (
                        <div className="mt-2" onClick={e => e.stopPropagation()}>
                            <textarea
                                className="w-full bg-brand-purple-dark text-gray-400 rounded-md p-2 border border-brand-border focus:outline-none resize-y cursor-not-allowed"
                                value="deleted by admin"
                                readOnly
                                rows={4}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={handleCancelDelete} className="px-4 py-1.5 rounded-full text-sm font-bold bg-transparent text-white border border-gray-400 hover:bg-white/10">Cancel</button>
                                <button onClick={handleConfirmDelete} className="px-4 py-1.5 rounded-full text-sm font-bold bg-red-600 text-white hover:bg-red-700">Save</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {originalRt.text && <p className="mt-1 whitespace-pre-wrap">{originalRt.text}</p>}
                            {originalRt.mediaUrl && (
                                <div className="mt-2">
                                    {originalRt.mediaType === 'image' ? (
                                        <img src={originalRt.mediaUrl} alt="rt media" className="rounded-xl max-h-96 border border-brand-border" />
                                    ) : (
                                        <video src={originalRt.mediaUrl} controls className="rounded-xl max-h-96 w-full border border-brand-border" onClick={e => e.stopPropagation()} />
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-3 text-gray-400 max-w-xs">
                                <div className="flex items-center space-x-1 group">
                                    <button onClick={(e) => { e.stopPropagation(); navigateToDetail(); }} className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500">
                                        <CommentIcon />
                                    </button>
                                    <span>{commentCount > 0 ? commentCount : ''}</span>
                                </div>
                                <div className="flex items-center space-x-1 group">
                                    <button onClick={handleRepost} disabled={hasReposted} className={`p-2 rounded-full ${hasReposted ? 'text-green-500' : 'group-hover:bg-green-500/10 group-hover:text-green-500'}`}>
                                        <RepostIcon />
                                    </button>
                                    <span className={hasReposted ? 'text-green-500' : ''}>{repostCount > 0 ? repostCount : ''}</span>
                                </div>
                                <div className="flex items-center space-x-1 group">
                                    <button onClick={handleLike} className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'group-hover:bg-red-500/10 group-hover:text-red-500'}`}>
                                        {isLiked ? <LikedIcon /> : <LikeIcon />}
                                    </button>
                                    <span className={isLiked ? 'text-red-500' : ''}>{likeCount > 0 ? likeCount : ''}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rt;
