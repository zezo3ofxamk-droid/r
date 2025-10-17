import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Message as MessageType } from '../types';

const Message: React.FC<{ message: MessageType, isOwn: boolean, conversation: any }> = ({ message, isOwn, conversation }) => {
    const { getUser } = useData();
    const sender = getUser(message.senderId);

    return (
        <div className={`flex my-2 items-end ${isOwn ? 'justify-end' : 'justify-start'}`}>
             {!isOwn && <img src={sender?.avatar} className="w-6 h-6 rounded-full mr-2" alt={sender?.displayName} />}
            <div className={`px-4 py-2 rounded-2xl max-w-sm sm:max-w-md md:max-w-lg ${isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-brand-purple-mid text-white rounded-bl-none'}`}>
                {!isOwn && conversation.isGroup && sender && <p className="text-xs font-bold text-gray-300 mb-1">{sender.displayName}</p>}
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
            </div>
        </div>
    );
};


const ConversationPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const { currentUser } = useAuth();
    const { conversations, messages, addMessage, getUser } = useData();
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversation = useMemo(() => {
        return conversations.find(c => c.id === conversationId);
    }, [conversations, conversationId]);

    const conversationMessages = useMemo(() => {
        return messages
            .filter(m => m.conversationId === conversationId)
            .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages, conversationId]);

    const headerTitle = useMemo(() => {
        if (!conversation || !currentUser) return '...';
        if (conversation.isGroup) return conversation.groupName || 'Group Chat';
        const otherUserId = conversation.participantIds.find(id => id !== currentUser.id);
        const otherUser = otherUserId ? getUser(otherUserId) : null;
        return otherUser?.displayName || 'Chat';
    }, [conversation, currentUser, getUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationMessages]);

    if (!currentUser || !conversation) {
        return <div className="p-4 text-center">Loading or conversation not found...</div>;
    }
    
    if (!conversation.participantIds.includes(currentUser.id)) {
        return <div className="p-4 text-center">You are not a member of this conversation.</div>;
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        addMessage(conversation.id, currentUser.id, text.trim());
        setText('');
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] lg:max-h-screen">
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex items-center space-x-6">
                <button onClick={() => navigate('/messages')} className="text-white text-2xl font-bold" aria-label="Go back">&larr;</button>
                <div>
                    <h1 className="text-xl font-bold">{headerTitle}</h1>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {conversationMessages.map(msg => (
                    <Message key={msg.id} message={msg} isOwn={msg.senderId === currentUser.id} conversation={conversation} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-brand-border bg-brand-purple-dark">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Start a new message"
                        className="flex-1 bg-brand-purple-mid text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50" disabled={!text.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationPage;
