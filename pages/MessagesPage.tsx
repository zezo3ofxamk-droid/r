import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useNavigate } from 'react-router-dom';
import ConversationListItem from '../components/ConversationListItem';

const MessagesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { conversations } = useData();
    const navigate = useNavigate();

    const userConversations = React.useMemo(() => {
        if (!currentUser) return [];
        return conversations
            .filter(c => c.participantIds.includes(currentUser.id))
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    }, [conversations, currentUser]);

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex justify-between items-center">
                <h1 className="text-xl font-bold">Messages</h1>
                <button
                    onClick={() => navigate('/messages/new')}
                    className="px-4 py-1.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200"
                >
                    New Group
                </button>
            </div>
            <div>
                {userConversations.length > 0 ? (
                    userConversations.map(conv => (
                        <ConversationListItem key={conv.id} conversation={conv} />
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-400">You have no messages yet. Start a conversation from someone's profile.</p>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
