

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import Rt from '../components/Zeet';
import Comment from '../components/Comment';
import { Comment as CommentType } from '../types';

const RtDetailPage: React.FC = () => {
    const { rtId } = useParams<{ rtId: string }>();
    const { getRt, comments, addComment, getUser } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [replyText, setReplyText] = useState('');

    const rt = useMemo(() => getRt(rtId || ''), [getRt, rtId]);
    
    const author = useMemo(() => rt ? getUser(rt.authorId) : null, [rt, getUser]);

    const rtComments = useMemo(() => {
        return comments
            .filter(c => c.rtId === rtId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [comments, rtId]);

    if (!rt) {
        return <div className="p-4 text-center">RT not found.</div>;
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !currentUser) return;

        const newComment: CommentType = {
            id: `comment_${Date.now()}`,
            authorId: currentUser.id,
            rtId: rt.id,
            text: replyText,
            createdAt: new Date().toISOString(),
        };
        addComment(newComment);
        setReplyText('');
    };

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex items-center space-x-6">
                 <button onClick={() => navigate(-1)} className="text-white text-2xl font-bold" aria-label="Go back">&larr;</button>
                 <div>
                    <h1 className="text-xl font-bold">RT</h1>
                 </div>
            </div>

            <Rt rt={rt} />

            {currentUser && author && (
                <div className="p-4 border-b border-brand-border text-gray-400">
                    Replying to <span className="text-blue-400">@{author.username}</span>
                </div>
            )}

            {currentUser && (
                <div className="p-4 border-b border-brand-border">
                    <div className="flex space-x-4">
                        <img src={currentUser.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
                        <form onSubmit={handleAddComment} className="flex-1">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Post your reply"
                                className="w-full bg-transparent text-xl focus:outline-none resize-none"
                                rows={2}
                            />
                            <div className="text-right mt-2">
                                <button type="submit" disabled={!replyText.trim()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                                    Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div>
                {rtComments.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
};

export default RtDetailPage;