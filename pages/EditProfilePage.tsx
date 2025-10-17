import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { User } from '../types';
import { ImageIcon, TrashIcon } from '../components/Icons';

const EditProfilePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { updateUser } = useData();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName);
            setUsername(currentUser.username);
            setBio(currentUser.bio || '');
            setAvatar(currentUser.avatar);
            setBanner(currentUser.banner || null);
        } else {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("Image file is too large. Please select a file smaller than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit for banner
                setError("Banner file is too large. Please select a file smaller than 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setBanner(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentUser) return;
        if (!username.trim() || !displayName.trim()) {
            setError('Display name and username cannot be empty.');
            return;
        }

        const updates: Partial<User> = {};

        if (displayName.trim() !== currentUser.displayName) {
            updates.displayName = displayName.trim();
        }
        if (username.trim() !== currentUser.username) {
            updates.username = username.trim();
        }
        if (password) {
            updates.password = password;
        }
        if (bio.trim() !== (currentUser.bio || '')) {
            updates.bio = bio.trim();
        }
        if (avatar !== currentUser.avatar) {
            updates.avatar = avatar || `https://picsum.photos/seed/${username.trim()}/200`;
        }
        
        const currentBanner = currentUser.banner || null;
        if (banner !== currentBanner) {
            updates.banner = banner || undefined;
        }
        
        if (Object.keys(updates).length === 0) {
            setError("No changes were made.");
            return;
        }

        const result = updateUser(currentUser.id, updates);

        if (result.success) {
            setSuccess('Profile updated successfully!');
            // Refresh current user data in auth context is needed if username changes
            // For now, redirecting is sufficient as auth context will re-load.
            setTimeout(() => {
                navigate(`/profile/${updates.username || currentUser.username}`);
            }, 1000);
        } else {
            setError(result.message || 'An unexpected error occurred.');
        }
    };
    
    if (!currentUser) return null;

    const commonInputClass = "appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-border bg-brand-purple-dark text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border flex items-center space-x-6">
                 <button onClick={() => navigate(-1)} className="text-white text-2xl font-bold" aria-label="Go back">&larr;</button>
                 <div>
                    <h1 className="text-xl font-bold">Edit Profile</h1>
                 </div>
            </div>
            <form className="pb-6" onSubmit={handleSubmit}>
                <div className="relative mb-16">
                    <div className="h-48 bg-brand-purple-mid">
                        {banner && <img src={banner} alt="Banner preview" className="w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center space-x-4">
                            <label htmlFor="banner-upload" className="cursor-pointer bg-black/50 p-3 rounded-full hover:bg-black/70 text-white">
                                <ImageIcon />
                                <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                            </label>
                            {banner && (
                                <button
                                    type="button"
                                    onClick={() => setBanner(null)}
                                    className="cursor-pointer bg-black/50 p-3 rounded-full hover:bg-black/70 text-white"
                                    aria-label="Remove banner"
                                >
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-16 left-4">
                        <div className="relative group">
                            <img src={avatar || ''} alt="Avatar preview" className="w-32 h-32 rounded-full border-4 border-brand-purple-dark bg-brand-purple-dark" />
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon />
                                <input id="avatar-upload" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 space-y-6 pt-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                            <input id="displayName" name="displayName" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={commonInputClass} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password (optional)</label>
                            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={commonInputClass} placeholder="Leave blank to keep current password" />
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                            <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} className={commonInputClass + " resize-none"} rows={3}></textarea>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-center text-sm">{success}</p>}

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="group relative flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-purple-mid focus:ring-blue-500">
                        Save Changes
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;
