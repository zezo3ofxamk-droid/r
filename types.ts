
export interface User {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  avatar: string; // URL or data URL
  banner?: string; // URL or data URL
  bio?: string;
  createdAt: string;
}

export interface Rt {
  id: string;
  authorId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  repostOf?: string; // ID of the original rt if this is a repost
}

export interface Comment {
  id: string;
  authorId: string;
  rtId: string;
  text: string;
  createdAt: string;
}

export interface Like {
  userId: string;
  rtId: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  lastMessageAt: string;
}

export interface Message {
  id:string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}


export interface AppData {
  users: User[];
  rts: Rt[];
  likes: Like[];
  follows: Follow[];
  comments: Comment[];
  manualVerifications: string[];
  generatedFollowers: { [userId: string]: number };
  owners: string[];
  conversations: Conversation[];
  messages: Message[];
}