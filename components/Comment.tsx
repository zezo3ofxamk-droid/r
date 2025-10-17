
import React, { useMemo } from 'react';
import { Comment as CommentType } from '../types';
import { useData } from '../hooks/useData';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { VerifiedBadgeIcon, CrownIcon, OwnerVerifiedBadgeIcon } from './Icons';

interface CommentProps {
    comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
    const { getUser, follows, manualVerifications, owners, generatedFollowers } = useData();
    const navigate = useNavigate();
    const author = getUser(comment.authorId);

    const isAuthorVerified = useMemo(() => {
        if (!author) return false;
        const realFollowerCount = follows.filter(f => f.followingId === author.id).length;
        const fakeFollowerCount = generatedFollowers[author.id] || 0;
        const totalFollowerCount = realFollowerCount + fakeFollowerCount;
        const isManuallyVerified = manualVerifications.includes(author.id);
        return totalFollowerCount >= 1000 || isManuallyVerified;
    }, [follows, manualVerifications, generatedFollowers, author]);

    const isAuthorOwner = useMemo(() => {
        if (!author) return false;
        return author.username.toLowerCase() === 'zezo' || owners.includes(author.id);
    }, [owners, author]);

    if (!author) {
        return null; // Or some placeholder for a deleted user
    }

    const navigateToProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${author.username}`);
    };

    return (
        <div className="p-4 border-b border-brand-border flex space-x-4">
            <img src={author.avatar} alt="avatar" className="w-12 h-12 rounded-full cursor-pointer" onClick={navigateToProfile} />
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-bold cursor-pointer hover:underline flex items-center" onClick={navigateToProfile}>
                        {author.displayName}
                        {isAuthorOwner && <CrownIcon />}
                        {isAuthorVerified && (isAuthorOwner ? <OwnerVerifiedBadgeIcon /> : <VerifiedBadgeIcon />)}
                    </span>
                    <span className="text-gray-400">@{author.username}</span>
                    <span className="text-gray-400">&middot;</span>
                    <span className="text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
            </div>
        </div>
    );
};

export default Comment;
