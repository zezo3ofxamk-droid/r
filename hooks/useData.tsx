
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Rt, Like, Follow, AppData, Comment, Conversation, Message } from '../types';

const defaultData: AppData = {
    users: [],
    rts: [],
    likes: [],
    follows: [],
    comments: [],
    manualVerifications: [],
    generatedFollowers: {},
    owners: [],
    conversations: [],
    messages: [],
};

// Seeding initial data for demonstration
const getInitialData = (): AppData => {
    const storedData = localStorage.getItem('r_appData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Rename zeets to rts for backward compatibility
        if (parsedData.zeets && !parsedData.rts) {
            parsedData.rts = parsedData.zeets;
            delete parsedData.zeets;
        }
        if(parsedData.likes) {
            parsedData.likes = parsedData.likes.map((like: any) => {
                if (like.zeetId) {
                    like.rtId = like.zeetId;
                    delete like.zeetId;
                }
                return like;
            });
        }
         if(parsedData.comments) {
            parsedData.comments = parsedData.comments.map((comment: any) => {
                if (comment.zeetId) {
                    comment.rtId = comment.zeetId;
                    delete comment.zeetId;
                }
                return comment;
            });
        }

        return { 
            ...defaultData, 
            ...parsedData, 
            manualVerifications: parsedData.manualVerifications || [],
            generatedFollowers: parsedData.generatedFollowers || {},
            owners: parsedData.owners || [],
            conversations: parsedData.conversations || [],
            messages: parsedData.messages || [],
        };
    }

    const initialUsers: User[] = [];
    const initialRts: Rt[] = [];

    const initialData = { ...defaultData, users: initialUsers, rts: initialRts };
    localStorage.setItem('r_appData', JSON.stringify(initialData));
    return initialData;
}


interface DataContextType extends AppData {
    addUser: (user: User) => void;
    addRt: (rt: Rt) => void;
    addComment: (comment: Comment) => void;
    toggleLike: (userId: string, rtId: string) => void;
    toggleFollow: (followerId: string, followingId: string) => void;
    toggleManualVerification: (userId: string) => void;
    toggleOwnerStatus: (userId: string) => void;
    addFollowers: (userId: string, count: number) => void;
    removeFollowers: (userId: string, count: number) => void;
    deleteRt: (rtId: string) => void;
    adminDeleteRt: (rtId: string) => void;
    adminEditRt: (rtId: string, newText: string) => void;
    deleteUser: (userId: string) => void;
    updateUser: (userId: string, updates: Partial<User>) => { success: boolean; message?: string };
    getUser: (userId: string) => User | undefined;
    getRt: (rtId: string) => Rt | undefined;
    getOrCreateOneToOneConversation: (userId1: string, userId2: string) => Conversation;
    createGroupConversation: (participantIds: string[], groupName: string) => Conversation;
    addMessage: (conversationId: string, senderId: string, text: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(getInitialData);

    useEffect(() => {
        try {
            localStorage.setItem('r_appData', JSON.stringify(data));
        } catch (error) {
            console.error("Could not save data to localStorage. Data might be too large.", error);
            alert("Error: Could not save changes. The application's local storage might be full. Please try reducing the amount of data (e.g., removing generated followers if possible) or clearing the application data.");
        }
    }, [data]);
    
    const addUser = (user: User) => {
        setData(prev => ({ ...prev, users: [...prev.users, user] }));
    };

    const addRt = (rt: Rt) => {
        setData(prev => ({ ...prev, rts: [rt, ...prev.rts] }));
    };

    const addComment = (comment: Comment) => {
        setData(prev => ({ ...prev, comments: [comment, ...prev.comments] }));
    };

    const toggleLike = (userId: string, rtId: string) => {
        setData(prev => {
            const likeExists = prev.likes.find(l => l.userId === userId && l.rtId === rtId);
            if (likeExists) {
                return { ...prev, likes: prev.likes.filter(l => !(l.userId === userId && l.rtId === rtId)) };
            } else {
                return { ...prev, likes: [...prev.likes, { userId, rtId }] };
            }
        });
    };

    const toggleFollow = (followerId: string, followingId: string) => {
        setData(prev => {
            const followExists = prev.follows.find(f => f.followerId === followerId && f.followingId === followingId);
            if (followExists) {
                return { ...prev, follows: prev.follows.filter(f => !(f.followerId === followerId && f.followingId === followingId)) };
            } else {
                return { ...prev, follows: [...prev.follows, { followerId, followingId }] };
            }
        });
    };

    const toggleManualVerification = (userId: string) => {
        setData(prev => {
            const isVerified = prev.manualVerifications.includes(userId);
            if (isVerified) {
                return { ...prev, manualVerifications: prev.manualVerifications.filter(id => id !== userId) };
            } else {
                return { ...prev, manualVerifications: [...prev.manualVerifications, userId] };
            }
        });
    };
    
    const toggleOwnerStatus = (userId: string) => {
        setData(prev => {
            const isOwner = prev.owners.includes(userId);
            if (isOwner) {
                return { ...prev, owners: prev.owners.filter(id => id !== userId) };
            } else {
                return { ...prev, owners: [...prev.owners, userId] };
            }
        });
    };

    const addFollowers = (userId: string, count: number) => {
        if (count <= 0) return;

        setData(prev => {
            const currentGenerated = prev.generatedFollowers[userId] || 0;
            const newGeneratedFollowers = {
                ...prev.generatedFollowers,
                [userId]: currentGenerated + count,
            };
            
            return {
                ...prev,
                generatedFollowers: newGeneratedFollowers,
            };
        });
    };

    const removeFollowers = (userId: string, count: number) => {
        if (count <= 0) return;
        setData(prev => {
            const currentGenerated = prev.generatedFollowers[userId] || 0;
            const newCount = Math.max(0, currentGenerated - count);
            const newGeneratedFollowers = {
                ...prev.generatedFollowers,
                [userId]: newCount,
            };
            return {
                ...prev,
                generatedFollowers: newGeneratedFollowers,
            };
        });
    };

    const getUser = (userId: string) => data.users.find(u => u.id === userId);
    const getRt = (rtId: string) => data.rts.find(r => r.id === rtId);

    const deleteRt = (rtId: string) => {
        if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) {
            return;
        }
        setData(prev => {
            const rtToDelete = prev.rts.find(rt => rt.id === rtId);
            if (!rtToDelete) return prev;

            // If it's a repost, just delete it.
            if (rtToDelete.repostOf) {
                return {
                    ...prev,
                    rts: prev.rts.filter(rt => rt.id !== rtId),
                };
            }

            // If it's an original rt, delete it and all its related data.
            const repostIds = prev.rts
                .filter(rt => rt.repostOf === rtId)
                .map(rt => rt.id);
            
            const allIdsToDelete = [rtId, ...repostIds];

            return {
                ...prev,
                rts: prev.rts.filter(rt => !allIdsToDelete.includes(rt.id)),
                likes: prev.likes.filter(l => l.rtId !== rtId),
                comments: prev.comments.filter(c => c.rtId !== rtId),
            };
        });
    };

    const adminDeleteRt = (rtId: string) => {
        setData(prev => {
            const originalRt = prev.rts.find(rt => rt.id === rtId);
    
            if (!originalRt) {
                console.error("Admin delete failed: Rt not found with id", rtId);
                return prev;
            }
    
            if (originalRt.repostOf) {
                console.error("Admin delete was called on a repost. This is not allowed.");
                alert("This is a repost. You can only delete original RTs from this panel.");
                return prev;
            }
    
            const newRts = prev.rts.map(rt => {
                if (rt.id === rtId) {
                    return {
                        ...rt,
                        text: 'deleted by admin',
                        mediaUrl: undefined,
                        mediaType: undefined,
                    };
                }
                return rt;
            });
    
            return { ...prev, rts: newRts };
        });
    };

    const adminEditRt = (rtId: string, newText: string) => {
        setData(prev => {
            const newRts = prev.rts.map(rt => {
                if (rt.id === rtId) {
                    return { ...rt, text: newText };
                }
                return rt;
            });
            return { ...prev, rts: newRts };
        });
    };

    const deleteUser = (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user and all their data? This action cannot be undone.")) {
            return;
        }

        setData(prev => {
            const rtIdsByDeletedUser = prev.rts
                .filter(rt => rt.authorId === userId)
                .map(rt => rt.id);
            const remainingUsers = prev.users.filter(u => u.id !== userId);
            const remainingRts = prev.rts.filter(rt =>
                rt.authorId !== userId && 
                !rtIdsByDeletedUser.includes(rt.repostOf || '')
            );
            const remainingLikes = prev.likes.filter(l =>
                l.userId !== userId &&
                !rtIdsByDeletedUser.includes(l.rtId)
            );
            const remainingComments = prev.comments.filter(c =>
                c.authorId !== userId &&
                !rtIdsByDeletedUser.includes(c.rtId)
            );
            
            const remainingFollows = prev.follows.filter(f =>
                f.followerId !== userId && f.followingId !== userId
            );
            
            const remainingManualVerifications = prev.manualVerifications.filter(id => id !== userId);
            const remainingGeneratedFollowers = { ...prev.generatedFollowers };
            delete remainingGeneratedFollowers[userId];
            const remainingOwners = prev.owners.filter(id => id !== userId);

            if (localStorage.getItem('r_currentUserId') === userId) {
                localStorage.removeItem('r_currentUserId');
            }

            return {
                users: remainingUsers,
                rts: remainingRts,
                likes: remainingLikes,
                comments: remainingComments,
                follows: remainingFollows,
                manualVerifications: remainingManualVerifications,
                generatedFollowers: remainingGeneratedFollowers,
                owners: remainingOwners,
                conversations: prev.conversations, // Not handling conversation deletion for simplicity
                messages: prev.messages,
            };
        });
    };
    
    const updateUser = (userId: string, updates: Partial<User>): { success: boolean; message?: string } => {
        if (updates.username) {
            const usernameExists = data.users.some(
                u => u.username.toLowerCase() === updates.username!.toLowerCase() && u.id !== userId
            );
            if (usernameExists) {
                return { success: false, message: 'Username is already taken.' };
            }
        }

        setData(prev => {
            const newUsers = prev.users.map(user => {
                if (user.id === userId) {
                    return { ...user, ...updates };
                }
                return user;
            });
            return { ...prev, users: newUsers };
        });

        return { success: true };
    };

    const getOrCreateOneToOneConversation = (userId1: string, userId2: string): Conversation => {
        const participantIds = [userId1, userId2].sort();
        const existing = data.conversations.find(c => 
            !c.isGroup && 
            c.participantIds.length === 2 && 
            c.participantIds[0] === participantIds[0] &&
            c.participantIds[1] === participantIds[1]
        );

        if (existing) {
            return existing;
        }

        const newConversation: Conversation = {
            id: `conv_${Date.now()}`,
            participantIds,
            isGroup: false,
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
        };
        
        setData(prev => ({
            ...prev,
            conversations: [...prev.conversations, newConversation]
        }));
        
        return newConversation;
    };

    const createGroupConversation = (participantIds: string[], groupName: string): Conversation => {
        const newConversation: Conversation = {
            id: `conv_${Date.now()}`,
            participantIds,
            isGroup: true,
            groupName,
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
        };
        setData(prev => ({ ...prev, conversations: [...prev.conversations, newConversation] }));
        return newConversation;
    };

    const addMessage = (conversationId: string, senderId: string, text: string) => {
        const newMessage: Message = {
            id: `msg_${Date.now()}`,
            conversationId,
            senderId,
            text,
            createdAt: new Date().toISOString(),
        };
        
        setData(prev => {
            const updatedConversations = prev.conversations.map(c => 
                c.id === conversationId 
                ? { ...c, lastMessageAt: new Date().toISOString() }
                : c
            );

            return {
                ...prev,
                messages: [...prev.messages, newMessage],
                conversations: updatedConversations,
            };
        });
    };

    return (
        <DataContext.Provider value={{ ...data, addUser, addRt, addComment, toggleLike, toggleFollow, toggleManualVerification, toggleOwnerStatus, addFollowers, removeFollowers, deleteRt, adminDeleteRt, adminEditRt, deleteUser, updateUser, getUser, getRt, getOrCreateOneToOneConversation, createGroupConversation, addMessage }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};