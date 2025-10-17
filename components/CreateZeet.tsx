
import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Rt } from '../types';
import { generateRtSuggestion } from '../services/geminiService';
import { ImageIcon, AIGenerateIcon } from './Icons';

interface CreateRtProps {
  onRtPosted?: () => void;
}

const CreateRt: React.FC<CreateRtProps> = ({ onRtPosted }) => {
    const { currentUser } = useAuth();
    const { addRt } = useData();
    const [text, setText] = useState('');
    const [media, setMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert("File is too large. Please select a file smaller than 10MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setMedia({
                    url: e.target?.result as string,
                    type: file.type.startsWith('image') ? 'image' : 'video'
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && !media) return;

        const newRt: Rt = {
            id: `rt_${Date.now()}`,
            authorId: currentUser.id,
            text: text,
            mediaUrl: media?.url,
            mediaType: media?.type,
            createdAt: new Date().toISOString(),
        };

        addRt(newRt);
        setText('');
        setMedia(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onRtPosted) {
            onRtPosted();
        }
    };

    const handleGenerateSuggestion = async () => {
        const topic = prompt("What topic do you want an RT about?");
        if (topic) {
            setIsAiLoading(true);
            try {
                const suggestion = await generateRtSuggestion(topic);
                setText(suggestion);
            } catch (error) {
                alert("Sorry, couldn't generate a suggestion right now.");
            } finally {
                setIsAiLoading(false);
            }
        }
    };

    return (
        <div className="p-4 border-b border-brand-border">
            <div className="flex space-x-4">
                <img src={currentUser.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
                <form onSubmit={handleSubmit} className="flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's happening?!"
                        className="w-full bg-transparent text-xl focus:outline-none resize-none"
                        rows={3}
                    />
                    {media && (
                        <div className="mt-2 relative">
                            {media.type === 'image' ? (
                                <img src={media.url} alt="preview" className="rounded-xl max-h-80" />
                            ) : (
                                <video src={media.url} controls className="rounded-xl max-h-80" />
                            )}
                            <button
                                type="button"
                                onClick={() => setMedia(null)}
                                className="absolute top-1 right-1 bg-black bg-opacity-75 rounded-full p-1 text-white"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full">
                                <ImageIcon />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                            <button type="button" onClick={handleGenerateSuggestion} disabled={isAiLoading} className="text-blue-500 hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded-full disabled:opacity-50">
                                {isAiLoading ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : <AIGenerateIcon />}
                            </button>
                        </div>
                        <button type="submit" disabled={!text.trim() && !media} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                            RT
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRt;