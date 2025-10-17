import React from 'react';
import { Conversation, User } from '../types';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
    conversation: Conversation;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation }) => {
    const { currentUser } = useAuth();
    const { getUser, messages } = useData();
    const navigate = useNavigate();

    const displayData = React.useMemo(() => {
        if (!currentUser) return { name: '', avatar: '' };

        if (conversation.isGroup) {
            return {
                name: conversation.groupName || 'Group Chat',
                avatar: conversation.groupAvatar || 'https://picsum.photos/seed/group/200'
            };
        } else {
            const otherUserId = conversation.participantIds.find(id => id !== currentUser.id);
            const otherUser = otherUserId ? getUser(otherUserId) : null;
            return {
                name: otherUser?.displayName || 'Unknown User',
                avatar: otherUser?.avatar || 'https://picsum.photos/seed/unknown/200'
            };
        }
    }, [conversation, currentUser, getUser]);

    const lastMessage = React.useMemo(() => {
        const convMessages = messages.filter(m => m.conversationId === conversation.id);
        return convMessages.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }, [messages, conversation.id]);

    const handleClick = () => {
        navigate(`/messages/${conversation.id}`);
    };

    return (
        <div 
            className="flex items-center p-4 border-b border-brand-border hover:bg-white/5 transition-colors duration-200 cursor-pointer"
            onClick={handleClick}
        >
            <img src={displayData.avatar} alt="avatar" className="w-12 h-12 rounded-full mr-4" />
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold truncate">{displayData.name}</p>
                    <p className="text-sm text-gray-400 flex-shrink-0 ml-2">
                        {lastMessage && formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                    </p>
                </div>
                <p className="text-gray-400 truncate">
                    {lastMessage ? `${getUser(lastMessage.senderId)?.displayName}: ${lastMessage.text}` : 'No messages yet...'}
                </p>
            </div>
        </div>
    );
};

export default ConversationListItem;
